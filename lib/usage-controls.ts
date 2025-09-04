// Client-side usage controls: throttling, session tracking, lightweight analytics
// Enforcement of free tier limits is DISABLED for testing, but metrics are collected.

export type UsageKey = 'short' | 'long'

const STORAGE_PREFIX = 'sb_'
const DAY_MS = 24 * 60 * 60 * 1000

// SSR-safe storage wrapper with in-memory fallback
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
const memoryStore = new Map<string, string>()
const storage = {
  getItem(key: string): string | null {
    if (isBrowser) return window.localStorage.getItem(key)
    return memoryStore.has(key) ? memoryStore.get(key)! : null
  },
  setItem(key: string, value: string) {
    if (isBrowser) return window.localStorage.setItem(key, value)
    memoryStore.set(key, value)
  },
  removeItem(key: string) {
    if (isBrowser) return window.localStorage.removeItem(key)
    memoryStore.delete(key)
  }
}

function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function safeParse<T>(s: string | null): T | undefined {
  if (!s) return undefined
  try { return JSON.parse(s) as T } catch { return undefined }
}

export interface UsageMetrics {
  date: string
  totalGenerations: number
  niches: Record<string, number>
  tones: Record<string, number>
  costsUsd: number
}

export interface SessionInfo {
  startedAt: number
  count: number
}

export class UsageController {
  private key: UsageKey
  private minIntervalMs: number
  private failureCooldownMs: number
  private enforceFreeLimit: boolean

  private queue: Promise<any> = Promise.resolve()

  constructor(key: UsageKey, opts?: { minIntervalMs?: number; failureCooldownMs?: number; enforceFreeLimit?: boolean }) {
    this.key = key
    this.minIntervalMs = opts?.minIntervalMs ?? 3000 // 3s between requests
    this.failureCooldownMs = opts?.failureCooldownMs ?? 5000 // 5s cooldown after failure
    // IMPORTANT: Keep enforcement off while testing
    this.enforceFreeLimit = opts?.enforceFreeLimit ?? false
  }

  private storageKey(name: string) {
    return `${STORAGE_PREFIX}${name}:${this.key}`
  }

  private getLastRequestAt(): number {
    const v = storage.getItem(this.storageKey('last_request_at'))
    return v ? Number(v) : 0
  }

  private setLastRequestAt(ts: number) {
    storage.setItem(this.storageKey('last_request_at'), String(ts))
  }

  private getNextAvailableAt(): number {
    const v = storage.getItem(this.storageKey('next_available_at'))
    return v ? Number(v) : 0
  }

  private setNextAvailableAt(ts: number) {
    storage.setItem(this.storageKey('next_available_at'), String(ts))
  }

  getCooldownSeconds(): number {
    const now = Date.now()
    const next = this.getNextAvailableAt()
    return next > now ? Math.ceil((next - now) / 1000) : 0
  }

  getSessionInfo(limit = 5): { info: SessionInfo; remaining: number } {
    const raw = safeParse<SessionInfo>(storage.getItem(this.storageKey('session_info')))
    const now = Date.now()
    let info: SessionInfo
    if (!raw || now - raw.startedAt > DAY_MS) {
      info = { startedAt: now, count: 0 }
      storage.setItem(this.storageKey('session_info'), JSON.stringify(info))
    } else {
      info = raw
    }
    const remaining = Math.max(0, limit - info.count)
    return { info, remaining }
  }

  private setSessionInfo(info: SessionInfo) {
    storage.setItem(this.storageKey('session_info'), JSON.stringify(info))
  }

  incrementSessionCount() {
    const { info } = this.getSessionInfo()
    info.count += 1
    this.setSessionInfo(info)
  }

  getDailyMetrics(): UsageMetrics {
    const key = `${STORAGE_PREFIX}usage_metrics:${todayKey()}`
    const raw = safeParse<UsageMetrics>(storage.getItem(key))
    if (raw && raw.date === todayKey()) return raw
    const fresh: UsageMetrics = { date: todayKey(), totalGenerations: 0, niches: {}, tones: {}, costsUsd: 0 }
    storage.setItem(key, JSON.stringify(fresh))
    return fresh
  }

  private setDailyMetrics(m: UsageMetrics) {
    const key = `${STORAGE_PREFIX}usage_metrics:${m.date}`
    storage.setItem(key, JSON.stringify(m))
  }

  recordSuccess(analytics?: { niche?: string; tone?: string; estCostUsd?: number }) {
    // session count
    this.incrementSessionCount()
    // analytics
    const m = this.getDailyMetrics()
    m.totalGenerations += 1
    if (analytics?.niche) {
      const n = analytics.niche.trim().toLowerCase().slice(0, 80)
      m.niches[n] = (m.niches[n] || 0) + 1
    }
    if (analytics?.tone) {
      const t = analytics.tone.trim().toLowerCase().slice(0, 80)
      m.tones[t] = (m.tones[t] || 0) + 1
    }
    if (typeof analytics?.estCostUsd === 'number' && isFinite(analytics.estCostUsd)) {
      m.costsUsd += Math.max(0, analytics.estCostUsd)
    }
    this.setDailyMetrics(m)
  }

  recordFailure() {
    // apply short cooldown after failure
    const next = Date.now() + this.failureCooldownMs
    this.setNextAvailableAt(next)
  }

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    // serialize tasks and enforce min interval between actual executions
    this.queue = this.queue.then(async () => {
      const now = Date.now()
      const last = this.getLastRequestAt()
      const cooldownUntil = this.getNextAvailableAt()
      let waitMs = 0
      if (cooldownUntil > now) waitMs = Math.max(waitMs, cooldownUntil - now)
      const since = now - last
      if (since < this.minIntervalMs) waitMs = Math.max(waitMs, this.minIntervalMs - since)
      if (waitMs > 0) await new Promise(res => setTimeout(res, waitMs))
      this.setLastRequestAt(Date.now())
      return undefined
    })

    // Chain actual task after timing control
    this.queue = this.queue.then(task)
    return this.queue
  }
}

const controllers: Partial<Record<UsageKey, UsageController>> = {}

export function getUsageController(key: UsageKey): UsageController {
  if (!controllers[key]) {
    controllers[key] = new UsageController(key, {
      minIntervalMs: 3000,
      failureCooldownMs: 5000,
      enforceFreeLimit: false, // testing mode
    })
  }
  return controllers[key]!
}

// Helper: estimated cost per generation (tweak if needed)
export function estimateCostUsd(): number {
  // Placeholder: tweak based on your model/provider
  return 0.005
}

import { ScriptInput, GeneratedScript, APIResponse, LongFormGenerated, LongFormInput, Platform, Tone, ContentGoal, ScriptLength, TargetAudience, LongFormLength, LongFormTone, LongFormAudience } from '@/types'
import { sanitizeText, containsPromptInjectionAttempt, containsInappropriateContent, moderateGeneratedContent } from '@/lib/security'

// In-flight request deduplication map
const inflight = new Map<string, Promise<Response>>()

function makeKey(resource: RequestInfo | URL, options?: RequestInit): string {
  const url = typeof resource === 'string' ? resource : resource.toString()
  const body = options && 'body' in options ? String(options.body || '') : ''
  return `${url}::${body}`
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryable: boolean = false,
    public retryAfterSeconds?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// ===== EXPORT & QUICK-EDIT CLIENT =====
export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'srt'

export async function exportScript(script: GeneratedScript, format: ExportFormat): Promise<Blob> {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script, format }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new APIError(err.error || `Failed to export (${format})`, res.status)
  }
  const contentType = res.headers.get('Content-Type') || 'application/octet-stream'
  const buf = await res.arrayBuffer()
  return new Blob([buf], { type: contentType })
}

export async function quickEditScript(
  script: GeneratedScript,
  action: 'shorter' | 'longer' | 'rewrite_hook' | 'change_tone',
  tone?: 'casual' | 'professional' | 'humorous' | 'dramatic'
): Promise<GeneratedScript> {
  const res = await fetch('/api/quick-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script, action, tone }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new APIError(err.error || 'Failed to apply quick edit', res.status)
  }
  const data: APIResponse<GeneratedScript> = await res.json()
  if (!data.success || !data.data) {
    throw new APIError(data.error || 'Quick edit failed', 500)
  }
  return data.data
}

export class RetryableError extends APIError {
  constructor(message: string, status: number, code?: string) {
    super(message, status, code, true)
  }
}

// Lightweight in-memory cache
type CacheEntry<T> = { value: T; expiresAt: number };
const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 60_000; // 60s
const DEFAULT_TIMEOUT_MS = 30_000; // 30s

function getCache<T>(key: string): T | undefined {
  const e = cache.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return e.value as T;
}

function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

// Parses Retry-After header which can be seconds or HTTP-date
function parseRetryAfter(value: string): number | undefined {
  const secs = Number(value)
  if (!Number.isNaN(secs) && secs >= 0) return Math.floor(secs)
  const dateMs = Date.parse(value)
  if (!Number.isNaN(dateMs)) {
    const diff = Math.ceil((dateMs - Date.now()) / 1000)
    return diff > 0 ? diff : 0
  }
  return undefined
}

async function fetchWithTimeout(resource: RequestInfo | URL, options: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    const key = makeKey(resource, rest)
    let p = inflight.get(key)
    if (!p) {
      const req = fetch(resource, { ...rest, signal: controller.signal })
      inflight.set(key, req)
      p = req.finally(() => {
        // slight delay to allow immediate re-use
        setTimeout(() => inflight.delete(key), 0)
      })
    }
    const res = await p
    const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    // Fire-and-forget metrics
    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const payload = JSON.stringify({
          type: 'api',
          url: typeof resource === 'string' ? resource : resource.toString(),
          status: (res as Response).status,
          durationMs: Math.round(end - start),
          t: Date.now(),
        })
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/metrics', blob)
      }
    } catch {}
    return res as Response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(
  resource: RequestInfo | URL, 
  options: RequestInit & { timeoutMs?: number } = {},
  onRetry?: (attempt: number, error: Error) => void
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(resource, options);
      
      // If successful or non-retryable error, return immediately
      if (response.ok || !isRetryableStatus(response.status)) {
        return response;
      }
      
      // For retryable errors, throw to trigger retry logic
      const errorData = await response.json().catch(() => ({}));
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? parseRetryAfter(retryAfterHeader) : undefined;
      const msg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      lastError = new RetryableError(msg, response.status, errorData.code);
      if (lastError instanceof APIError && retryAfterSeconds !== undefined) {
        (lastError as APIError).retryAfterSeconds = retryAfterSeconds;
      }
      
      if (attempt < MAX_RETRIES) {
        const delayMs = getRetryDelay(attempt);
        onRetry?.(attempt + 1, lastError);
        await delay(delayMs);
        continue;
      }
      
      throw lastError;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry non-retryable errors
      if (error instanceof APIError && !error.retryable) {
        throw error;
      }
      
      // Don't retry on abort/timeout after max attempts
      if (attempt >= MAX_RETRIES) {
        throw lastError;
      }
      
      // Retry network errors and timeouts
      const delayMs = getRetryDelay(attempt);
      onRetry?.(attempt + 1, lastError);
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

export async function generateScript(
  input: ScriptInput,
  onRetry?: (attempt: number, error: Error) => void
): Promise<GeneratedScript> {
  try {
    // Security: sanitize and validate before request
    const cleanInput: ScriptInput = {
      ...input,
      niche: sanitizeText(input.niche, 200),
      additionalContext: sanitizeText(input.additionalContext || '', 500),
    }
    // Block prompt injection or inappropriate content
    const combined = `${cleanInput.niche}\n${cleanInput.additionalContext || ''}`
    if (containsPromptInjectionAttempt(combined)) {
      throw new APIError('Unsafe input detected. Please rephrase your request.', 400, 'PROMPT_INJECTION_DETECTED')
    }
    if (containsInappropriateContent(combined)) {
      throw new APIError('Request contains inappropriate content.', 400, 'INAPPROPRIATE_REQUEST')
    }

    const cacheKey = `gen:${JSON.stringify(input)}`;
    const cached = getCache<GeneratedScript>(cacheKey);
    if (cached) return cached;

    const response = await fetchWithRetry('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: cleanInput }),
      timeoutMs: 45000, // Longer timeout for script generation
    }, onRetry);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const is429 = response.status === 429
      const isRetryable = isRetryableStatus(response.status)
      const retryAfterHeader = response.headers.get('retry-after')
      const retryAfterSeconds = retryAfterHeader ? parseRetryAfter(retryAfterHeader) : undefined
      const ErrorClass = isRetryable ? RetryableError : APIError
      const err = new ErrorClass(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code || (is429 ? 'RATE_LIMITED' : undefined)
      )
      if (err instanceof APIError && retryAfterSeconds !== undefined) {
        err.retryAfterSeconds = retryAfterSeconds
      }
      throw err
    }

    const data: APIResponse<GeneratedScript> = await response.json()
    
    if (!data.success || !data.data) {
      throw new APIError(
        data.error || 'Failed to generate script',
        500,
        'GENERATION_FAILED'
      )
    }

    // Content moderation on generated text (basic heuristic)
    const allText = [data.data.hook?.text, data.data.body?.text, data.data.cta?.text].filter(Boolean).join('\n')
    const mod = moderateGeneratedContent(allText)
    if (!mod.safe) {
      throw new APIError('Generated content was flagged by moderation.', 400, 'CONTENT_FLAGGED')
    }

    setCache(cacheKey, data.data)
    return data.data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Network or parsing errors
    throw new RetryableError(
      'Network error: Unable to connect to the server',
      0,
      'NETWORK_ERROR'
    )
  }
}

export async function regenerateScript(
  originalScript: GeneratedScript,
  variations?: string[]
): Promise<GeneratedScript> {
  try {
    const cacheKey = `regen:${originalScript.id}:${JSON.stringify(variations || [])}`;
    const cached = getCache<GeneratedScript>(cacheKey);
    if (cached) return cached;

    const response = await fetchWithTimeout('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        input: originalScript.input,
        generateVariations: true,
        variationCount: 1
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      )
    }

    const data: APIResponse<GeneratedScript> = await response.json()
    
    if (!data.success || !data.data) {
      throw new APIError(
        data.error || 'Failed to regenerate script',
        500,
        'REGENERATION_FAILED'
      )
    }

    return data.data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    throw new APIError(
      'Network error: Unable to connect to the server',
      0,
      'NETWORK_ERROR'
    )
  }
}

// Utility function to handle API errors in components
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    // Prefer explicit 429 messaging with countdown when available
    if (error.status === 429) {
      const secs = error.retryAfterSeconds
      if (typeof secs === 'number' && isFinite(secs) && secs > 0) {
        return `Too many requests. Try again in ${secs} seconds`
      }
      return 'Too many requests. Please wait a moment and try again.'
    }
    switch (error.code) {
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment before trying again.'
      case 'INVALID_INPUT':
        return 'Please check your input and try again.'
      case 'PROMPT_INJECTION_DETECTED':
        return 'Your input appears to contain unsafe instructions. Please rephrase your request.'
      case 'INAPPROPRIATE_REQUEST':
        return 'That request isn’t allowed. Please try a different topic.'
      case 'NETWORK_ERROR':
        return 'Connection failed. Please check your internet and try again.'
      case 'GENERATION_FAILED':
        return 'Failed to generate script. Please try again with different inputs.'
      case 'TIMEOUT':
        return 'Request timed out. Please try again.'
      case 'INVALID_API_KEY':
        return 'API configuration error. Please contact support.'
      case 'QUOTA_EXCEEDED':
        return 'Daily quota exceeded. Please try again tomorrow or upgrade your plan.'
      case 'CONTENT_FLAGGED':
        return 'Content was flagged by moderation. Please try different inputs.'
      default:
        return error.message
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Input validation and sanitization
export function validateScriptInput(input: Partial<ScriptInput>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate niche
  if (!input.niche || typeof input.niche !== 'string') {
    errors.push('Niche is required');
  } else if (input.niche.trim().length === 0) {
    errors.push('Niche cannot be empty');
  } else if (input.niche.length > 200) {
    errors.push('Niche must be less than 200 characters');
  }
  
  // Validate additional context
  if (input.additionalContext && input.additionalContext.length > 500) {
    errors.push('Additional context must be less than 500 characters');
  }
  
  // Validate required enums
  if (!input.targetAudience) {
    errors.push('Target audience is required');
  }
  
  if (!input.contentGoal) {
    errors.push('Content goal is required');
  }
  
  if (!input.tone) {
    errors.push('Tone is required');
  }
  
  if (!input.scriptLength) {
    errors.push('Script length is required');
  }
  
  if (!input.platform) {
    errors.push('Platform is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  return sanitizeText(input, 1000)
}

// ===== LONG-FORM CLIENT =====
export function validateLongFormInput(input: Partial<LongFormInput>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!input.niche || typeof input.niche !== 'string' || input.niche.trim().length === 0) {
    errors.push('Niche is required')
  } else if (input.niche.length > 200) {
    errors.push('Niche must be less than 200 characters')
  }
  if (input.additionalContext && input.additionalContext.length > 1000) {
    errors.push('Additional context too long')
  }
  if (!input.targetAudience) errors.push('Target audience is required')
  if (!input.contentGoal) errors.push('Content goal is required')
  if (!input.tone) errors.push('Tone is required')
  if (!input.videoLengthMinutes) errors.push('Video length is required')

  // Enum validations (defense-in-depth if raw strings reach here)
  if (input.targetAudience && !(['gen-z','millennials','professionals','general-audience'] as const).includes(input.targetAudience)) {
    errors.push('Invalid target audience selection')
  }
  if (input.contentGoal && !Object.values(ContentGoal).includes(input.contentGoal)) {
    errors.push('Invalid content goal selection')
  }
  if (input.tone && !(['funny','professional','motivational','storytelling','casual'] as const).includes(input.tone)) {
    errors.push('Invalid tone selection')
  }
  if (input.videoLengthMinutes && !Object.values(LongFormLength).includes(input.videoLengthMinutes as LongFormLength)) {
    errors.push('Invalid video length selection')
  }
  if (input.niche && containsPromptInjectionAttempt(input.niche)) {
    errors.push('Unsafe input detected in niche')
  }
  return { isValid: errors.length === 0, errors }
}

export async function generateLongFormScript(
  input: LongFormInput,
  onRetry?: (attempt: number, error: Error) => void
): Promise<LongFormGenerated> {
  try {
    // Security: sanitize and validate before request
    const cleanInput: LongFormInput = {
      ...input,
      niche: sanitizeText(input.niche, 200),
      additionalContext: sanitizeText(input.additionalContext || '', 1000),
    }
    const combined = `${cleanInput.niche}\n${cleanInput.additionalContext || ''}`
    if (containsPromptInjectionAttempt(combined)) {
      throw new APIError('Unsafe input detected. Please rephrase your request.', 400, 'PROMPT_INJECTION_DETECTED')
    }
    if (containsInappropriateContent(combined)) {
      throw new APIError('Request contains inappropriate content.', 400, 'INAPPROPRIATE_REQUEST')
    }

    const cacheKey = `gen-long:${JSON.stringify(cleanInput)}`
    const cached = getCache<LongFormGenerated>(cacheKey)
    if (cached) return cached

    const response = await fetchWithRetry('/api/generate-long', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: cleanInput }),
      timeoutMs: 60000,
    }, onRetry)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const is429 = response.status === 429
      const isRetryable = isRetryableStatus(response.status)
      const retryAfterHeader = response.headers.get('retry-after')
      const retryAfterSeconds = retryAfterHeader ? parseRetryAfter(retryAfterHeader) : undefined
      const ErrorClass = isRetryable ? RetryableError : APIError
      const err = new ErrorClass(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code || (is429 ? 'RATE_LIMITED' : undefined)
      )
      if (err instanceof APIError && retryAfterSeconds !== undefined) {
        err.retryAfterSeconds = retryAfterSeconds
      }
      throw err
    }

    const data: APIResponse<LongFormGenerated> = await response.json()
    if (!data.success || !data.data) {
      throw new APIError(data.error || 'Failed to generate long-form script', 500, 'GENERATION_FAILED')
    }

    // Content moderation on generated long-form text
    const joined = [
      data.data.outline?.intro?.title,
      ...((data.data.outline?.sections || []).flatMap(s => [s.title, ...(s.keyPoints || [])])),
      data.data.outline?.outro?.title,
      data.data.script?.intro,
      ...(data.data.script?.sections || []).map(s => s.content),
      data.data.script?.outro,
    ].filter(Boolean).join('\n')
    const mod = moderateGeneratedContent(joined)
    if (!mod.safe) {
      throw new APIError('Generated content was flagged by moderation.', 400, 'CONTENT_FLAGGED')
    }

    setCache(cacheKey, data.data, 2 * DEFAULT_TTL_MS)
    return data.data
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new RetryableError('Network error: Unable to connect to the server', 0, 'NETWORK_ERROR')
  }
}

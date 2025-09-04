"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { LongFormGenerated, LongFormInput, LongFormLength, LongFormTone, LongFormAudience, ContentGoal } from '@/types'
import { generateLongFormScript, getErrorMessage, validateLongFormInput, sanitizeInput, APIError } from '@/lib/api-client'
import { getUsageController, estimateCostUsd } from '@/lib/usage-controls'
import { LongFormResults } from './long-form-results'
import { Loader2 } from 'lucide-react'

export function LongFormGeneratorForm() {
  const [form, setForm] = useState<LongFormInput>({
    niche: '',
    targetAudience: 'general-audience',
    contentGoal: ContentGoal.EDUCATION,
    tone: 'professional',
    videoLengthMinutes: LongFormLength.M10,
    chapterSegmentation: true,
    additionalContext: ''
  })
  // UI-only preferences (kept separate; merged into additionalContext on submit)
  const [emojiIntensity, setEmojiIntensity] = useState<'none'|'subtle'|'balanced'|'heavy'>('balanced')
  const [pacing, setPacing] = useState<number>(6) // 1-10
  const [detailLevel, setDetailLevel] = useState<number>(3) // 1-5
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LongFormGenerated | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const usage = getUsageController('long')
  const [remainingGenerations, setRemainingGenerations] = useState<number>(0)

  // word helpers
  const countWords = (v: string) => (v.trim() ? v.trim().split(/\s+/).length : 0)
  const clampWords = (v: string, max: number) => {
    const parts = v.trim().split(/\s+/)
    if (parts[0] === "") return ""
    return parts.length > max ? parts.slice(0, max).join(" ") : v
  }

  function update<K extends keyof LongFormInput>(key: K, value: LongFormInput[K]) {
    // clamp by words where applicable
    let nextVal: any = value
    if (key === 'niche' && typeof value === 'string') {
      nextVal = clampWords(value, 100)
    }
    if (key === 'additionalContext' && typeof value === 'string') {
      nextVal = clampWords(value, 500)
    }
    setForm(prev => ({ ...prev, [key]: nextVal }))
  }

  function validate(): boolean {
    const sanitized: LongFormInput = {
      ...form,
      niche: sanitizeInput(form.niche),
      additionalContext: form.additionalContext ? sanitizeInput(form.additionalContext) : ''
    }
    // word count validation
    const wNiche = countWords(sanitized.niche)
    const wCtx = countWords(sanitized.additionalContext || '')
    const e: Record<string,string> = {}
    if (wNiche > 100) e.niche = `Topic/Niche must be 100 words or fewer (currently ${wNiche}).`
    if (wCtx > 500) e.additionalContext = `Additional context must be 500 words or fewer (currently ${wCtx}).`
    if (Object.keys(e).length) {
      setErrors(e)
      return false
    }
    const v = validateLongFormInput(sanitized)
    if (!v.isValid) {
      const e2: Record<string,string> = {}
      v.errors.forEach(msg => {
        if (msg.toLowerCase().includes('niche')) e2.niche = msg
        if (msg.toLowerCase().includes('audience')) e2.targetAudience = msg
        if (msg.toLowerCase().includes('goal')) e2.contentGoal = msg
        if (msg.toLowerCase().includes('tone')) e2.tone = msg
        if (msg.toLowerCase().includes('length')) e2.videoLengthMinutes = msg
        if (msg.toLowerCase().includes('context')) e2.additionalContext = msg
      })
      setErrors(e2)
      return false
    }
    setErrors({})
    return true
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cooldownSeconds > 0) return
    if (!validate()) return
    setLoading(true)
    setResult(null)
    setApiError(null)
    try {
      // Merge UI-only prefs into context for better guidance
      const prefsSummary = `\n\nPreferences: emoji=${emojiIntensity}, pacing=${pacing}/10, detailLevel=${detailLevel}/5`
      const payload: LongFormInput = {
        ...form,
        additionalContext: sanitizeInput(`${form.additionalContext || ''}${prefsSummary}`)
      }
      const data = await usage.enqueue(() =>
        generateLongFormScript(payload, (attempt) => {
          console.warn(`Retrying long-form generation, attempt ${attempt}`)
        })
      )
      setResult(data)
      usage.recordSuccess({ niche: form.niche, tone: form.tone, estCostUsd: estimateCostUsd() })
      setRemainingGenerations(usage.getSessionInfo().remaining)
    } catch (err) {
      if (err instanceof APIError && err.status === 429) {
        const secs = typeof err.retryAfterSeconds === 'number' && isFinite(err.retryAfterSeconds) ? Math.max(0, Math.floor(err.retryAfterSeconds)) : 30
        setCooldownSeconds(secs)
        setApiError(`Too many requests. Try again in ${secs} seconds`)
      } else {
        setApiError(getErrorMessage(err))
      }
      usage.recordFailure()
      const cd = usage.getCooldownSeconds()
      if (cd > 0) setCooldownSeconds(cd)
    } finally {
      setLoading(false)
    }
  }

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const id = setInterval(() => {
      setCooldownSeconds((s) => (s > 1 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownSeconds])

  // Refresh remaining generations indicator on mount
  useEffect(() => {
    const { remaining } = usage.getSessionInfo()
    setRemainingGenerations(remaining)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toneOptions: LongFormTone[] = ['funny','professional','motivational','storytelling','casual']
  const audienceOptions: LongFormAudience[] = ['gen-z','millennials','professionals','general-audience']
  const minuteOptions = [3,5,10,15,20] as const

  return (
    <div className="space-y-6">
      <div className="text-xs text-muted-foreground">Remaining free generations today: <strong>{remainingGenerations}</strong> (testing mode — limits not enforced)</div>
      {(apiError || cooldownSeconds > 0) && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-destructive text-sm">
            {cooldownSeconds > 0 ? (
              <>
                <strong>Too many requests.</strong> Try again in <strong>{cooldownSeconds}</strong> seconds.
              </>
            ) : (
              <>
                <strong>Error:</strong> {apiError}
              </>
            )}
          </p>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="niche" className="text-muted-foreground">Topic / Niche</Label>
          <Input id="niche" disabled={loading} value={form.niche} onChange={e => update('niche', e.target.value)} placeholder="e.g., Beginner investing strategies" className="w-full" />
          {errors.niche && <p className="text-sm text-destructive mt-1">{errors.niche}</p>}
          {!errors.niche && (
            <p className="text-xs text-muted-foreground mt-1">{countWords(form.niche)}/100 words</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Target Audience</Label>
            <Select disabled={loading} value={form.targetAudience} onChange={e => update('targetAudience', e.target.value as LongFormAudience)}>
              <optgroup label="Generational">
                <option value="gen-z">Gen Z (18–26)</option>
                <option value="millennials">Millennials (27–42)</option>
              </optgroup>
              <optgroup label="Professional">
                <option value="professionals">Professionals</option>
                <option value="general-audience">General Audience</option>
              </optgroup>
            </Select>
            {errors.targetAudience && <p className="text-sm text-destructive mt-1">{errors.targetAudience}</p>}
            {!errors.targetAudience && (
              <p className="text-xs text-muted-foreground mt-1">
                {form.targetAudience === 'gen-z' && 'Trend-focused, fast-paced content'}
                {form.targetAudience === 'millennials' && 'Career-focused, nostalgia-friendly'}
                {form.targetAudience === 'professionals' && 'Outcome-driven, clear structure'}
                {form.targetAudience === 'general-audience' && 'Accessible, broad appeal'}
              </p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Content Goal</Label>
            <Select disabled={loading} value={form.contentGoal} onChange={e => update('contentGoal', e.target.value as ContentGoal)}>
              <option value={ContentGoal.EDUCATION}>Education</option>
              <option value={ContentGoal.ENTERTAINMENT}>Entertainment</option>
              <option value={ContentGoal.PRODUCT_PROMOTION}>Product Promotion</option>
              <option value={ContentGoal.BRAND_AWARENESS}>Brand Awareness</option>
            </Select>
            {errors.contentGoal && <p className="text-sm text-destructive mt-1">{errors.contentGoal}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Tone</Label>
            <Select disabled={loading} value={form.tone} onChange={e => update('tone', e.target.value as LongFormTone)}>
              {toneOptions.map(t => (<option key={t} value={t}>{t}</option>))}
            </Select>
            {errors.tone && <p className="text-sm text-destructive mt-1">{errors.tone}</p>}
          </div>
          <div>
            <Label className="text-muted-foreground">Video Length</Label>
            <Select disabled={loading} value={form.videoLengthMinutes} onChange={e => update('videoLengthMinutes', Number(e.target.value) as LongFormLength)}>
              {minuteOptions.map(m => (<option key={m} value={m}>{m} minutes</option>))}
            </Select>
            {errors.videoLengthMinutes && <p className="text-sm text-destructive mt-1">{errors.videoLengthMinutes}</p>}
          </div>
        </div>

        {/* UI Extras: Dropdowns & Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-muted-foreground">Emoji Intensity</Label>
            <Select disabled={loading} value={emojiIntensity} onChange={e => setEmojiIntensity(e.target.value as any)}>
              <option value="none">None</option>
              <option value="subtle">Subtle</option>
              <option value="balanced">Balanced</option>
              <option value="heavy">Heavy</option>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground">Pacing: {pacing}/10</Label>
            <div className="pt-2">
              <Slider min={1} max={10} step={1} value={pacing} onValueChange={(v) => setPacing(v)} />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Detail Level: {detailLevel}/5</Label>
            <div className="pt-2">
              <Slider min={1} max={5} step={1} value={detailLevel} onValueChange={(v) => setDetailLevel(v)} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="chapters" disabled={loading} type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" checked={!!form.chapterSegmentation} onChange={e => update('chapterSegmentation', e.target.checked)} />
          <Label htmlFor="chapters" className="text-muted-foreground">Generate timestamped chapters</Label>
        </div>

        <div>
          <Label htmlFor="ctx" className="text-muted-foreground">Additional Context (optional)</Label>
          <textarea id="ctx" disabled={loading} value={form.additionalContext} onChange={e => update('additionalContext', e.target.value)} rows={4} className="w-full bg-card border border-border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Key points, sources, examples, product details, constraints, etc." />
          {errors.additionalContext && <p className="text-sm text-destructive mt-1">{errors.additionalContext}</p>}
          {!errors.additionalContext && (
            <p className="text-xs text-muted-foreground mt-1">{countWords(form.additionalContext || '')}/500 words</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button type="submit" disabled={loading || cooldownSeconds > 0} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? (
              <span className="inline-flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your script...
              </span>
            ) : cooldownSeconds > 0 ? (
              `Try again in ${cooldownSeconds}s`
            ) : (
              'Generate Long-Form Script'
            )}
          </Button>
          <span className="text-sm text-muted-foreground sm:text-left text-center">Structured outline + detailed script{form.chapterSegmentation ? ' + chapters' : ''}</span>
        </div>
      </form>

      {loading && (
        <div className="border border-primary/30 rounded-xl p-5 bg-primary/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Analyzing your inputs and generating outline…</p>
            <span className="text-xs text-muted-foreground">Step 1/3</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary via-accent to-primary animate-[progress_1.6s_ease-in-out_infinite]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs text-foreground/90">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Outline & Chapters</div>
            <div className="flex items-center gap-2 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-primary/80" />Detailed Sections</div>
            <div className="flex items-center gap-2 opacity-60"><span className="w-1.5 h-1.5 rounded-full bg-primary/60" />CTA & Refinements</div>
          </div>
        </div>
      )}

      {result && (
        <div className="border border-border rounded-xl p-5 bg-card/60">
          <LongFormResults result={result} />
        </div>
      )}
    </div>
  )
}

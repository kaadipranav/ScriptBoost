"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LongFormGenerated, LongFormInput, LongFormLength, LongFormTone, LongFormAudience, ContentGoal } from '@/types'
import { generateLongFormScript, getErrorMessage, validateLongFormInput, sanitizeInput, APIError } from '@/lib/api-client'
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LongFormGenerated | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  const [apiError, setApiError] = useState<string | null>(null)

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
      const data = await generateLongFormScript(form, (attempt) => {
        console.warn(`Retrying long-form generation, attempt ${attempt}`)
      })
      setResult(data)
    } catch (err) {
      if (err instanceof APIError && err.status === 429) {
        const secs = typeof err.retryAfterSeconds === 'number' && isFinite(err.retryAfterSeconds) ? Math.max(0, Math.floor(err.retryAfterSeconds)) : 30
        setCooldownSeconds(secs)
        setApiError(`Too many requests. Try again in ${secs} seconds`)
      } else {
        setApiError(getErrorMessage(err))
      }
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

  const toneOptions: LongFormTone[] = ['funny','professional','motivational','storytelling','casual']
  const audienceOptions: LongFormAudience[] = ['gen-z','millennials','professionals','general-audience']
  const minuteOptions = [3,5,10,15,20] as const

  return (
    <div className="space-y-6">
      {(apiError || cooldownSeconds > 0) && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">
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
          <Label htmlFor="niche" className="text-purple-300">Topic / Niche</Label>
          <Input id="niche" disabled={loading} value={form.niche} onChange={e => update('niche', e.target.value)} placeholder="e.g., Beginner investing strategies" className="w-full bg-gray-900 border-gray-700 focus:border-purple-500" />
          {errors.niche && <p className="text-sm text-red-400 mt-1">{errors.niche}</p>}
          {!errors.niche && (
            <p className="text-xs text-gray-400 mt-1">{countWords(form.niche)}/100 words</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-purple-300">Target Audience</Label>
            <Select disabled={loading} value={form.targetAudience} onChange={e => update('targetAudience', e.target.value as LongFormAudience)}>
              {audienceOptions.map(a => (<option key={a} value={a}>{a}</option>))}
            </Select>
            {errors.targetAudience && <p className="text-sm text-red-400 mt-1">{errors.targetAudience}</p>}
          </div>
          <div>
            <Label className="text-purple-300">Content Goal</Label>
            <Select disabled={loading} value={form.contentGoal} onChange={e => update('contentGoal', e.target.value as ContentGoal)}>
              <option value={ContentGoal.EDUCATION}>Education</option>
              <option value={ContentGoal.ENTERTAINMENT}>Entertainment</option>
              <option value={ContentGoal.PRODUCT_PROMOTION}>Product Promotion</option>
              <option value={ContentGoal.BRAND_AWARENESS}>Brand Awareness</option>
            </Select>
            {errors.contentGoal && <p className="text-sm text-red-400 mt-1">{errors.contentGoal}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-purple-300">Tone</Label>
            <Select disabled={loading} value={form.tone} onChange={e => update('tone', e.target.value as LongFormTone)}>
              {toneOptions.map(t => (<option key={t} value={t}>{t}</option>))}
            </Select>
            {errors.tone && <p className="text-sm text-red-400 mt-1">{errors.tone}</p>}
          </div>
          <div>
            <Label className="text-purple-300">Video Length</Label>
            <Select disabled={loading} value={form.videoLengthMinutes} onChange={e => update('videoLengthMinutes', Number(e.target.value) as LongFormLength)}>
              {minuteOptions.map(m => (<option key={m} value={m}>{m} minutes</option>))}
            </Select>
            {errors.videoLengthMinutes && <p className="text-sm text-red-400 mt-1">{errors.videoLengthMinutes}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="chapters" disabled={loading} type="checkbox" className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500" checked={!!form.chapterSegmentation} onChange={e => update('chapterSegmentation', e.target.checked)} />
          <Label htmlFor="chapters" className="text-purple-300">Generate timestamped chapters</Label>
        </div>

        <div>
          <Label htmlFor="ctx" className="text-purple-300">Additional Context (optional)</Label>
          <textarea id="ctx" disabled={loading} value={form.additionalContext} onChange={e => update('additionalContext', e.target.value)} rows={4} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:border-purple-500 outline-none" placeholder="Key points, sources, examples, product details, constraints, etc." />
          {errors.additionalContext && <p className="text-sm text-red-400 mt-1">{errors.additionalContext}</p>}
          {!errors.additionalContext && (
            <p className="text-xs text-gray-400 mt-1">{countWords(form.additionalContext || '')}/500 words</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button type="submit" disabled={loading || cooldownSeconds > 0} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white">
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
          <span className="text-sm text-gray-400 sm:text-left text-center">Structured outline + detailed script{form.chapterSegmentation ? ' + chapters' : ''}</span>
        </div>
      </form>

      {loading && (
        <div className="border border-purple-900/40 rounded-xl p-5 bg-purple-900/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-purple-200">Analyzing your inputs and generating outline…</p>
            <span className="text-xs text-purple-300">Step 1/3</span>
          </div>
          <div className="h-2 w-full rounded-full bg-purple-950/40 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-[progress_1.6s_ease-in-out_infinite]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs text-purple-200/90">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />Outline & Chapters</div>
            <div className="flex items-center gap-2 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-purple-400/70" />Detailed Sections</div>
            <div className="flex items-center gap-2 opacity-60"><span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />CTA & Refinements</div>
          </div>
        </div>
      )}

      {result && (
        <div className="border border-gray-800 rounded-xl p-5 bg-gray-900/60">
          <LongFormResults result={result} />
        </div>
      )}
    </div>
  )
}

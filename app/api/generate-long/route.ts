import { NextRequest, NextResponse } from 'next/server'
import openai, { DEEPSEEK_MODEL } from '@/lib/openrouter'
import { APIResponse, ContentGoal, LongFormGenerated, LongFormInput } from '@/types'
import { generateId } from '@/lib/utils'
import { rateLimiter } from '@/lib/rate-limiter'
import { getEnvConfig } from '@/lib/env-validation'
import { buildLongFormPrompt } from '@/lib/longform-prompt'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  return 'unknown'
}

function tryParseJSON(text: string): any {
  try { return JSON.parse(text) } catch {}
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)
  if (fenced?.[1]) { try { return JSON.parse(fenced[1].trim()) } catch {} }
  const a = text.indexOf('{'); const b = text.lastIndexOf('}')
  if (a !== -1 && b !== -1 && b > a) { try { return JSON.parse(text.slice(a, b+1)) } catch {} }
  throw new Error('Invalid response format from AI model')
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  const ip = getClientIP(request)

  try {
    getEnvConfig()

    if (!rateLimiter.isAllowed(ip)) {
      const reset = rateLimiter.getResetTime(ip)
      const wait = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json({ success: false, error: `Rate limit exceeded. Please try again in ${wait} seconds.`, code: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': String(wait) } })
    }

    let body: { input: LongFormInput }
    try { body = await request.json() } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body', code: 'INVALID_JSON' }, { status: 400 })
    }

    const { input } = body
    const missing: (keyof LongFormInput)[] = []
    if (!input.niche) missing.push('niche')
    if (!input.targetAudience) missing.push('targetAudience')
    if (!input.contentGoal) missing.push('contentGoal')
    if (!input.tone) missing.push('tone')
    if (!input.videoLengthMinutes) missing.push('videoLengthMinutes')

    if (missing.length) {
      return NextResponse.json({ success: false, error: `Missing required fields: ${missing.join(', ')}`, code: 'INVALID_INPUT' }, { status: 400 })
    }

    // Bounds
    if (input.niche.length > 200) {
      return NextResponse.json({ success: false, error: 'Niche must be less than 200 characters', code: 'INVALID_INPUT' }, { status: 400 })
    }
    if (input.additionalContext && input.additionalContext.length > 1000) {
      return NextResponse.json({ success: false, error: 'Additional context too long', code: 'INVALID_INPUT' }, { status: 400 })
    }
    if (![3,5,10,15,20].includes(input.videoLengthMinutes)) {
      return NextResponse.json({ success: false, error: 'Video length must be one of 3, 5, 10, 15, 20 minutes', code: 'INVALID_INPUT' }, { status: 400 })
    }

    console.log(`Generating LONG-FORM for IP: ${ip}, Length: ${input.videoLengthMinutes}m`)

    const prompt = buildLongFormPrompt(input)
    const completion = await openai.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert long-form video scriptwriter. Respond with valid JSON ONLY.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
      top_p: 0.9,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content from AI model')

    const parsed = tryParseJSON(content)
    if (!parsed.outline || !parsed.script) throw new Error('Incomplete long-form structure from AI model')

    // Normalize
    const generated: LongFormGenerated = {
      id: generateId(),
      outline: parsed.outline,
      script: parsed.script,
      ctas: Array.isArray(parsed.ctas) ? parsed.ctas : buildDefaultCTAs(input.contentGoal),
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters : (input.chapterSegmentation ? [] : undefined),
      totalMinutes: input.videoLengthMinutes,
      createdAt: new Date(),
      input,
    }

    const ms = Date.now() - start
    console.log(`Long-form generated in ${ms}ms for IP: ${ip}`)

    const response: APIResponse<LongFormGenerated> = { success: true, data: generated, timestamp: new Date().toISOString() }
    return NextResponse.json(response, { headers: { 'X-Processing-Time': String(ms) } })

  } catch (error) {
    const ms = Date.now() - start
    console.error('Long-form generation error:', error)
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('quota')) {
        const wait = 30
        return NextResponse.json(
          { success: false, error: `Too many requests. Try again in ${wait} seconds`, code: 'RATE_LIMITED', timestamp: new Date().toISOString() },
          { status: 429, headers: { 'Retry-After': String(wait), 'X-Processing-Time': String(ms) } }
        )
      }
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to generate long-form script', code: 'GENERATION_FAILED', timestamp: new Date().toISOString() }, { status: 500, headers: { 'X-Processing-Time': String(ms) } })
  }
}

function buildDefaultCTAs(goal: ContentGoal): string[] {
  switch (goal) {
    case ContentGoal.EDUCATION: return ['Subscribe for more in-depth guides', 'Turn on notifications to keep learning']
    case ContentGoal.ENTERTAINMENT: return ['Like and share if you enjoyed', 'Comment your favorite moment']
    case ContentGoal.PRODUCT_PROMOTION: return ['Check the link in description', 'Use the promo code mentioned']
    case ContentGoal.BRAND_AWARENESS: return ['Follow for more stories', 'Join the community in the description']
    default: return ['Subscribe and stay tuned']
  }
}

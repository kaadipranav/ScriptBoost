import { NextRequest, NextResponse } from 'next/server'
import openai, { DEEPSEEK_MODEL } from '@/lib/openrouter'
import { GeneratedScript, ScriptInput, Tone } from '@/types'

function buildEditInstruction(action: string, tone?: string) {
  switch (action) {
    case 'shorter':
      return 'Make the script more concise by ~20-30% total duration while preserving meaning and flow.'
    case 'longer':
      return 'Expand the script by ~20-30% with more detail and examples while keeping it engaging.'
    case 'rewrite_hook':
      return 'Rewrite ONLY the hook to be punchier and more scroll-stopping, keep body and CTA consistent.'
    case 'change_tone':
      return `Change the overall tone to "${tone}" consistently across hook, body, and CTA without changing core meaning.`
    default:
      return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { script, action, tone } = await req.json()
    if (!script || !action) {
      return NextResponse.json({ success: false, error: 'Missing script or action', timestamp: new Date().toISOString() }, { status: 400 })
    }

    const s: GeneratedScript = script
    const input: ScriptInput = s.input

    const instruction = buildEditInstruction(action, tone)

    const userPayload = {
      input,
      currentScript: {
        hook: s.hook,
        body: s.body,
        cta: s.cta,
        hashtags: s.hashtags,
      },
      instruction,
    }

    const messages: any[] = [
      { role: 'system', content: 'You are an expert viral content creator and script editor. Respond with valid JSON ONLY: {"hook": {...}, "body": {...}, "cta": {...}, "hashtags": []}.' },
      { role: 'user', content: JSON.stringify(userPayload) },
    ]

    const completion = await openai.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.9,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content from model')

    let edited
    try {
      edited = JSON.parse(content)
    } catch {
      const m = content.match(/```json\s*([\s\S]*?)```/i)
      if (m?.[1]) edited = JSON.parse(m[1])
    }
    if (!edited) throw new Error('Invalid model response')

    const result: GeneratedScript = {
      ...s,
      hook: { ...s.hook, ...edited.hook },
      body: { ...s.body, ...edited.body },
      cta: { ...s.cta, ...edited.cta },
      hashtags: Array.isArray(edited.hashtags) ? edited.hashtags : s.hashtags,
      totalDuration: (edited.hook?.duration ?? s.hook.duration ?? 3) + (edited.body?.duration ?? s.body.duration ?? Math.max(1, s.input.scriptLength - 6)) + 3,
      // keep same id but could generate a new one if preferred
    }

    return NextResponse.json({ success: true, data: result, timestamp: new Date().toISOString() })
  } catch (e) {
    console.error('Quick-edit error', e)
    return NextResponse.json({ success: false, error: 'Failed to apply quick edit', timestamp: new Date().toISOString() }, { status: 500 })
  }
}

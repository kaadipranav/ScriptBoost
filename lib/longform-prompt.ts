import { ContentGoal, LongFormInput, LongFormTone } from '@/types'

export function buildLongFormPrompt(input: LongFormInput): string {
  const minutes = input.videoLengthMinutes
  const lengthDesc = `${minutes} minute${minutes > 1 ? 's' : ''}`
  const toneDesc = getToneDesc(input.tone)
  const goalCTA = getGoalCTA(input.contentGoal)

  // Scale structure with length
  const wpm = 150 // typical narration words-per-minute
  const targetWords = Math.round(minutes * wpm)
  const minWords = Math.round(targetWords * 0.9)
  const maxWords = Math.round(targetWords * 1.15)
  // Section count scales with duration
  const sectionRanges: Record<number, [number, number]> = {
    3: [3, 4],
    5: [4, 6],
    10: [6, 9],
    15: [8, 12],
    20: [10, 14],
  }
  const [minSections, maxSections] = sectionRanges[minutes] || [6, 10]
  // Rough pacing guidance (intro/outro share time; remaining divided by sections)
  const introPct = 0.08
  const outroPct = 0.07
  const bodyPct = 1 - introPct - outroPct
  const avgSectionMinutes = Math.max(0.4, (minutes * bodyPct) / ((minSections + maxSections) / 2))
  const avgSectionWords = Math.round(avgSectionMinutes * wpm)

  return `You are an expert YouTube scriptwriter.
Create a long-form video script about "${input.niche}" for ${readableAudience(input.targetAudience)}.
Tone & style: ${toneDesc}.
Total length target: ${lengthDesc}.
Target total words: between ${minWords} and ${maxWords} (ideal ≈ ${targetWords}).
Sections: ${minSections}-${maxSections} body sections (not counting intro/outro).
Average body section length: ≈ ${avgSectionWords} words (some shorter/longer is fine).
Additional context: ${input.additionalContext || 'None'}

STRICT OUTPUT: Return JSON ONLY with this schema:
{
  "outline": {
    "intro": { "title": string, "objective": string },
    "sections": [ { "title": string, "keyPoints": string[] } ],
    "outro": { "title": string, "objective": string }
  },
  "script": {
    "intro": string, 
    "sections": [ { "title": string, "content": string } ],
    "outro": string
  },
  "ctas": string[],
  "chapters": ${input.chapterSegmentation ? '[ { "start": string("MM:SS"), "title": string } ]' : '[]'}
}

Rules:
- Scale depth with length: longer videos require more sections and deeper content.
- The outline must have ${minSections}-${maxSections} sections.
- Each section content must be detailed, narrative/dialogue friendly, and add new substance (no repetition/filler).
- Include clear transitions and engagement prompts.
- CTAs must reflect goal: ${input.contentGoal} (${goalCTA}).
- If chapters requested, generate timestamped chapter titles that approximately sum to ${lengthDesc}. Distribute starts to reflect pacing (intro ~${Math.round(introPct*100)}%, outro ~${Math.round(outroPct*100)}%).
- Keep intro concise and hook-driven (~${Math.round(introPct*minutes)} min). Keep outro concise with CTA (~${Math.round(outroPct*minutes)} min).
- Aim total words between ${minWords}-${maxWords}. Avoid compressing a ${minutes} minute script into fewer words.
- Do not include backticks or extra prose; JSON only.
}

function readableAudience(aud: LongFormInput['targetAudience']): string {
  switch (aud) {
    case 'gen-z': return 'Gen Z'
    case 'millennials': return 'Millennials'
    case 'professionals': return 'Professionals'
    case 'general-audience': return 'a General Audience'
    default: return 'your audience'
  }
}

function getToneDesc(tone: LongFormTone): string {
  switch (tone) {
    case 'funny': return 'Funny, light, with tasteful humor'
    case 'professional': return 'Professional, credible, structured'
    case 'storytelling': return 'Storytelling, narrative-driven'
    case 'motivational': return 'Motivational, inspirational, energetic'
    case 'casual': return 'Casual, conversational, friendly'
    // fallback: reuse educational/promotional guidance via context
    default: return 'Appropriate and consistent'
  }
}

function getGoalCTA(goal: ContentGoal): string {
  switch (goal) {
    case ContentGoal.EDUCATION: return 'subscribe to learn more'
    case ContentGoal.ENTERTAINMENT: return 'like and share for part 2'
    case ContentGoal.PRODUCT_PROMOTION: return 'visit the link to buy/learn'
    case ContentGoal.BRAND_AWARENESS: return 'follow and engage with the brand'
    default: return 'subscribe and engage'
  }
}

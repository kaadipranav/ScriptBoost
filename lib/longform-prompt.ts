import { ContentGoal, LongFormInput, LongFormTone } from '@/types'

export function buildLongFormPrompt(input: LongFormInput): string {
  const minutes = input.videoLengthMinutes
  const lengthDesc = `${minutes} minute${minutes > 1 ? 's' : ''}`
  const toneDesc = getToneDesc(input.tone)
  const goalCTA = getGoalCTA(input.contentGoal)

  return `You are an expert YouTube scriptwriter.
Create a long-form video script about "${input.niche}" for ${readableAudience(input.targetAudience)}.
Tone & style: ${toneDesc}.
Total length target: ${lengthDesc}.
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
  "chapters": ${input.chapterSegmentation ? '[ { "start": string(\"MM:SS\"), "title": string } ]' : '[]'}
}

Rules:
- The outline must have 3-7 sections.
- Each section content must be detailed, narrative/dialogue friendly.
- Include clear transitions and engagement prompts.
- CTAs must reflect goal: ${input.contentGoal} (${goalCTA}).
- If chapters requested, generate timestamped chapter titles that sum to ~${lengthDesc}.
- Do not include backticks or extra prose; JSON only.`
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

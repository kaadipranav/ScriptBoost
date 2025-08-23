import { ScriptInput, ContentGoal, Platform, Tone } from '@/types'
import { generateDynamicPrompt } from './dynamic-prompt-engine'
import { 
  buildEducationalPrompt, 
  buildEntertainmentPrompt, 
  buildPromotionPrompt, 
  buildBrandAwarenessPrompt 
} from './prompt-templates'

export function buildScriptPrompt(input: ScriptInput): string {
  // Use the new dynamic prompt engine as primary method
  try {
    const dynamicPrompt = generateDynamicPrompt(input)
    console.log('Using dynamic prompt engine for script generation')
    return dynamicPrompt
  } catch (error) {
    console.warn('Dynamic prompt engine failed, falling back to legacy prompts:', error)
    
    // Fallback to legacy specialized prompts based on content goal
    return getLegacyPrompt(input)
  }
}

function getLegacyPrompt(input: ScriptInput): string {
  switch (input.contentGoal) {
    case ContentGoal.EDUCATION:
      return buildEducationalPrompt(input)
    case ContentGoal.ENTERTAINMENT:
      return buildEntertainmentPrompt(input)
    case ContentGoal.PRODUCT_PROMOTION:
      return buildPromotionPrompt(input)
    case ContentGoal.BRAND_AWARENESS:
      return buildBrandAwarenessPrompt(input)
    default:
      return buildEducationalPrompt(input) // Default fallback
  }
}

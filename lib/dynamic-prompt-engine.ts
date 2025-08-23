import { ScriptInput, Platform, Tone, ContentGoal, TargetAudience } from '@/types'

// ===== TRENDING PATTERNS & VIRAL FORMATS =====
export const VIRAL_PATTERNS = {
  [Platform.TIKTOK]: {
    currentTrends: [
      "POV: You're the friend who...",
      "Tell me you're [demographic] without telling me",
      "Things that just hit different when...",
      "This is your sign to...",
      "Me explaining to my [person] why...",
      "When you realize...",
      "Nobody: ... Me:",
      "The way I [action] vs how I should [action]"
    ],
    viralFormats: [
      "Before/After transformation",
      "Day in my life as...",
      "Ranking [things] from worst to best",
      "Trying [trend] so you don't have to",
      "Plot twist: [unexpected reveal]",
      "Green screen storytelling",
      "Duet/Stitch response format"
    ],
    soundTrends: [
      "Trending audio with text overlay",
      "Original sound with hook",
      "Remix of popular song",
      "Voiceover with background music"
    ]
  },
  
  [Platform.INSTAGRAM]: {
    currentTrends: [
      "Swipe for the transformation",
      "Save this for later",
      "Share this with someone who needs it",
      "This changed my perspective on...",
      "What I wish I knew about [topic]",
      "The reality of [situation]",
      "Behind the scenes of..."
    ],
    viralFormats: [
      "Carousel post storytelling",
      "Before/after reveal",
      "Step-by-step tutorial",
      "Aesthetic flat lay",
      "Quote with personal story",
      "Day in the life content",
      "Product/service demonstration"
    ],
    aestheticTrends: [
      "Minimalist design",
      "Bold typography overlays",
      "Consistent color palette",
      "High-contrast visuals"
    ]
  },
  
  [Platform.YOUTUBE]: {
    currentTrends: [
      "You won't believe what happened when...",
      "I tried [thing] for [timeframe]",
      "The truth about [topic]",
      "Why everyone's wrong about...",
      "This will change how you think about...",
      "The [number] things that changed my life"
    ],
    viralFormats: [
      "Educational explainer",
      "Personal story/journey",
      "Reaction/commentary",
      "How-to/tutorial",
      "Myth-busting content",
      "Behind-the-scenes reveal"
    ],
    thumbnailElements: [
      "Surprised facial expression",
      "Bold text overlay",
      "Bright contrasting colors",
      "Arrow pointing to key element"
    ]
  }
}

// ===== DEMOGRAPHIC LANGUAGE PATTERNS =====
export const DEMOGRAPHIC_LANGUAGE = {
  [TargetAudience.GEN_Z]: {
    vocabulary: ["lowkey", "highkey", "no cap", "periodt", "slaps", "hits different", "main character energy", "that's on me", "we love to see it"],
    phrases: ["I'm not gonna lie", "It's giving...", "Tell me why...", "The way I...", "Not me...", "This is sending me"],
    references: ["TikTok", "Twitter", "mental health", "sustainability", "social justice", "authenticity"],
    avoidWords: ["millennials do this", "back in my day", "kids these days"]
  },
  
  [TargetAudience.MILLENNIALS]: {
    vocabulary: ["adulting", "mood", "same", "iconic", "queen/king", "slay", "vibe check", "main character", "living for this"],
    phrases: ["As a millennial", "When you're in your 30s", "Remember when", "Plot twist", "Can we talk about"],
    references: ["90s/2000s nostalgia", "work-life balance", "student loans", "house prices", "parenting", "career pivots"],
    avoidWords: ["boomer", "outdated", "old school"]
  },
  
  [TargetAudience.BUSINESS_OWNERS]: {
    vocabulary: ["ROI", "scale", "optimize", "leverage", "streamline", "pivot", "disrupt", "growth hack", "KPIs"],
    phrases: ["As an entrepreneur", "In my business", "What I learned", "Game-changer", "Bottom line"],
    references: ["productivity", "automation", "team management", "cash flow", "market trends", "competition"],
    avoidWords: ["waste time", "impossible", "can't afford", "too risky"]
  },
  
  [TargetAudience.PARENTS]: {
    vocabulary: ["mom/dad life", "parenting win", "family time", "kid-friendly", "safe", "educational", "developmental"],
    phrases: ["As a parent", "With kids", "Family-friendly", "Teaching moments", "Real talk"],
    references: ["school", "activities", "safety", "development", "family bonding", "work-life balance"],
    avoidWords: ["dangerous", "inappropriate", "waste of time", "too complicated"]
  },
  
  [TargetAudience.FITNESS_ENTHUSIASTS]: {
    vocabulary: ["gains", "workout", "fitness journey", "healthy lifestyle", "motivation", "grind", "beast mode", "transformation"],
    phrases: ["As a fitness enthusiast", "In my fitness journey", "What works for me", "Fitness tip", "Health hack"],
    references: ["gym", "nutrition", "workouts", "wellness", "strength training", "cardio", "recovery"],
    avoidWords: ["lazy", "unhealthy", "give up", "impossible"]
  },
  
  [TargetAudience.TECH_PROFESSIONALS]: {
    vocabulary: ["optimize", "scalable", "efficient", "innovative", "cutting-edge", "streamline", "automate", "debug"],
    phrases: ["As a developer", "In tech", "From a technical perspective", "Best practices", "Pro tip"],
    references: ["coding", "software", "tech stack", "APIs", "frameworks", "productivity tools", "automation"],
    avoidWords: ["outdated", "inefficient", "legacy", "broken"]
  },
  
  [TargetAudience.STUDENTS]: {
    vocabulary: ["study tips", "academic", "learning", "grades", "campus life", "budget-friendly", "efficient", "productive"],
    phrases: ["As a student", "In college", "Study hack", "Academic tip", "Student life"],
    references: ["exams", "assignments", "campus", "budget", "time management", "career prep", "networking"],
    avoidWords: ["expensive", "time-consuming", "complicated", "adult problems"]
  },
  
  [TargetAudience.ENTREPRENEURS]: {
    vocabulary: ["startup", "hustle", "scale", "disrupt", "innovate", "pivot", "bootstrap", "growth", "venture"],
    phrases: ["As an entrepreneur", "In my startup journey", "Business insight", "Entrepreneurial tip", "Startup hack"],
    references: ["funding", "investors", "market validation", "product-market fit", "scaling", "competition", "networking"],
    avoidWords: ["safe", "traditional", "corporate", "risk-averse"]
  }
}

// ===== HASHTAG GENERATION SYSTEM =====
export const HASHTAG_STRATEGIES = {
  [Platform.TIKTOK]: {
    maxHashtags: 10,
    strategy: "trending + niche + broad",
    categories: {
      trending: ["fyp", "viral", "trending", "foryou", "foryoupage"],
      broad: ["tiktok", "reels", "content", "video", "creator"],
      engagement: ["comment", "share", "save", "follow", "like"]
    }
  },
  
  [Platform.INSTAGRAM]: {
    maxHashtags: 30,
    strategy: "niche + community + location + broad",
    categories: {
      trending: ["reels", "instagram", "explore", "viral", "trending"],
      community: ["community", "support", "together", "family", "tribe"],
      engagement: ["save", "share", "comment", "follow", "like"]
    }
  },
  
  [Platform.YOUTUBE]: {
    maxHashtags: 15,
    strategy: "searchable + niche + broad",
    categories: {
      trending: ["shorts", "youtube", "viral", "trending", "new"],
      searchable: ["howto", "tutorial", "guide", "tips", "learn"],
      broad: ["video", "content", "creator", "channel", "subscribe"]
    }
  }
}

// ===== DYNAMIC PROMPT ENGINE =====
export class DynamicPromptEngine {
  private input: ScriptInput
  private viralPatterns: any
  private demographicLanguage: any
  private hashtagStrategy: any

  constructor(input: ScriptInput) {
    this.input = input
    this.viralPatterns = VIRAL_PATTERNS[input.platform]
    this.demographicLanguage = DEMOGRAPHIC_LANGUAGE[input.targetAudience]
    this.hashtagStrategy = HASHTAG_STRATEGIES[input.platform]
  }

  generateOptimizedPrompt(): string {
    const basePrompt = this.buildBasePrompt()
    const trendingElements = this.incorporateTrends()
    const demographicAdjustments = this.adjustForDemographics()
    const platformOptimizations = this.addPlatformOptimizations()
    const lengthRequirements = this.ensureLengthCompliance()
    const hashtagGuidance = this.generateHashtagGuidance()

    return `${basePrompt}

${trendingElements}

${demographicAdjustments}

${platformOptimizations}

${lengthRequirements}

${hashtagGuidance}

CRITICAL OPTIMIZATION REQUIREMENTS:
1. Use EXACTLY the demographic language patterns provided
2. Incorporate at least 2 trending formats from the viral patterns
3. Ensure script timing matches ${this.input.scriptLength} seconds precisely
4. Generate hashtags using the platform-specific strategy
5. Include platform-native features and best practices
6. Create hooks that work within first 3 seconds
7. Make content shareable and engagement-worthy

STRICT OUTPUT FORMAT (JSON ONLY):
Return a single JSON object matching this schema with NON-EMPTY strings:
{
  "hook": { "text": string(min 8 chars), "duration": number(=3), "visualCues": string[] },
  "body": { "text": string(min 20 chars), "duration": number(=${this.input.scriptLength - 6}), "keyPoints": string[], "visualCues": string[], "transitions": string[] },
  "cta": { "text": string(min 8 chars), "action": string, "urgency": "low"|"medium"|"high", "visualCues": string[] },
  "hashtags": string[],
  "platformFormatting": { "platform": "${this.input.platform}", "aspectRatio": "9:16", "maxDuration": ${this.input.scriptLength}, "hashtagLimit": 10, "captionLimit": 300, "features": string[] },
  "performance": { "hookStrength": number(1-10), "engagementPotential": number(1-10), "viralPotential": number(1-10), "ctaEffectiveness": number(1-10), "overallScore": number(1-10), "improvements": string[] }
}

Rules:
- Do not leave any text field empty.
- Do not include markdown fences or extra prose. JSON only.`
  }

  private buildBasePrompt(): string {
    return `Create a ${this.input.scriptLength}-second ${this.input.platform} script about "${this.input.niche}" for ${this.input.targetAudience.replace('-', ' ')} with ${this.input.tone} tone for ${this.input.contentGoal.replace('-', ' ')}.

CONTENT GOAL: ${this.getContentGoalStrategy()}
TONE REQUIREMENTS: ${this.getToneRequirements()}
ADDITIONAL CONTEXT: ${this.input.additionalContext || 'None provided'}`
  }

  private incorporateTrends(): string {
    const trends = this.viralPatterns.currentTrends.slice(0, 3)
    const formats = this.viralPatterns.viralFormats.slice(0, 2)
    
    return `VIRAL TRENDS TO INCORPORATE:
Current Trending Patterns:
${trends.map((trend: string) => `- ${trend}`).join('\n')}

Viral Formats to Consider:
${formats.map((format: string) => `- ${format}`).join('\n')}

ADDITIONAL VIRAL STRATEGIES:
- Use pattern interrupts and unexpected moments
- Create "wait for it" moments that build anticipation
- Include relatable "POV" scenarios and situations
- Use trending audio cues and sound effects
- Create content that begs to be shared or saved
- Include controversial or debate-worthy takes (when appropriate)
- Use current events and pop culture references
- Create educational content with surprising facts
- Include before/after transformations or reveals
- Use storytelling with cliffhangers and plot twists

TREND INTEGRATION: Naturally weave these patterns into the script without forcing them. Use them as inspiration for hooks and structure while maintaining authenticity.`
  }

  private adjustForDemographics(): string {
    const vocab = this.demographicLanguage.vocabulary.slice(0, 5)
    const phrases = this.demographicLanguage.phrases.slice(0, 3)
    const references = this.demographicLanguage.references.slice(0, 4)
    
    return `DEMOGRAPHIC LANGUAGE OPTIMIZATION for ${this.input.targetAudience.replace('-', ' ').toUpperCase()}:

Vocabulary to Include:
${vocab.map((word: string) => `- "${word}"`).join('\n')}

Natural Phrases:
${phrases.map((phrase: string) => `- "${phrase}"`).join('\n')}

Relevant References:
${references.map((ref: string) => `- ${ref}`).join('\n')}

Words to AVOID:
${this.demographicLanguage.avoidWords.map((word: string) => `- "${word}"`).join('\n')}

DEMOGRAPHIC-SPECIFIC GUIDELINES:
- Match the energy level and communication style of this audience
- Use appropriate slang and colloquialisms naturally
- Reference relevant cultural touchstones and shared experiences
- Adjust complexity level to match audience sophistication
- Use humor and references that resonate with this demographic
- Consider generational differences in communication preferences
- Adapt tone to match how this audience typically communicates online

LANGUAGE RULE: Use this vocabulary naturally - don't force it. The script should sound authentic to this demographic and feel like it's coming from someone who truly understands their world.`
  }

  private addPlatformOptimizations(): string {
    switch (this.input.platform) {
      case Platform.TIKTOK:
        return `TIKTOK OPTIMIZATION REQUIREMENTS:
- Hook must grab attention in first 1-2 seconds with movement or surprise
- Use trending sounds/audio cues in script direction
- Include text overlay suggestions for key points
- Create "duet-able" or "stitch-able" moments
- Use fast-paced, energetic delivery with quick cuts
- Include visual transitions every 3-5 seconds
- Make it comment-worthy with questions or controversial takes
- Use TikTok-native language and expressions
- Include trending hashtags: #fyp #viral #trending
- Create loop potential - end connects to beginning
- Use vertical 9:16 format with close-up shots
- Include captions for accessibility
- Create shareable moments that spark conversation
- Use current TikTok trends: dance moves, challenges, memes
- Include call-to-action for engagement (like, share, follow)`

      case Platform.INSTAGRAM:
        return `INSTAGRAM REELS OPTIMIZATION:
- Create "save-worthy" educational moments with clear takeaways
- Include aesthetic visual cues and styling with consistent brand colors
- Use Instagram-native features (polls, questions, stickers)
- Create story-reshare potential with quotable moments
- Include clear value proposition in first 3 seconds
- Use high-quality, polished presentation with good lighting
- Create carousel-worthy key points for multi-slide posts
- Encourage profile visits and follows with compelling bio CTA
- Use trending Instagram audio and music
- Include relevant hashtags: mix of popular and niche tags
- Create content that encourages saves and shares
- Use vertical 9:16 format optimized for mobile viewing
- Include text overlays for key information
- Create behind-the-scenes or authentic moments
- Use Instagram Reels features: transitions, effects, timers`

      case Platform.YOUTUBE:
        return `YOUTUBE SHORTS OPTIMIZATION:
- Create strong thumbnail moments in script with compelling visuals
- Include searchable keywords naturally in dialogue
- Build to satisfying conclusion/payoff that delivers on promise
- Create subscription-worthy value that makes viewers want more
- Use clear, concise explanations with step-by-step guidance
- Include end-screen worthy CTAs for related videos
- Make content educational/informative with actionable insights
- Create series/playlist potential with episodic structure
- Use YouTube-friendly language that's advertiser-safe
- Include trending YouTube topics and formats
- Create content that encourages comments and engagement
- Use vertical 9:16 format with clear audio quality
- Include captions and timestamps for accessibility
- Create watch-time optimization with strong retention hooks
- Use YouTube Shorts features: music, effects, quick cuts`

      default:
        return "Standard platform optimization"
    }
  }

  private ensureLengthCompliance(): string {
    const hookTime = 3
    const ctaTime = 3
    const bodyTime = this.input.scriptLength - hookTime - ctaTime

    return `PRECISE TIMING REQUIREMENTS:
- HOOK: Exactly ${hookTime} seconds (approximately 8-10 words)
- BODY: Exactly ${bodyTime} seconds (approximately ${Math.floor(bodyTime * 2.5)}-${Math.floor(bodyTime * 3)} words)
- CTA: Exactly ${ctaTime} seconds (approximately 8-10 words)
- TOTAL: Must equal exactly ${this.input.scriptLength} seconds

PACING GUIDE:
- Average speaking pace: 2.5-3 words per second
- Include natural pauses and emphasis
- Account for visual transitions and effects
- Ensure comfortable, not rushed delivery`
  }

  private generateHashtagGuidance(): string {
    const strategy = this.hashtagStrategy
    const nicheHashtags = this.generateNicheHashtags()
    
    return `HASHTAG GENERATION STRATEGY (${strategy.strategy}):
Max Hashtags: ${strategy.maxHashtags}

Required Categories:
${Object.entries(strategy.categories).map(([category, tags]) => 
  `${category.toUpperCase()}: ${(tags as string[]).slice(0, 3).join(', ')}`
).join('\n')}

Niche-Specific Hashtags for "${this.input.niche}":
${nicheHashtags.join(', ')}

PLATFORM-SPECIFIC HASHTAG OPTIMIZATION:
${this.getPlatformHashtagStrategy()}

HASHTAG RULES:
1. Mix trending (30%), niche (40%), and broad (30%) hashtags
2. Use relevant, searchable terms that match content
3. Include platform-specific viral hashtags
4. Avoid banned or shadowbanned hashtags
5. Make hashtags discoverable and relevant to target audience
6. Include branded hashtags when appropriate
7. Use location-based hashtags if relevant
8. Include trending challenge or meme hashtags when suitable`
  }

  private getPlatformHashtagStrategy(): string {
    switch (this.input.platform) {
      case Platform.TIKTOK:
        return `TikTok Strategy: Use #fyp #viral #trending + niche tags + trending challenges`
      case Platform.INSTAGRAM:
        return `Instagram Strategy: Mix popular/niche tags + location tags + branded hashtags`
      case Platform.YOUTUBE:
        return `YouTube Strategy: Focus on searchable keywords + trending topics + series tags`
      default:
        return `General Strategy: Balance trending and niche hashtags`
    }
  }

  private generateNicheHashtags(): string[] {
    const niche = this.input.niche.toLowerCase()
    const words = niche.split(' ')
    const hashtags = []
    
    // Add niche-specific hashtags
    hashtags.push(niche.replace(/\s+/g, ''))
    words.forEach(word => {
      if (word.length > 3) {
        hashtags.push(word)
        hashtags.push(`${word}tips`)
        hashtags.push(`${word}hacks`)
      }
    })
    
    // Add goal-specific hashtags
    switch (this.input.contentGoal) {
      case ContentGoal.EDUCATION:
        hashtags.push('learn', 'education', 'tips', 'howto', 'tutorial')
        break
      case ContentGoal.ENTERTAINMENT:
        hashtags.push('funny', 'entertainment', 'viral', 'comedy', 'relatable')
        break
      case ContentGoal.PRODUCT_PROMOTION:
        hashtags.push('review', 'recommendation', 'musthave', 'product', 'shopping')
        break
      case ContentGoal.BRAND_AWARENESS:
        hashtags.push('brand', 'story', 'mission', 'values', 'community')
        break
    }
    
    return hashtags.slice(0, 8)
  }

  private getContentGoalStrategy(): string {
    switch (this.input.contentGoal) {
      case ContentGoal.EDUCATION:
        return "Teach valuable, actionable information that viewers can immediately apply"
      case ContentGoal.ENTERTAINMENT:
        return "Create shareable, engaging content that entertains and delights"
      case ContentGoal.PRODUCT_PROMOTION:
        return "Subtly promote while providing genuine value and building trust"
      case ContentGoal.BRAND_AWARENESS:
        return "Build brand recognition and emotional connection with audience"
      default:
        return "Provide value while achieving the specified goal"
    }
  }

  private getToneRequirements(): string {
    switch (this.input.tone) {
      case Tone.FUNNY:
        return "Use humor, wit, and comedic timing. Include unexpected twists or punchlines."
      case Tone.PROFESSIONAL:
        return "Maintain authority and credibility while being accessible and trustworthy."
      case Tone.STORYTELLING:
        return "Create narrative arc with emotional hooks and memorable moments."
      case Tone.EDUCATIONAL:
        return "Be clear, informative, and easy to understand with actionable insights."
      case Tone.PROMOTIONAL:
        return "Be persuasive but authentic, focusing on benefits and value."
      default:
        return "Maintain consistent, appropriate tone throughout"
    }
  }
}

// ===== MAIN EXPORT FUNCTION =====
export function generateDynamicPrompt(input: ScriptInput): string {
  const engine = new DynamicPromptEngine(input)
  return engine.generateOptimizedPrompt()
}

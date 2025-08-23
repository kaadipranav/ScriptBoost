import { ScriptInput, Platform, Tone, ContentGoal, TargetAudience } from '@/types'

// ===== HOOK FORMULAS =====
export const HOOK_FORMULAS = {
  // Question hooks that create curiosity
  CURIOSITY_QUESTION: [
    "Did you know that {statistic} about {niche}?",
    "What if I told you {surprising_fact}?",
    "Why do {percentage} of people get {niche} wrong?",
    "Have you ever wondered why {common_belief} is actually false?"
  ],
  
  // Problem identification hooks
  PROBLEM_IDENTIFICATION: [
    "Stop doing {common_mistake} in {niche}",
    "If you're struggling with {problem}, this is for you",
    "The biggest mistake people make with {niche} is...",
    "You're probably doing {activity} wrong, and here's why"
  ],
  
  // Transformation promise hooks
  TRANSFORMATION: [
    "How I went from {before_state} to {after_state} in {timeframe}",
    "This {simple_method} changed everything about my {niche}",
    "The {number}-second trick that will transform your {niche}",
    "I wish someone told me this about {niche} {timeframe} ago"
  ],
  
  // Controversy/contrarian hooks
  CONTRARIAN: [
    "Everyone's wrong about {popular_belief}",
    "Unpopular opinion: {controversial_statement}",
    "Why {popular_method} is actually hurting your {goal}",
    "The truth about {niche} that nobody talks about"
  ],
  
  // Urgency/scarcity hooks
  URGENCY: [
    "You have {timeframe} to fix this {problem}",
    "This {opportunity} won't last forever",
    "If you don't {action} now, you'll regret it",
    "Last chance to {benefit} before {deadline}"
  ]
}

// ===== CTA TEMPLATES =====
export const CTA_TEMPLATES = {
  EDUCATIONAL: {
    low: [
      "What's your experience with {topic}? Share below!",
      "Which tip will you try first? Let me know!",
      "Save this for later and tag someone who needs to see it",
      "Follow for more {niche} tips like this"
    ],
    medium: [
      "Try this today and comment your results!",
      "Share this with someone who needs to hear it",
      "Which part surprised you most? Tell me below!",
      "Follow @{username} for daily {niche} insights"
    ],
    high: [
      "Do this RIGHT NOW and watch what happens",
      "Stop scrolling and try this immediately",
      "Your {goal} depends on taking action TODAY",
      "Don't just watch - DO IT and thank me later"
    ]
  },
  
  ENTERTAINMENT: {
    low: [
      "Tag someone who would relate to this",
      "Which one are you? Comment below!",
      "Follow for more content like this",
      "Save this if it made you laugh"
    ],
    medium: [
      "Share this with your {target_group}!",
      "Comment if this is literally you",
      "Tag your {relationship} who does this",
      "Follow @{username} for daily laughs"
    ],
    high: [
      "SHARE this if you've been called out",
      "Tag EVERYONE who needs to see this",
      "Comment 'ME' if this is you right now",
      "Follow NOW for content that hits different"
    ]
  },
  
  PRODUCT_PROMOTION: {
    low: [
      "What questions do you have about {product_category}?",
      "Follow for more {product_type} reviews",
      "Save this for your next {purchase_occasion}",
      "Share your {product_category} experience below"
    ],
    medium: [
      "Link in bio to learn more about this {product}",
      "DM me '{keyword}' for the full details",
      "Comment '{emoji}' if you want the link",
      "Check my stories for more info on this"
    ],
    high: [
      "Get yours before they sell out - link in bio",
      "DM me NOW for exclusive {discount}",
      "Comment 'WANT' for instant access",
      "Limited time only - don't miss out!"
    ]
  },
  
  BRAND_AWARENESS: {
    low: [
      "What's your take on {industry_topic}?",
      "Follow @{brand} for more insights",
      "Share your {brand_related} story below",
      "Tag us in your {brand_activity} posts"
    ],
    medium: [
      "Join our community of {target_audience}",
      "Share this if you agree with our mission",
      "Follow @{brand} to stay updated",
      "What would you like to see from us next?"
    ],
    high: [
      "Be part of the {brand_movement} - follow now",
      "Join thousands who trust @{brand}",
      "Ready to {brand_promise}? Follow us",
      "Don't just follow - become part of our story"
    ]
  }
}

// ===== CONTENT-SPECIFIC PROMPT BUILDERS =====

export function buildEducationalPrompt(input: ScriptInput): string {
  const platformSpecs = getPlatformSpecs(input.platform)
  const audienceSpecs = getAudienceSpecs(input.targetAudience)
  
  return `Create a ${input.scriptLength}-second educational ${input.platform} script about "${input.niche}" for ${input.targetAudience}.

EDUCATIONAL CONTENT REQUIREMENTS:
- Start with a compelling hook that promises valuable learning
- Break down complex concepts into digestible steps
- Use the "Problem → Solution → Proof → Action" structure
- Include specific, actionable takeaways
- Make learning feel effortless and engaging
- Use storytelling to make information memorable

ENGAGEMENT STRATEGIES:
- Use pattern interrupts every 5-7 seconds
- Include "aha moment" reveals
- Reference common misconceptions to correct
- Use analogies and metaphors for clarity
- Create "save-worthy" moments

HOOK FORMULA (First 3 seconds):
Choose from: Curiosity Question, Problem Identification, or Transformation Promise
Examples:
- "The ${input.niche} mistake 90% of people make..."
- "What if I told you everything you know about ${input.niche} is wrong?"
- "This ${input.niche} secret changed everything for me..."

${platformSpecs}
${audienceSpecs}

TONE: ${input.tone} but always educational and authoritative
ADDITIONAL CONTEXT: ${input.additionalContext || 'None'}

Format as JSON with hook, body, cta, hashtags, platformFormatting, and performance fields.`
}

export function buildEntertainmentPrompt(input: ScriptInput): string {
  const platformSpecs = getPlatformSpecs(input.platform)
  const audienceSpecs = getAudienceSpecs(input.targetAudience)
  
  return `Create a ${input.scriptLength}-second viral entertainment ${input.platform} script about "${input.niche}" for ${input.targetAudience}.

VIRAL ENTERTAINMENT REQUIREMENTS:
- Hook must be instantly engaging and shareable
- Use humor, surprise, or emotional triggers
- Create "comment-worthy" moments
- Include relatable situations or characters
- Build to a satisfying payoff or punchline
- Make viewers want to share immediately

VIRAL POTENTIAL STRATEGIES:
- Use trending formats and memes
- Create "duet-able" or "stitch-able" moments
- Include controversial but harmless takes
- Use unexpected plot twists
- Reference current events or pop culture
- Create "tag your friend who..." moments

HOOK FORMULA (First 3 seconds):
Choose from: Contrarian, Curiosity Question, or Transformation
Examples:
- "POV: You're the friend who always..."
- "Tell me you're ${input.targetAudience} without telling me..."
- "Things that just hit different when you're..."

ENTERTAINMENT STRUCTURES:
1. Setup → Escalation → Punchline
2. Relatable Problem → Funny Solution → Twist
3. Character Introduction → Situation → Resolution
4. Before/After → Dramatic Reveal → Reaction

${platformSpecs}
${audienceSpecs}

TONE: ${input.tone} with high entertainment value and shareability
ADDITIONAL CONTEXT: ${input.additionalContext || 'None'}

Format as JSON with hook, body, cta, hashtags, platformFormatting, and performance fields.`
}

export function buildPromotionPrompt(input: ScriptInput): string {
  const platformSpecs = getPlatformSpecs(input.platform)
  const audienceSpecs = getAudienceSpecs(input.targetAudience)
  
  return `Create a ${input.scriptLength}-second subtle product promotion ${input.platform} script about "${input.niche}" for ${input.targetAudience}.

SUBTLE SELLING REQUIREMENTS:
- Lead with value, not product features
- Address pain points before introducing solutions
- Use social proof and testimonials naturally
- Create desire through storytelling
- Make the product feel like a natural solution
- Avoid pushy or salesy language

PERSUASION PSYCHOLOGY:
- Use the "Problem-Agitation-Solution" framework
- Include scarcity or urgency elements
- Leverage social proof and authority
- Create emotional connection before logical appeal
- Use "because" reasoning for requests
- Include risk reversal or guarantees

HOOK FORMULA (First 3 seconds):
Choose from: Problem Identification, Transformation, or Curiosity Question
Examples:
- "I used to struggle with ${input.niche} until I found this..."
- "The ${input.niche} solution nobody talks about..."
- "How I solved my ${input.niche} problem in 30 days..."

SUBTLE SELLING STRUCTURE:
1. Relatable Problem → Personal Story → Solution Reveal → Soft CTA
2. Before/After → Journey Story → Product Introduction → Social Proof
3. Common Mistake → Better Way → Tool/Method → Results

AUTHENTICITY MARKERS:
- Share personal experience/journey
- Acknowledge product limitations
- Include genuine user testimonials
- Show real results, not just promises
- Use conversational, not corporate language

${platformSpecs}
${audienceSpecs}

TONE: ${input.tone} but authentic and helpful, not pushy
ADDITIONAL CONTEXT: ${input.additionalContext || 'None'}

Format as JSON with hook, body, cta, hashtags, platformFormatting, and performance fields.`
}

export function buildBrandAwarenessPrompt(input: ScriptInput): string {
  const platformSpecs = getPlatformSpecs(input.platform)
  const audienceSpecs = getAudienceSpecs(input.targetAudience)
  
  return `Create a ${input.scriptLength}-second brand awareness ${input.platform} script about "${input.niche}" for ${input.targetAudience}.

BRAND AWARENESS REQUIREMENTS:
- Establish brand personality and values
- Create emotional connection with audience
- Share brand story or mission
- Showcase brand culture or behind-the-scenes
- Build trust and credibility
- Make brand memorable and relatable

BRAND BUILDING STRATEGIES:
- Use consistent brand voice and messaging
- Share founder/team stories
- Highlight brand values in action
- Show social impact or community involvement
- Create brand-associated emotions
- Use visual and verbal brand elements

HOOK FORMULA (First 3 seconds):
Choose from: Brand Story, Values Statement, or Behind-the-Scenes
Examples:
- "Why we started [BRAND_NAME]..."
- "The story behind [BRAND_NAME] that nobody knows..."
- "What [BRAND_NAME] really stands for..."

BRAND AWARENESS STRUCTURE:
1. Brand Origin Story → Values → Mission → Community
2. Problem We Solve → Our Approach → Our Impact → Join Us
3. Behind-the-Scenes → Team Culture → Brand Values → Invitation

EMOTIONAL CONNECTION POINTS:
- Shared values and beliefs
- Common struggles or aspirations
- Community and belonging
- Purpose beyond profit
- Authentic human stories

${platformSpecs}
${audienceSpecs}

TONE: ${input.tone} but authentic and brand-aligned
ADDITIONAL CONTEXT: ${input.additionalContext || 'None'}

Format as JSON with hook, body, cta, hashtags, platformFormatting, and performance fields.`
}

// ===== PLATFORM-SPECIFIC FORMATTING RULES =====

function getPlatformSpecs(platform: Platform): string {
  switch (platform) {
    case Platform.TIKTOK:
      return `
TIKTOK SPECIFICATIONS:
- Vertical 9:16 format optimized
- Fast-paced editing with quick cuts
- Use trending sounds and effects
- Include text overlays for key points
- Hook within first 1-3 seconds
- Encourage duets, stitches, and comments
- Use popular hashtags and challenges
- Keep captions under 300 characters
- Include call-to-action in video, not just caption
- Use TikTok-native language and trends`

    case Platform.INSTAGRAM:
      return `
INSTAGRAM REELS SPECIFICATIONS:
- Vertical 9:16 format for Reels
- Polished, aesthetic visual style
- Use trending Instagram audio
- Strong visual storytelling elements
- Include save-worthy moments
- Optimize for Instagram algorithm
- Use relevant hashtags (up to 30)
- Encourage saves, shares, and story reposts
- Include branded elements subtly
- Cross-promote to Stories`

    case Platform.YOUTUBE:
      return `
YOUTUBE SHORTS SPECIFICATIONS:
- Vertical 9:16 format for Shorts
- Clear, concise messaging
- Strong thumbnail potential moments
- Encourage subscriptions and notifications
- Use YouTube-friendly language
- Optimize for search discovery
- Include end screen elements
- Create series or playlist potential
- Use YouTube community features
- Longer retention focus`

    default:
      return "Standard short-form video format"
  }
}

function getAudienceSpecs(audience: TargetAudience): string {
  switch (audience) {
    case TargetAudience.GEN_Z:
      return `
GEN Z AUDIENCE (18-26):
- Use current slang and internet culture
- Reference TikTok trends and memes
- Address mental health, authenticity, social issues
- Use quick, snappy communication style
- Include diverse representation
- Focus on experiences over possessions
- Use humor and self-deprecation
- Reference pop culture and social media`

    case TargetAudience.MILLENNIALS:
      return `
MILLENNIAL AUDIENCE (27-42):
- Reference 90s/2000s nostalgia
- Address work-life balance, career growth
- Use humor about adulting struggles
- Include references to childhood/teen experiences
- Focus on practical solutions and efficiency
- Address financial concerns and goals
- Use relatable parenting or relationship content
- Balance professionalism with authenticity`

    case TargetAudience.BUSINESS_OWNERS:
      return `
BUSINESS OWNER AUDIENCE:
- Focus on ROI, efficiency, and growth
- Use business terminology appropriately
- Address common entrepreneurial challenges
- Include success stories and case studies
- Focus on actionable business strategies
- Address time management and productivity
- Use professional but approachable tone
- Include industry insights and trends`

    case TargetAudience.PARENTS:
      return `
PARENT AUDIENCE:
- Address parenting challenges and solutions
- Use family-friendly language and content
- Focus on child development and safety
- Include time-saving tips and hacks
- Address work-life balance with kids
- Use relatable parenting situations
- Include educational content for children
- Focus on family bonding and activities`

    default:
      return "General audience considerations"
  }
}

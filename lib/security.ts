// Security and validation utilities for client-side input hardening
// These helpers are SSR-safe and can be used in forms and API client.

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all|any|previous) (instructions|directions)/i,
  /disregard (the )?(system|previous) prompt/i,
  /(you are|you're) (an? )?ai|chatgpt|assistant/i,
  /act as (.+)/i,
  /switch (role|persona)/i,
  /reveal (hidden|system|internal) (prompt|instructions)/i,
  /print (the )?(system|hidden) prompt/i,
  /jailbreak/i,
]

const INAPPROPRIATE_CONTENT: RegExp[] = [
  /sexual|porn|nsfw|erotic/i,
  /violence|gore|torture/i,
  /hate\s*speech|racist|bigot/i,
  /extremist|terror/i,
]

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

export function escapeScriptTags(input: string): string {
  return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
}

export function removeEventHandlers(input: string): string {
  return input.replace(/on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

export function removeJsProtocols(input: string): string {
  return input.replace(/javascript:/gi, '')
}

export function clamp(input: string, max = 1000): string {
  return input.length > max ? input.slice(0, max) : input
}

export function sanitizeText(input?: string, max = 1000): string {
  if (!input) return ''
  const cleaned = clamp(removeEventHandlers(removeJsProtocols(escapeScriptTags(stripHtml(input)))), max)
  return cleaned.replace(/[<>]/g, '')
}

export function validateSelection<T extends string>(value: string, allowed: readonly T[]): value is T {
  return allowed.includes(value as T)
}

export function containsPromptInjectionAttempt(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text))
}

export function containsInappropriateContent(text: string): boolean {
  return INAPPROPRIATE_CONTENT.some((re) => re.test(text))
}

export function validateEmail(email?: string): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function moderateGeneratedContent(text: string): { safe: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (containsInappropriateContent(text)) reasons.push('Inappropriate content detected')
  // Add additional heuristics as needed
  return { safe: reasons.length === 0, reasons }
}

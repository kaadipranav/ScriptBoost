// Environment variable validation
export function validateEnvVars() {
  // Only the API key is strictly required. The others have safe defaults in openrouter.ts
  const requiredVars = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  }

  const optionalVars = {
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL, // defaults to https://openrouter.ai/api/v1
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,           // defaults to deepseek/deepseek-chat
  }

  const missingRequired = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingRequired.join(', ')}\n` +
      'Please add them to your .env.local file and restart the dev server.'
    )
  }

  // Warn (do not throw) if optional vars are missing
  const missingOptional = Object.entries(optionalVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingOptional.length > 0) {
    console.warn(
      `Optional env var(s) not set (${missingOptional.join(', ')}). Using defaults from lib/openrouter.ts.`
    )
  }

  return {
    ...requiredVars,
    ...optionalVars,
  } as Record<string, string>
}

export function getEnvConfig() {
  try {
    return validateEnvVars()
  } catch (error) {
    console.error('Environment validation failed:', error)
    throw error
  }
}

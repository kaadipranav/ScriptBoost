import { NextRequest, NextResponse } from 'next/server';
import openai, { DEEPSEEK_MODEL } from '@/lib/openrouter';
import { ScriptInput, GeneratedScript, APIResponse } from '@/types';
import { generateId } from '@/lib/utils';
import { rateLimiter } from '@/lib/rate-limiter';
import { getEnvConfig } from '@/lib/env-validation';
import { buildScriptPrompt } from '@/lib/script-prompts';

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Attempt to safely parse JSON from a possibly noisy LLM response
function tryParseModelJSON(text: string): any {
  // 1) Direct parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 2) Look for fenced code block ```json ... ```
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch && fencedMatch[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch (_) {}
  }

  // 3) Fallback: extract the largest JSON-like substring between the first '{' and the last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  // 4) Give up
  throw new Error('Invalid response format from AI model');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Validate environment variables
    const envConfig = getEnvConfig();
    
    // Rate limiting
    if (!rateLimiter.isAllowed(clientIP)) {
      const resetTime = rateLimiter.getResetTime(clientIP);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
          code: 'RATE_LIMITED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': waitTime.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      );
    }

    // Parse and validate request body
    let body: { input: ScriptInput };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { input } = body;
    
    // Validate required fields
    const requiredFields = ['niche', 'targetAudience', 'contentGoal', 'tone', 'platform', 'scriptLength'];
    const missingFields = requiredFields.filter(field => !input[field as keyof ScriptInput]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    // Validate script length
    if (![15, 30, 60].includes(input.scriptLength)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Script length must be 15, 30, or 60 seconds',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    console.log(`Generating script for IP: ${clientIP}, Platform: ${input.platform}, Length: ${input.scriptLength}s`);

    // Helper to call the model and parse
    const generateOnce = async (extraInstruction?: string) => {
      const basePrompt = buildScriptPrompt(input);
      const finalPrompt = extraInstruction ? `${basePrompt}\n\nADDITIONAL CONSTRAINTS:\n${extraInstruction}` : basePrompt;

      const completion = await openai.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert viral content creator and script writer. Respond with valid JSON ONLY, no prose, no backticks.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.9,
      });

      const scriptContent = completion.choices[0]?.message?.content;
      if (!scriptContent) throw new Error('No script generated from AI model');
      return tryParseModelJSON(scriptContent);
    };

    // First attempt
    let parsedScript = await generateOnce();
    const isEmpty = (s: any) => !s || typeof s.text !== 'string' || s.text.trim().length === 0;
    if (isEmpty(parsedScript.hook) || isEmpty(parsedScript.body) || isEmpty(parsedScript.cta)) {
      // One retry with stricter constraints
      parsedScript = await generateOnce('Do NOT leave hook.text, body.text, or cta.text empty. Provide full sentences for each.');
    }

    // Validate parsed script structure
    if (!parsedScript.hook || !parsedScript.body || !parsedScript.cta) {
      throw new Error('Incomplete script structure from AI model');
    }

    // Final guard against empties
    const ensureText = (t?: string) => (typeof t === 'string' && t.trim().length > 0) ? t : '...';
    parsedScript.hook.text = ensureText(parsedScript.hook.text);
    parsedScript.body.text = ensureText(parsedScript.body.text);
    parsedScript.cta.text = ensureText(parsedScript.cta.text);

    // Calculate total duration
    const totalDuration = (parsedScript.hook?.duration || 3) + 
                         (parsedScript.body?.duration || input.scriptLength - 6) + 
                         3; // CTA duration

    // Create the final script object
    const generatedScript: GeneratedScript = {
      id: generateId(),
      hook: {
        text: parsedScript.hook.text || '',
        duration: parsedScript.hook.duration || 3,
        visualCues: parsedScript.hook.visualCues || []
      },
      body: {
        text: parsedScript.body.text || '',
        duration: parsedScript.body.duration || input.scriptLength - 6,
        keyPoints: parsedScript.body.keyPoints || [],
        visualCues: parsedScript.body.visualCues || [],
        transitions: parsedScript.body.transitions || []
      },
      cta: {
        text: parsedScript.cta.text || '',
        action: parsedScript.cta.action || 'engage',
        urgency: parsedScript.cta.urgency || 'medium',
        visualCues: parsedScript.cta.visualCues || []
      },
      hashtags: parsedScript.hashtags || [],
      platform: input.platform,
      platformFormatting: parsedScript.platformFormatting || {
        platform: input.platform,
        aspectRatio: '9:16' as const,
        maxDuration: input.scriptLength,
        hashtagLimit: 10,
        captionLimit: 300,
        features: []
      },
      totalDuration,
      createdAt: new Date(),
      input,
      performance: parsedScript.performance
    };

    const processingTime = Date.now() - startTime;
    console.log(`Script generated successfully in ${processingTime}ms for IP: ${clientIP}`);

    const response: APIResponse<GeneratedScript> = {
      success: true,
      data: generatedScript,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimiter.getRemainingRequests(clientIP).toString(),
        'X-Processing-Time': processingTime.toString()
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Script generation error:', error);
    console.error(`Error occurred after ${processingTime}ms for IP: ${clientIP}`);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'API configuration error. Please contact support.',
            code: 'API_CONFIG_ERROR',
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        const defaultWait = 30; // seconds
        return NextResponse.json(
          { 
            success: false, 
            error: `Too many requests. Try again in ${defaultWait} seconds`,
            code: 'RATE_LIMITED',
            timestamp: new Date().toISOString()
          },
          { status: 429, headers: { 'Retry-After': defaultWait.toString() } }
        );
      }
    }

    // Fallback generic handler but include error message when available
    const message = (error instanceof Error && error.message) 
      ? error.message 
      : 'Failed to generate script. Please try again.'

    return NextResponse.json(
      { 
        success: false, 
        error: message,
        code: 'GENERATION_FAILED',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

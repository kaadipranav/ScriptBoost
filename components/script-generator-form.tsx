"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select } from "./ui/select"
import { Slider } from "./ui/slider"
import { Loader2, Sparkles, X, AlertCircle, Clock, HelpCircle, Info } from "lucide-react"
import { Platform, Tone, ContentGoal, TargetAudience, ScriptLength, GeneratedScript } from "@/types"
import { cn } from "@/lib/utils"
import { ScriptResults } from "./script-results"
import { generateScript, getErrorMessage, validateScriptInput, sanitizeInput, APIError } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"
import { Tooltip } from "./ui/tooltip"

interface FormData {
  niche: string
  targetAudience: TargetAudience
  contentGoal: ContentGoal
  tone: Tone
  scriptLength: ScriptLength
  platform: Platform
  additionalContext: string
  // UI-only preferences (appended into additionalContext on submit)
  emojiIntensity?: 'none' | 'subtle' | 'balanced' | 'heavy'
  hookSpeed?: number // 1-10
  hashtagCount?: number // 0-10
}

interface FormErrors {
  niche?: string
  targetAudience?: string
  contentGoal?: string
  tone?: string
  platform?: string
  additionalContext?: string
}

interface LoadingState {
  isLoading: boolean
  progress: number
  estimatedTime: number
  retryAttempt: number
  canCancel: boolean
}

const tonePreviewData = {
  [Tone.FUNNY]: { emoji: "😂", description: "Light-hearted and entertaining" },
  [Tone.PROFESSIONAL]: { emoji: "💼", description: "Authoritative and credible" },
  [Tone.STORYTELLING]: { emoji: "📚", description: "Narrative and engaging" },
  [Tone.EDUCATIONAL]: { emoji: "🎓", description: "Informative and clear" },
  [Tone.PROMOTIONAL]: { emoji: "🚀", description: "Persuasive and action-oriented" },
}

const platformData = {
  [Platform.TIKTOK]: { name: "TikTok", color: "bg-pink-500" },
  [Platform.INSTAGRAM]: { name: "Instagram Reels", color: "bg-purple-500" },
  [Platform.YOUTUBE]: { name: "YouTube Shorts", color: "bg-red-500" },
}

export function ScriptGeneratorForm() {
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  
  const [formData, setFormData] = useState<FormData>({
    niche: "",
    targetAudience: TargetAudience.GEN_Z,
    contentGoal: ContentGoal.ENTERTAINMENT,
    tone: Tone.FUNNY,
    scriptLength: ScriptLength.MEDIUM,
    platform: Platform.TIKTOK,
    additionalContext: "",
    emojiIntensity: 'balanced',
    hookSpeed: 6,
    hashtagCount: 5,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    estimatedTime: 0,
    retryAttempt: 0,
    canCancel: false
  })
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Check server config (OPENROUTER_API_KEY presence)
  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!mounted) return
        setServiceAvailable(Boolean(data?.available))
      } catch {
        if (!mounted) return
        setServiceAvailable(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const id = setInterval(() => {
      setCooldownSeconds((s) => (s > 1 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownSeconds])

  // word helpers
  const countWords = (v: string) => (v?.trim() ? v.trim().split(/\s+/).length : 0)
  const clampWords = (v: string, max: number) => {
    const t = v?.trim() ?? ""
    if (!t) return ""
    const parts = t.split(/\s+/)
    return parts.length > max ? parts.slice(0, max).join(" ") : v
  }

  const validateForm = (): boolean => {
    // Sanitize inputs first
    const sanitizedData = {
      ...formData,
      niche: sanitizeInput(formData.niche),
      additionalContext: sanitizeInput(formData.additionalContext)
    }
    // Word-count checks
    const wNiche = countWords(sanitizedData.niche)
    const wCtx = countWords(sanitizedData.additionalContext)
    if (wNiche > 100 || wCtx > 500) {
      const newErrors: FormErrors = {}
      if (wNiche > 100) newErrors.niche = `Topic/Niche must be 100 words or fewer (currently ${wNiche}).`
      if (wCtx > 500) newErrors.additionalContext = `Additional context must be 500 words or fewer (currently ${wCtx}).`
      setErrors(newErrors)
      return false
    }
    
    // Use comprehensive validation
    const validation = validateScriptInput(sanitizedData)
    
    if (!validation.isValid) {
      const newErrors: FormErrors = {}
      validation.errors.forEach(error => {
        if (error.includes('niche')) newErrors.niche = error
        if (error.includes('context')) newErrors.additionalContext = error
        if (error.includes('audience')) newErrors.targetAudience = error
        if (error.includes('goal')) newErrors.contentGoal = error
        if (error.includes('tone')) newErrors.tone = error
        if (error.includes('platform')) newErrors.platform = error
      })
      setErrors(newErrors)
      return false
    }
    
    setErrors({})
    return true
  }

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    setLoadingState({
      isLoading: false,
      progress: 0,
      estimatedTime: 0,
      retryAttempt: 0,
      canCancel: false
    })
    
    toast({
      title: "Generation Cancelled",
      description: "Script generation was cancelled.",
      variant: "default"
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (serviceAvailable === false) {
      toast({
        title: "Service temporarily unavailable",
        description: "Please try again later.",
        variant: "destructive"
      })
      return
    }
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      })
      return
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      estimatedTime: 30,
      retryAttempt: 0,
      canCancel: true
    })
    setApiError(null)
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setLoadingState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 15, 85),
        estimatedTime: Math.max(prev.estimatedTime - 1, 5)
      }))
    }, 1000)
    
    try {
      // Merge UI-only preferences into additionalContext for better guidance
      const prefsSummary = `\n\nPreferences: emoji=${formData.emojiIntensity}, hookSpeed=${formData.hookSpeed}/10, desiredHashtags≈${formData.hashtagCount}`
      const mergedContext = `${formData.additionalContext || ''}${prefsSummary}`

      const sanitizedInput = {
        ...formData,
        niche: sanitizeInput(formData.niche),
        additionalContext: sanitizeInput(mergedContext)
      }

      const script = await generateScript(sanitizedInput, (attempt, error) => {
        setLoadingState(prev => ({
          ...prev,
          retryAttempt: attempt,
          estimatedTime: prev.estimatedTime + 10
        }))
        
        toast({
          title: `Retry Attempt ${attempt}`,
          description: `Retrying due to: ${getErrorMessage(error)}`,
          variant: "warning"
        })
      })

      clearInterval(progressInterval)
      setLoadingState(prev => ({ ...prev, progress: 100 }))
      
      setTimeout(() => {
        setGeneratedScript(script)
        setLoadingState({
          isLoading: false,
          progress: 0,
          estimatedTime: 0,
          retryAttempt: 0,
          canCancel: false
        })
        
        toast({
          title: "Script Generated!",
          description: "Your viral script is ready to use.",
          variant: "success"
        })
      }, 500)

    } catch (error) {
      clearInterval(progressInterval)
      console.error("Error generating script:", error)
      // Handle rate limit with countdown when available
      if (error instanceof APIError && error.status === 429) {
        const secs = typeof error.retryAfterSeconds === 'number' && isFinite(error.retryAfterSeconds)
          ? Math.max(0, Math.floor(error.retryAfterSeconds))
          : 30
        setCooldownSeconds(secs)
        setApiError(`Too many requests. Try again in ${secs} seconds`)
      } else {
        const errorMessage = getErrorMessage(error)
        setApiError(errorMessage)
      }
      
      setLoadingState({
        isLoading: false,
        progress: 0,
        estimatedTime: 0,
        retryAttempt: 0,
        canCancel: false
      })
      
      const toastMsg = getErrorMessage(error)
      toast({ title: "Generation Failed", description: toastMsg, variant: "destructive" })
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    // clamp by word limits
    let nextVal = value
    if (field === 'niche' && typeof value === 'string') nextVal = clampWords(value, 100)
    if (field === 'additionalContext' && typeof value === 'string') nextVal = clampWords(value, 500)
    setFormData(prev => ({ ...prev, [field]: nextVal }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const resetForm = () => {
    setGeneratedScript(null)
    setApiError(null)
  }

  // Show results if script is generated
  if (generatedScript) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <ScriptResults 
          script={generatedScript} 
          formData={formData}
          onGenerateNew={resetForm}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {serviceAvailable === false && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-900 dark:text-amber-100 text-sm">
            <strong>Service temporarily unavailable.</strong> Please try again later.
          </p>
        </div>
      )}
      {(apiError || cooldownSeconds > 0) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">
            {cooldownSeconds > 0 ? (
              <>
                <strong>Too many requests.</strong> Try again in <strong>{cooldownSeconds}</strong> seconds.
              </>
            ) : (
              <>
                <strong>Error:</strong> {apiError}
              </>
            )}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Niche Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="niche" className="text-base font-semibold">
              What's your niche or topic? *
            </Label>
            <Tooltip content="Be specific! Examples: 'Morning workout routines for busy professionals' or 'Quick healthy breakfast recipes under 5 minutes'">
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            id="niche"
            placeholder="e.g., Fitness tips, Cooking hacks, Business advice..."
            value={formData.niche}
            onChange={(e) => updateFormData("niche", e.target.value)}
            className={cn(
              "w-full text-base h-12",
              errors.niche && "border-red-500 focus-visible:ring-red-500"
            )}
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            {errors.niche ? (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.niche}
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  Be specific for better results
                </p>
                <span className="text-xs text-muted-foreground">{countWords(formData.niche)}/100 words</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">&nbsp;</span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="audience" className="text-base font-semibold">
              Target Audience
            </Label>
            <Tooltip content="Choose your primary audience. This affects language style, references, and content approach for maximum engagement.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Select
            id="audience"
            value={formData.targetAudience}
            onChange={(e) => updateFormData("targetAudience", e.target.value as TargetAudience)}
            className="text-base h-12"
          >
            <option value={TargetAudience.GEN_Z}>Gen Z (18-26) - TikTok natives, trend-focused</option>
            <option value={TargetAudience.MILLENNIALS}>Millennials (27-42) - Career-focused, nostalgic</option>
            <option value={TargetAudience.BUSINESS_OWNERS}>Business Owners - Growth & efficiency focused</option>
            <option value={TargetAudience.PARENTS}>Parents - Family & time-saving focused</option>
            <option value={TargetAudience.FITNESS_ENTHUSIASTS}>Fitness Enthusiasts - Health & motivation focused</option>
            <option value={TargetAudience.TECH_PROFESSIONALS}>Tech Professionals - Innovation & productivity focused</option>
            <option value={TargetAudience.STUDENTS}>Students - Learning & budget-conscious</option>
            <option value={TargetAudience.ENTREPRENEURS}>Entrepreneurs - Hustle & success focused</option>
          </Select>
        </div>

        {/* Content Goal */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-semibold">Content Goal</Label>
            <Tooltip content="Your content goal determines the script structure, call-to-action, and overall messaging strategy.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(ContentGoal).map((goal) => {
              const goalDescriptions: Record<ContentGoal, string> = {
                [ContentGoal.EDUCATION]: "Teach something valuable",
                [ContentGoal.ENTERTAINMENT]: "Make people laugh or smile",
                [ContentGoal.PRODUCT_PROMOTION]: "Showcase product/service",
                [ContentGoal.BRAND_AWARENESS]: "Build brand recognition & trust"
              }
              
              return (
                <Tooltip key={goal} content={goalDescriptions[goal]} side="bottom">
                  <label
                    className={cn(
                      "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                      formData.contentGoal === goal
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="contentGoal"
                      value={goal}
                      checked={formData.contentGoal === goal}
                      onChange={(e) => updateFormData("contentGoal", e.target.value as ContentGoal)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.contentGoal === goal
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {formData.contentGoal === goal && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {goal.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-semibold">Tone & Style</Label>
            <Tooltip content="The tone affects language style, humor level, and overall personality of your script.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(Tone).map((tone) => {
              const toneDescriptions: Record<Tone, string> = {
                [Tone.FUNNY]: "Humorous & entertaining",
                [Tone.PROFESSIONAL]: "Formal & authoritative", 
                [Tone.STORYTELLING]: "Narrative & engaging",
                [Tone.EDUCATIONAL]: "Informative & clear",
                [Tone.PROMOTIONAL]: "Persuasive & sales-focused"
              }
              
              return (
                <Tooltip key={tone} content={toneDescriptions[tone]} side="bottom">
                  <label
                    className={cn(
                      "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                      formData.tone === tone
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={tone}
                      checked={formData.tone === tone}
                      onChange={(e) => updateFormData("tone", e.target.value as Tone)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.tone === tone
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {formData.tone === tone && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {tone.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Script Length */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-semibold">
              Script Length: {formData.scriptLength}s
            </Label>
            <Tooltip content="Choose the optimal length for your platform. TikTok favors 15-30s, Instagram 30s, YouTube 60s+">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: ScriptLength.SHORT, label: "15s", description: "Quick & punchy" },
              { value: ScriptLength.MEDIUM, label: "30s", description: "Balanced content" },
              { value: ScriptLength.LONG, label: "60s", description: "Detailed story" }
            ].map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  formData.scriptLength === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <input
                  type="radio"
                  name="scriptLength"
                  value={option.value}
                  checked={formData.scriptLength === option.value}
                  onChange={(e) => updateFormData("scriptLength", parseInt(e.target.value) as ScriptLength)}
                  className="sr-only"
                />
                <div className="text-lg font-bold">{option.label}</div>
                <div className="text-xs text-muted-foreground text-center">
                  {option.description}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Platform Selector */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-semibold">Platform</Label>
            <Tooltip content="Each platform has unique algorithms and audience behaviors. This affects script style, pacing, and optimization.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(Platform).map((platform) => {
              const platformDescriptions: Record<Platform, string> = {
                [Platform.TIKTOK]: "Short, trendy, fast-paced content",
                [Platform.INSTAGRAM]: "Visual storytelling & aesthetic focus",
                [Platform.YOUTUBE]: "Longer form, searchable content"
              }
              
              return (
                <Tooltip key={platform} content={platformDescriptions[platform]} side="bottom">
                  <label
                    className={cn(
                      "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      formData.platform === platform
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={platform}
                      checked={formData.platform === platform}
                      onChange={(e) => updateFormData("platform", e.target.value as Platform)}
                      className="sr-only"
                    />
                    <div className="text-2xl">
                      {platform === Platform.TIKTOK && "📱"}
                      {platform === Platform.INSTAGRAM && "📸"}
                      {platform === Platform.YOUTUBE && "🎥"}
                    </div>
                    <div className="text-center">
                      <div className="font-medium capitalize">{platform}</div>
                      <div className="text-xs text-muted-foreground">
                        {platformDescriptions[platform]}
                      </div>
                    </div>
                  </label>
                </Tooltip>
              )
            })}
        </div>
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="context" className="text-base font-semibold">
              Additional Context (Optional)
            </Label>
            <Tooltip content="Add specific requirements, brand guidelines, trending topics, or any other details to customize your script.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            id="context"
            placeholder="Any specific requirements, brand guidelines, or additional details..."
            value={formData.additionalContext}
            onChange={(e) => updateFormData("additionalContext", e.target.value)}
            className="w-full text-base h-12"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Include trending topics, brand voice, or specific calls-to-action
            </p>
            <span className="text-xs text-muted-foreground">{countWords(formData.additionalContext)}/500 words</span>
          </div>
        </div>

        {/* UI Extras: Dropdowns & Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Emoji Intensity</Label>
            <Select
              value={formData.emojiIntensity}
              onChange={(e) => updateFormData('emojiIntensity', e.target.value as FormData['emojiIntensity'])}
              className="h-12"
            >
              <option value="none">None</option>
              <option value="subtle">Subtle</option>
              <option value="balanced">Balanced</option>
              <option value="heavy">Heavy</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Hook Speed: {formData.hookSpeed}/10</Label>
            <Slider min={1} max={10} step={1} value={formData.hookSpeed} onValueChange={(v) => updateFormData('hookSpeed', v)} />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Hashtag Count: {formData.hashtagCount}</Label>
            <Slider min={0} max={10} step={1} value={formData.hashtagCount} onValueChange={(v) => updateFormData('hashtagCount', v)} />
          </div>
        </div>

        {/* Loading Progress */}
        {loadingState.isLoading && (
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">
                  {loadingState.retryAttempt > 0 
                    ? `Retrying... (Attempt ${loadingState.retryAttempt})`
                    : "Generating Your Script..."
                  }
                </span>
              </div>
              {loadingState.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelGeneration}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(loadingState.progress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${loadingState.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated time: ~{loadingState.estimatedTime} seconds</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          type="submit"
          size="lg"
          disabled={loadingState.isLoading || serviceAvailable === false || serviceAvailable === null || cooldownSeconds > 0}
          className="w-full h-14 text-base font-semibold"
        >
          {loadingState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Script...
            </>
          ) : cooldownSeconds > 0 ? (
            <>Try again in {cooldownSeconds}s</>
          ) : serviceAvailable === null ? (
            <>Checking service…</>
          ) : serviceAvailable === false ? (
            <>Service unavailable</>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Viral Script
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

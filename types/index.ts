// ===== ENUMS =====
export enum Platform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
}

export enum Tone {
  FUNNY = 'funny',
  PROFESSIONAL = 'professional',
  STORYTELLING = 'storytelling',
  EDUCATIONAL = 'educational',
  PROMOTIONAL = 'promotional',
}

export enum ContentGoal {
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  PRODUCT_PROMOTION = 'product-promotion',
  BRAND_AWARENESS = 'brand-awareness',
}

export enum ScriptLength {
  SHORT = 15,
  MEDIUM = 30,
  LONG = 60,
}

export enum TargetAudience {
  GEN_Z = 'gen-z',
  MILLENNIALS = 'millennials',
  BUSINESS_OWNERS = 'business-owners',
  PARENTS = 'parents',
  FITNESS_ENTHUSIASTS = 'fitness-enthusiasts',
  TECH_PROFESSIONALS = 'tech-professionals',
  STUDENTS = 'students',
  ENTREPRENEURS = 'entrepreneurs',
}

// ===== USER INPUT TYPES =====
export interface ScriptInput {
  niche: string;
  targetAudience: TargetAudience;
  contentGoal: ContentGoal;
  tone: Tone;
  scriptLength: ScriptLength;
  platform: Platform;
  additionalContext?: string;
}

export interface ScriptInputForm extends Omit<ScriptInput, 'targetAudience' | 'contentGoal' | 'tone' | 'scriptLength' | 'platform'> {
  targetAudience: string;
  contentGoal: string;
  tone: string;
  scriptLength: number;
  platform: string;
}

// ===== SCRIPT OUTPUT TYPES =====
export interface ScriptHook {
  text: string;
  duration: number; // seconds
  visualCues?: string[];
}

export interface ScriptBody {
  text: string;
  duration: number;
  keyPoints: string[];
  visualCues?: string[];
  transitions?: string[];
}

export interface ScriptCTA {
  text: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
  visualCues?: string[];
}

export interface PlatformFormatting {
  platform: Platform;
  aspectRatio: '9:16' | '1:1' | '16:9';
  maxDuration: number;
  hashtagLimit: number;
  captionLimit: number;
  features: string[];
}

export interface GeneratedScript {
  id: string;
  hook: ScriptHook;
  body: ScriptBody;
  cta: ScriptCTA;
  hashtags: string[];
  platform: Platform;
  platformFormatting: PlatformFormatting;
  totalDuration: number;
  createdAt: Date;
  input: ScriptInput;
  performance?: ScriptPerformance;
}

export interface ScriptPerformance {
  hookStrength: number; // 1-10
  engagementPotential: number; // 1-10
  viralPotential: number; // 1-10
  ctaEffectiveness: number; // 1-10
  overallScore: number; // 1-10
  improvements: string[];
}

// ===== SCRIPT VARIATIONS =====
export interface ScriptVariation {
  id: string;
  parentScriptId: string;
  variationType: 'hook' | 'body' | 'cta' | 'tone' | 'length';
  script: GeneratedScript;
  createdAt: Date;
}

// ===== SCRIPT HISTORY & MANAGEMENT =====
export interface ScriptHistory {
  scripts: GeneratedScript[];
  variations: ScriptVariation[];
  totalGenerated: number;
  lastGenerated?: Date;
  favoriteScripts: string[]; // script IDs
}

export interface ScriptCollection {
  id: string;
  name: string;
  description?: string;
  scriptIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== API TYPES =====
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface GenerateScriptRequest {
  input: ScriptInput;
  generateVariations?: boolean;
  variationCount?: number;
}

export interface GenerateScriptResponse {
  script: GeneratedScript;
  variations?: GeneratedScript[];
  creditsUsed: number;
  remainingCredits: number;
}

// ===== USER & SUBSCRIPTION TYPES =====
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  subscription: SubscriptionTier;
  creditsRemaining: number;
  scriptsGenerated: number;
  joinedAt: Date;
  preferences: UserPreferences;
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  AGENCY = 'agency',
}

export interface UserPreferences {
  defaultPlatform: Platform;
  defaultTone: Tone;
  defaultLength: ScriptLength;
  autoSave: boolean;
  darkMode: boolean;
  emailNotifications: boolean;
}

// ===== ANALYTICS TYPES =====
export interface ScriptAnalytics {
  scriptId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clickThroughRate: number;
  engagementRate: number;
  platform: Platform;
  recordedAt: Date;
}

export interface TrendData {
  platform: Platform;
  trendingTopics: string[];
  popularHashtags: string[];
  viralFormats: string[];
  audienceInsights: {
    mostActiveHours: number[];
    preferredContentTypes: ContentGoal[];
    engagementPatterns: string[];
  };
  updatedAt: Date;
}

// ===== UTILITY TYPES =====
export type ScriptStatus = 'draft' | 'generated' | 'published' | 'archived';
export type SortOrder = 'newest' | 'oldest' | 'most-liked' | 'best-performance';
export type FilterOptions = {
  platform?: Platform;
  tone?: Tone;
  contentGoal?: ContentGoal;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: ScriptStatus;
};

// ===== FORM VALIDATION TYPES =====
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// ===== LONG-FORM VIDEO TYPES =====
// Keep short-form enums intact; long-form uses independent string unions/enums to avoid breaking changes

export type LongFormAudience = 'gen-z' | 'millennials' | 'professionals' | 'general-audience'

// Long-form tone options per requirements
export type LongFormTone = 'funny' | 'professional' | 'motivational' | 'storytelling' | 'casual'

export enum LongFormLength {
  M3 = 3,
  M5 = 5,
  M10 = 10,
  M15 = 15,
  M20 = 20,
}

export interface LongFormInput {
  niche: string;
  targetAudience: LongFormAudience;
  contentGoal: ContentGoal; // reuse existing goals
  tone: LongFormTone;
  videoLengthMinutes: LongFormLength; // 3,5,10,15,20
  chapterSegmentation?: boolean;
  additionalContext?: string;
}

export interface LongFormOutlineSection {
  title: string;
  keyPoints: string[];
}

export interface LongFormOutline {
  intro: { title: string; objective: string };
  sections: LongFormOutlineSection[];
  outro: { title: string; objective: string };
}

export interface LongFormScriptSection {
  title: string;
  content: string; // narration/dialogue style text
}

export interface LongFormScriptBody {
  intro: string;
  sections: LongFormScriptSection[];
  outro: string;
}

export interface LongFormChapter {
  start: string; // MM:SS
  title: string;
}

export interface LongFormGenerated {
  id: string;
  outline: LongFormOutline;
  script: LongFormScriptBody;
  ctas: string[];
  chapters?: LongFormChapter[];
  totalMinutes: number;
  createdAt: Date;
  input: LongFormInput;
}

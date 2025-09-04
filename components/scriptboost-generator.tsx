"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { GeneratorFormSkeleton } from '@/components/skeletons'
import ErrorBoundary from '@/components/error-boundary'
// Lazy-load heavy generator forms
const ScriptGeneratorForm = dynamic(() => import('@/components/script-generator-form').then(m => m.ScriptGeneratorForm), {
  ssr: false,
  loading: () => <GeneratorFormSkeleton />
})
const LongFormGeneratorForm = dynamic(() => import('@/components/long-form-generator-form').then(m => m.LongFormGeneratorForm), {
  ssr: false,
  loading: () => <GeneratorFormSkeleton />
})

export function ScriptboostGenerator() {
  const [mode, setMode] = useState<'short' | 'long'>('short')

  return (
    <ErrorBoundary resetKeys={[mode]}>
      <div>
      {/* Mode Switcher: theme-aware styles */}
      <div className="flex flex-col sm:inline-flex w-full rounded-xl overflow-hidden border mb-6 bg-card/70 backdrop-blur-sm border-border">
        <button
          aria-pressed={mode === 'short'}
          className={`relative w-full sm:w-auto px-4 py-3 sm:py-2 text-sm md:text-base font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 
            ${mode === 'short'
              ? 'bg-blue-600 text-white shadow-[0_0_0_2px_rgba(59,130,246,0.15)_inset]'
              : 'text-foreground/80 hover:text-foreground hover:bg-muted'} 
            hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200`}
          onClick={() => setMode('short')}
        >
          Short-Form
        </button>
        <button
          aria-pressed={mode === 'long'}
          className={`relative w-full sm:w-auto px-4 py-3 sm:py-2 text-sm md:text-base font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 
            ${mode === 'long'
              ? 'bg-purple-600 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.18)_inset]'
              : 'text-foreground/80 hover:text-foreground hover:bg-muted'} 
            hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200`}
          onClick={() => setMode('long')}
        >
          Long-Form
        </button>
      </div>

      {/* Form container: translucent, theme-aware background */}
      <div className={`rounded-2xl p-4 md:p-6 bg-card/70 backdrop-blur-sm border border-border ${mode === 'short' ? 'ring-1 ring-blue-900/40' : 'ring-1 ring-purple-900/40'}`}>
        {mode === 'short' ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400">Short-Form Mode</h3>
              <p className="text-sm text-muted-foreground">Create punchy, high-retention scripts (≤ 60s) optimized for TikTok, Reels, and Shorts. Fine-tune tone, hooks, and hashtags for fast scroll-stopping impact.</p>
            </div>
            <ScriptGeneratorForm />
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-purple-500 dark:text-purple-400">Long-Form Mode</h3>
              <p className="text-sm text-muted-foreground">Plan and generate 3–20 minute structured scripts with detailed outlines, narration cues, CTAs, and optional chapters for clear viewing flow.</p>
            </div>
            <LongFormGeneratorForm />
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  )
}

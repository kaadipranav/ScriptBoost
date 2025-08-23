"use client"
import React, { useState } from 'react'
import { ScriptGeneratorForm } from '@/components/script-generator-form'
import { LongFormGeneratorForm } from '@/components/long-form-generator-form'

export function ScriptboostGenerator() {
  const [mode, setMode] = useState<'short' | 'long'>('short')

  return (
    <div>
      <div className="flex flex-col sm:inline-flex w-full rounded-xl overflow-hidden border border-gray-800 mb-6 bg-gray-900">
        <button
          aria-pressed={mode === 'short'}
          className={`relative w-full sm:w-auto px-4 py-3 sm:py-2 text-sm md:text-base font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 
            ${mode === 'short'
              ? 'bg-blue-600 text-white shadow-[0_0_0_2px_rgba(59,130,246,0.15)_inset]'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'} 
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
              : 'text-gray-300 hover:text-white hover:bg-gray-800'} 
            hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200`}
          onClick={() => setMode('long')}
        >
          Long-Form
        </button>
      </div>

      <div className={`rounded-2xl p-4 md:p-6 ${mode === 'short' ? 'ring-1 ring-blue-900/40' : 'ring-1 ring-purple-900/40'}`}>
        {mode === 'short' ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-400">Short-Form Mode</h3>
              <p className="text-sm text-gray-400">≤ 60s scripts optimized for TikTok, Reels, and Shorts</p>
            </div>
            <ScriptGeneratorForm />
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-purple-400">Long-Form Mode</h3>
              <p className="text-sm text-gray-400">3–20 minute structured scripts with outline, narration, CTAs, and optional chapters</p>
            </div>
            <LongFormGeneratorForm />
          </div>
        )}
      </div>
    </div>
  )
}

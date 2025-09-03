'use client'

import { useState } from 'react'
import { useTheme, Theme } from '@/lib/theme-context'

const themeLabels: Record<Theme, string> = {
  minimalist: 'Minimalist',
  notion: 'Notion Style',
  neon: 'Neon Cyberpunk',
  cinematic: 'Cinematic Black'
}

const themeDescriptions: Record<Theme, string> = {
  minimalist: 'Clean, simple, and distraction-free',
  notion: 'Warm, professional, and organized',
  neon: 'Vibrant, futuristic, and electric',
  cinematic: 'Dark, elegant, and dramatic'
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[11rem] md:min-w-[12rem] px-4 py-3 text-left bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg transition-all duration-200"
        style={{ boxShadow: 'var(--color-shadow)' }}
      >
        <div>
          <div className="font-medium text-[var(--color-text)]">
            {themeLabels[theme]}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {themeDescriptions[theme]}
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full right-0 left-auto mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg z-20 overflow-hidden w-[min(20rem,calc(100vw-2rem))]"
            style={{ boxShadow: 'var(--color-shadow)' }}
          >
            {(Object.keys(themeLabels) as Theme[]).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors duration-200 ${
                  theme === themeKey ? 'bg-[var(--color-accent)]/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${
                      theme === themeKey 
                        ? 'text-[var(--color-accent)]' 
                        : 'text-[var(--color-text)]'
                    }`}>
                      {themeLabels[themeKey]}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {themeDescriptions[themeKey]}
                    </div>
                  </div>
                  {theme === themeKey && (
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

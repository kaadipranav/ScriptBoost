'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'minimalist' | 'notion' | 'neon' | 'cinematic'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  surfaceHover: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  borderHover: string
  shadow: string
  success: string
  warning: string
  error: string
}

export const themes: Record<Theme, ThemeColors> = {
  minimalist: {
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066CC',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceHover: '#F1F3F4',
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E1E5E9',
    borderHover: '#C1C7CD',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    success: '#00C851',
    warning: '#FF8800',
    error: '#FF4444'
  },
  notion: {
    primary: '#2F3437',
    secondary: '#787774',
    accent: '#0F7B6C',
    background: '#FFFFFF',
    surface: '#F7F6F3',
    surfaceHover: '#EBEAE6',
    text: '#37352F',
    textSecondary: '#787774',
    textMuted: '#9B9A97',
    border: '#E9E9E7',
    borderHover: '#D3D1CB',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    success: '#0F7B6C',
    warning: '#D9730D',
    error: '#E03E3E'
  },
  neon: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#00FF00',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceHover: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#333333',
    borderHover: '#00FFFF',
    shadow: '0 0 10px rgba(0, 255, 255, 0.3)',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0066'
  },
  cinematic: {
    primary: '#C9A96E',
    secondary: '#8B7355',
    accent: '#D4AF37',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceHover: '#2D2D2D',
    text: '#F5F5DC',
    textSecondary: '#D3D3D3',
    textMuted: '#A0A0A0',
    border: '#404040',
    borderHover: '#C9A96E',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
    success: '#228B22',
    warning: '#DAA520',
    error: '#DC143C'
  }
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('minimalist')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('scriptboost-theme') as Theme
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('scriptboost-theme', theme)
    
    // Apply CSS variables to document root
    const root = document.documentElement
    const colors = themes[theme]
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  const value = {
    theme,
    setTheme,
    colors: themes[theme]
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

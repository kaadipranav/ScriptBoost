"use client"
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (reg) {
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing
            installing?.addEventListener('statechange', () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available; could show a toast prompting refresh
                // console.info('New version available')
              }
            })
          })
        }
      } catch (e) {
        // console.error('SW registration failed', e)
      }
    }
    register()
  }, [])
  return null
}

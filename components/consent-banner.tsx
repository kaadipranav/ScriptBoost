"use client"
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const LS_KEY = 'sb-consent'

type Consent = 'accepted' | 'rejected' | 'unset'

export function useConsent(): [Consent, (c: Consent) => void] {
  const [consent, setConsent] = useState<Consent>('unset')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(LS_KEY) as Consent | null
    if (saved === 'accepted' || saved === 'rejected') setConsent(saved)
  }, [])
  const update = (c: Consent) => {
    setConsent(c)
    try { localStorage.setItem(LS_KEY, c) } catch {}
  }
  return [consent, update]
}

export default function ConsentBanner() {
  const [consent, setConsent] = useConsent()

  if (consent !== 'unset') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-50 max-w-2xl p-4 rounded-lg border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70 shadow-lg">
      <div className="text-sm text-foreground/90">
        We use anonymous analytics (no personal data) to improve ScriptBoost. You can opt-out anytime in Privacy settings.
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setConsent('rejected')}>Decline</Button>
        <Button onClick={() => setConsent('accepted')}>Allow</Button>
      </div>
    </div>
  )
}

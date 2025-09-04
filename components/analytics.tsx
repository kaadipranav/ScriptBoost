"use client"
import Script from 'next/script'
import { useEffect, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useConsent } from '@/components/consent-banner'

function dntEnabled() {
  if (typeof navigator === 'undefined') return false
  // Covers various vendor-specific DNT flags
  // 1 means DNT enabled
  return (navigator as any).doNotTrack === '1' || (window as any).doNotTrack === '1'
}

export default function Analytics() {
  const [consent] = useConsent()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const gaId = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || process.env.GOOGLE_ANALYTICS_ID, [])

  const enabled = consent === 'accepted' && !dntEnabled() && !!gaId

  // Track client-side navigation as pageviews
  useEffect(() => {
    if (!enabled) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams?.toString()}` : '')
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'page_view', { page_path: url })
    }
  }, [enabled, pathname, searchParams])

  if (!enabled) return null

  return (
    <>
      {/* GA loader */}
      <Script id="ga-loader" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: false });
        `}
      </Script>
    </>
  )
}

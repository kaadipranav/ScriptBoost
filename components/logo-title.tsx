"use client"
import React from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const heading = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600','700','800'] })

export function LogoTitle() {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      const dist = Math.hypot(x, y)
      const max = Math.max(rect.width, rect.height)
      // Scale from 1.0 to 1.06 when cursor is near; clamp
      const proximity = Math.max(0, 1 - dist / (max * 0.9))
      const scale = 1 + proximity * 0.06
      const glow = Math.min(0.35, proximity * 0.5)
      setStyle({
        transform: `scale(${scale.toFixed(3)})`,
        textShadow: `0 8px 30px rgba(59,130,246,${glow})`,
        transition: 'transform 120ms ease-out',
      })
    }

    const onLeave = () => setStyle({ transform: 'scale(1)', textShadow: 'none', transition: 'transform 160ms ease-in' })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="inline-block will-change-transform pt-2 pb-3">
      <h1
        style={style}
        className={`${heading.className} select-none text-[42px] leading-tight md:text-[72px] md:leading-[1.05] font-extrabold text-gray-900 dark:text-white mb-2`}
      >
        Script<span className="text-blue-600">Boost</span>
      </h1>
    </div>
  )
}

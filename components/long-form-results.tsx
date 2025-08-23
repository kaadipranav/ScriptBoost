"use client"
import React from 'react'
import { LongFormGenerated } from '@/types'

type Props = {
  result: LongFormGenerated
}

export function LongFormResults({ result }: Props) {
  const { outline, script, ctas, chapters, totalMinutes } = result
  return (
    <div className="text-left space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-purple-400">Outline</h3>
        <div className="mt-2 space-y-2 text-gray-200">
          <div>
            <p className="font-medium">Intro:</p>
            <p className="text-sm text-gray-300">{outline.intro.title} — {outline.intro.objective}</p>
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {outline.sections?.map((s, i) => (
              <li key={i}>
                <span className="font-medium">{s.title}:</span>
                <ul className="list-[circle] pl-6 text-sm text-gray-300">
                  {s.keyPoints?.map((k, idx) => (<li key={idx}>{k}</li>))}
                </ul>
              </li>
            ))}
          </ul>
          <div>
            <p className="font-medium">Outro:</p>
            <p className="text-sm text-gray-300">{outline.outro.title} — {outline.outro.objective}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-purple-400">Script</h3>
        <div className="mt-2 space-y-4 text-gray-100">
          <div>
            <h4 className="font-semibold">Intro</h4>
            <p className="whitespace-pre-wrap text-gray-200">{script.intro}</p>
          </div>
          {script.sections?.map((s, i) => (
            <div key={i}>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="whitespace-pre-wrap text-gray-200">{s.content}</p>
            </div>
          ))}
          <div>
            <h4 className="font-semibold">Outro</h4>
            <p className="whitespace-pre-wrap text-gray-200">{script.outro}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-purple-400">CTAs</h3>
        <ul className="list-disc pl-6 text-gray-200">
          {ctas?.map((c, i) => (<li key={i}>{c}</li>))}
        </ul>
      </div>

      {chapters && chapters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-purple-400">Chapters (total ~{totalMinutes} min)</h3>
          <ul className="mt-2 divide-y divide-gray-800/60">
            {chapters.map((c, i) => (
              <li key={i} className="py-2 flex items-center justify-between text-gray-100">
                <span>{c.title}</span>
                <span className="text-sm text-gray-400">{c.start}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

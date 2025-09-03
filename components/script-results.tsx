"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Copy, Save, Check, TrendingUp, Clock, Target } from "lucide-react"
import { GeneratedScript, Platform } from "@/types"
import { cn, getPlatformDisplayName } from "@/lib/utils"
import { saveNamedScript } from "@/lib/storage"
import { Select } from "./ui/select"
import { exportScript, quickEditScript, type ExportFormat } from "@/lib/api-client"

interface ScriptResultsProps {
  script: GeneratedScript
  formData: any
  onGenerateNew: () => void
}

const platformStyles = {
  [Platform.TIKTOK]: {
    gradient: "from-pink-500 to-purple-600",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    icon: "🎵"
  },
  [Platform.INSTAGRAM]: {
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "📸"
  },
  [Platform.YOUTUBE]: {
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    icon: "▶️"
  }
}

export function ScriptResults({ script, formData, onGenerateNew }: ScriptResultsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [currentScript, setCurrentScript] = useState<GeneratedScript>(script)
  const [exportFmt, setExportFmt] = useState<ExportFormat>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [tone, setTone] = useState<'casual' | 'professional' | 'humorous' | 'dramatic'>('casual')

  const platformStyle = platformStyles[currentScript.platform]

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const copyFullScript = async () => {
    const fullScript = `${currentScript.hook.text}\n\n${currentScript.body.text}\n\n${currentScript.cta.text}\n\n${currentScript.hashtags.join(" ")}`
    await copyToClipboard(fullScript, "full")
  }

  const handleSave = () => {
    const defaultName = `${getPlatformDisplayName(currentScript.platform)} • ${new Date().toLocaleString()}`
    const name = typeof window !== 'undefined' ? window.prompt("Save script as:", defaultName) : null
    if (!name) return
    saveNamedScript(name.trim(), currentScript)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const formatDuration = (seconds: number) => {
    return `${seconds}s`
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportScript(currentScript, exportFmt)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const base = `${currentScript.input.niche.replace(/[^a-z0-9]+/gi, '_')}_${currentScript.id}`
      a.href = url
      a.download = `${base}.${exportFmt}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
      alert('Failed to export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const doQuickEdit = async (action: 'shorter' | 'longer' | 'rewrite_hook' | 'change_tone') => {
    try {
      setIsEditing(true)
      const edited = await quickEditScript(currentScript, action, action === 'change_tone' ? tone : undefined)
      setCurrentScript(edited)
    } catch (e) {
      console.error('Quick edit failed', e)
      alert('Failed to apply quick edit. Please try again.')
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn("rounded-lg p-6", platformStyle.bg, platformStyle.border, "border")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("text-2xl")}>{platformStyle.icon}</div>
            <div>
              <h2 className="text-xl font-bold">
                {getPlatformDisplayName(currentScript.platform)} Script
              </h2>
              <p className="text-sm text-muted-foreground">
                Generated for {currentScript.input.targetAudience.replace("-", " ")} • {currentScript.input.tone} tone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDuration(currentScript.totalDuration)}
            </div>
          </div>
        </div>

        {/* Quick Edit Controls */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button variant="secondary" size="sm" disabled={isEditing} onClick={() => doQuickEdit('shorter')}>Make Shorter</Button>
          <Button variant="secondary" size="sm" disabled={isEditing} onClick={() => doQuickEdit('longer')}>Make Longer</Button>
          <Button variant="secondary" size="sm" disabled={isEditing} onClick={() => doQuickEdit('rewrite_hook')}>Rewrite Hook</Button>
          <div className="flex items-center gap-2">
            <Select value={tone} onChange={(e) => setTone(e.target.value as any)} className="w-36">
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="humorous">Humorous</option>
              <option value="dramatic">Dramatic</option>
            </Select>
            <Button variant="secondary" size="sm" disabled={isEditing} onClick={() => doQuickEdit('change_tone')}>Apply Tone</Button>
          </div>
        </div>

        {/* Platform Optimization Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Hook Optimized</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Platform Format</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Trending Elements</span>
          </div>
        </div>
      </div>

      {/* Script Sections */}
      <div className="grid gap-6">
        {/* Hook Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Hook</h3>
                <p className="text-sm text-muted-foreground">
                  First {currentScript.hook.duration}s • Attention grabber
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentScript.hook.text, "hook")}
            >
              {copiedSection === "hook" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-base sm:text-sm leading-relaxed break-words whitespace-pre-wrap">{currentScript.hook.text}</p>
          </div>
          {currentScript.hook.visualCues && currentScript.hook.visualCues.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Visual Cues:</p>
              <div className="flex flex-wrap gap-2">
                {currentScript.hook.visualCues.map((cue, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Body</h3>
                <p className="text-sm text-muted-foreground">
                  {currentScript.body.duration}s • Main content
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentScript.body.text, "body")}
            >
              {copiedSection === "body" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-base sm:text-sm leading-relaxed break-words whitespace-pre-wrap">{currentScript.body.text}</p>
          </div>
          {currentScript.body.keyPoints && currentScript.body.keyPoints.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Key Points:</p>
              <ul className="space-y-1">
                {currentScript.body.keyPoints.map((point, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">CTA</span>
              </div>
              <div>
                <h3 className="font-semibold">Call to Action</h3>
                <p className="text-sm text-muted-foreground">
                  {currentScript.cta.urgency} urgency • {currentScript.cta.action}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentScript.cta.text, "cta")}
            >
              {copiedSection === "cta" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-base sm:text-sm leading-relaxed break-words whitespace-pre-wrap font-medium">{currentScript.cta.text}</p>
          </div>
        </div>

        {/* Hashtags */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Hashtags</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentScript.hashtags.join(" "), "hashtags")}
            >
              {copiedSection === "hashtags" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentScript.hashtags.map((hashtag, index) => (
              <span
                key={index}
                className={cn(
                  "text-sm px-3 py-1 rounded-full",
                  platformStyle.bg,
                  "text-foreground"
                )}
              >
                #{hashtag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={copyFullScript}
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          {copiedSection === "full" ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copy Full Script
        </Button>

        <Button
          onClick={handleSave}
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          {isSaved ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaved ? "Saved!" : "Save Script"}
        </Button>

        <Button onClick={onGenerateNew} variant="default" className="w-full sm:w-auto flex items-center gap-2">
          Generate New
        </Button>

        {/* Export Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={exportFmt} onChange={(e) => setExportFmt(e.target.value as ExportFormat)} className="w-36">
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="pptx">PPTX</option>
            <option value="srt">SRT</option>
          </Select>
          <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">{isExporting ? 'Exporting…' : 'Export as…'}</Button>
        </div>
      </div>

      {/* Performance Indicators */}
      {currentScript.performance && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Performance Analysis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentScript.performance.hookStrength}/10</div>
              <div className="text-xs text-muted-foreground">Hook Strength</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentScript.performance.engagementPotential}/10</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentScript.performance.viralPotential}/10</div>
              <div className="text-xs text-muted-foreground">Viral Potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{currentScript.performance.ctaEffectiveness}/10</div>
              <div className="text-xs text-muted-foreground">CTA Power</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { GeneratedScript } from "@/types"
import {
  listScripts,
  toggleFavorite,
  isFavorite,
  deleteScript,
  updateScript,
  exportScriptJSON,
  exportScriptsJSON,
  listSavedScripts,
  deleteSavedScript,
  renameSavedScript,
  SavedScriptItem,
} from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Copy, Download, Heart, HeartOff, Trash2, Save, Edit3, X, Pencil, MoreVertical, Check } from "lucide-react"

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
}

function ScriptCard({ script, onRefresh }: { script: GeneratedScript; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [hook, setHook] = useState(script.hook.text)
  const [body, setBody] = useState(script.body.text)
  const [cta, setCta] = useState(script.cta.text)
  const [hashtags, setHashtags] = useState((script.hashtags || []).join(" "))
  const favorite = useMemo(() => isFavorite(script.id), [script.id])
  const [saving, setSaving] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActions(false)
    if (showActions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showActions])

  const onToggleFavorite = () => {
    toggleFavorite(script.id)
    onRefresh()
  }

  const onDelete = () => {
    if (confirm("Delete this script?")) {
      deleteScript(script.id)
      onRefresh()
    }
  }

  const onSave = async () => {
    setSaving(true)
    const updated: GeneratedScript = {
      ...script,
      hook: { ...script.hook, text: hook },
      body: { ...script.body, text: body },
      cta: { ...script.cta, text: cta },
      hashtags: (hashtags || "").split(/[#\s]+/).map(h => h.trim()).filter(Boolean),
    }
    updateScript(updated)
    setEditing(false)
    setSaving(false)
    onRefresh()
  }

  const onCopy = async () => {
    const full = `${hook}\n\n${body}\n\n${cta}\n\n${(hashtags || "").split(/[#\s]+/).filter(Boolean).map(h => `#${h}`).join(" ")}`
    await copyToClipboard(full)
    alert("Copied!")
  }

  const onDownload = () => {
    const json = exportScriptJSON(script)
    downloadText(`script-${script.id}.json`, json)
  }

  return (
    <div className="group relative bg-card border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-brand-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
              {script.platform}
            </span>
            <span className="text-xs text-neutral-500">
              {new Date(script.createdAt).toLocaleDateString()}
            </span>
            <button
              onClick={onToggleFavorite}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {favorite ? (
                <Heart className="h-4 w-4 text-brand-danger fill-current" />
              ) : (
                <HeartOff className="h-4 w-4 text-neutral-400 hover:text-brand-danger" />
              )}
            </button>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{script.input.niche}</h3>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="capitalize">{script.input.targetAudience.replace('-', ' ')}</span>
            <span>•</span>
            <span className="capitalize">{script.input.tone}</span>
            <span>•</span>
            <span className="capitalize">{script.input.contentGoal.replace('-', ' ')}</span>
          </div>
        </div>
        
        <div className="relative">
          {editing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-700"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 top-8 w-40 bg-popover border border-border rounded-lg shadow-lg z-10 py-1">
                  <button
                    onClick={() => { onCopy(); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" /> Copy Script
                  </button>
                  <button
                    onClick={() => { onDownload(); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                  <button
                    onClick={() => { setEditing(true); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => { onDelete(); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-brand-danger flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="mt-6 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Hook</span>
              <span className="text-xs text-neutral-500">{script.hook.duration}s</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{hook}</p>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Body</span>
              <span className="text-xs text-neutral-500">{script.body.duration}s</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{body}</p>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">Call to Action</div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{cta}</p>
          </div>
          
          {hashtags && (
            <div className="flex flex-wrap gap-1">
              {(hashtags || "").split(/[#\s]+/).filter(Boolean).map((tag, i) => (
                <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-accent/10 text-brand-accent">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Hook</label>
            <textarea 
              className="w-full p-3 border border-input rounded-lg bg-background text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
              rows={3} 
              value={hook} 
              onChange={e => setHook(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Body</label>
            <textarea 
              className="w-full p-3 border border-input rounded-lg bg-background text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
              rows={6} 
              value={body} 
              onChange={e => setBody(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Call to Action</label>
            <textarea 
              className="w-full p-3 border border-input rounded-lg bg-background text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
              rows={2} 
              value={cta} 
              onChange={e => setCta(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Hashtags</label>
            <input 
              className="w-full p-3 border border-input rounded-lg bg-background text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
              placeholder="Enter hashtags separated by spaces or #" 
              value={hashtags} 
              onChange={e => setHashtags(e.target.value)} 
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={() => setEditing(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={saving}
              className="px-6 bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyScriptsPage() {
  const [scripts, setScripts] = useState<GeneratedScript[]>([])
  const [saved, setSaved] = useState<SavedScriptItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  const refresh = () => {
    setScripts(listScripts())
    setSaved(listSavedScripts())
  }

  useEffect(() => {
    refresh()
    setHydrated(true)
  }, [])

  const exportAll = () => {
    const json = exportScriptsJSON(scripts)
    downloadText(`scripts-export-${new Date().toISOString()}.json`, json)
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Scripts</h1>
          <p className="text-neutral-500 mt-1">Manage and organize your AI-generated video scripts</p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportAll}
          className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
        >
          <Download className="h-4 w-4 mr-2" /> Export All
        </Button>
      </div>

      {!hydrated ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded"/>
                <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded"/>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded"/>
                <div className="h-3 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded"/>
                <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded"/>
              </div>
            </div>
          ))}
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-20 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="h-8 w-8 text-brand-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No scripts yet</h3>
            <p className="text-neutral-500">Generate your first AI-powered video script to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {scripts.map((s) => (
            <ScriptCard key={s.id} script={s} onRefresh={refresh} />
          ))}
        </div>
      )}

      {/* Named Saves Section */}
      <div className="pt-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Named Saves</h2>
        {!hydrated ? (
          <div className="grid gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 animate-pulse">
                <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded"/>
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-12 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="max-w-sm mx-auto">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Save className="h-6 w-6 text-brand-accent" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No named saves</h3>
              <p className="text-sm text-neutral-500">Save your favorite scripts with custom names for easy access</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {saved.map(item => (
              <div key={item.id} className="group border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-brand-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const full = `${item.script.hook.text}\n\n${item.script.body.text}\n\n${item.script.cta.text}\n\n${(item.script.hashtags || []).map(h=>`#${h}`).join(" ")}`
                        navigator.clipboard.writeText(full)
                      }}
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-brand-primary"
                    >
                      <Copy className="h-3 w-3"/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadText(`named-${item.id}.json`, exportScriptJSON(item.script))}
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-brand-primary"
                    >
                      <Download className="h-3 w-3"/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const name = window.prompt('Rename saved script', item.name)
                        if (name && name.trim()) {
                          renameSavedScript(item.id, name.trim())
                          refresh()
                        }
                      }}
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-brand-primary"
                    >
                      <Pencil className="h-3 w-3"/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (confirm('Delete this saved script?')) { deleteSavedScript(item.id); refresh(); } }}
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-brand-danger"
                    >
                      <Trash2 className="h-3 w-3"/>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

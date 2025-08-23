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
import { Copy, Download, Heart, HeartOff, Trash2, Save, Edit3, X, Pencil } from "lucide-react"

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
  const [hook, setHook] = useState(script.hook.text)
  const [body, setBody] = useState(script.body.text)
  const [cta, setCta] = useState(script.cta.text)
  const [hashtags, setHashtags] = useState((script.hashtags || []).join(" "))
  const favorite = useMemo(() => isFavorite(script.id), [script.id])
  const [saving, setSaving] = useState(false)

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
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{script.platform} • {new Date(script.createdAt).toLocaleString()}</div>
          <h3 className="text-lg font-semibold mt-1">{script.input.niche}</h3>
          <div className="text-xs text-muted-foreground">{script.input.targetAudience.replace('-', ' ')} • {script.input.tone} • {script.input.contentGoal.replace('-', ' ')}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleFavorite} title={favorite ? "Unfavorite" : "Favorite"}>
            {favorite ? <Heart className="h-4 w-4 text-red-500"/> : <HeartOff className="h-4 w-4"/>}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopy} title="Copy full script">
            <Copy className="h-4 w-4"/>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownload} title="Download JSON">
            <Download className="h-4 w-4"/>
          </Button>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} title="Edit">
              <Edit3 className="h-4 w-4"/>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} title="Cancel">
              <X className="h-4 w-4"/>
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {!editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Hook ({script.hook.duration}s)</div>
            <p className="mt-1 whitespace-pre-wrap">{hook}</p>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Body ({script.body.duration}s)</div>
            <p className="mt-1 whitespace-pre-wrap">{body}</p>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">CTA</div>
            <p className="mt-1 whitespace-pre-wrap">{cta}</p>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Hashtags</div>
            <p className="mt-1 text-sm break-words">{(hashtags || "").split(/[#\s]+/).filter(Boolean).map(h => `#${h}`).join(" ")}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Hook</div>
            <textarea className="w-full mt-1 p-2 border rounded-md bg-background" rows={3} value={hook} onChange={e => setHook(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Body</div>
            <textarea className="w-full mt-1 p-2 border rounded-md bg-background" rows={6} value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">CTA</div>
            <textarea className="w-full mt-1 p-2 border rounded-md bg-background" rows={2} value={cta} onChange={e => setCta(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Hashtags (space or # separated)</div>
            <input className="w-full mt-1 p-2 border rounded-md bg-background" value={hashtags} onChange={e => setHashtags(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> Save
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
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Scripts</h1>
          <p className="text-sm text-muted-foreground">View, edit, favorite, and export your generated scripts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAll}>
            <Download className="h-4 w-4 mr-2" /> Export All (JSON)
          </Button>
        </div>
      </div>

      {!hydrated ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-3 w-48 bg-muted rounded"/>
                <div className="h-8 w-32 bg-muted rounded"/>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-muted rounded"/>
                <div className="h-3 w-5/6 bg-muted rounded"/>
                <div className="h-3 w-2/3 bg-muted rounded"/>
              </div>
            </div>
          ))}
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-20 border rounded-lg">
          No scripts saved yet. Generate a script to see it here.
        </div>
      ) : (
        <div className="grid gap-4">
          {scripts.map((s) => (
            <ScriptCard key={s.id} script={s} onRefresh={refresh} />
          ))}
        </div>
      )}

      {/* Named Saves Section */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold mt-8">Named Saves</h2>
        {!hydrated ? (
          <div className="grid gap-4 mt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-3 w-48 bg-muted rounded"/>
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No named saves yet. Use "Save Script" after generation.</p>
        ) : (
          <div className="grid gap-3 mt-3">
            {saved.map(item => (
              <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                  <div className="font-medium">{item.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const full = `${item.script.hook.text}\n\n${item.script.body.text}\n\n${item.script.cta.text}\n\n${(item.script.hashtags || []).map(h=>`#${h}`).join(" ")}`
                      navigator.clipboard.writeText(full)
                    }}
                    title="Copy full"
                  >
                    <Copy className="h-4 w-4"/>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadText(`named-${item.id}.json`, exportScriptJSON(item.script))}
                    title="Download JSON"
                  >
                    <Download className="h-4 w-4"/>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = window.prompt('Rename saved script', item.name)
                      if (name && name.trim()) {
                        renameSavedScript(item.id, name.trim())
                        refresh()
                      }
                    }}
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4"/>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { if (confirm('Delete this saved script?')) { deleteSavedScript(item.id); refresh(); } }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

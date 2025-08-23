import { GeneratedScript, ScriptHistory } from '@/types';

const STORAGE_KEY = 'scriptboost_history';
const SAVED_SCRIPTS_KEY = 'scriptboost_saved_scripts';

// Saved item with a user-provided name
export interface SavedScriptItem {
  id: string;
  name: string;
  script: GeneratedScript;
  createdAt: Date;
}

export function saveScript(script: GeneratedScript): void {
  if (typeof window === 'undefined') return;
  
  const history = getScriptHistory();
  history.scripts.unshift(script);
  history.totalGenerated += 1;
  history.lastGenerated = new Date();
  
  // Keep only last 50 scripts for performance
  if (history.scripts.length > 50) {
    history.scripts = history.scripts.slice(0, 50);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getScriptHistory(): ScriptHistory {
  if (typeof window === 'undefined') {
    return { scripts: [], variations: [], totalGenerated: 0, favoriteScripts: [] } as ScriptHistory;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return { scripts: [], variations: [], totalGenerated: 0, favoriteScripts: [] } as ScriptHistory;
    }
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.scripts = parsed.scripts.map((script: any) => ({
      ...script,
      createdAt: new Date(script.createdAt),
    }));
    
    if (parsed.lastGenerated) {
      parsed.lastGenerated = new Date(parsed.lastGenerated);
    }
    if (!parsed.favoriteScripts) parsed.favoriteScripts = [];
    if (!parsed.variations) parsed.variations = [];
    
    return parsed;
  } catch (error) {
    console.error('Error loading script history:', error);
    return { scripts: [], variations: [], totalGenerated: 0, favoriteScripts: [] } as ScriptHistory;
  }
}

export function clearScriptHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// List scripts (most recent first)
export function listScripts(): GeneratedScript[] {
  return getScriptHistory().scripts;
}

// Update a script by id
export function updateScript(updated: GeneratedScript): void {
  if (typeof window === 'undefined') return;
  const history = getScriptHistory();
  const idx = history.scripts.findIndex(s => s.id === updated.id);
  if (idx !== -1) {
    history.scripts[idx] = { ...updated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

// Delete a script by id
export function deleteScript(id: string): void {
  if (typeof window === 'undefined') return;
  const history = getScriptHistory();
  history.scripts = history.scripts.filter(s => s.id !== id);
  history.favoriteScripts = (history.favoriteScripts || []).filter((fid: string) => fid !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Favorites helpers
export function toggleFavorite(id: string): void {
  if (typeof window === 'undefined') return;
  const history = getScriptHistory();
  const set = new Set(history.favoriteScripts || []);
  if (set.has(id)) set.delete(id); else set.add(id);
  history.favoriteScripts = Array.from(set);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function isFavorite(id: string): boolean {
  return (getScriptHistory().favoriteScripts || []).includes(id);
}

// Export helpers
export function exportScriptJSON(script: GeneratedScript): string {
  return JSON.stringify(script, null, 2);
}

export function exportScriptsJSON(scripts?: GeneratedScript[]): string {
  const list = scripts || listScripts();
  return JSON.stringify(list, null, 2);
}

// ===== Named Saved Scripts (local-only, per-browser) =====
function loadSaved(): SavedScriptItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_SCRIPTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Array<Omit<SavedScriptItem, 'createdAt'>> & { createdAt: string }[];
    return arr.map((it: any) => ({ ...it, createdAt: new Date(it.createdAt) }));
  } catch (e) {
    console.error('Error loading saved scripts:', e);
    return [];
  }
}

function persistSaved(items: SavedScriptItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(items));
}

export function saveNamedScript(name: string, script: GeneratedScript): SavedScriptItem {
  const id = script.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const items = loadSaved();
  const item: SavedScriptItem = { id, name, script, createdAt: new Date() };
  items.unshift(item);
  // cap list to 100
  persistSaved(items.slice(0, 100));
  return item;
}

export function listSavedScripts(): SavedScriptItem[] {
  return loadSaved();
}

export function getSavedScript(id: string): SavedScriptItem | undefined {
  return loadSaved().find(s => s.id === id);
}

export function renameSavedScript(id: string, name: string): void {
  const items = loadSaved();
  const idx = items.findIndex(s => s.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], name };
    persistSaved(items);
  }
}

export function deleteSavedScript(id: string): void {
  const items = loadSaved().filter(s => s.id !== id);
  persistSaved(items);
}

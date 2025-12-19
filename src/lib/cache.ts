/**
 * Optimized Cache Layer für Astro SSR
 * 
 * Features:
 * - In-Memory Cache mit File-Backup für Persistenz
 * - Stärkere ETag-Generierung (MD5)
 * - Perspektiven-Caching
 * - Bulk-Operations
 * - Cache-Warming Support
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

interface CacheEntry<T> {
  data: T;
  expires: number;
  etag: string;
  created: number;
}

// Cache-Konfiguration
export const CACHE_TTL = {
  species: 60 * 60 * 24,      // 24 Stunden - Species-Seiten
  perspectives: 60 * 60 * 24, // 24 Stunden - Perspektiv-Daten
  sitemap: 60 * 60 * 24,      // 24 Stunden - Sitemap
  search: 60 * 5,              // 5 Minuten - Such-Ergebnisse
  searchIndex: 60 * 60,        // 1 Stunde - Suchindex
  index: 60 * 60,              // 1 Stunde - Kingdom Index
  home: 60 * 60                // 1 Stunde - Homepage
} as const;

// In-Memory Cache Store
const cache = new Map<string, CacheEntry<any>>();

// File-Cache Pfad
const CACHE_DIR = path.join(process.cwd(), '.cache', 'ssr');
let cacheInitialized = false;

/**
 * Initialisiert File-Cache (lazy)
 */
async function initFileCache(): Promise<void> {
  if (cacheInitialized) return;
  
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    
    // Existierende Cache-Dateien laden
    const files = await fs.readdir(CACHE_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const content = await fs.readFile(path.join(CACHE_DIR, file), 'utf-8');
        const entry = JSON.parse(content) as CacheEntry<any>;
        
        // Nur nicht-abgelaufene Einträge laden
        if (Date.now() <= entry.expires) {
          const key = file.replace('.json', '').replace(/_/g, ':');
          cache.set(key, entry);
        }
      } catch {
        // Korrupte Cache-Datei ignorieren
      }
    }
    
    cacheInitialized = true;
  } catch {
    cacheInitialized = true;
  }
}

/**
 * Generiert einen starken ETag (MD5-basiert)
 */
function generateEtag(data: any): string {
  const hash = createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
    .slice(0, 16);
  return `"${hash}"`;
}

/**
 * Konvertiert Cache-Key zu Dateinamen
 */
function keyToFilename(key: string): string {
  return key.replace(/:/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '.json';
}

/**
 * Wert aus Cache holen
 */
export function get<T>(key: string): { data: T; etag: string } | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Abgelaufen?
  if (Date.now() > entry.expires) {
    cache.delete(key);
    // Async File löschen (fire-and-forget)
    fs.unlink(path.join(CACHE_DIR, keyToFilename(key))).catch(() => {});
    return null;
  }
  
  return { data: entry.data, etag: entry.etag };
}

/**
 * Wert in Cache speichern
 */
export function set<T>(key: string, data: T, ttlSeconds: number): { etag: string } {
  const etag = generateEtag(data);
  const entry: CacheEntry<T> = {
    data,
    expires: Date.now() + (ttlSeconds * 1000),
    etag,
    created: Date.now()
  };
  
  cache.set(key, entry);
  
  // Async in File schreiben für langlebige Einträge
  if (ttlSeconds >= 3600) {
    initFileCache().then(() => {
      const filename = path.join(CACHE_DIR, keyToFilename(key));
      fs.writeFile(filename, JSON.stringify(entry), 'utf-8').catch(() => {});
    });
  }
  
  return { etag };
}

/**
 * Cache-Eintrag löschen
 */
export function del(key: string): boolean {
  const existed = cache.delete(key);
  if (existed) {
    fs.unlink(path.join(CACHE_DIR, keyToFilename(key))).catch(() => {});
  }
  return existed;
}

/**
 * Cache komplett leeren
 */
export async function clear(): Promise<void> {
  cache.clear();
  
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(
      files.map(f => fs.unlink(path.join(CACHE_DIR, f)).catch(() => {}))
    );
  } catch {
    // Ignore
  }
}

/**
 * Cache-Statistiken
 */
export function stats(): { 
  size: number; 
  keys: string[];
  memoryBytes: number;
} {
  let memoryBytes = 0;
  for (const entry of cache.values()) {
    memoryBytes += JSON.stringify(entry).length * 2;
  }
  
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    memoryBytes
  };
}

/**
 * Prüft ob ETag noch gültig ist (für 304 Not Modified)
 */
export function isValidEtag(key: string, clientEtag: string): boolean {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    return false;
  }
  return entry.etag === clientEtag;
}

/**
 * Cache-Key Generatoren
 */
export const cacheKey = {
  species: (slug: string) => `species:${slug}`,
  perspective: (slug: string, perspId: string) => `persp:${slug}:${perspId}`,
  search: (query: string) => `search:${query.toLowerCase().trim()}`,
  searchIndex: () => 'searchIndex',
  index: (kingdom: string) => `index:${kingdom}`,
  sitemap: () => 'sitemap'
};

/**
 * HTTP Cache-Control Header generieren
 */
export function getCacheHeaders(ttlSeconds: number, etag?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (ttlSeconds > 0) {
    headers['Cache-Control'] = `public, max-age=${ttlSeconds}, stale-while-revalidate=${Math.min(ttlSeconds * 2, 86400)}`;
  } else {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
  
  if (etag) {
    headers['ETag'] = etag;
  }
  
  return headers;
}

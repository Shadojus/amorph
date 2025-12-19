/**
 * Optimized Species Data Loader
 * 
 * Features:
 * - Vorberechneter Suchindex (kein N+1 Problem)
 * - Perspektiven-Caching
 * - Bulk-Loading
 * - Parallel File-Reads
 */

import * as cache from './cache';
import fs from 'node:fs/promises';
import path from 'node:path';

// Kingdoms im Dateisystem
const KINGDOMS = ['fungi', 'plantae', 'animalia', 'bacteria'] as const;
type Kingdom = typeof KINGDOMS[number];

export interface SpeciesData {
  slug: string;
  kingdom: Kingdom;
  name: string;
  wissenschaftlicher_name?: string;
  data: Record<string, any>;
}

export interface SpeciesIndex {
  kingdom: Kingdom;
  species: Array<{
    slug: string;
    name: string;
    wissenschaftlicher_name?: string;
  }>;
}

// Suchindex-Struktur
interface SearchIndexEntry {
  slug: string;
  kingdom: Kingdom;
  name: string;
  wissenschaftlicher_name?: string;
  searchText: string; // Lowercase, vorberechnet
}

/**
 * Alle Species-Slugs laden (für Sitemap/Index)
 */
export async function getAllSpeciesSlugs(): Promise<Array<{ slug: string; kingdom: Kingdom }>> {
  const all: Array<{ slug: string; kingdom: Kingdom }> = [];
  
  for (const kingdom of KINGDOMS) {
    const dataPath = path.join(process.cwd(), 'data', kingdom);
    
    try {
      const entries = await fs.readdir(dataPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'index.json') {
          all.push({ slug: entry.name, kingdom });
        }
      }
    } catch {
      // Kingdom-Ordner existiert nicht
      continue;
    }
  }
  
  return all;
}

/**
 * Species-Daten laden (mit Cache)
 */
export async function getSpecies(slug: string): Promise<SpeciesData | null> {
  const key = cache.cacheKey.species(slug);
  
  // Aus Cache?
  const cached = cache.get<SpeciesData>(key);
  if (cached) {
    return cached.data;
  }
  
  // Aus Dateisystem laden
  for (const kingdom of KINGDOMS) {
    // Versuche zuerst index.json, dann data.json
    const possiblePaths = [
      path.join(process.cwd(), 'data', kingdom, slug, 'index.json'),
      path.join(process.cwd(), 'data', kingdom, slug, 'data.json')
    ];
    
    for (const dataPath of possiblePaths) {
      try {
        const content = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(content);
        
        const species: SpeciesData = {
          slug,
          kingdom,
          name: data.name || data.trivialname || slug,
          wissenschaftlicher_name: data.wissenschaftlicher_name || data.scientific_name,
          data
        };
        
        // In Cache speichern
        cache.set(key, species, cache.CACHE_TTL.species);
        
        return species;
      } catch {
        // Nicht in diesem Pfad
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Species-Index für ein Kingdom laden
 */
export async function getKingdomIndex(kingdom: Kingdom): Promise<SpeciesIndex | null> {
  const key = cache.cacheKey.index(kingdom);
  
  // Aus Cache?
  const cached = cache.get<SpeciesIndex>(key);
  if (cached) {
    return cached.data;
  }
  
  const indexPath = path.join(process.cwd(), 'data', kingdom, 'index.json');
  
  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    const items = JSON.parse(content);
    
    const index: SpeciesIndex = {
      kingdom,
      species: Array.isArray(items) ? items : []
    };
    
    // In Cache
    cache.set(key, index, cache.CACHE_TTL.index);
    
    return index;
  } catch {
    return null;
  }
}

/**
 * Baut den Suchindex einmalig auf
 */
async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const indexKey = cache.cacheKey.searchIndex();
  
  // Aus Cache?
  const cached = cache.get<SearchIndexEntry[]>(indexKey);
  if (cached) {
    return cached.data;
  }
  
  const index: SearchIndexEntry[] = [];
  const slugs = await getAllSpeciesSlugs();
  
  // Parallel alle Species-Basis-Daten laden
  const loadPromises = slugs.map(async ({ slug, kingdom }) => {
    const species = await getSpecies(slug);
    if (species) {
      const searchText = [
        slug,
        species.name,
        species.wissenschaftlicher_name || ''
      ].join(' ').toLowerCase();
      
      return {
        slug,
        kingdom,
        name: species.name,
        wissenschaftlicher_name: species.wissenschaftlicher_name,
        searchText
      };
    }
    return null;
  });
  
  const results = await Promise.all(loadPromises);
  
  for (const entry of results) {
    if (entry) index.push(entry);
  }
  
  // In Cache (1 Stunde)
  cache.set(indexKey, index, cache.CACHE_TTL.searchIndex);
  
  return index;
}

/**
 * Suche in allen Species (optimiert mit Suchindex)
 */
export async function searchSpecies(query: string): Promise<SpeciesData[]> {
  const key = cache.cacheKey.search(query);
  
  // Ergebnis aus Cache?
  const cached = cache.get<SpeciesData[]>(key);
  if (cached) {
    return cached.data;
  }
  
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  // Suchindex nutzen (schnell!)
  const index = await buildSearchIndex();
  const matches = index.filter(entry => entry.searchText.includes(q));
  
  // Nur die gematchten Species laden
  const results: SpeciesData[] = [];
  for (const match of matches.slice(0, 50)) { // Max 50 Ergebnisse
    const species = await getSpecies(match.slug);
    if (species) results.push(species);
  }
  
  // In Cache
  cache.set(key, results, cache.CACHE_TTL.search);
  
  return results;
}

/**
 * Lädt eine Perspektive mit Caching
 */
export async function getPerspective(
  slug: string, 
  kingdom: Kingdom, 
  perspectiveId: string
): Promise<Record<string, any> | null> {
  const key = cache.cacheKey.perspective(slug, perspectiveId);
  
  // Aus Cache?
  const cached = cache.get<Record<string, any>>(key);
  if (cached) {
    return cached.data;
  }
  
  const perspPath = path.join(process.cwd(), 'data', kingdom, slug, `${perspectiveId}.json`);
  
  try {
    const content = await fs.readFile(perspPath, 'utf-8');
    const data = JSON.parse(content);
    
    // In Cache
    cache.set(key, data, cache.CACHE_TTL.perspectives);
    
    return data;
  } catch {
    return null;
  }
}

/**
 * Lädt alle Perspektiven einer Species (parallel)
 */
export async function getAllPerspectives(
  slug: string,
  kingdom: Kingdom,
  perspectiveIds: string[]
): Promise<Record<string, Record<string, any>>> {
  const results: Record<string, Record<string, any>> = {};
  
  const loadPromises = perspectiveIds.map(async (perspId) => {
    const data = await getPerspective(slug, kingdom, perspId);
    return { perspId, data };
  });
  
  const loaded = await Promise.all(loadPromises);
  
  for (const { perspId, data } of loaded) {
    if (data) results[perspId] = data;
  }
  
  return results;
}

/**
 * Alle Kingdoms mit Counts laden
 */
export async function getKingdomStats(): Promise<Array<{ kingdom: Kingdom; count: number }>> {
  const stats: Array<{ kingdom: Kingdom; count: number }> = [];
  
  // Parallel laden
  const promises = KINGDOMS.map(async (kingdom) => {
    const dataPath = path.join(process.cwd(), 'data', kingdom);
    
    try {
      const entries = await fs.readdir(dataPath, { withFileTypes: true });
      const count = entries.filter(e => e.isDirectory()).length;
      return { kingdom, count };
    } catch {
      return { kingdom, count: 0 };
    }
  });
  
  return Promise.all(promises);
}

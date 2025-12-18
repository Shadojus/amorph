import { debug } from '../observer/debug.js';
import { semanticScore as schemaSemanticScore, getSuchfelder } from './semantic.js';

export function createDataSource(config) {
  const { typ, url, headers = {}, sammlung, indexUrl, baseUrl, dataPath } = config.quelle;
  
  debug.data('Creating DataSource', { type: typ, url, indexUrl, baseUrl, dataPath });
  
  switch (typ) {
    case 'pocketbase':
      return new PocketBaseSource(url, sammlung);
    case 'rest':
      return new RestSource(url, headers);
    case 'json':
      return new JsonSource(url);
    case 'json-multi':
      return new JsonMultiSource(indexUrl, baseUrl);
    case 'json-perspektiven':
      return new JsonPerspektivenSource(indexUrl, baseUrl);
    case 'json-universe':
      // Durchsucht alle Sammlungen im data/ Ordner (legacy, langsam)
      return new JsonUniverseSource(dataPath || './data/');
    case 'json-universe-optimized':
      // OPTIMIERT: Lädt nur universe-index.json beim Start
      return new JsonUniverseOptimizedSource(dataPath || './data/');
    default:
      debug.error(`Unknown data source type: ${typ}`);
      throw new Error(`Unknown data source type: ${typ}`);
  }
}

class PocketBaseSource {
  constructor(url, sammlung) {
    this.url = url;
    this.sammlung = sammlung;
  }
  
  async query({ search, limit = 50, filter } = {}) {
    const params = new URLSearchParams();
    params.set('perPage', limit);
    
    if (search) {
      params.set('filter', `name~"${search.replace(/["\\]/g, '\\$&')}"`);
    }
    if (filter) {
      params.set('filter', filter);
    }
    
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records?${params}`
    );
    
    if (!response.ok) throw new Error(`PocketBase: ${response.status}`);
    const data = await response.json();
    return data.items;
  }
  
  async getBySlug(slug) {
    const params = new URLSearchParams();
    params.set('filter', `slug="${slug.replace(/["\\]/g, '\\$&')}"`);
    
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records?${params}`
    );
    
    if (!response.ok) throw new Error(`PocketBase: ${response.status}`);
    const data = await response.json();
    return data.items?.[0] || null;
  }
  
  async getById(id) {
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records/${id}`
    );
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`PocketBase: ${response.status}`);
    }
    return response.json();
  }
}

class RestSource {
  constructor(url, headers) {
    this.url = url;
    this.headers = headers;
  }
  
  async query({ search, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (limit) params.set('limit', limit);
    
    const response = await fetch(`${this.url}?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) throw new Error(`REST: ${response.status}`);
    return response.json();
  }
  
  async getBySlug(slug) {
    const items = await this.query({});
    return items.find(item => item.slug === slug);
  }
  
  async getById(id) {
    const items = await this.query({});
    return items.find(item => item.id === id);
  }
}

class JsonSource {
  constructor(url) {
    this.url = url;
    this.data = null;
    this.lastMatchedTerms = new Set(); // Speichert welche Terme gematcht haben
    this.lastFilteredData = []; // Speichert gefilterte Daten für Pagination
    this.totalCount = 0; // Gesamtanzahl der gefilterten Items
  }
  
  async ensureData() {
    if (!this.data) {
      debug.data('Loading JSON data...', { url: this.url });
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(`Data could not be loaded: ${response.status}`);
      }
      this.data = await response.json();
      debug.data('JSON loaded', { 
        count: Array.isArray(this.data) ? this.data.length : (this.data.items?.length || 0) 
      });
    }
    return Array.isArray(this.data) ? this.data : this.data.items || [];
  }
  
  async query({ search, limit = 50, offset = 0 } = {}) {
    let items = await this.ensureData();
    this.lastMatchedTerms = new Set();
    
    if (search && String(search).trim()) {
      const query = String(search).toLowerCase().trim();
      debug.search('JsonSource Query', { query, totalItems: items.length, offset, limit });
      
      // Intelligente Suche: Jedes Item bewerten und Match-Terme sammeln
      const scored = items.map(item => {
        const result = scoreItemWithMatches(item, query);
        return {
          item,
          score: result.score,
          matches: result.matches
        };
      });
      
      // Nur Treffer mit Score > 0
      const filtered = scored.filter(s => s.score > 0);
      
      // Alle gefundenen Match-Terme sammeln
      for (const s of filtered) {
        for (const match of s.matches) {
          this.lastMatchedTerms.add(match);
        }
      }
      
      this.lastFilteredData = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
      
      this.totalCount = this.lastFilteredData.length;
      items = this.lastFilteredData;
      
      debug.search('Search complete', { 
        hits: items.length, 
        matchedTerms: [...this.lastMatchedTerms].slice(0, 10)
      });
    } else {
      this.lastFilteredData = items;
      this.totalCount = items.length;
    }
    
    // Pagination: offset und limit anwenden
    const paginatedItems = items.slice(offset, offset + limit);
    debug.data('Pagination', { offset, limit, returned: paginatedItems.length, total: this.totalCount });
    
    return paginatedItems;
  }
  
  /**
   * Weitere Items laden (Infinite Scroll)
   * @param {number} offset - Start-Index
   * @param {number} limit - Anzahl Items
   * @returns {Promise<{items: Array, hasMore: boolean}>}
   */
  async loadMore(offset, limit = 20) {
    const items = this.lastFilteredData.slice(offset, offset + limit);
    const hasMore = offset + limit < this.totalCount;
    
    debug.data('Load more', { offset, limit, returned: items.length, hasMore, total: this.totalCount });
    
    return { items, hasMore };
  }
  
  /**
   * Gibt Gesamtanzahl zurück
   */
  getTotalCount() {
    return this.totalCount;
  }
  
  async getBySlug(slug) {
    const items = await this.ensureData();
    return items.find(item => item.slug === slug);
  }
  
  async getById(id) {
    const items = await this.ensureData();
    return items.find(item => item.id === id);
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms; // Gibt das Set direkt zurück
  }
}

/**
 * JSON Multi Source - Lädt Items aus einzelnen JSON-Dateien
 * 
 * Struktur:
 * - data/fungi/index.json → Liste aller Dateien
 * - data/fungi/steinpilz.json → Einzelner Pilz
 * - data/fungi/pfifferling.json → Einzelner Pilz
 * - ...
 * 
 * Vorteile:
 * - Jeder Pilz kann unabhängig bearbeitet werden
 * - Git-Konflikte werden minimiert
 * - Bessere Skalierbarkeit für große Datenmengen
 * - Lazy Loading möglich (zukünftig)
 */
class JsonMultiSource {
  constructor(indexUrl, baseUrl) {
    this.indexUrl = indexUrl;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.data = null;
    this.lastMatchedTerms = new Set();
    this.lastFilteredData = [];
    this.totalCount = 0;
  }
  
  async ensureData() {
    if (!this.data) {
      debug.data('Loading JSON-Multi index...', { indexUrl: this.indexUrl });
      
      // 1. Index laden
      const indexResponse = await fetch(this.indexUrl);
      if (!indexResponse.ok) {
        throw new Error(`Index konnte nicht geladen werden: ${indexResponse.status}`);
      }
      const index = await indexResponse.json();
      const dateien = index.dateien || [];
      
      debug.data('Index loaded', { fileCount: dateien.length });
      
      // 2. Alle Dateien parallel laden
      const loadPromises = dateien.map(async (datei) => {
        const url = this.baseUrl + datei;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            debug.warn(`File not found: ${url}`);
            return null;
          }
          return response.json();
        } catch (e) {
          debug.warn(`Fehler beim Laden von ${url}:`, e);
          return null;
        }
      });
      
      const results = await Promise.all(loadPromises);
      this.data = results.filter(item => item !== null);
      
      debug.data('All files loaded', { 
        count: this.data.length,
        items: this.data.map(i => i.name || i.slug || i.id).join(', ')
      });
    }
    return this.data;
  }
  
  async query({ search, limit = 50, offset = 0 } = {}) {
    let items = await this.ensureData();
    this.lastMatchedTerms = new Set();
    
    if (search && String(search).trim()) {
      const query = String(search).toLowerCase().trim();
      debug.search('JsonMultiSource Query', { query, totalItems: items.length, offset, limit });
      
      // Intelligente Suche mit Scoring
      const scored = items.map(item => {
        const result = scoreItemWithMatches(item, query);
        return {
          item,
          score: result.score,
          matches: result.matches
        };
      });
      
      // Nur Treffer mit Score > 0
      const filtered = scored.filter(s => s.score > 0);
      
      // Match-Terme sammeln
      for (const s of filtered) {
        for (const match of s.matches) {
          this.lastMatchedTerms.add(match);
        }
      }
      
      this.lastFilteredData = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
      
      this.totalCount = this.lastFilteredData.length;
      items = this.lastFilteredData;
      
      debug.suche('Suche komplett', { 
        treffer: items.length, 
        matchedTerms: [...this.lastMatchedTerms].slice(0, 10)
      });
    } else {
      this.lastFilteredData = items;
      this.totalCount = items.length;
    }
    
    // Pagination
    const paginatedItems = items.slice(offset, offset + limit);
    debug.daten('Pagination', { offset, limit, returned: paginatedItems.length, total: this.totalCount });
    
    return paginatedItems;
  }
  
  async loadMore(limit = 20) {
    const currentCount = this.lastFilteredData.length;
    const offset = currentCount;
    
    // Bei JsonMultiSource sind bereits alle Daten geladen
    // Pagination nur auf gecachten Daten
    return this.lastFilteredData.slice(offset, offset + limit);
  }
  
  getTotalCount() {
    return this.totalCount;
  }
  
  async getBySlug(slug) {
    const items = await this.ensureData();
    return items.find(item => item.slug === slug);
  }
  
  async getById(id) {
    const items = await this.ensureData();
    return items.find(item => item.id === id);
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms;
  }
}

/**
 * JSON Perspektiven Source - Lädt Spezies mit modularen Perspektiven-Dateien
 * 
 * Struktur:
 * - data/animalia/index.json → Liste aller Spezies
 * - data/animalia/monarchfalter/index.json → Basis-Info + Liste der Perspektiven
 * - data/animalia/monarchfalter/identification.json → Perspektive: Identification
 * - data/animalia/monarchfalter/ecology.json → Perspektive: Ecology
 * - ...
 * 
 * Vorteile:
 * - Jede Perspektive kann unabhängig bearbeitet werden
 * - Nur benötigte Perspektiven werden geladen (Lazy Loading)
 * - Skaliert gut für viele Spezies und Perspektiven
 */
class JsonPerspektivenSource {
  constructor(indexUrl, baseUrl) {
    this.indexUrl = indexUrl;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.data = null;
    this.lastMatchedTerms = new Set();
    this.lastFilteredData = [];
    this.totalCount = 0;
    this.loadedPerspektiven = new Map(); // Cache für geladene Perspektiven
  }
  
  async ensureData() {
    if (!this.data) {
      debug.data('Loading JSON-Perspektiven index...', { indexUrl: this.indexUrl });
      
      // 1. Sammlungs-Index laden
      const indexResponse = await fetch(this.indexUrl);
      if (!indexResponse.ok) {
        throw new Error(`Index could not be loaded: ${indexResponse.status}`);
      }
      const index = await indexResponse.json();
      // Support both German and English field names
      const speziesListe = index.spezies || index.species || [];
      
      debug.data('Collection index loaded', { speciesCount: speziesListe.length });
      
      // 2. Alle Spezies-Index-Dateien parallel laden
      const loadPromises = speziesListe.map(async (speziesInfo) => {
        // Support both German 'ordner' and English 'folder'
        const ordner = typeof speziesInfo === 'string' ? speziesInfo : (speziesInfo.ordner || speziesInfo.folder);
        const url = `${this.baseUrl}${ordner}/index.json`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            debug.warn(`Species index not found: ${url}`);
            return null;
          }
          const speziesData = await response.json();
          speziesData._ordner = ordner; // For later loading of perspectives
          speziesData._baseUrl = `${this.baseUrl}${ordner}/`;
          return speziesData;
        } catch (e) {
          debug.warn(`Error loading ${url}:`, e);
          return null;
        }
      });
      
      const results = await Promise.all(loadPromises);
      this.data = results.filter(item => item !== null);
      
      debug.data('All species indices loaded', { 
        count: this.data.length,
        items: this.data.map(i => i.name || i.slug).join(', ')
      });
    }
    return this.data;
  }
  
  /**
   * Lädt Perspektiven für eine Spezies - OPTIMIERT für selektives Laden
   * @param {Object} spezies - Spezies-Objekt mit _ordner und perspektiven
   * @param {Array<string>} onlyPerspectives - Optional: Nur diese Perspektiven laden
   */
  async loadPerspectives(spezies, onlyPerspectives = null) {
    const allPerspectives = spezies.perspektiven || spezies.perspectives || [];
    const perspectivesToLoad = onlyPerspectives || allPerspectives;
    
    if (!spezies._ordner || perspectivesToLoad.length === 0) {
      return spezies;
    }
    
    const cacheKey = spezies.slug || spezies.id;
    
    // Bereits geladene Perspektiven aus Cache holen
    let merged = this.loadedPerspektiven.get(cacheKey) || { ...spezies };
    merged._loadedPerspectives = merged._loadedPerspectives || new Set();
    
    // Nur Perspektiven laden die noch fehlen
    const missingPerspectives = perspectivesToLoad.filter(
      p => allPerspectives.includes(p) && !merged._loadedPerspectives.has(p)
    );
    
    if (missingPerspectives.length === 0) {
      debug.data('All requested perspectives cached', { slug: spezies.slug });
      return merged;
    }
    
    debug.data('Loading perspectives', { 
      name: spezies.name, 
      loading: missingPerspectives,
      cached: [...merged._loadedPerspectives]
    });
    
    // Nur fehlende Perspektiven parallel laden
    const loadPromises = missingPerspectives.map(async (perspektive) => {
      const url = `${spezies._baseUrl}${perspektive}.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return { perspektive, data: await response.json() };
      } catch (e) {
        return null;
      }
    });
    
    const results = await Promise.all(loadPromises);
    
    for (const result of results) {
      if (result?.data) {
        const { perspektive: marker, ...daten } = result.data;
        Object.assign(merged, daten);
        merged._loadedPerspectives.add(result.perspektive);
      }
    }
    
    this.loadedPerspektiven.set(cacheKey, merged);
    return merged;
  }
  
  // Legacy-Alias für Abwärtskompatibilität
  async loadAllPerspektiven(spezies) {
    return this.loadPerspectives(spezies, null);
  }
  
  /**
   * Lädt Perspektiven für alle aktuell geladenen Items
   * @param {Array<string>} activePerspectives - Nur diese Perspektiven laden (optional)
   */
  async ensureFullData(activePerspectives = null) {
    if (this.lastFilteredData.length === 0) return [];
    
    debug.data('Loading perspectives for items...', { 
      count: this.lastFilteredData.length,
      perspectives: activePerspectives || 'all'
    });
    
    const fullItems = await Promise.all(
      this.lastFilteredData.map(item => this.loadPerspectives(item, activePerspectives))
    );
    
    this.lastFilteredData = fullItems;
    return fullItems;
  }
  
  async query({ search, limit = 50, offset = 0 } = {}) {
    let items = await this.ensureData();
    this.lastMatchedTerms = new Set();
    
    // OPTIMIERT: Perspektiven werden NICHT bei Query geladen!
    // Nur bei ensureFullData() oder getBySlug()
    
    if (search && String(search).trim()) {
      const query = String(search).toLowerCase().trim();
      debug.search('JsonPerspektivenSource Query', { query, totalItems: items.length, offset, limit });
      
      const scored = items.map(item => {
        const result = scoreItemWithMatches(item, query);
        return { item, score: result.score, matches: result.matches };
      });
      
      const filtered = scored.filter(s => s.score > 0);
      
      for (const s of filtered) {
        for (const match of s.matches) {
          this.lastMatchedTerms.add(match);
        }
      }
      
      this.lastFilteredData = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
      
      this.totalCount = this.lastFilteredData.length;
      items = this.lastFilteredData;
      
      debug.search('Search complete', { 
        hits: items.length, 
        matchedTerms: [...this.lastMatchedTerms].slice(0, 10)
      });
    } else {
      this.lastFilteredData = items;
      this.totalCount = items.length;
    }
    
    const paginatedItems = items.slice(offset, offset + limit);
    debug.data('Pagination', { offset, limit, returned: paginatedItems.length, total: this.totalCount });
    
    return paginatedItems;
  }
  
  async loadMore(offset, limit = 20) {
    const items = this.lastFilteredData.slice(offset, offset + limit);
    const hasMore = offset + limit < this.totalCount;
    return { items, hasMore };
  }
  
  getTotalCount() {
    return this.totalCount;
  }
  
  async getBySlug(slug) {
    const items = await this.ensureData();
    const item = items.find(item => item.slug === slug);
    if (item) {
      return this.loadAllPerspektiven(item);
    }
    return null;
  }
  
  async getById(id) {
    const items = await this.ensureData();
    const item = items.find(item => item.id === id);
    if (item) {
      return this.loadAllPerspektiven(item);
    }
    return null;
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms;
  }
}

/**
 * JsonUniverseOptimizedSource - OPTIMIERT!
 * 
 * Lädt nur universe-index.json beim Start (eine Datei, klein).
 * Perspektiven werden erst bei Bedarf geladen (Lazy Loading).
 * 
 * Workflow:
 * 1. Beim Start: Nur universe-index.json laden (~10KB für 100 Spezies)
 * 2. Bei Suche: Nur im Index suchen (name, slug, description)
 * 3. Bei Detail-View: Perspektiven on-demand laden
 * 
 * KI-Freundlich: Alle JSON-Dateien bleiben lesbar im Dateisystem!
 */
class JsonUniverseOptimizedSource {
  constructor(dataPath) {
    this.dataPath = dataPath.endsWith('/') ? dataPath : dataPath + '/';
    this.index = null;
    this.lastMatchedTerms = new Set();
    this.lastFilteredData = [];
    this.totalCount = 0;
    this.perspectiveCache = new Map();
  }
  
  /**
   * Lädt nur den Universe-Index (einmal beim Start)
   */
  async ensureIndex() {
    if (this.index) return this.index;
    
    const indexUrl = `${this.dataPath}universe-index.json`;
    debug.data('Loading universe index...', { url: indexUrl });
    
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) {
        throw new Error(`Index not found: ${indexUrl}`);
      }
      this.index = await response.json();
      
      debug.data('Universe index loaded', { 
        total: this.index.total,
        kingdoms: Object.keys(this.index.kingdoms)
      });
      
      return this.index;
    } catch (e) {
      debug.error('Failed to load universe index', e);
      // Fallback: Leerer Index
      this.index = { total: 0, species: [], kingdoms: {} };
      return this.index;
    }
  }
  
  /**
   * Suche - OPTIMIERT: Sucht nur im Index, lädt KEINE Perspektiven!
   * Perspektiven werden erst bei getBySlug() / Einzelansicht geladen.
   */
  async query({ search, limit = 50, offset = 0 } = {}) {
    const index = await this.ensureIndex();
    this.lastMatchedTerms = new Set();
    
    // Wenn keine Suche: Nur Index-Daten zurückgeben (schnell)
    if (!search || !String(search).trim()) {
      this.lastFilteredData = index.species;
      this.totalCount = index.species.length;
      return index.species.slice(offset, offset + limit);
    }
    
    // OPTIMIERT: Nur im Index suchen - KEINE Perspektiven laden!
    const query = String(search).toLowerCase().trim();
    debug.search('Universe Optimized Query - Index only (fast)', { query, totalItems: index.species.length });
    
    // Suche nur in Index-Daten (name, description, scientific_name, perspectives)
    const scored = index.species.map(species => {
      const result = scoreItemBasic(species, query);
      return { item: species, score: result.score, matches: result.matches };
    });
    
    const filtered = scored.filter(s => s.score > 0);
    
    for (const s of filtered) {
      for (const match of s.matches) {
        this.lastMatchedTerms.add(match);
      }
    }
    
    this.lastFilteredData = filtered
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
    
    this.totalCount = this.lastFilteredData.length;
    
    debug.search('Search complete (index only)', { 
      hits: this.lastFilteredData.length,
      matchedTerms: [...this.lastMatchedTerms].slice(0, 5)
    });
    
    return this.lastFilteredData.slice(offset, offset + limit);
  }
  
  /**
   * Pagination für Infinite Scroll
   */
  async loadMore(offset, limit = 20) {
    const items = this.lastFilteredData.slice(offset, offset + limit);
    const hasMore = offset + limit < this.totalCount;
    return { items, hasMore };
  }
  
  /**
   * Einzelne Spezies mit allen Perspektiven laden
   */
  async getBySlug(slug) {
    const index = await this.ensureIndex();
    const species = index.species.find(s => s.slug === slug);
    
    if (!species) return null;
    
    return this.loadFullSpecies(species);
  }
  
  /**
   * Lädt Perspektiven für eine Spezies
   * @param {Object} species - Spezies aus dem Index
   * @param {Array<string>} onlyPerspectives - Optional: Nur diese Perspektiven laden (für Skalierung)
   */
  async loadFullSpecies(species, onlyPerspectives = null) {
    const cacheKey = `${species.kingdom}/${species.slug}`;
    const perspectivesToLoad = onlyPerspectives || species.perspectives || [];
    const partialCacheKey = onlyPerspectives 
      ? `${cacheKey}:${onlyPerspectives.sort().join(',')}`
      : cacheKey;
    
    // Vollständiger Cache-Hit?
    if (!onlyPerspectives && this.perspectiveCache.has(cacheKey)) {
      return this.perspectiveCache.get(cacheKey);
    }
    
    // Partieller Cache - prüfen welche Perspektiven bereits geladen
    let full = this.perspectiveCache.get(cacheKey) || { ...species };
    full._baseUrl = `${this.dataPath}${species.kingdom}/${species.slug}/`;
    full._loadedPerspectives = full._loadedPerspectives || new Set();
    
    // Nur Perspektiven laden die noch fehlen
    const missingPerspectives = perspectivesToLoad.filter(
      p => !full._loadedPerspectives.has(p)
    );
    
    if (missingPerspectives.length === 0) {
      debug.data('All requested perspectives cached', { slug: species.slug });
      return full;
    }
    
    debug.data('Loading species perspectives', { 
      slug: species.slug, 
      loading: missingPerspectives,
      cached: [...full._loadedPerspectives]
    });
    
    // Nur fehlende Perspektiven parallel laden
    const loadPromises = missingPerspectives.map(async (perspective) => {
      const url = `${full._baseUrl}${perspective}.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return { perspective, data: await response.json() };
      } catch (e) {
        return null;
      }
    });
    
    const results = await Promise.all(loadPromises);
    
    for (const result of results) {
      if (result?.data) {
        Object.assign(full, result.data);
        full._loadedPerspectives.add(result.perspective);
      }
    }
    
    // Im Cache speichern
    this.perspectiveCache.set(cacheKey, full);
    return full;
  }
  
  async getById(id) {
    const index = await this.ensureIndex();
    const species = index.species.find(s => s.id === id);
    return species ? this.loadFullSpecies(species) : null;
  }
  
  getTotalCount() {
    return this.totalCount;
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms;
  }
  
  getCollections() {
    return this.index ? Object.keys(this.index.kingdoms) : [];
  }
  
  /**
   * Lädt Perspektiven-Daten für aktuell geladene Items
   * OPTIMIERT: Lädt nur die aktiven Perspektiven, nicht alle!
   * @param {Array<string>} activePerspectives - Nur diese Perspektiven laden (optional)
   * @returns {Promise<Array>} Array mit geladenen Items
   */
  async ensureFullData(activePerspectives = null) {
    if (this.lastFilteredData.length === 0) return [];
    
    // Prüfe ob erstes Item bereits alle nötigen Perspektiven hat
    const firstItem = this.lastFilteredData[0];
    
    if (activePerspectives && activePerspectives.length > 0) {
      // Selektives Laden: Nur aktive Perspektiven
      const loadedPerspectives = firstItem._loadedPerspectives || new Set();
      const allLoaded = activePerspectives.every(p => loadedPerspectives.has(p));
      
      if (allLoaded) {
        debug.data('Active perspectives already loaded', { perspectives: activePerspectives });
        return this.lastFilteredData;
      }
      
      debug.data('Loading active perspectives for items...', { 
        count: this.lastFilteredData.length,
        perspectives: activePerspectives 
      });
      
      // Nur aktive Perspektiven für alle Items laden
      const fullItems = await Promise.all(
        this.lastFilteredData.map(item => this.loadFullSpecies(item, activePerspectives))
      );
      
      this.lastFilteredData = fullItems;
      debug.data('Active perspectives loaded', { count: fullItems.length, perspectives: activePerspectives });
      return fullItems;
    }
    
    // Fallback: Alle Perspektiven laden (für Einzelansicht etc.)
    const hasPerspectives = firstItem._baseUrl || firstItem._perspectivesLoaded;
    
    if (hasPerspectives) {
      debug.data('Items already have full data');
      return this.lastFilteredData;
    }
    
    debug.data('Loading full data for all items...', { count: this.lastFilteredData.length });
    
    const fullItems = await Promise.all(
      this.lastFilteredData.map(item => this.loadFullSpecies(item))
    );
    
    this.lastFilteredData = fullItems;
    debug.data('Full data loaded', { count: fullItems.length });
    return fullItems;
  }
}

/**
 * JsonUniverseSource - Durchsucht ALLE Sammlungen im data/ Ordner
 * Datengetrieben: Entdeckt automatisch alle Sammlungen und Spezies
 */
class JsonUniverseSource {
  constructor(dataPath) {
    this.dataPath = dataPath.endsWith('/') ? dataPath : dataPath + '/';
    this.data = null;
    this.lastMatchedTerms = new Set();
    this.lastFilteredData = [];
    this.totalCount = 0;
    this.loadedPerspektiven = new Map();
    this.collections = []; // Entdeckte Sammlungen
  }
  
  async ensureData() {
    if (this.data) return this.data;
    
    debug.data('JsonUniverseSource: Discovering collections...', { dataPath: this.dataPath });
    
    // Bekannte Sammlungen (später durch Discovery ersetzen)
    const knownCollections = ['fungi', 'animalia', 'plantae', 'bacteria'];
    this.data = [];
    
    for (const collection of knownCollections) {
      try {
        const indexUrl = `${this.dataPath}${collection}/index.json`;
        const response = await fetch(indexUrl);
        
        if (!response.ok) {
          debug.data(`Collection not found: ${collection}`);
          continue;
        }
        
        const index = await response.json();
        // Support both German and English field names
        const speziesListe = index.spezies || index.species || [];
        
        debug.data(`Collection loaded: ${collection}`, { speciesCount: speziesListe.length });
        this.collections.push(collection);
        
        // Alle Spezies dieser Sammlung laden
        for (const speziesInfo of speziesListe) {
          const ordner = typeof speziesInfo === 'string' 
            ? speziesInfo 
            : (speziesInfo.ordner || speziesInfo.folder);
          
          const speziesUrl = `${this.dataPath}${collection}/${ordner}/index.json`;
          
          try {
            const speziesResponse = await fetch(speziesUrl);
            if (!speziesResponse.ok) continue;
            
            const speziesData = await speziesResponse.json();
            speziesData._sammlung = collection;
            speziesData._ordner = ordner;
            speziesData._baseUrl = `${this.dataPath}${collection}/${ordner}/`;
            
            this.data.push(speziesData);
          } catch (e) {
            debug.warn(`Error loading species ${ordner}:`, e);
          }
        }
      } catch (e) {
        debug.warn(`Error loading collection ${collection}:`, e);
      }
    }
    
    debug.data('JsonUniverseSource: All data loaded', { 
      collections: this.collections,
      totalSpecies: this.data.length,
      items: this.data.map(i => `${i._sammlung}/${i.slug}`).join(', ')
    });
    
    return this.data;
  }
  
  /**
   * Lädt Perspektiven für eine Spezies - OPTIMIERT für selektives Laden
   * @param {Object} spezies - Spezies-Objekt
   * @param {Array<string>} onlyPerspectives - Optional: Nur diese Perspektiven laden
   */
  async loadPerspectives(spezies, onlyPerspectives = null) {
    const allPerspectives = spezies.perspektiven || spezies.perspectives || [];
    const perspectivesToLoad = onlyPerspectives || allPerspectives;
    
    if (!spezies._ordner || perspectivesToLoad.length === 0) {
      return spezies;
    }
    
    const cacheKey = `${spezies._sammlung}/${spezies.slug}`;
    
    let merged = this.loadedPerspektiven.get(cacheKey) || { ...spezies };
    merged._loadedPerspectives = merged._loadedPerspectives || new Set();
    
    const missingPerspectives = perspectivesToLoad.filter(
      p => allPerspectives.includes(p) && !merged._loadedPerspectives.has(p)
    );
    
    if (missingPerspectives.length === 0) {
      return merged;
    }
    
    debug.data('Loading perspectives', { 
      name: spezies.name, 
      loading: missingPerspectives 
    });
    
    const loadPromises = missingPerspectives.map(async (perspektive) => {
      const url = `${spezies._baseUrl}${perspektive}.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return { perspektive, data: await response.json() };
      } catch (e) {
        return null;
      }
    });
    
    const results = await Promise.all(loadPromises);
    
    for (const result of results) {
      if (result?.data) {
        const { perspektive: marker, ...daten } = result.data;
        Object.assign(merged, daten);
        merged._loadedPerspectives.add(result.perspektive);
      }
    }
    
    this.loadedPerspektiven.set(cacheKey, merged);
    return merged;
  }
  
  // Legacy-Alias
  async loadAllPerspektiven(spezies) {
    return this.loadPerspectives(spezies, null);
  }
  
  /**
   * Lädt Perspektiven für alle aktuell geladenen Items
   * @param {Array<string>} activePerspectives - Nur diese Perspektiven laden (optional)
   */
  async ensureFullData(activePerspectives = null) {
    if (this.lastFilteredData.length === 0) return [];
    
    debug.data('Loading perspectives for items...', { 
      count: this.lastFilteredData.length,
      perspectives: activePerspectives || 'all'
    });
    
    const fullItems = await Promise.all(
      this.lastFilteredData.map(item => this.loadPerspectives(item, activePerspectives))
    );
    
    this.lastFilteredData = fullItems;
    return fullItems;
  }
  
  async query({ search, limit = 50, offset = 0 } = {}) {
    let items = await this.ensureData();
    this.lastMatchedTerms = new Set();
    
    // OPTIMIERT: Perspektiven werden NICHT mehr bei Query geladen!
    // Nur Basis-Daten (index.json) werden durchsucht
    // Perspektiven werden erst bei getBySlug() geladen
    
    if (search && String(search).trim()) {
      const query = String(search).toLowerCase().trim();
      debug.search('JsonUniverseSource Query', { 
        query, 
        totalItems: items.length, 
        collections: this.collections 
      });
      
      // Suche nur in Basis-Daten (name, slug, scientific_name, description)
      const scored = items.map(item => {
        const result = scoreItemBasic(item, query);
        return { item, score: result.score, matches: result.matches };
      });
      
      const filtered = scored.filter(s => s.score > 0);
      
      for (const s of filtered) {
        for (const match of s.matches) {
          this.lastMatchedTerms.add(match);
        }
      }
      
      this.lastFilteredData = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
      
      this.totalCount = this.lastFilteredData.length;
      items = this.lastFilteredData;
      
      debug.search('Universe search complete', { 
        hits: items.length, 
        matchedTerms: [...this.lastMatchedTerms].slice(0, 10)
      });
    } else {
      this.lastFilteredData = items;
      this.totalCount = items.length;
    }
    
    return items.slice(offset, offset + limit);
  }
  
  async loadMore(limit = 20) {
    const offset = this.lastFilteredData.length;
    return this.lastFilteredData.slice(offset, offset + limit);
  }
  
  getTotalCount() {
    return this.totalCount;
  }
  
  async getBySlug(slug) {
    const items = await this.ensureData();
    const item = items.find(i => i.slug === slug);
    return item ? this.loadAllPerspektiven(item) : null;
  }
  
  async getById(id) {
    const items = await this.ensureData();
    const item = items.find(i => i.id === id);
    return item ? this.loadAllPerspektiven(item) : null;
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms;
  }
  
  getCollections() {
    return this.collections;
  }
}

/**
 * OPTIMIERT: Schnelle Basis-Suche nur in index.json Feldern
 * Keine Perspektiven laden = viel schneller!
 * Durchsucht: name, slug, scientific_name, description, tags, searchText, perspectives
 * @returns {{ score: number, matches: string[] }}
 */
function scoreItemBasic(item, query) {
  let score = 0;
  const matches = new Set();
  
  // Nur Basis-Felder durchsuchen (aus index.json)
  const name = (item.name || '').toLowerCase();
  const slug = (item.slug || '').toLowerCase();
  const scientificName = (item.scientific_name || item.wissenschaftlich || '').toLowerCase();
  const description = (item.description || item.beschreibung || '').toLowerCase();
  const kingdom = (item.kingdom || item._sammlung || '').toLowerCase();
  
  // NEU: Tags und searchText aus erweitertem Index
  const tags = item.tags || [];
  const searchText = (item.searchText || '').toLowerCase();
  
  // Exakter Name-Match
  if (name === query) {
    score += 100;
    matches.add(item.name);
  }
  // Name beginnt mit Query
  else if (name.startsWith(query)) {
    score += 80;
    matches.add(item.name);
  }
  // Name enthält Query
  else if (name.includes(query)) {
    score += 60;
    matches.add(item.name);
  }
  
  // Slug Match
  if (slug.includes(query)) {
    score += 30;
    matches.add(item.slug);
  }
  
  // Wissenschaftlicher Name
  if (scientificName.includes(query)) {
    score += 50;
    matches.add(item.scientific_name || item.wissenschaftlich);
  }
  
  // Beschreibung
  if (description.includes(query)) {
    score += 20;
    // Finde das passende Wort
    const words = (item.description || item.beschreibung || '').split(/\s+/);
    for (const word of words) {
      if (word.toLowerCase().includes(query)) {
        matches.add(word.replace(/[.,;:!?()]/g, ''));
      }
    }
  }
  
  // Kingdom
  if (kingdom.includes(query)) {
    score += 10;
    matches.add(item.kingdom || item._sammlung);
  }
  
  // NEU: Tags durchsuchen (hohe Relevanz!)
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    if (tagLower === query) {
      score += 80;  // Exakter Tag-Match
      matches.add(tag);
    } else if (tagLower.startsWith(query)) {
      score += 50;  // Tag beginnt mit Query
      matches.add(tag);
    } else if (tagLower.includes(query)) {
      score += 30;  // Tag enthält Query
      matches.add(tag);
    }
  }
  
  // NEU: searchText durchsuchen (aus Perspektiven extrahiert)
  if (searchText.includes(query)) {
    score += 25;
    // Finde passende Wörter
    const words = searchText.split(/\s+/);
    for (const word of words) {
      if (word.includes(query)) {
        matches.add(word);
        break;  // Nur erstes Match
      }
    }
  }
  
  // Perspektiven-Namen durchsuchen (identification, culinary, etc.)
  const perspectives = item.perspectives || [];
  for (const perspective of perspectives) {
    const perspLower = perspective.toLowerCase();
    if (perspLower === query) {
      score += 70; // Exakter Match
      matches.add(perspective);
    } else if (perspLower.startsWith(query)) {
      score += 50; // Prefix Match
      matches.add(perspective);
    } else if (perspLower.includes(query)) {
      score += 30; // Teil-Match
      matches.add(perspective);
    }
  }
  
  // Query-Wörter einzeln
  const stopwords = new Set(['was', 'ist', 'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'für', 'mit', 'von', 'zu', 'bei', 'kann', 'man', 'wie', 'wo', 'wer', 'welche', 'welcher']);
  const queryWords = query.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  
  const allText = `${name} ${scientificName} ${description} ${searchText}`.toLowerCase();
  for (const word of queryWords) {
    if (allText.includes(word)) {
      score += 5;
    }
  }
  
  return { score, matches: [...matches] };
}

/**
 * Bewertet wie gut ein Item zur Suchanfrage passt UND gibt gefundene Matches zurück
 * VOLLSTÄNDIG: Durchsucht auch Perspektiven-Daten
 * @returns {{ score: number, matches: string[] }}
 */
function scoreItemWithMatches(item, query) {
  let score = 0;
  const matches = new Set();
  
  // Alle Texte aus dem Item extrahieren (auch verschachtelt)
  const allTexts = extractAllTexts(item);
  const allTextLower = allTexts.join(' ').toLowerCase();
  
  // === DIREKTE TREFFER ===
  const name = (item.name || '').toLowerCase();
  const wiss = (item.wissenschaftlich || '').toLowerCase();
  
  // Exakter Name-Match
  if (name === query) {
    score += 100;
    matches.add(item.name);
  }
  // Name beginnt mit Query
  else if (name.startsWith(query)) {
    score += 80;
    matches.add(item.name);
  }
  // Name enthält Query
  else if (name.includes(query)) {
    score += 60;
    matches.add(item.name);
  }
  
  // Wissenschaftlicher Name
  if (wiss.includes(query)) {
    score += 40;
    matches.add(item.wissenschaftlich);
  }
  
  // Andere Felder enthalten Query direkt - finde welche
  if (allTextLower.includes(query)) {
    score += 20;
    // Finde die tatsächlichen Matches in den Texten
    for (const text of allTexts) {
      if (typeof text === 'string' && text.toLowerCase().includes(query)) {
        // Extrahiere das passende Wort/Fragment
        const idx = text.toLowerCase().indexOf(query);
        const matchedWord = text.slice(idx, idx + query.length);
        matches.add(matchedWord);
        // Auch den Kontext hinzufügen (das ganze Wort)
        const words = text.split(/\s+/);
        for (const word of words) {
          if (word.toLowerCase().includes(query)) {
            matches.add(word.replace(/[.,;:!?()]/g, ''));
          }
        }
      }
    }
  }
  
  // === QUERY-WÖRTER EINZELN ===
  const stopwords = new Set(['was', 'ist', 'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'für', 'mit', 'von', 'zu', 'bei', 'kann', 'man', 'wie', 'wo', 'wer', 'welche', 'welcher']);
  const queryWords = query.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  
  for (const word of queryWords) {
    if (allTextLower.includes(word)) {
      score += 10;
      // Finde das passende Wort im Original
      for (const text of allTexts) {
        if (typeof text === 'string' && text.toLowerCase().includes(word)) {
          const words = text.split(/\s+/);
          for (const w of words) {
            if (w.toLowerCase().includes(word)) {
              matches.add(w.replace(/[.,;:!?()]/g, ''));
            }
          }
        }
      }
    }
  }
  
  // === SEMANTISCHE MAPPINGS (aus Schema) ===
  const semanticResult = schemaSemanticScore(item, query);
  score += semanticResult.score;
  for (const m of semanticResult.matches) {
    matches.add(m);
  }
  
  return { score, matches: [...matches] };
}

/**
 * Legacy-Funktion für Kompatibilität
 */
function scoreItem(item, query) {
  return scoreItemWithMatches(item, query).score;
}

/**
 * Extrahiert alle Text-Werte aus einem Objekt (rekursiv)
 */
export function extractAllTexts(obj, texts = []) {
  if (obj === null || obj === undefined) return texts;
  
  if (typeof obj === 'string') {
    texts.push(obj);
  } else if (typeof obj === 'number') {
    texts.push(String(obj));
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      extractAllTexts(item, texts);
    }
  } else if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      extractAllTexts(value, texts);
    }
  }
  
  return texts;
}

/**
 * Lokale Suche auf vorhandenen Daten (ohne DB-Query)
 * Für Vergleich-View und andere Views wo Daten schon existieren
 * 
 * @param {Array} items - Array von Daten-Objekten
 * @param {string} query - Suchbegriff
 * @returns {{ results: Array, matchedTerms: Set, scores: Map }}
 */
export function localSearch(items, query) {
  if (!query || !String(query).trim() || !items?.length) {
    return { results: items || [], matchedTerms: new Set(), scores: new Map() };
  }
  
  const q = String(query).toLowerCase().trim();
  const matchedTerms = new Set();
  const scores = new Map();
  
  const scored = items.map(item => {
    const result = scoreItemWithMatches(item, q);
    return { item, score: result.score, matches: result.matches };
  });
  
  // Treffer sammeln
  const filtered = scored.filter(s => s.score > 0);
  
  for (const s of filtered) {
    for (const match of s.matches) {
      matchedTerms.add(match);
    }
    scores.set(s.item, s.score);
  }
  
  const results = filtered
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
  
  debug.suche('localSearch komplett', { 
    query: q, 
    treffer: results.length, 
    matchedTerms: [...matchedTerms].slice(0, 10)
  });
  
  return { results, matchedTerms, scores };
}

/**
 * Highlight-Funktion für beliebige Container
 * NEU: Nutzt TreeWalker um ALLE Text-Nodes zu finden, auch in verschachtelten Elementen
 * 
 * @param {Element} container - DOM-Element in dem gesucht wird
 * @param {string} query - Original-Query
 * @param {Set} matchedTerms - Gefundene Begriffe
 * @param {Object} options - { deep: true für TreeWalker-Modus }
 */
export function highlightInContainer(container, query, matchedTerms = new Set(), options = {}) {
  // Highlight-Begriffe sammeln
  let highlightTerms = new Set();
  
  // matchedTerms übernehmen (falls vorhanden)
  if (matchedTerms && matchedTerms.size > 0) {
    for (const term of matchedTerms) {
      if (term && term.length >= 2) {
        highlightTerms.add(String(term).toLowerCase());
      }
    }
  }
  
  // Query-Wörter IMMER hinzufügen (für direktes Matching)
  if (query) {
    const stopwords = new Set([
      'der', 'die', 'das', 'und', 'oder', 'für', 'mit', 'von', 'zu', 'bei',
      'was', 'ist', 'ein', 'eine', 'kann', 'man', 'wie', 'wo', 'wer', 'welche',
      'the', 'a', 'an', 'and', 'or', 'for', 'with', 'from', 'to', 'at', 'in', 'on', 'is', 'are'
    ]);
    
    // Ganze Query (falls kurz genug und sinnvoll)
    const cleanQuery = String(query).toLowerCase().trim();
    if (cleanQuery.length >= 2 && cleanQuery.length <= 30) {
      highlightTerms.add(cleanQuery);
    }
    
    // Einzelne Wörter
    const words = cleanQuery.split(/\s+/)
      .map(w => w.replace(/[?!.,;:'"()]/g, ''))
      .filter(w => w.length >= 2 && !stopwords.has(w));
    for (const word of words) {
      highlightTerms.add(word);
    }
  }
  
  if (highlightTerms.size === 0) return 0;
  
  debug.suche('highlightInContainer', { terms: [...highlightTerms], deep: options.deep !== false });
  
  // NEU: TreeWalker-basiertes Highlighting für verschachtelte Elemente
  let count = 0;
  
  // Sammle alle Text-Nodes mit TreeWalker
  const textNodes = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip wenn in SVG
        if (node.parentElement?.closest('svg')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip wenn schon in einem Highlight
        if (node.parentElement?.classList?.contains('amorph-highlight')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip leere Nodes
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip Script/Style
        const tagName = node.parentElement?.tagName?.toLowerCase();
        if (tagName === 'script' || tagName === 'style') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  // Regex für alle Terme bauen
  const termsArray = [...highlightTerms].filter(t => t.length >= 2);
  if (termsArray.length === 0) return 0;
  
  // Sortiere nach Länge (längste zuerst) um überlappende Matches zu vermeiden
  termsArray.sort((a, b) => b.length - a.length);
  const combinedRegex = new RegExp(`(${termsArray.map(escapeRegex).join('|')})`, 'gi');
  
  // Text-Nodes durchgehen und markieren
  for (const textNode of textNodes) {
    const text = textNode.textContent;
    if (!combinedRegex.test(text)) continue;
    
    // Reset regex state
    combinedRegex.lastIndex = 0;
    
    // Fragment erstellen mit markierten Teilen
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Text vor dem Match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      // Markierter Teil
      const mark = document.createElement('mark');
      mark.className = 'amorph-highlight';
      mark.textContent = match[1];
      fragment.appendChild(mark);
      
      lastIndex = combinedRegex.lastIndex;
      count++;
    }
    
    // Rest nach letztem Match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    // Nur ersetzen wenn wirklich Matches gefunden wurden
    if (fragment.childNodes.length > 1 || (fragment.childNodes.length === 1 && fragment.firstChild.nodeName === 'MARK')) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }
  
  debug.suche('highlightInContainer done', { terms: termsArray.length, marked: count });
  return count;
}

/**
 * Entfernt alle Highlights aus einem Container
 */
export function clearHighlights(container) {
  const highlights = container.querySelectorAll('.amorph-highlight');
  for (const mark of highlights) {
    // Skip SVG-Elemente
    if (mark instanceof SVGElement || mark.closest('svg')) continue;
    
    const text = document.createTextNode(mark.textContent);
    mark.parentNode?.replaceChild(text, mark);
  }
  // Normalisieren um aufeinanderfolgende Textnodes zu vereinen
  container.normalize();
}

// Hilfsfunktionen
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

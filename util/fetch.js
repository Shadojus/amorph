import { debug } from '../observer/debug.js';
import { semanticScore as schemaSemanticScore, getSuchfelder } from './semantic.js';

export function createDataSource(config) {
  const { typ, url, headers = {}, sammlung } = config.quelle;
  
  debug.daten('DataSource erstellen', { typ, url });
  
  switch (typ) {
    case 'pocketbase':
      return new PocketBaseSource(url, sammlung);
    case 'rest':
      return new RestSource(url, headers);
    case 'json':
      return new JsonSource(url);
    default:
      debug.fehler(`Unbekannter Datenquellen-Typ: ${typ}`);
      throw new Error(`Unbekannter Datenquellen-Typ: ${typ}`);
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
}

class JsonSource {
  constructor(url) {
    this.url = url;
    this.data = null;
    this.lastMatchedTerms = new Set(); // Speichert welche Terme gematcht haben
  }
  
  async query({ search, limit = 50 } = {}) {
    if (!this.data) {
      debug.daten('Lade JSON-Daten...', { url: this.url });
      const response = await fetch(this.url);
      this.data = await response.json();
      debug.daten('JSON geladen', { 
        anzahl: Array.isArray(this.data) ? this.data.length : (this.data.items?.length || 0) 
      });
    }
    
    let items = Array.isArray(this.data) ? this.data : this.data.items || [];
    this.lastMatchedTerms = new Set();
    
    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      debug.suche('JsonSource Query', { query, totalItems: items.length });
      
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
      
      items = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
      
      debug.suche('Suche komplett', { 
        treffer: items.length, 
        matchedTerms: [...this.lastMatchedTerms].slice(0, 10)
      });
    }
    
    return items.slice(0, limit);
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms; // Gibt das Set direkt zurück
  }
}

/**
 * Bewertet wie gut ein Item zur Suchanfrage passt UND gibt gefundene Matches zurück
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
      if (text.toLowerCase().includes(query)) {
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
        if (text.toLowerCase().includes(word)) {
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
  if (!query?.trim() || !items?.length) {
    return { results: items || [], matchedTerms: new Set(), scores: new Map() };
  }
  
  const q = query.toLowerCase().trim();
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
 * Markiert Treffer in Text-Elementen
 * 
 * @param {Element} container - DOM-Element in dem gesucht wird
 * @param {string} query - Original-Query
 * @param {Set} matchedTerms - Gefundene Begriffe
 * @param {Object} options - { selectors: Array von CSS-Selektoren }
 */
export function highlightInContainer(container, query, matchedTerms = new Set(), options = {}) {
  // Erweiterte Selektoren für Grid-View UND Vergleich-View
  // Alle Text-tragenden Elemente die durchsucht werden sollen
  // HINWEIS: SVG-Elemente (wie radar-label) werden übersprungen da innerHTML sie zerstört
  const selectors = options.selectors || [
    // Grid-View
    '.amorph-text', '.amorph-tag', '.amorph-label', '.amorph-value',
    // Vergleich-View Compare-Morphs - Labels
    '.compare-label', 
    // Bar
    '.bar-name', '.bar-wert',
    // Rating
    '.rating-name', '.rating-wert',
    // Tag/Chips
    '.chip-wert', '.chip-pilze span',
    // List
    '.list-wert', '.compare-list-item',
    // Radar (nur HTML-Teile, nicht SVG)
    '.radar-achse', '.radar-compact-row',
    // Pie
    '.pie-pilz',
    // Text
    '.compare-text-row',
    // Timeline
    '.timeline-event', '.timeline-label',
    // Wirkstoffe
    '.wirkstoffe-name', '.wirkstoffe-label',
    // Image
    '.img-label',
    // Legende (wichtig für Pilznamen)
    '.legende-item', '.compare-legende .legende-item'
  ];
  
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
      'was', 'ist', 'ein', 'eine', 'kann', 'man', 'wie', 'wo', 'wer', 'welche'
    ]);
    
    // Ganze Query (falls kurz genug und sinnvoll)
    const cleanQuery = query.toLowerCase().trim();
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
  
  debug.suche('highlightInContainer - Suche nach', { terms: [...highlightTerms] });
  
  let count = 0;
  const elements = container.querySelectorAll(selectors.join(', '));
  
  for (const el of elements) {
    // Skip SVG-Elemente (können nicht mit innerHTML manipuliert werden)
    if (el instanceof SVGElement || el.closest('svg')) {
      continue;
    }
    
    // Skip wenn schon Highlights drin
    if (el.querySelector('.amorph-highlight')) continue;
    
    const originalText = el.textContent;
    if (!originalText || originalText.trim().length === 0) continue;
    
    let html = escapeHtml(originalText);
    let hasMatch = false;
    
    for (const term of highlightTerms) {
      if (term.length < 2) continue;
      
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      if (regex.test(originalText)) {
        html = html.replace(new RegExp(`(${escapeRegex(term)})`, 'gi'), '<mark class="amorph-highlight">$1</mark>');
        hasMatch = true;
      }
    }
    
    if (hasMatch) {
      el.innerHTML = html;
      count++;
    }
  }
  
  debug.suche('highlightInContainer', { terms: [...highlightTerms], markiert: count });
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

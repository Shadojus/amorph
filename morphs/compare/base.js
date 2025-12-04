/**
 * COMPARE BASE - Utilities für Compare-Morphs
 * 
 * Gemeinsame Funktionen für alle Compare-Morphs:
 * - Farb-Zuweisung für Items
 * - Section/Container-Erstellung
 * - Typ-Erkennung (wie Pipeline)
 */

import { debug } from '../../observer/debug.js';

// Farben-Config wird von außen gesetzt (aus morphs.yaml)
let farbenConfig = null;

// Fallback-Farben
const FALLBACK_FARBEN = [
  '#e8b04a', '#60c090', '#d06080', '#5aa0d8', 
  '#a080d0', '#d0a050', '#50b0b0', '#d08050'
];

/**
 * Setzt die Farben-Konfiguration (aus morphs.yaml)
 */
export function setFarbenConfig(config) {
  farbenConfig = config?.farben || null;
  debug.morphs('Compare Farben-Config geladen', { 
    items: farbenConfig?.items?.length || 0,
    diagramme: farbenConfig?.diagramme?.length || 0
  });
}

/**
 * Holt die konfigurierten Farben
 */
export function getFarben(typ = 'items') {
  return farbenConfig?.[typ] || FALLBACK_FARBEN;
}

/**
 * Erstellt Farbzuordnung für Items (Pilze, Pflanzen, etc.)
 * @param {Array} itemIds - Array von Item-IDs
 * @returns {Map} ID → Farbe
 */
export function erstelleFarben(itemIds) {
  const farben = new Map();
  const palette = getFarben('items');
  
  itemIds.forEach((id, i) => {
    const normalizedId = String(id);
    const farbe = palette[i % palette.length];
    farben.set(normalizedId, farbe);
  });
  
  return farben;
}

/**
 * Erstellt einen Section-Container
 * @param {string} label - Überschrift
 * @param {string} farbe - Akzentfarbe (optional)
 */
export function createSection(label, farbe = null) {
  const section = document.createElement('div');
  section.className = 'compare-section';
  
  if (farbe) {
    section.style.setProperty('--section-farbe', farbe);
  }
  
  const header = document.createElement('div');
  header.className = 'compare-section-header';
  header.textContent = label;
  section.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'compare-section-content';
  section.appendChild(content);
  
  // Helper um Content hinzuzufügen
  section.addContent = (el) => content.appendChild(el);
  
  return section;
}

/**
 * Erstellt einen Perspektiven-Header
 */
export function createHeader(config) {
  const { symbol, title, count, farben } = config;
  
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  
  if (farben?.[0]) {
    header.style.setProperty('--p-farbe', farben[0]);
  }
  
  header.innerHTML = `
    <span class="compare-symbol">${symbol || ''}</span>
    <span class="compare-title">${title || ''}</span>
    <span class="compare-count">${count || 0} Items</span>
  `;
  
  return header;
}

/**
 * Erstellt Legende für Items
 */
export function createLegende(items) {
  const legende = document.createElement('div');
  legende.className = 'compare-legende';
  
  items.forEach(item => {
    const el = document.createElement('span');
    el.className = 'compare-legende-item';
    el.innerHTML = `
      <span class="legende-dot" style="background:${item.farbe}"></span>
      <span class="legende-name">${item.name}</span>
    `;
    legende.appendChild(el);
  });
  
  return legende;
}

/**
 * DATENGETRIEBEN: Erkennt den Typ aus der Datenstruktur
 * Gleiche Logik wie Pipeline, aber ohne Config-Abhängigkeit
 */
export function detectType(wert) {
  if (wert === null || wert === undefined) return 'empty';
  if (typeof wert === 'boolean') return 'boolean';
  if (typeof wert === 'number') return detectNumberType(wert);
  if (typeof wert === 'string') return detectStringType(wert);
  if (Array.isArray(wert)) return detectArrayType(wert);
  if (typeof wert === 'object') return detectObjectType(wert);
  return 'text';
}

function detectNumberType(wert) {
  // Rating: 0-10 mit Dezimalstellen
  if (wert >= 0 && wert <= 10 && !Number.isInteger(wert)) {
    return 'rating';
  }
  // Progress: 0-100 Ganzzahl
  if (wert >= 0 && wert <= 100 && Number.isInteger(wert)) {
    return 'progress';
  }
  return 'number';
}

function detectStringType(wert) {
  const lower = wert.toLowerCase().trim();
  const statusKeywords = [
    'aktiv', 'inaktiv', 'ja', 'nein', 'essbar', 'giftig', 'tödlich',
    'verfügbar', 'vergriffen', 'saisonal', 'warnung'
  ];
  
  if (wert.length <= 25 && statusKeywords.some(kw => lower.includes(kw))) {
    return 'badge';
  }
  return 'text';
}

function detectArrayType(wert) {
  if (wert.length === 0) return 'list';
  
  const first = wert[0];
  if (typeof first === 'string') return 'list';
  
  if (typeof first === 'object') {
    // Radar: [{axis, value}]
    if ('axis' in first && 'value' in first) return 'radar';
    if ('dimension' in first && 'value' in first) return 'radar';
    
    // Timeline: [{date, event}]
    if ('date' in first && 'event' in first) return 'timeline';
    if ('datum' in first && 'ereignis' in first) return 'timeline';
    
    // Bar: [{label, value}]
    if ('label' in first && 'value' in first) return 'bar';
    if ('name' in first && 'value' in first) return 'bar';
  }
  
  return 'list';
}

function detectObjectType(wert) {
  const keys = Object.keys(wert);
  
  // Range: {min, max}
  if (keys.includes('min') && keys.includes('max') && keys.length <= 3) {
    return 'range';
  }
  
  // Stats: {min, max, avg, ...}
  if (keys.includes('min') && keys.includes('max') && keys.includes('avg')) {
    return 'stats';
  }
  
  // Pie: Objekt mit nur numerischen Werten
  const allNumeric = Object.values(wert).every(v => typeof v === 'number');
  if (allNumeric && keys.length >= 2 && keys.length <= 8) {
    return 'pie';
  }
  
  return 'object';
}

export default {
  setFarbenConfig,
  getFarben,
  erstelleFarben,
  createSection,
  createHeader,
  createLegende,
  detectType
};

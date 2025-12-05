/**
 * COMPARE BASE - Utilities für Compare-Morphs
 * 
 * Gemeinsame Funktionen für alle Compare-Morphs:
 * - Farb-Zuweisung für Items
 * - Section/Container-Erstellung
 * - Typ-Erkennung (config-driven aus morphs.yaml)
 * 
 * DATENGETRIEBEN: Keywords und Regeln kommen aus config/morphs.yaml!
 */

import { debug } from '../../observer/debug.js';

// Farben-Config wird von außen gesetzt (aus morphs.yaml)
let farbenConfig = null;

// Erkennung-Config wird von außen gesetzt (aus morphs.yaml)
let erkennungConfig = null;

// Pilz-Farben: Nur Blau-Töne - klar getrennt von Perspektiven-Farben
// Perspektiven nutzen: Gold, Grün, Cyan, Rosa, Violett, Türkis
// Pilze nutzen: Nur Blau-Spektrum
const FALLBACK_FARBEN = [
  'rgba(180, 200, 255, 0.75)',   // Eisblau - hell
  'rgba(130, 170, 255, 0.70)',   // Himmelblau
  'rgba(100, 140, 220, 0.65)',   // Mittelblau
  'rgba(70, 120, 200, 0.60)',    // Königsblau
  'rgba(90, 100, 180, 0.60)',    // Indigo-Blau
  'rgba(60, 90, 160, 0.55)',     // Dunkelblau
  'rgba(80, 130, 190, 0.62)',    // Stahlblau
  'rgba(110, 160, 230, 0.68)'    // Kornblumenblau
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
 * Setzt die Erkennungs-Konfiguration (aus morphs.yaml)
 * WICHTIG: Macht detectType config-driven statt hardcoded!
 */
export function setErkennungConfig(config) {
  erkennungConfig = config?.erkennung || null;
  debug.morphs('Compare Erkennung-Config geladen', { 
    hatBadge: !!erkennungConfig?.badge,
    keywords: erkennungConfig?.badge?.keywords?.length || 0
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
 * Erstellt einen Section-Container mit optionalem Abwahl-Button
 * @param {string} label - Überschrift
 * @param {string} farbe - Akzentfarbe (optional)
 * @param {string} feldName - Feldname für Abwahl-Funktionalität (optional)
 */
export function createSection(label, farbe = null, feldName = null) {
  const section = document.createElement('div');
  section.className = 'compare-section';
  
  if (farbe) {
    section.style.setProperty('--section-farbe', farbe);
  }
  
  // Feldname als data-Attribut für spätere Referenz
  if (feldName) {
    section.dataset.feldName = feldName;
  }
  
  const header = document.createElement('div');
  header.className = 'compare-section-header';
  
  // Label-Text
  const labelSpan = document.createElement('span');
  labelSpan.className = 'compare-section-label';
  labelSpan.textContent = label;
  header.appendChild(labelSpan);
  
  // Abwahl-Button (nur wenn feldName vorhanden)
  if (feldName) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'compare-section-remove';
    removeBtn.type = 'button';
    removeBtn.title = `${label} abwählen`;
    removeBtn.innerHTML = '×';
    removeBtn.dataset.feldName = feldName;
    header.appendChild(removeBtn);
  }
  
  section.appendChild(header);

  const content = document.createElement('div');
  content.className = 'compare-section-content';
  section.appendChild(content);

  // Helper um Content hinzuzufügen
  section.addContent = (el) => content.appendChild(el);

  return section;
}

/**
 * Erstellt Section nur wenn Feld noch nicht gerendert wurde (Deduplizierung)
 * 
 * @param {string} feldName - Eindeutiger Feldname für Deduplizierung
 * @param {string} label - Überschrift der Section
 * @param {string} farbe - Akzentfarbe (optional)
 * @param {Set} skipFelder - Set von bereits gerenderten Feldnamen
 * @returns {Object|null} Section oder null wenn bereits gerendert
 */
export function createSectionIfNew(feldName, label, farbe = null, skipFelder = null) {
  // Wenn skipFelder existiert und Feld bereits gerendert wurde → null
  if (skipFelder && skipFelder.has(feldName)) {
    debug.morphs('Section übersprungen (bereits gerendert)', { feldName });
    return null;
  }
  
  // Feld als gerendert markieren
  if (skipFelder) {
    skipFelder.add(feldName);
  }
  
  // Normale Section erstellen MIT feldName für Abwahl-Button
  return createSection(label, farbe, feldName);
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

// =============================================================================
// TYP-ERKENNUNG - 100% CONFIG-DRIVEN (aus morphs.yaml)
// =============================================================================

/**
 * Helper: Stellt sicher dass wir ein Array haben
 * (YAML-Parser kann manchmal String statt Array zurückgeben)
 */
function ensureArray(val, fallback) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim());
  return fallback;
}

/**
 * DATENGETRIEBEN: Erkennt den Typ aus der Datenstruktur
 * 
 * WICHTIG: Nutzt erkennungConfig aus morphs.yaml!
 * Keine hardcodierten Keywords mehr.
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

/**
 * Erkennt den besten Morph für Zahlen
 * Regeln kommen aus config/morphs.yaml → erkennung
 */
function detectNumberType(wert) {
  const cfg = erkennungConfig || {};
  
  // Rating: aus Config oder Fallback 0-10 mit Dezimalstellen
  const rating = cfg.rating || { min: 0, max: 10, dezimalstellen: true };
  if (wert >= rating.min && wert <= rating.max && rating.dezimalstellen && !Number.isInteger(wert)) {
    return 'rating';
  }
  
  // Progress: aus Config oder Fallback 0-100 Ganzzahl
  const progress = cfg.progress || { min: 0, max: 100, ganzzahl: true };
  if (wert >= progress.min && wert <= progress.max && (!progress.ganzzahl || Number.isInteger(wert))) {
    return 'progress';
  }
  
  return 'number';
}

/**
 * Erkennt den besten Morph für Strings
 * Keywords kommen aus config/morphs.yaml → erkennung.badge
 * 
 * KEINE HARDCODIERTEN KEYWORDS MEHR!
 */
function detectStringType(wert) {
  const lower = wert.toLowerCase().trim();
  const cfg = erkennungConfig?.badge || {};
  
  // Badge: Keywords NUR aus Config (Fallback ist leer = reiner text)
  // Das garantiert 100% Datengetriebenheit
  const keywords = cfg.keywords || [];
  const maxLaenge = cfg.maxLaenge || 25;
  
  if (keywords.length > 0 && wert.length <= maxLaenge && keywords.some(kw => lower.includes(kw.toLowerCase()))) {
    return 'badge';
  }
  
  return 'text';
}

/**
 * Erkennt den besten Morph für Arrays
 * Regeln kommen aus config/morphs.yaml → erkennung.array
 */
function detectArrayType(wert) {
  if (wert.length === 0) return 'list';
  
  const first = wert[0];
  const cfg = erkennungConfig?.array || {};
  
  // String-Arrays → List
  if (typeof first === 'string') return 'list';
  
  // Objekt-Arrays: Struktur analysieren
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    // Radar: aus Config oder Fallback
    const radarCfg = cfg.radar || {};
    const radarKeys = ensureArray(radarCfg.benoetigtKeys, ['axis', 'value']);
    const radarAltKeys = ensureArray(radarCfg.alternativeKeys, ['dimension', 'score', 'factor']);
    const allRadarKeys = [...radarKeys, ...radarAltKeys];
    if (wert.length >= (radarCfg.minItems || 3) && allRadarKeys.some(k => k in first)) {
      return 'radar';
    }
    
    // Timeline: aus Config oder Fallback
    const timelineCfg = cfg.timeline || {};
    const timelineKeys = ensureArray(timelineCfg.benoetigtKeys, ['date', 'event']);
    const timelineAltKeys = ensureArray(timelineCfg.alternativeKeys, ['time', 'datum', 'monat', 'periode', 'label']);
    const allTimelineKeys = [...timelineKeys, ...timelineAltKeys];
    if (allTimelineKeys.some(k => k in first)) {
      return 'timeline';
    }
    
    // Bar/Pie: aus Config oder Fallback
    const barCfg = cfg.bar || {};
    const pieCfg = cfg.pie || {};
    const labelKeys = ensureArray(barCfg.benoetigtKeys || pieCfg.benoetigtKeys, ['label', 'value']);
    const valueAltKeys = ensureArray(barCfg.alternativeKeys || pieCfg.alternativeKeys, ['name', 'amount', 'count', 'score']);
    const hasLabel = labelKeys.some(k => k in first);
    const hasValue = valueAltKeys.some(k => k in first) || 'value' in first;
    
    if (hasLabel && hasValue) {
      return wert.length <= 6 ? 'pie' : 'bar';
    }
  }
  
  // Zahlen-Arrays → Bar
  if (wert.every(v => typeof v === 'number')) {
    return 'bar';
  }
  
  return 'list';
}

/**
 * Erkennt den besten Morph für Objekte
 * Regeln kommen aus config/morphs.yaml → erkennung.objekt
 */
function detectObjectType(wert) {
  const keys = Object.keys(wert);
  const cfg = erkennungConfig?.objekt || {};
  
  // Range: aus Config oder Fallback (min + max)
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.benoetigtKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in wert) && keys.length <= (rangeCfg.maxKeys || 3)) {
    // Prüfen ob es Stats ist (hat zusätzlich avg/mean)
    const statsCfg = cfg.stats || {};
    const statsKeys = ensureArray(statsCfg.benoetigtKeys, ['min', 'max', 'avg']);
    if (statsKeys.filter(k => k in wert).length >= 3) {
      return 'stats';
    }
    return 'range';
  }
  
  // Pie: aus Config oder Fallback (nur numerische Werte)
  const pieCfg = cfg.pie || { nurNumerisch: true, minKeys: 2, maxKeys: 8 };
  const allNumeric = keys.every(k => typeof wert[k] === 'number');
  if (pieCfg.nurNumerisch !== false && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 8)) {
    return 'pie';
  }
  
  return 'object';
}

export default {
  setFarbenConfig,
  setErkennungConfig,
  getFarben,
  erstelleFarben,
  createSection,
  createHeader,
  createLegende,
  detectType
};
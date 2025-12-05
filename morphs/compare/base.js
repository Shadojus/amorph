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

// Pilz-Farben: Große Palette von Glass-Morphism Farben
// Diese werden dynamisch gefiltert basierend auf aktiven Perspektiven
const FALLBACK_FARBEN = [
  { name: 'Silber', rgb: [200, 210, 220], color: 'rgba(200, 210, 220, 0.70)' },
  { name: 'Stahl', rgb: [160, 175, 195], color: 'rgba(160, 175, 195, 0.65)' },
  { name: 'Schiefer', rgb: [130, 145, 165], color: 'rgba(130, 145, 165, 0.60)' },
  { name: 'Eisblau', rgb: [180, 200, 255], color: 'rgba(180, 200, 255, 0.70)' },
  { name: 'Himmelblau', rgb: [130, 170, 255], color: 'rgba(130, 170, 255, 0.65)' },
  { name: 'Indigo', rgb: [100, 120, 200], color: 'rgba(100, 120, 200, 0.60)' },
  { name: 'Bernstein', rgb: [240, 190, 100], color: 'rgba(240, 190, 100, 0.65)' },
  { name: 'Kupfer', rgb: [220, 150, 100], color: 'rgba(220, 150, 100, 0.60)' },
  { name: 'Jade', rgb: [140, 210, 170], color: 'rgba(140, 210, 170, 0.65)' },
  { name: 'Moos', rgb: [120, 180, 130], color: 'rgba(120, 180, 130, 0.60)' },
  { name: 'Lavendel', rgb: [180, 160, 220], color: 'rgba(180, 160, 220, 0.65)' },
  { name: 'Rose', rgb: [220, 160, 180], color: 'rgba(220, 160, 180, 0.60)' }
];

// Cache für aktive Perspektiven-Farben
let aktivePerspektivenFarben = [];

/**
 * Berechnet die Farbdistanz zwischen zwei RGB-Werten
 * Verwendet euklidische Distanz im RGB-Raum
 */
function farbDistanz(rgb1, rgb2) {
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Extrahiert RGB-Werte aus einem rgba() String
 */
function parseRgba(rgbaString) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

/**
 * Setzt die aktiven Perspektiven-Farben (wird vom Vergleich-Feature aufgerufen)
 * @param {string[]} farben - Array von rgba() Farbstrings
 */
export function setAktivePerspektivenFarben(farben) {
  aktivePerspektivenFarben = farben
    .map(f => parseRgba(f))
    .filter(Boolean);
  
  debug.morphs('Aktive Perspektiven-Farben gesetzt', { 
    anzahl: aktivePerspektivenFarben.length,
    farben: aktivePerspektivenFarben 
  });
}

/**
 * Filtert Farben die zu ähnlich zu den aktiven Perspektiven sind
 * @param {Array} palette - Array von Farb-Objekten {name, rgb, color}
 * @param {number} schwellenwert - Minimale Distanz (0-255)
 */
function filtereFarben(palette, schwellenwert = 80) {
  if (aktivePerspektivenFarben.length === 0) {
    return palette;
  }
  
  const gefiltert = palette.filter(farbe => {
    // Prüfe Distanz zu jeder aktiven Perspektiven-Farbe
    for (const perspFarbe of aktivePerspektivenFarben) {
      const distanz = farbDistanz(farbe.rgb, perspFarbe);
      if (distanz < schwellenwert) {
        debug.morphs(`Farbe ${farbe.name} zu ähnlich zu Perspektive`, { distanz, schwellenwert });
        return false;
      }
    }
    return true;
  });
  
  debug.morphs('Farben gefiltert', { 
    original: palette.length, 
    gefiltert: gefiltert.length,
    aktivePerspektiven: aktivePerspektivenFarben.length 
  });
  
  // Falls alle gefiltert wurden, nimm die mit der größten Distanz
  if (gefiltert.length === 0) {
    const mitDistanz = palette.map(farbe => {
      const minDistanz = Math.min(...aktivePerspektivenFarben.map(pf => farbDistanz(farbe.rgb, pf)));
      return { ...farbe, distanz: minDistanz };
    });
    mitDistanz.sort((a, b) => b.distanz - a.distanz);
    return mitDistanz.slice(0, Math.min(4, palette.length));
  }
  
  return gefiltert;
}

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
 * @param {string} typ - 'pilze' oder 'diagramme'
 * @returns {Array} Array von Farb-Objekten oder Strings
 */
export function getFarben(typ = 'pilze') {
  const configFarben = farbenConfig?.[typ];
  
  // Wenn Config vorhanden und Array von Objekten mit rgb
  if (Array.isArray(configFarben) && configFarben[0]?.rgb) {
    return configFarben;
  }
  
  return FALLBACK_FARBEN;
}

/**
 * Erstellt Farbzuordnung für Items (Pilze, Pflanzen, etc.)
 * Filtert automatisch Farben die zu ähnlich zu aktiven Perspektiven sind
 * @param {Array} itemIds - Array von Item-IDs
 * @returns {Map} ID → Farbe (rgba String)
 */
export function erstelleFarben(itemIds) {
  const farben = new Map();
  
  // Hole Palette und filtere nach aktiven Perspektiven
  const vollePalette = getFarben('pilze');
  const schwellenwert = farbenConfig?.aehnlichkeit_schwellenwert || 80;
  const gefilterte = filtereFarben(vollePalette, schwellenwert);
  
  debug.morphs('erstelleFarben', { 
    items: itemIds.length, 
    paletteVoll: vollePalette.length,
    paletteGefiltert: gefilterte.length,
    aktivePerspektiven: aktivePerspektivenFarben.length
  });
  
  itemIds.forEach((id, i) => {
    const normalizedId = String(id);
    const farbObj = gefilterte[i % gefilterte.length];
    // Extrahiere color String aus Objekt oder verwende direkt
    const farbe = farbObj?.color || farbObj;
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
  setAktivePerspektivenFarben,
  getFarben,
  erstelleFarben,
  createSection,
  createHeader,
  createLegende,
  detectType
};
/**
 * Transformationspipeline
 * DATEN → MORPHS → DOM
 * 
 * DATENGETRIEBEN: Morphs werden aus der Datenstruktur erkannt!
 * Erkennungsregeln kommen aus config/morphs.yaml
 */

import { morphs } from '../morphs/index.js';
import { debug } from '../observer/debug.js';
import { getFeldMorphs, getVersteckteFelder, getFeldConfig, sortBySchemaOrder } from '../util/semantic.js';

// Erkennung-Config wird beim ersten Aufruf geladen
let erkennungConfig = null;

/**
 * Setzt die Erkennungs-Konfiguration (aus morphs.yaml)
 */
export function setErkennungConfig(config) {
  erkennungConfig = config?.erkennung || null;
  debug.morphs('Erkennungs-Config geladen', { 
    hatBadge: !!erkennungConfig?.badge,
    hatRating: !!erkennungConfig?.rating,
    hatProgress: !!erkennungConfig?.progress
  });
}

export function transform(daten, config, customMorphs = {}) {
  debug.morphs('Transform Start', { 
    typ: Array.isArray(daten) ? 'array' : typeof daten,
    anzahl: Array.isArray(daten) ? daten.length : 1
  });
  
  // Erkennungs-Config aus morphs.yaml laden falls vorhanden
  if (!erkennungConfig && config?.morphs?.erkennung) {
    setErkennungConfig(config.morphs);
  }
  
  const alleMorphs = { ...morphs, ...customMorphs };
  
  // Feld-Morphs aus Schema laden (als Fallback/Override)
  const schemaFeldMorphs = getFeldMorphs();
  const versteckteFelder = getVersteckteFelder();
  
  function morphen(wert, feldname = null) {
    // Versteckte Felder überspringen
    if (feldname && versteckteFelder.includes(feldname)) {
      return null;
    }
    
    const typ = detectType(wert);
    const morphName = findMorph(typ, wert, feldname, config.morphs, schemaFeldMorphs);
    let morph = alleMorphs[morphName];
    let actualMorphName = morphName;
    
    if (!morph) {
      debug.warn(`Morph nicht gefunden: ${morphName}, nutze text`);
      morph = alleMorphs.text;
      actualMorphName = 'text';
    }
    
    // Config zusammenbauen: morphs.yaml + schema.yaml Feld-Config
    const morphConfig = getMorphConfig(actualMorphName, feldname, config);
    const element = morph(wert, morphConfig, morphen);
    
    // In Container wrappen
    const container = document.createElement('amorph-container');
    container.setAttribute('data-morph', morphName);
    if (feldname) container.setAttribute('data-field', feldname);
    container.appendChild(element);
    
    return container;
  }
  
  // Array von Objekten: Jedes Objekt als Einheit
  if (Array.isArray(daten)) {
    const fragment = document.createDocumentFragment();
    for (const item of daten) {
      const itemContainer = document.createElement('amorph-container');
      itemContainer.setAttribute('data-morph', 'item');
      itemContainer.className = 'amorph-item';
      
      // ID für Auswahl-System
      const itemId = item.id || item.slug || JSON.stringify(item).slice(0, 50);
      itemContainer.dataset.itemId = itemId;
      // Daten als JSON für späteren Zugriff (für Detail/Vergleich)
      itemContainer.dataset.itemData = JSON.stringify(item);
      
      if (typeof item === 'object' && item !== null) {
        // Felder in Schema-Reihenfolge rendern
        const sortedEntries = sortBySchemaOrder(item);
        for (const [key, value] of sortedEntries) {
          const morphed = morphen(value, key);
          if (morphed) itemContainer.appendChild(morphed);
        }
      } else {
        const morphed = morphen(item);
        if (morphed) itemContainer.appendChild(morphed);
      }
      
      fragment.appendChild(itemContainer);
    }
    return fragment;
  }
  
  // Einzelnes Objekt
  if (typeof daten === 'object' && daten !== null) {
    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(daten)) {
      const morphed = morphen(value, key);
      if (morphed) fragment.appendChild(morphed);
    }
    return fragment;
  }
  
  return morphen(daten);
}

function detectType(wert) {
  if (wert === null || wert === undefined) return 'null';
  if (typeof wert === 'boolean') return 'boolean';
  if (typeof wert === 'number') return detectNumberType(wert);
  if (typeof wert === 'string') return detectStringType(wert);
  
  if (Array.isArray(wert)) {
    return detectArrayType(wert);
  }
  
  if (typeof wert === 'object') {
    return detectObjectType(wert);
  }
  
  return 'unknown';
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
 */
function detectStringType(wert) {
  const lower = wert.toLowerCase().trim();
  const cfg = erkennungConfig?.badge || {};
  
  // Badge: Keywords aus Config oder Fallback
  const keywords = cfg.keywords || [
    'aktiv', 'inaktiv', 'ja', 'nein', 'essbar', 'giftig', 'tödlich',
    'active', 'inactive', 'yes', 'no', 'online', 'offline',
    'offen', 'geschlossen', 'verfügbar', 'vergriffen'
  ];
  const maxLaenge = cfg.maxLaenge || 25;
  
  if (wert.length <= maxLaenge && keywords.some(kw => lower.includes(kw))) {
    return 'badge';
  }
  
  return 'string';
}

/**
 * Erkennt den besten Morph für Arrays
 * Regeln kommen aus config/morphs.yaml → erkennung.array
 */
function detectArrayType(wert) {
  if (wert.length === 0) return 'array';
  
  const first = wert[0];
  const cfg = erkennungConfig?.array || {};
  
  // Helper: Stellt sicher dass wir ein Array haben
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  // Alle Elemente sind Objekte?
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    // Radar: aus Config oder Fallback
    const radarCfg = cfg.radar || {};
    const radarKeys = ensureArray(radarCfg.benoetigtKeys, ['axis', 'value', 'score', 'dimension', 'factor']);
    if (wert.length >= (radarCfg.minItems || 3) && 
        radarKeys.some(k => k in first)) {
      return 'radar';
    }
    
    // Timeline: aus Config oder Fallback
    const timelineCfg = cfg.timeline || {};
    const timelineKeys = ensureArray(timelineCfg.benoetigtKeys, ['date', 'time', 'datum', 'monat', 'periode']);
    if (timelineKeys.some(k => k in first)) {
      return 'timeline';
    }
    
    // Pie/Bar: Arrays mit label/value Struktur (aus Config)
    const arrayCfg = cfg.array || cfg || {};
    const pieCfg = arrayCfg.pie || {};
    const barCfg = arrayCfg.bar || {};
    const labelKeys = ensureArray(pieCfg.benoetigtKeys || barCfg.benoetigtKeys, ['label', 'name', 'category']);
    const valueKeys = ensureArray(pieCfg.alternativeKeys || barCfg.alternativeKeys, ['value', 'count', 'amount', 'score']);
    const hasLabel = labelKeys.some(k => k in first);
    const hasValue = valueKeys.some(k => k in first);
    if (hasLabel && hasValue) {
      return wert.length <= 6 ? 'pie' : 'bar';
    }
  }
  
  // Alle Elemente sind Zahlen → Bar Chart
  if (wert.every(v => typeof v === 'number')) {
    return 'bar';
  }
  
  return 'array';
}

/**
 * Erkennt den besten Morph für Objekte
 * Regeln kommen aus config/morphs.yaml → erkennung.objekt
 */
function detectObjectType(wert) {
  const keys = Object.keys(wert);
  const cfg = erkennungConfig?.objekt || {};
  
  // Helper: Stellt sicher dass wir ein Array haben (YAML-Parser kann String zurückgeben)
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  // Range: aus Config oder Fallback (min + max)
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.benoetigtKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in wert)) {
    // Prüfen ob es Stats ist (hat zusätzlich avg/mean)
    const statsCfg = cfg.stats || {};
    const statsKeys = ensureArray(statsCfg.benoetigtKeys, ['min', 'max', 'avg', 'mean', 'median']);
    if (statsKeys.filter(k => k in wert).length >= 3) {
      return 'stats';
    }
    return 'range';
  }
  
  // Rating: aus Config oder Fallback (hat rating/score/stars Feld)
  const ratingCfg = cfg.rating || {};
  const ratingKeys = ensureArray(ratingCfg.benoetigtKeys, ['rating']);
  const ratingAltKeys = ensureArray(ratingCfg.alternativeKeys, ['score', 'stars']);
  if (ratingKeys.some(k => k in wert) || ratingAltKeys.some(k => k in wert)) {
    return 'rating';
  }
  
  // Progress: aus Config oder Fallback (value/current + max/total)
  const progressCfg = cfg.progress || {};
  const progressKeys = ensureArray(progressCfg.benoetigtKeys, ['value']);
  const progressAltKeys = ensureArray(progressCfg.alternativeKeys, ['current', 'max', 'total']);
  const hasProgressPrimary = progressKeys.some(k => k in wert) || progressAltKeys.filter(k => ['current'].includes(k)).some(k => k in wert);
  const hasProgressMax = ['max', 'total'].some(k => k in wert);
  if (hasProgressPrimary && hasProgressMax) {
    return 'progress';
  }
  
  // Badge: aus Config oder Fallback (status/variant Feld)
  const badgeCfg = cfg.badge || {};
  const badgeKeys = ensureArray(badgeCfg.benoetigtKeys, ['status']);
  const badgeAltKeys = ensureArray(badgeCfg.alternativeKeys, ['variant']);
  if (badgeKeys.some(k => k in wert) || badgeAltKeys.some(k => k in wert)) {
    return 'badge';
  }
  
  // Pie: aus Config oder Fallback (nur numerische Werte)
  const pieCfg = cfg.pie || { nurNumerisch: true, minKeys: 2, maxKeys: 8 };
  const allNumeric = keys.every(k => typeof wert[k] === 'number');
  if (pieCfg.nurNumerisch && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 8)) {
    return 'pie';
  }
  
  return 'object';
}

function findMorph(typ, wert, feldname, morphConfig, schemaFeldMorphs = {}) {
  // 1. Explizite Feld-Zuweisung aus morphs.yaml
  if (feldname && morphConfig?.felder?.[feldname]) {
    return morphConfig.felder[feldname];
  }
  
  // 2. Feld-Typ aus Schema (Single Source of Truth)
  if (feldname && schemaFeldMorphs[feldname]) {
    return schemaFeldMorphs[feldname];
  }
  
  // 3. Regeln prüfen
  if (morphConfig?.regeln) {
    for (const regel of morphConfig.regeln) {
      if (matchesRegel(regel, typ, wert)) {
        return regel.morph;
      }
    }
  }
  
  // 4. Standard-Mapping (erweitert mit neuen Morphs)
  const defaults = {
    // Basis-Typen
    'string': 'text',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'list',
    'object': 'object',
    'range': 'range',
    'null': 'text',
    
    // Visuelle Morphs (automatisch erkannt)
    'pie': 'pie',
    'bar': 'bar',
    'radar': 'radar',
    'rating': 'rating',
    'progress': 'progress',
    'stats': 'stats',
    'timeline': 'timeline',
    'badge': 'badge'
  };
  
  return defaults[typ] || 'text';
}

function matchesRegel(regel, typ, wert) {
  if (regel.typ && regel.typ !== typ) return false;
  if (regel.hat && typeof wert === 'object') {
    return regel.hat.every(key => key in wert);
  }
  if (regel.maxLaenge && typeof wert === 'string') {
    return wert.length <= regel.maxLaenge;
  }
  return true;
}

/**
 * Morph-Config zusammenbauen aus:
 * 1. morphs.yaml config (generisch)
 * 2. schema.yaml feld-config (feld-spezifisch, überschreibt)
 */
function getMorphConfig(morphName, feldname, config) {
  // Basis-Config aus morphs.yaml
  const basisConfig = config?.morphs?.config?.[morphName] || {};
  
  // Feld-spezifische Config aus Schema
  const feldConfig = feldname ? getFeldConfig(feldname) : {};
  
  // Zusammenführen: Schema überschreibt morphs.yaml
  const merged = { ...basisConfig };
  
  // Farben aus Schema übernehmen (für Tags)
  if (feldConfig.farben) {
    merged.farben = { ...basisConfig.farben, ...feldConfig.farben };
  }
  
  // Einheit aus Schema übernehmen (für Ranges)
  if (feldConfig.einheit) {
    merged.einheit = feldConfig.einheit;
  }
  
  // Label aus Schema
  if (feldConfig.label) {
    merged.label = feldConfig.label;
  }
  
  return merged;
}

export async function render(container, daten, config) {
  debug.render('Render Start', { 
    hatDaten: !!daten, 
    anzahl: Array.isArray(daten) ? daten.length : (daten ? 1 : 0) 
  });
  
  // Empty State entfernen
  const emptyState = container.querySelector('.amorph-empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  // Nur den Daten-Bereich leeren, nicht die Features!
  // Features haben data-feature Attribut, Daten-Items haben data-morph="item"
  const dataItems = container.querySelectorAll(':scope > amorph-container[data-morph="item"]');
  debug.render('Alte Items entfernen', { anzahl: dataItems.length });
  for (const item of dataItems) {
    item.remove();
  }
  
  // Wenn keine Daten, nichts rendern
  if (!daten || (Array.isArray(daten) && daten.length === 0)) {
    debug.render('Keine Daten zum Rendern');
    container.dispatchEvent(new CustomEvent('amorph:rendered', {
      detail: { anzahl: 0, timestamp: Date.now() }
    }));
    return;
  }
  
  const dom = transform(daten, config);
  container.appendChild(dom);
  
  const anzahl = Array.isArray(daten) ? daten.length : 1;
  debug.render('Render komplett', { anzahl });
  
  container.dispatchEvent(new CustomEvent('amorph:rendered', {
    detail: { anzahl, timestamp: Date.now() }
  }));
}

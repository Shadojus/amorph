/**
 * Transformationspipeline
 * DATEN → MORPHS → DOM
 */

import { morphs } from '../morphs/index.js';
import { debug } from '../observer/debug.js';
import { getFeldMorphs, getVersteckteFelder, getFeldConfig, sortBySchemaOrder } from '../util/semantic.js';

export function transform(daten, config, customMorphs = {}) {
  debug.morphs('Transform Start', { 
    typ: Array.isArray(daten) ? 'array' : typeof daten,
    anzahl: Array.isArray(daten) ? daten.length : 1
  });
  
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
 */
function detectNumberType(wert) {
  // Rating: 0-5 oder 0-10 Skala (mit Dezimalstellen)
  if (wert >= 0 && wert <= 10 && !Number.isInteger(wert)) {
    return 'rating';
  }
  // Progress: 0-100 Prozent
  if (wert >= 0 && wert <= 100 && Number.isInteger(wert)) {
    return 'progress';
  }
  return 'number';
}

/**
 * Erkennt den besten Morph für Strings
 */
function detectStringType(wert) {
  const lower = wert.toLowerCase().trim();
  
  // Badge: Kurze Status-Wörter
  const badgeKeywords = ['aktiv', 'inaktiv', 'ja', 'nein', 'essbar', 'giftig', 'tödlich', 
                         'active', 'inactive', 'yes', 'no', 'online', 'offline', 
                         'offen', 'geschlossen', 'verfügbar', 'vergriffen'];
  if (wert.length <= 20 && badgeKeywords.some(kw => lower.includes(kw))) {
    return 'badge';
  }
  
  return 'string';
}

/**
 * Erkennt den besten Morph für Arrays
 */
function detectArrayType(wert) {
  if (wert.length === 0) return 'array';
  
  const first = wert[0];
  
  // Alle Elemente sind Objekte?
  if (typeof first === 'object' && first !== null) {
    // Pie Chart: Arrays mit {label, value/count}
    if (('label' in first || 'name' in first || 'category' in first) && 
        ('value' in first || 'count' in first || 'amount' in first)) {
      return 'pie';
    }
    
    // Bar Chart: Arrays mit numerischen Werten und Labels
    if (('label' in first || 'name' in first) && 
        ('value' in first || 'amount' in first || 'score' in first)) {
      return 'bar';
    }
    
    // Radar Chart: Arrays mit Achsen-Daten (3+ Elemente)
    if (wert.length >= 3 && 
        ('axis' in first || 'dimension' in first || 'factor' in first) &&
        ('value' in first || 'score' in first)) {
      return 'radar';
    }
    
    // Timeline: Arrays mit Datums-Feldern
    if ('date' in first || 'time' in first || 'datum' in first || 
        'monat' in first || 'periode' in first) {
      return 'timeline';
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
 */
function detectObjectType(wert) {
  const keys = Object.keys(wert);
  
  // Range: hat min und max
  if ('min' in wert && 'max' in wert) {
    return 'range';
  }
  
  // Stats: Objekt mit statistischen Feldern
  const statKeys = ['min', 'max', 'avg', 'average', 'mean', 'count', 'total', 'sum', 'median'];
  const hasStats = keys.some(k => statKeys.includes(k.toLowerCase()));
  if (hasStats && keys.length >= 2 && keys.length <= 8) {
    return 'stats';
  }
  
  // Rating: hat rating/score/stars Feld
  if ('rating' in wert || 'score' in wert || 'stars' in wert) {
    return 'rating';
  }
  
  // Progress: hat value/current und max/total
  if (('value' in wert || 'current' in wert) && ('max' in wert || 'total' in wert)) {
    return 'progress';
  }
  
  // Badge: hat status/variant Feld
  if ('status' in wert || 'variant' in wert) {
    return 'badge';
  }
  
  // Pie: Objekt mit nur numerischen Werten (Verteilung)
  const allNumeric = keys.every(k => typeof wert[k] === 'number');
  if (allNumeric && keys.length >= 2 && keys.length <= 8) {
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

/**
 * Transformationspipeline
 * DATEN → MORPHS → DOM
 */

import { morphs } from '../morphs/index.js';
import { debug } from '../observer/debug.js';
import { getFeldMorphs, getVersteckteFelder, getFeldConfig } from '../util/semantic.js';

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
      
      if (typeof item === 'object' && item !== null) {
        for (const [key, value] of Object.entries(item)) {
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
  if (Array.isArray(wert)) return 'array';
  if (typeof wert === 'boolean') return 'boolean';
  if (typeof wert === 'number') return 'number';
  if (typeof wert === 'string') return 'string';
  if (typeof wert === 'object') {
    if ('min' in wert && 'max' in wert) return 'range';
    return 'object';
  }
  return 'unknown';
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
  
  // 4. Standard-Mapping
  const defaults = {
    'string': 'text',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'list',
    'object': 'object',
    'range': 'range',
    'null': 'text'
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

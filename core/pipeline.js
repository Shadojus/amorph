/**
 * Transformationspipeline
 * DATEN → MORPHS → DOM
 */

import { morphs } from '../morphs/index.js';
import { debug } from '../observer/debug.js';

export function transform(daten, config, customMorphs = {}) {
  debug.morphs('Transform Start', { 
    typ: Array.isArray(daten) ? 'array' : typeof daten,
    anzahl: Array.isArray(daten) ? daten.length : 1
  });
  
  const alleMorphs = { ...morphs, ...customMorphs };
  
  function morphen(wert, feldname = null) {
    const typ = detectType(wert);
    const morphName = findMorph(typ, wert, feldname, config.morphs);
    const morph = alleMorphs[morphName];
    
    if (!morph) {
      debug.warn(`Morph nicht gefunden: ${morphName}, nutze text`);
      return alleMorphs.text(wert, {});
    }
    
    const morphConfig = getMorphConfig(morphName, config);
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
          itemContainer.appendChild(morphen(value, key));
        }
      } else {
        itemContainer.appendChild(morphen(item));
      }
      
      fragment.appendChild(itemContainer);
    }
    return fragment;
  }
  
  // Einzelnes Objekt
  if (typeof daten === 'object' && daten !== null) {
    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(daten)) {
      fragment.appendChild(morphen(value, key));
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

function findMorph(typ, wert, feldname, morphConfig) {
  // 1. Explizite Feld-Zuweisung
  if (feldname && morphConfig?.felder?.[feldname]) {
    return morphConfig.felder[feldname];
  }
  
  // 2. Regeln prüfen
  if (morphConfig?.regeln) {
    for (const regel of morphConfig.regeln) {
      if (matchesRegel(regel, typ, wert)) {
        return regel.morph;
      }
    }
  }
  
  // 3. Standard-Mapping
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

function getMorphConfig(morphName, config) {
  return config?.morphs?.config?.[morphName] || {};
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

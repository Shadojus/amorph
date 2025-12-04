/**
 * COMPARE - Generische Vergleichs-Morphs
 * 
 * Exportiert:
 * - Base-Utilities (erstelleFarben, detectType, etc.)
 * - Generische Compare-Morphs (compareBar, compareRadar, etc.)
 * - compareMorph() Dispatcher
 */

import { debug } from '../../observer/debug.js';

// Base-Utilities
export { 
  setFarbenConfig, 
  getFarben, 
  erstelleFarben, 
  createSection, 
  createHeader, 
  createLegende,
  detectType 
} from './base.js';

// Compare-Morphs
export {
  compareByType,
  compareBar,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange
} from './morphs.js';

import { detectType } from './base.js';
import {
  compareByType,
  compareBar,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange
} from './morphs.js';

/**
 * Typ → Compare-Morph Mapping
 */
const typHandler = {
  rating: compareRating,
  progress: (items, config) => compareBar(items, { ...config, max: 100 }),
  number: compareBar,
  range: compareRange,
  stats: compareStats,
  tag: compareTag,
  badge: compareTag,
  list: compareList,
  image: compareImage,
  radar: compareRadar,
  pie: comparePie,
  bar: compareBar,
  timeline: compareTimeline,
  text: compareText,
  string: compareText,
  object: compareText
};

/**
 * HAUPT-DISPATCHER: Wählt automatisch den richtigen Compare-Morph
 * 
 * DATENGETRIEBEN: Typ wird erkannt, nicht übergeben!
 * 
 * @param {string} feldName - Name des Feldes
 * @param {string} typ - Erkannter oder übergebener Typ
 * @param {Array} items - [{id, name, wert, farbe}]
 * @param {Object} config - Feld-Config
 */
export function compareMorph(feldName, typ, items, config = {}) {
  debug.morphs('compareMorph', { feldName, typ, items: items?.length });
  
  // Handler finden
  const handler = typHandler[typ];
  
  if (handler) {
    return handler(items, config);
  }
  
  // Fallback
  debug.warn(`Kein Compare-Handler für Typ: ${typ}, nutze text`);
  return compareText(items, config);
}

/**
 * Erstellt Compare-Morph basierend auf DATEN-Erkennung
 * 
 * @param {string} feldName - Feldname
 * @param {Array} items - Items mit Werten
 * @param {Object} config - Config
 */
export function compareByData(feldName, items, config = {}) {
  if (!items?.length || items[0]?.wert === undefined) {
    return compareText(items, config);
  }
  
  // Typ aus erstem Wert erkennen
  const erkannterTyp = detectType(items[0].wert);
  debug.morphs('compareByData', { feldName, erkannterTyp });
  
  return compareMorph(feldName, erkannterTyp, items, config);
}

export default {
  compareMorph,
  compareByData,
  compareByType,
  detectType
};

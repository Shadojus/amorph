/**
 * THEME COMPARE - Pilze
 * 
 * Perspektiven-spezifische Compare-Morphs für das Pilze-Theme.
 * Jeder Morph erhält die Items und die Perspektiven-Config.
 * 
 * DATENGETRIEBEN: Typ wird aus Datenstruktur erkannt, nicht definiert!
 */

import { debug } from '../../../../observer/debug.js';

// Import der Perspektiven-Morphs
import { compareculinary } from './culinary.js';
import { comparesafety } from './safety.js';
import { comparecultivation } from './cultivation.js';
import { compareWissenschaft } from './wissenschaft.js';
import { comparemedicine } from './medicine.js';
import { comparestatistics } from './statistics.js';
// Neue Perspektiven
import { comparechemistry } from './chemistry.js';
import { compareSensorik } from './sensorik.js';
import { compareecology } from './ecology.js';
import { compareTemporal } from './temporal.js';
import { comparegeography } from './geography.js';
import { compareeconomy } from './economy.js';
import { compareconservation } from './conservation.js';
import { compareculture } from './culture.js';
import { compareresearch } from './research.js';
import { compareinteractions } from './interactions.js';
import { compareidentification } from './identification.js';

/**
 * Registry der Perspektiven-Compare-Morphs
 */
export const perspektivenMorphs = {
  culinary: compareculinary,
  safety: comparesafety,
  cultivation: comparecultivation,
  wissenschaft: compareWissenschaft,
  medicine: comparemedicine,
  statistics: comparestatistics,
  // Neue Perspektiven
  chemistry: comparechemistry,
  sensorik: compareSensorik,
  ecology: compareecology,
  temporal: compareTemporal,
  geography: comparegeography,
  economy: compareeconomy,
  conservation: compareconservation,
  culture: compareculture,
  research: compareresearch,
  interactions: compareinteractions,
  identification: compareidentification
};

/**
 * Holt den Compare-Morph für eine Perspektive
 * @param {string} perspektiveId - ID der Perspektive
 * @returns {Function|null} Render-Funktion oder null
 */
export function getCompareForPerspektive(perspektiveId) {
  return perspektivenMorphs[perspektiveId] || null;
}

/**
 * Rendert Compare für eine Perspektive
 * 
 * @param {string} perspektiveId - ID der Perspektive
 * @param {Array} items - Transformierte Items [{id, name, data, farbe}]
 * @param {Object} perspektive - Perspektiven-Config aus Schema
 * @param {Object} schema - Schema-Definitionen
 */
export function renderPerspektiveCompare(perspektiveId, items, perspektive, schema) {
  const morph = perspektivenMorphs[perspektiveId];
  
  if (!morph) {
    debug.warn(`Kein Theme-Compare für Perspektive: ${perspektiveId}`);
    return null;
  }
  
  debug.morphs('Theme-Compare', { perspektiveId, items: items.length });
  return morph(items, perspektive, schema);
}

export default {
  perspektivenMorphs,
  getCompareForPerspektive,
  renderPerspektiveCompare
};

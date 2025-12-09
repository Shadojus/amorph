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
import { compareKulinarisch } from './kulinarisch.js';
import { compareSicherheit } from './sicherheit.js';
import { compareAnbau } from './anbau.js';
import { compareWissenschaft } from './wissenschaft.js';
import { compareMedizin } from './medizin.js';
import { compareStatistik } from './statistik.js';
// Neue Perspektiven
import { compareChemie } from './chemie.js';
import { compareSensorik } from './sensorik.js';
import { compareOekologie } from './oekologie.js';
import { compareTemporal } from './temporal.js';
import { compareGeografie } from './geografie.js';
import { compareWirtschaft } from './wirtschaft.js';
import { compareNaturschutz } from './naturschutz.js';
import { compareKultur } from './kultur.js';
import { compareForschung } from './forschung.js';
import { compareInteraktionen } from './interaktionen.js';
import { compareBestimmung } from './bestimmung.js';

/**
 * Registry der Perspektiven-Compare-Morphs
 */
export const perspektivenMorphs = {
  kulinarisch: compareKulinarisch,
  sicherheit: compareSicherheit,
  anbau: compareAnbau,
  wissenschaft: compareWissenschaft,
  medizin: compareMedizin,
  statistik: compareStatistik,
  // Neue Perspektiven
  chemie: compareChemie,
  sensorik: compareSensorik,
  oekologie: compareOekologie,
  temporal: compareTemporal,
  geografie: compareGeografie,
  wirtschaft: compareWirtschaft,
  naturschutz: compareNaturschutz,
  kultur: compareKultur,
  forschung: compareForschung,
  interaktionen: compareInteraktionen,
  bestimmung: compareBestimmung
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

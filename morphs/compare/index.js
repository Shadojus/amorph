/**
 * COMPARE - Generic comparison morphs
 * 
 * Exports:
 * - Base utilities (createColors, detectType, etc.)
 * - Generic compare morphs (compareBar, compareRadar, etc.)
 * - Smart composites (smartCompare, diffCompare)
 * - compareMorph() dispatcher
 * 
 * DATA-DRIVEN: detectType uses config/morphs.yaml!
 */

import { debug } from '../../observer/debug.js';

// Base utilities (new English API + legacy German aliases)
export { 
  // New English API
  setColorsConfig,
  setDetectionConfig,
  getColors, 
  createColors,
  createLegend,
  createSection, 
  createSectionIfNew,
  createHeader,
  detectType,
  // Legacy aliases
  setFarbenConfig,
  setErkennungConfig,
  getFarben, 
  erstelleFarben, 
  createLegende
} from './base.js';

// Compare-Morphs (aus refactored primitives/)
export {
  compareByType,
  compareBar,
  compareBarGroup,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange,
  compareProgress,
  compareBoolean,
  compareObject,
  // New primitives
  compareBadge,
  compareNumber,
  compareGauge,
  compareSparkline,
  compareCurrency,
  compareLink,
  compareCitation,
  compareDosage,
  compareSeverity,
  compareComparison,
  compareBoxplot,
  compareBubble,
  compareCalendar,
  compareDotplot,
  compareLollipop,
  compareFlow,
  compareSteps,
  compareLifecycle,
  compareGroupedbar,
  compareStackedbar,
  compareSlopegraph,
  compareHeatmap,
  compareHierarchy,
  compareNetwork,
  compareMap,
  comparePictogram,
  compareScatterplot,
  compareSunburst,
  compareTreemap
} from './primitives/index.js';

// Smart Composites
export {
  analyzeItems,
  findRelatedFields,
  smartCompare,
  diffCompare,
  calculateDiff,
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY
} from './composites.js';

import { detectType } from './base.js';
import {
  compareByType,
  compareBar,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange,
  compareProgress,
  compareBoolean,
  compareObject
} from './primitives/index.js';

import { smartCompare, diffCompare } from './composites.js';

// NOTE: compareByType in morphs.js is the SINGLE SOURCE OF TRUTH
// for type → compare morph mapping (incl. intelligent BarGroup detection)

/**
 * MAIN DISPATCHER: Automatically selects the right compare morph
 * 
 * DATA-DRIVEN: Type is detected, not passed!
 * 
 * Delegates to compareByType() for consistent mapping.
 * 
 * @param {string} fieldName - Name of the field
 * @param {string} type - Detected or passed type
 * @param {Array} items - [{id, name, value, color}]
 * @param {Object} config - Field config
 */
export function compareMorph(fieldName, type, items, config = {}) {
  debug.morphs('compareMorph', { fieldName, type, items: items?.length });
  
  // Delegate to compareByType - SINGLE SOURCE OF TRUTH
  return compareByType(type, items, config);
}

// Legacy alias
export const compareMorphLegacy = compareMorph;

/**
 * Creates compare morph based on DATA detection
 * 
 * @param {string} fieldName - Field name
 * @param {Array} items - Items with values
 * @param {Object} config - Config
 */
export function compareByData(fieldName, items, config = {}) {
  // Support both value and wert
  if (!items?.length || (items[0]?.value === undefined && items[0]?.wert === undefined)) {
    return compareText(items, config);
  }
  
  // Detect type from first value
  const firstValue = items[0]?.value ?? items[0]?.wert;
  const detectedType = detectType(firstValue);
  debug.morphs('compareByData', { fieldName, detectedType });
  
  return compareMorph(fieldName, detectedType, items, config);
}

export default {
  compareMorph,
  compareByData,
  compareByType,
  detectType,
  smartCompare,
  diffCompare
};

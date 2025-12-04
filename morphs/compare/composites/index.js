/**
 * COMPOSITES INDEX - Export aller Composite-Morphs
 * 
 * Composite-Morphs kombinieren mehrere Basis-Morphs zu intelligenten Vergleichen.
 * Sie sind 100% DATENGETRIEBEN und erkennen automatisch die beste Darstellung.
 */

// Typ-Kategorien - Import für lokale Nutzung UND Re-Export
import { 
  TYPE_CATEGORIES, 
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory
} from './types.js';

// Analyse-Funktionen
import {
  analyzeItems,
  findRelatedFields,
  calculateDiff
} from './analyze.js';

// Render-Helpers
import {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite
} from './render.js';

// Composite-Morphs
import { smartCompare } from './smartCompare.js';
import { diffCompare } from './diffCompare.js';

// Named Exports
export {
  // Typ-Kategorien
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory,
  
  // Analyse
  analyzeItems,
  findRelatedFields,
  calculateDiff,
  
  // Render-Helpers
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite,
  
  // Composite-Morphs
  smartCompare,
  diffCompare
};

// Default Export
export default {
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  analyzeItems,
  findRelatedFields,
  calculateDiff,
  smartCompare,
  diffCompare
};

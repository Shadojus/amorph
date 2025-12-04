/**
 * COMPARE COMPOSITES - Re-Export aus composites/ Ordner
 * 
 * REFACTORED: Alle Composite-Morphs sind jetzt in eigenen Dateien:
 * - composites/types.js      - Typ-Kategorien (TYPE_CATEGORIES, TYPE_TO_CATEGORY)
 * - composites/analyze.js    - Analyse-Funktionen (analyzeItems, findRelatedFields, calculateDiff)
 * - composites/render.js     - Rendering-Helpers (renderFieldMorph, renderXxxComposite)
 * - composites/smartCompare.js - Smart Compare Composite
 * - composites/diffCompare.js  - Diff Compare Composite
 * 
 * DATENGETRIEBEN:
 * - Alle Morphs erkennen Typen aus Datenstruktur
 * - Keine hardcodierten Feldnamen
 * - Automatische Gruppierung nach Typ-Kategorie
 */

// Re-export alles aus dem composites/ Ordner
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
} from './composites/index.js';

// Default-Export für Abwärtskompatibilität
export { default } from './composites/index.js';

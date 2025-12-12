/**
 * COMPARE COMPOSITES - Re-export from composites/ folder
 * 
 * REFACTORED: All composite morphs are now in their own files:
 * - composites/types.js        - Type categories (TYPE_CATEGORIES, TYPE_TO_CATEGORY)
 * - composites/analyze.js      - Analysis functions (analyzeItems, findRelatedFields, calculateDiff)
 * - composites/render.js       - Rendering helpers (renderFieldMorph, renderXxxComposite)
 * - composites/smartCompare.js - Smart Compare composite
 * - composites/diffCompare.js  - Diff Compare composite
 * 
 * DATA-DRIVEN:
 * - All morphs detect types from data structure
 * - No hardcoded field names
 * - Automatic grouping by type category
 */

// Re-export everything from composites/ folder
export {
  // Type categories
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory,
  
  // Analysis
  analyzeItems,
  findRelatedFields,
  calculateDiff,
  
  // Render helpers
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite,
  
  // Composite morphs
  smartCompare,
  diffCompare
} from './composites/index.js';

// Default export for backwards compatibility
export { default } from './composites/index.js';

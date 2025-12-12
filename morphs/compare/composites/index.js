/**
 * COMPOSITES INDEX - Export of all composite morphs
 * 
 * Composite morphs combine multiple base morphs into intelligent comparisons.
 * They are 100% DATA-DRIVEN and automatically detect the best visualization.
 */

// Type categories - import for local use AND re-export
import { 
  TYPE_CATEGORIES, 
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory
} from './types.js';

// Analysis functions
import {
  analyzeItems,
  findRelatedFields,
  calculateDiff
} from './analyze.js';

// Render helpers
import {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite
} from './render.js';

// Composite morphs
import { smartCompare } from './smartCompare.js';
import { diffCompare } from './diffCompare.js';

// Named Exports
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
};

// Default export
export default {
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  analyzeItems,
  findRelatedFields,
  calculateDiff,
  smartCompare,
  diffCompare
};

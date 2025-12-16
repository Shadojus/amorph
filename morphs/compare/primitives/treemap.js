/**
 * COMPARE TREEMAP - Treemap comparison
 * Shows hierarchical data summary
 */

import { compareHierarchy } from './hierarchy.js';
import { debug } from '../../../../observer/debug.js';

export function compareTreemap(items, config = {}) {
  debug.morphs('compareTreemap', { itemCount: items?.length });
  // Treemap uses hierarchy visualization
  return compareHierarchy(items, config);
}

export default compareTreemap;

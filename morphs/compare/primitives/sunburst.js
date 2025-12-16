/**
 * COMPARE SUNBURST - Sunburst chart comparison
 * Shows hierarchical data summary
 */

import { compareHierarchy } from './hierarchy.js';
import { debug } from '../../../../observer/debug.js';

export function compareSunburst(items, config = {}) {
  debug.morphs('compareSunburst', { itemCount: items?.length });
  // Sunburst uses hierarchy visualization
  return compareHierarchy(items, config);
}

export default compareSunburst;

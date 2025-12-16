/**
 * COMPARE COMPARISON - Generic comparison visualization
 * Uses bar charts for comparison data
 */

import { compareBarGroup } from './barGroup.js';
import { debug } from '../../../../observer/debug.js';

export function compareComparison(items, config = {}) {
  debug.morphs('compareComparison', { itemCount: items?.length });
  // Comparison uses bar group visualization
  return compareBarGroup(items, config);
}

export default compareComparison;

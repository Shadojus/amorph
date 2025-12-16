/**
 * COMPARE GROUPEDBAR - Grouped bar chart comparison
 * Alias for compareBarGroup
 */

import { compareBarGroup } from './barGroup.js';
import { debug } from '../../../../observer/debug.js';

export function compareGroupedbar(items, config = {}) {
  debug.morphs('compareGroupedbar', { itemCount: items?.length });
  // Grouped bar uses bar group visualization
  return compareBarGroup(items, config);
}

export default compareGroupedbar;

/**
 * COMPARE FLOW - Flow diagram comparison
 * Shows flow data as list
 */

import { compareList } from './list.js';
import { debug } from '../../../../observer/debug.js';

export function compareFlow(items, config = {}) {
  debug.morphs('compareFlow', { itemCount: items?.length });
  // Flow uses list visualization
  return compareList(items, config);
}

export default compareFlow;

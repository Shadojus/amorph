/**
 * COMPARE NUMBER - Numeric comparison with bars
 * Alias for compareBar for simple numeric values
 */

import { compareBar } from './bar.js';
import { debug } from '../../../../observer/debug.js';

export function compareNumber(items, config = {}) {
  debug.morphs('compareNumber', { itemCount: items?.length });
  // Numbers use bar visualization
  return compareBar(items, config);
}

export default compareNumber;

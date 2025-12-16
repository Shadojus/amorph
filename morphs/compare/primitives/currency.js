/**
 * COMPARE CURRENCY - Currency value comparison
 * Alias for compareBar with currency formatting
 */

import { compareBar } from './bar.js';
import { debug } from '../../../../observer/debug.js';

export function compareCurrency(items, config = {}) {
  debug.morphs('compareCurrency', { itemCount: items?.length });
  // Currency uses bar visualization
  return compareBar(items, { ...config, format: 'currency' });
}

export default compareCurrency;

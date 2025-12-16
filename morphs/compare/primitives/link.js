/**
 * COMPARE LINK - Side-by-side link comparison
 * Alias for compareText for link values
 */

import { compareText } from './text.js';
import { debug } from '../../../../observer/debug.js';

export function compareLink(items, config = {}) {
  debug.morphs('compareLink', { itemCount: items?.length });
  // Links use text visualization
  return compareText(items, config);
}

export default compareLink;

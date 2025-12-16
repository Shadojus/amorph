/**
 * COMPARE CITATION - Side-by-side citation comparison
 * Alias for compareText for citation values
 */

import { compareText } from './text.js';
import { debug } from '../../../../observer/debug.js';

export function compareCitation(items, config = {}) {
  debug.morphs('compareCitation', { itemCount: items?.length });
  // Citations use text visualization
  return compareText(items, config);
}

export default compareCitation;

/**
 * COMPARE DOSAGE - Dosage comparison
 * Alias for compareBar for dosage values
 */

import { compareBar } from './bar.js';
import { debug } from '../../../../observer/debug.js';

export function compareDosage(items, config = {}) {
  debug.morphs('compareDosage', { itemCount: items?.length });
  // Dosage uses bar visualization
  return compareBar(items, config);
}

export default compareDosage;

/**
 * COMPARE SEVERITY - Severity level comparison
 * Alias for compareBar with severity coloring
 */

import { compareBar } from './bar.js';
import { debug } from '../../../../observer/debug.js';

export function compareSeverity(items, config = {}) {
  debug.morphs('compareSeverity', { itemCount: items?.length });
  // Severity uses bar visualization with severity styling
  return compareBar(items, { ...config, variant: 'severity' });
}

export default compareSeverity;

/**
 * COMPARE LIFECYCLE - Lifecycle stage comparison
 * Shows lifecycle stages
 */

import { compareSteps } from './steps.js';
import { debug } from '../../../../observer/debug.js';

export function compareLifecycle(items, config = {}) {
  debug.morphs('compareLifecycle', { itemCount: items?.length });
  // Lifecycle uses steps visualization
  return compareSteps(items, config);
}

export default compareLifecycle;

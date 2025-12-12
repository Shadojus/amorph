/**
 * COMPARE PRIMITIVES - Central exports
 * All compare primitives for item comparison
 */

import { debug } from '../../../../observer/debug.js';

// Import all primitives
export { compareBar } from './bar.js';
export { compareBarGroup } from './barGroup.js';
export { compareRating } from './rating.js';
export { compareTag } from './tag.js';
export { compareList } from './list.js';
export { compareImage } from './image.js';
export { compareRadar } from './radar.js';
export { comparePie } from './pie.js';
export { compareText } from './text.js';
export { compareTimeline } from './timeline.js';
export { compareStats } from './stats.js';
export { compareProgress } from './progress.js';
export { compareBoolean } from './boolean.js';
export { compareObject } from './object.js';
export { compareRange } from './range.js';

// Alias: compareNumber uses compareText for simple number display
export { compareText as compareNumber } from './text.js';

// For compareByType we need the functions directly
import { compareBar } from './bar.js';
import { compareBarGroup } from './barGroup.js';
import { compareRating } from './rating.js';
import { compareTag } from './tag.js';
import { compareList } from './list.js';
import { compareImage } from './image.js';
import { compareRadar } from './radar.js';
import { comparePie } from './pie.js';
import { compareText } from './text.js';
import { compareTimeline } from './timeline.js';
import { compareStats } from './stats.js';
import { compareProgress } from './progress.js';
import { compareBoolean } from './boolean.js';
import { compareObject } from './object.js';
import { compareRange } from './range.js';

/**
 * Selects the right compare function based on type
 * @param {string} type - The detected data type
 * @param {Array} items - Items to compare [{name, value, color}, ...]
 * @param {Object} config - Optional configuration
 * @returns {HTMLElement} The DOM element for comparison
 */
export function compareByType(type, items, config = {}) {
  debug.morphs('compareByType', { type, itemCount: items?.length, config });
  
  // Intelligent bar detection: If value is an array of objects → BarGroup
  const firstValue = items?.[0]?.value ?? items?.[0]?.wert;
  if ((type === 'bar' || type === 'number') && items?.length && Array.isArray(firstValue)) {
    debug.morphs('compareByType: Bar with array value → BarGroup');
    return compareBarGroup(items, config);
  }
  
  switch (type) {
    case 'bar':
    case 'number':
      return compareBar(items, config);
      
    case 'rating':
      return compareRating(items, config);
      
    case 'radar':
      return compareRadar(items, config);
      
    case 'pie':
      return comparePie(items, config);
      
    case 'tag':
    case 'badge':
      return compareTag(items, config);
      
    case 'list':
      return compareList(items, config);
      
    case 'image':
      return compareImage(items, config);
      
    case 'timeline':
      return compareTimeline(items, config);
      
    case 'stats':
      return compareStats(items, config);
      
    case 'range':
      return compareRange(items, config);
      
    case 'progress':
      return compareProgress(items, config);
      
    case 'boolean':
      return compareBoolean(items, config);
      
    case 'object':
      return compareObject(items, config);
      
    case 'text':
    case 'string':
    default:
      return compareText(items, config);
  }
}

export default {
  compareByType,
  compareBar,
  compareBarGroup,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange,
  compareProgress,
  compareBoolean,
  compareObject
};

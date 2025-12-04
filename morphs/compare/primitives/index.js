/**
 * COMPARE PRIMITIVES - Zentrale Exports
 * Alle Compare-Primitive für den Vergleich von Items
 */

import { debug } from '../../../observer/debug.js';

// Import alle Primitives
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

// Für compareByType brauchen wir die Funktionen direkt
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
 * Wählt die richtige Compare-Funktion basierend auf dem Typ
 * @param {string} typ - Der erkannte Datentyp
 * @param {Array} items - Die zu vergleichenden Items [{name, wert, farbe}, ...]
 * @param {Object} config - Optionale Konfiguration
 * @returns {HTMLElement} Das DOM-Element für den Vergleich
 */
export function compareByType(typ, items, config = {}) {
  debug.morphs('compareByType', { typ, itemCount: items?.length, config });
  
  // Intelligente Bar-Erkennung: Wenn wert ein Array von Objekten ist → BarGroup
  if ((typ === 'bar' || typ === 'number') && items?.length && Array.isArray(items[0]?.wert)) {
    debug.morphs('compareByType: Bar mit Array-Wert → BarGroup');
    return compareBarGroup(items, config);
  }
  
  switch (typ) {
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

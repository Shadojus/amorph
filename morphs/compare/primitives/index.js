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

// New primitives
export { compareBadge } from './badge.js';
export { compareNumber } from './number.js';
export { compareGauge } from './gauge.js';
export { compareSparkline } from './sparkline.js';
export { compareCurrency } from './currency.js';
export { compareLink } from './link.js';
export { compareCitation } from './citation.js';
export { compareDosage } from './dosage.js';
export { compareSeverity } from './severity.js';
export { compareComparison } from './comparison.js';
export { compareBoxplot } from './boxplot.js';
export { compareBubble } from './bubble.js';
export { compareCalendar } from './calendar.js';
export { compareDotplot } from './dotplot.js';
export { compareLollipop } from './lollipop.js';
export { compareFlow } from './flow.js';
export { compareSteps } from './steps.js';
export { compareLifecycle } from './lifecycle.js';
export { compareGroupedbar } from './groupedbar.js';
export { compareStackedbar } from './stackedbar.js';
export { compareSlopegraph } from './slopegraph.js';
export { compareHeatmap } from './heatmap.js';
export { compareHierarchy } from './hierarchy.js';
export { compareNetwork } from './network.js';
export { compareMap } from './map.js';
export { comparePictogram } from './pictogram.js';
export { compareScatterplot } from './scatterplot.js';
export { compareSunburst } from './sunburst.js';
export { compareTreemap } from './treemap.js';

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
import { compareBadge } from './badge.js';
import { compareNumber } from './number.js';
import { compareGauge } from './gauge.js';
import { compareSparkline } from './sparkline.js';
import { compareCurrency } from './currency.js';
import { compareLink } from './link.js';
import { compareCitation } from './citation.js';
import { compareDosage } from './dosage.js';
import { compareSeverity } from './severity.js';
import { compareComparison } from './comparison.js';
import { compareBoxplot } from './boxplot.js';
import { compareBubble } from './bubble.js';
import { compareCalendar } from './calendar.js';
import { compareDotplot } from './dotplot.js';
import { compareLollipop } from './lollipop.js';
import { compareFlow } from './flow.js';
import { compareSteps } from './steps.js';
import { compareLifecycle } from './lifecycle.js';
import { compareGroupedbar } from './groupedbar.js';
import { compareStackedbar } from './stackedbar.js';
import { compareSlopegraph } from './slopegraph.js';
import { compareHeatmap } from './heatmap.js';
import { compareHierarchy } from './hierarchy.js';
import { compareNetwork } from './network.js';
import { compareMap } from './map.js';
import { comparePictogram } from './pictogram.js';
import { compareScatterplot } from './scatterplot.js';
import { compareSunburst } from './sunburst.js';
import { compareTreemap } from './treemap.js';

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
      return compareBar(items, config);
      
    case 'number':
      return compareNumber(items, config);
      
    case 'rating':
      return compareRating(items, config);
      
    case 'radar':
      return compareRadar(items, config);
      
    case 'pie':
      return comparePie(items, config);
      
    case 'tag':
      return compareTag(items, config);
      
    case 'badge':
      return compareBadge(items, config);
      
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
      
    case 'gauge':
      return compareGauge(items, config);
      
    case 'sparkline':
      return compareSparkline(items, config);
      
    case 'currency':
      return compareCurrency(items, config);
      
    case 'link':
      return compareLink(items, config);
      
    case 'citation':
      return compareCitation(items, config);
      
    case 'dosage':
      return compareDosage(items, config);
      
    case 'severity':
      return compareSeverity(items, config);
      
    case 'comparison':
      return compareComparison(items, config);
      
    case 'boxplot':
      return compareBoxplot(items, config);
      
    case 'bubble':
      return compareBubble(items, config);
      
    case 'calendar':
      return compareCalendar(items, config);
      
    case 'dotplot':
      return compareDotplot(items, config);
      
    case 'lollipop':
      return compareLollipop(items, config);
      
    case 'flow':
      return compareFlow(items, config);
      
    case 'steps':
      return compareSteps(items, config);
      
    case 'lifecycle':
      return compareLifecycle(items, config);
      
    case 'groupedbar':
      return compareGroupedbar(items, config);
      
    case 'stackedbar':
      return compareStackedbar(items, config);
      
    case 'slopegraph':
      return compareSlopegraph(items, config);
      
    case 'heatmap':
      return compareHeatmap(items, config);
      
    case 'hierarchy':
      return compareHierarchy(items, config);
      
    case 'network':
      return compareNetwork(items, config);
      
    case 'map':
      return compareMap(items, config);
      
    case 'pictogram':
      return comparePictogram(items, config);
      
    case 'scatterplot':
      return compareScatterplot(items, config);
      
    case 'sunburst':
      return compareSunburst(items, config);
      
    case 'treemap':
      return compareTreemap(items, config);
      
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
  compareObject,
  compareBadge,
  compareNumber,
  compareGauge,
  compareSparkline,
  compareCurrency,
  compareLink,
  compareCitation,
  compareDosage,
  compareSeverity,
  compareComparison,
  compareBoxplot,
  compareBubble,
  compareCalendar,
  compareDotplot,
  compareLollipop,
  compareFlow,
  compareSteps,
  compareLifecycle,
  compareGroupedbar,
  compareStackedbar,
  compareSlopegraph,
  compareHeatmap,
  compareHierarchy,
  compareNetwork,
  compareMap,
  comparePictogram,
  compareScatterplot,
  compareSunburst,
  compareTreemap
};

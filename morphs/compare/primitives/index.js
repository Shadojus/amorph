/**
 * COMPARE PRIMITIVES - Central exports
 * All compare primitives for item comparison
 */

import { debug } from '../../../observer/debug.js';

// Import all primitives from subdirectories
export { compareBar } from './bar/bar.js';
export { compareBarGroup } from './barGroup/barGroup.js';
export { compareTag } from './tag/tag.js';
export { compareList } from './list/list.js';
export { compareImage } from './image/image.js';
export { compareRadar } from './radar/radar.js';
export { comparePie } from './pie/pie.js';
export { compareText } from './text/text.js';
export { compareTimeline } from './timeline/timeline.js';
export { compareStats } from './stats/stats.js';
export { compareProgress } from './progress/progress.js';
export { compareBoolean } from './boolean/boolean.js';
export { compareObject } from './object/object.js';
export { compareRange } from './range/range.js';

// New primitives
export { compareBadge } from './badge/badge.js';
export { compareNumber } from './number/number.js';
export { compareGauge } from './gauge/gauge.js';
export { compareSparkline } from './sparkline/sparkline.js';
export { compareCurrency } from './currency/currency.js';
export { compareLink } from './link/link.js';
export { compareCitation } from './citation/citation.js';
export { compareDosage } from './dosage/dosage.js';
export { compareSeverity } from './severity/severity.js';
export { compareComparison } from './comparison/comparison.js';
export { compareBoxplot } from './boxplot/boxplot.js';
export { compareBubble } from './bubble/bubble.js';
export { compareCalendar } from './calendar/calendar.js';
export { compareDotplot } from './dotplot/dotplot.js';
export { compareLollipop } from './lollipop/lollipop.js';
export { compareFlow } from './flow/flow.js';
export { compareSteps } from './steps/steps.js';
export { compareLifecycle } from './lifecycle/lifecycle.js';
export { compareGroupedbar } from './groupedbar/groupedbar.js';
export { compareStackedbar } from './stackedbar/stackedbar.js';
export { compareSlopegraph } from './slopegraph/slopegraph.js';
export { compareHeatmap } from './heatmap/heatmap.js';
export { compareHierarchy } from './hierarchy/hierarchy.js';
export { compareNetwork } from './network/network.js';
export { compareMap } from './map/map.js';
export { comparePictogram } from './pictogram/pictogram.js';
export { compareScatterplot } from './scatterplot/scatterplot.js';
export { compareSunburst } from './sunburst/sunburst.js';
export { compareTreemap } from './treemap/treemap.js';

// For compareByType we need the functions directly
import { compareBar } from './bar/bar.js';
import { compareBarGroup } from './barGroup/barGroup.js';
import { compareTag } from './tag/tag.js';
import { compareList } from './list/list.js';
import { compareImage } from './image/image.js';
import { compareRadar } from './radar/radar.js';
import { comparePie } from './pie/pie.js';
import { compareText } from './text/text.js';
import { compareTimeline } from './timeline/timeline.js';
import { compareStats } from './stats/stats.js';
import { compareProgress } from './progress/progress.js';
import { compareBoolean } from './boolean/boolean.js';
import { compareObject } from './object/object.js';
import { compareRange } from './range/range.js';
import { compareBadge } from './badge/badge.js';
import { compareNumber } from './number/number.js';
import { compareGauge } from './gauge/gauge.js';
import { compareSparkline } from './sparkline/sparkline.js';
import { compareCurrency } from './currency/currency.js';
import { compareLink } from './link/link.js';
import { compareCitation } from './citation/citation.js';
import { compareDosage } from './dosage/dosage.js';
import { compareSeverity } from './severity/severity.js';
import { compareComparison } from './comparison/comparison.js';
import { compareBoxplot } from './boxplot/boxplot.js';
import { compareBubble } from './bubble/bubble.js';
import { compareCalendar } from './calendar/calendar.js';
import { compareDotplot } from './dotplot/dotplot.js';
import { compareLollipop } from './lollipop/lollipop.js';
import { compareFlow } from './flow/flow.js';
import { compareSteps } from './steps/steps.js';
import { compareLifecycle } from './lifecycle/lifecycle.js';
import { compareGroupedbar } from './groupedbar/groupedbar.js';
import { compareStackedbar } from './stackedbar/stackedbar.js';
import { compareSlopegraph } from './slopegraph/slopegraph.js';
import { compareHeatmap } from './heatmap/heatmap.js';
import { compareHierarchy } from './hierarchy/hierarchy.js';
import { compareNetwork } from './network/network.js';
import { compareMap } from './map/map.js';
import { comparePictogram } from './pictogram/pictogram.js';
import { compareScatterplot } from './scatterplot/scatterplot.js';
import { compareSunburst } from './sunburst/sunburst.js';
import { compareTreemap } from './treemap/treemap.js';

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

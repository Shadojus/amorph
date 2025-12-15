/**
 * PRIMITIVES - Domänenunabhängige Basis-Morphs
 * 
 * Diese Morphs sind reine Funktionen ohne Domain-Logik.
 * Sie transformieren Datenstrukturen in DOM-Elemente.
 * 
 * WICHTIG: Keine "Pilz"-, "Pflanze"- oder andere domänenspezifische
 * Begriffe dürfen hier vorkommen!
 */

// Text-basierte Morphs
export { text } from './text/text.js';
export { number } from './number/number.js';
export { boolean } from './boolean/boolean.js';
export { tag } from './tag/tag.js';
export { badge } from './badge/badge.js';

// Container-Morphs
export { list } from './list/list.js';
export { object } from './object/object.js';
export { range } from './range/range.js';
export { stats } from './stats/stats.js';

// Visuelle Morphs
export { bar } from './bar/bar.js';
export { radar } from './radar/radar.js';
export { pie } from './pie/pie.js';
export { rating } from './rating/rating.js';
export { progress } from './progress/progress.js';
export { timeline } from './timeline/timeline.js';
export { sparkline } from './sparkline/sparkline.js';
export { slopegraph } from './slopegraph/slopegraph.js';
export { heatmap } from './heatmap/heatmap.js';

// Neue Kirk-Morphs
export { bubble } from './bubble/bubble.js';
export { boxplot } from './boxplot/boxplot.js';
export { treemap } from './treemap/treemap.js';
export { stackedbar } from './stackedbar/stackedbar.js';
export { dotplot } from './dotplot/dotplot.js';
export { sunburst } from './sunburst/sunburst.js';

// Noch neuere Kirk-Morphs (Session 2)
export { default as flow } from './flow/flow.js';
export { default as groupedbar } from './groupedbar/groupedbar.js';
export { default as scatterplot } from './scatterplot/scatterplot.js';
export { default as lollipop } from './lollipop/lollipop.js';
export { default as pictogram } from './pictogram/pictogram.js';

// Media-Morphs
export { image } from './image/image.js';
export { link } from './link/link.js';

// Erweiterte Morphs
export { map } from './map/map.js';
export { hierarchy } from './hierarchy/hierarchy.js';
export { comparison } from './comparison/comparison.js';
export { steps } from './steps/steps.js';
export { lifecycle } from './lifecycle/lifecycle.js';
export { network } from './network/network.js';
export { severity } from './severity/severity.js';
export { calendar } from './calendar/calendar.js';
export { gauge } from './gauge/gauge.js';
export { citation } from './citation/citation.js';
export { currency } from './currency/currency.js';
export { dosage } from './dosage/dosage.js';

// Alle Morphs als Map für dynamischen Zugriff
import { text } from './text/text.js';
import { number } from './number/number.js';
import { boolean } from './boolean/boolean.js';
import { tag } from './tag/tag.js';
import { badge } from './badge/badge.js';
import { list } from './list/list.js';
import { object } from './object/object.js';
import { range } from './range/range.js';
import { stats } from './stats/stats.js';
import { bar } from './bar/bar.js';
import { radar } from './radar/radar.js';
import { pie } from './pie/pie.js';
import { rating } from './rating/rating.js';
import { progress } from './progress/progress.js';
import { timeline } from './timeline/timeline.js';
import { sparkline } from './sparkline/sparkline.js';
import { slopegraph } from './slopegraph/slopegraph.js';
import { heatmap } from './heatmap/heatmap.js';
import { image } from './image/image.js';
import { link } from './link/link.js';
import { map } from './map/map.js';
import { hierarchy } from './hierarchy/hierarchy.js';
import { comparison } from './comparison/comparison.js';
import { steps } from './steps/steps.js';
import { lifecycle } from './lifecycle/lifecycle.js';
import { network } from './network/network.js';
import { severity } from './severity/severity.js';
import { calendar } from './calendar/calendar.js';
import { gauge } from './gauge/gauge.js';
import { citation } from './citation/citation.js';
import { currency } from './currency/currency.js';
import { dosage } from './dosage/dosage.js';

// Neue Kirk-Morphs
import { bubble } from './bubble/bubble.js';
import { boxplot } from './boxplot/boxplot.js';
import { treemap } from './treemap/treemap.js';
import { stackedbar } from './stackedbar/stackedbar.js';
import { dotplot } from './dotplot/dotplot.js';
import { sunburst } from './sunburst/sunburst.js';

// Noch neuere Kirk-Morphs (Session 2)
import flow from './flow/flow.js';
import groupedbar from './groupedbar/groupedbar.js';
import scatterplot from './scatterplot/scatterplot.js';
import lollipop from './lollipop/lollipop.js';
import pictogram from './pictogram/pictogram.js';

export const primitives = {
  // Text
  text,
  string: text,  // Alias
  number,
  boolean,
  tag,
  badge,
  
  // Container
  list,
  object,
  range,
  stats,
  
  // Visuell
  bar,
  radar,
  pie,
  rating,
  progress,
  timeline,
  sparkline,
  trend: sparkline,  // Alias
  slopegraph,
  slope: slopegraph,  // Alias
  heatmap,
  matrix: heatmap,  // Alias
  
  // Neue Kirk-Morphs
  bubble,
  bubbles: bubble,  // Alias
  boxplot,
  box: boxplot,  // Alias
  treemap,
  tiles: treemap,  // Alias
  stackedbar,
  stacked: stackedbar,  // Alias
  dotplot,
  scatter: dotplot,  // Alias
  sunburst,
  radial: sunburst,  // Alias
  
  // Noch neuere Kirk-Morphs (Session 2)
  flow,
  stream: flow,  // Alias
  myzel: flow,  // Alias - für biologische Netzwerke
  groupedbar,
  grouped: groupedbar,  // Alias
  multiseries: groupedbar,  // Alias
  scatterplot,
  correlation: scatterplot,  // Alias
  xy: scatterplot,  // Alias
  lollipop,
  lolly: lollipop,  // Alias
  pictogram,
  isotype: pictogram,  // Alias
  icons: pictogram,  // Alias
  
  // Media
  image,
  link,
  
  // Erweiterte Morphs
  map,
  hierarchy,
  tree: hierarchy,  // Alias
  comparison,
  diff: comparison,  // Alias
  steps,
  process: steps,  // Alias
  lifecycle,
  phase: lifecycle,  // Alias
  network,
  graph: network,  // Alias
  severity,
  warning: severity,  // Alias
  calendar,
  season: calendar,  // Alias
  gauge,
  score: gauge,  // Alias
  citation,
  reference: citation,  // Alias
  currency,
  money: currency,  // Alias
  dosage,
  dose: dosage  // Alias
};

export default primitives;

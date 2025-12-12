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

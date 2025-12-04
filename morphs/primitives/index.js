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
export { text } from './text.js';
export { number } from './number.js';
export { boolean } from './boolean.js';
export { tag } from './tag.js';
export { badge } from './badge.js';

// Container-Morphs
export { list } from './list.js';
export { object } from './object.js';
export { range } from './range.js';
export { stats } from './stats.js';

// Visuelle Morphs
export { bar } from './bar.js';
export { radar } from './radar.js';
export { pie } from './pie.js';
export { rating } from './rating.js';
export { progress } from './progress.js';
export { timeline } from './timeline.js';

// Media-Morphs
export { image } from './image.js';
export { link } from './link.js';

// Alle Morphs als Map für dynamischen Zugriff
import { text } from './text.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { tag } from './tag.js';
import { badge } from './badge.js';
import { list } from './list.js';
import { object } from './object.js';
import { range } from './range.js';
import { stats } from './stats.js';
import { bar } from './bar.js';
import { radar } from './radar.js';
import { pie } from './pie.js';
import { rating } from './rating.js';
import { progress } from './progress.js';
import { timeline } from './timeline.js';
import { image } from './image.js';
import { link } from './link.js';

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
  link
};

export default primitives;

import { text } from './text.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { tag } from './tag.js';
import { range } from './range.js';
import { list } from './list.js';
import { object } from './object.js';
import { image } from './image.js';
import { link } from './link.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';
import { header } from './header.js';

// Neue visuelle Morphs
import { pie } from './pie.js';
import { bar } from './bar.js';
import { radar } from './radar.js';
import { rating } from './rating.js';
import { progress } from './progress.js';
import { stats } from './stats.js';
import { timeline } from './timeline.js';
import { badge } from './badge.js';

// Compare-Morphs für Vergleichsansichten
import { 
  compareMorph, 
  compareBar, 
  compareRating, 
  compareTag, 
  compareList, 
  compareImage, 
  compareRadar, 
  comparePie, 
  compareText,
  erstelleFarben 
} from './compare.js';

import { debug } from '../observer/debug.js';

export const morphs = {
  // Basis-Morphs
  text,
  number,
  boolean,
  tag,
  range,
  list,
  object,
  image,
  link,
  
  // Feature-Morphs
  suche,
  perspektiven,
  header,
  
  // Visuelle Morphs (NEU)
  pie,      // Kreisdiagramm für Verteilungen
  bar,      // Balkendiagramm für Vergleiche
  radar,    // Radar-Chart für Profile (3+ Achsen)
  rating,   // Sterne-Bewertung (0-5, 0-10, 0-100)
  progress, // Fortschrittsbalken
  stats,    // Statistik-Karte (min/max/avg)
  timeline, // Zeitliche Abfolge
  badge,    // Farbige Status-Labels
  
  // Compare-Morphs (Vergleich)
  compareMorph,  // Auto-Selektor für Vergleiche
  compareBar,    // Balken-Vergleich
  compareRating, // Rating-Vergleich
  compareTag,    // Tag-Vergleich
  compareList,   // Listen-Vergleich
  compareImage,  // Bild-Vergleich
  compareRadar,  // Radar-Vergleich
  comparePie,    // Pie-Vergleich
  compareText,   // Text-Fallback
  erstelleFarben // Farb-Utility
};

// Log registrierte Morphs
debug.morphs('registry', { verfügbar: Object.keys(morphs) });

export { 
  text, number, boolean, tag, range, list, object, image, link, 
  suche, perspektiven, header,
  pie, bar, radar, rating, progress, stats, timeline, badge,
  compareMorph, compareBar, compareRating, compareTag, compareList, 
  compareImage, compareRadar, comparePie, compareText, erstelleFarben
};

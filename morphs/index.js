// ============================================================================
// PRIMITIVES - Domänenunabhängige Basis-Morphs
// ============================================================================
import { text } from './primitives/text.js';
import { number } from './primitives/number.js';
import { boolean } from './primitives/boolean.js';
import { tag } from './primitives/tag.js';
import { range } from './primitives/range.js';
import { list } from './primitives/list.js';
import { object } from './primitives/object.js';
import { image } from './primitives/image.js';
import { link } from './primitives/link.js';
import { pie } from './primitives/pie.js';
import { bar } from './primitives/bar.js';
import { radar } from './primitives/radar.js';
import { rating } from './primitives/rating.js';
import { progress } from './primitives/progress.js';
import { stats } from './primitives/stats.js';
import { timeline } from './primitives/timeline.js';
import { badge } from './primitives/badge.js';

// ============================================================================
// FEATURE-MORPHS - Systemweite Features
// ============================================================================
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';
import { header } from './header.js';

// ============================================================================
// COMPARE - Generische Compare-Wrapper
// ============================================================================
import { 
  compareByType,
  compareBar as compareBarMorph, 
  compareRating, 
  compareTag as compareTagMorph, 
  compareList as compareListMorph, 
  compareImage, 
  compareRadar as compareRadarMorph, 
  comparePie as comparePieMorph, 
  compareText as compareTextMorph
} from './compare/morphs.js';
import { erstelleFarben, detectType, createSection, createHeader } from './compare/base.js';

// Legacy-Alias für compareMorph (wird von vergleich/index.js genutzt)
const compareMorph = (feldName, typ, items, config) => {
  // Container mit Feldname als Header
  const container = document.createElement('div');
  container.className = 'compare-section';
  
  const header = document.createElement('h3');
  header.className = 'compare-section-header';
  header.textContent = config?.label || feldName;
  container.appendChild(header);
  
  const content = compareByType(typ, items.map(i => ({
    id: i.pilzId,
    name: i.pilzName,
    wert: i.wert,
    farbe: i.farbe
  })), config);
  
  container.appendChild(content);
  return container;
};

// Aliase für Abwärtskompatibilität
const compareBar = compareBarMorph;
const compareTag = compareTagMorph;
const compareList = compareListMorph;
const compareRadar = compareRadarMorph;
const comparePie = comparePieMorph;
const compareText = compareTextMorph;

import { debug } from '../observer/debug.js';

// ============================================================================
// REGISTRY - Alle verfügbaren Morphs
// ============================================================================
export const morphs = {
  // Basis-Morphs (Primitives)
  text,
  string: text,  // Alias: Schema nutzt 'string', Morph heißt 'text'
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
  
  // Visuelle Morphs
  pie,      // Kreisdiagramm für Verteilungen
  bar,      // Balkendiagramm für Vergleiche
  radar,    // Radar-Chart für Profile (3+ Achsen)
  rating,   // Sterne-Bewertung (0-5, 0-10, 0-100)
  progress, // Fortschrittsbalken
  stats,    // Statistik-Karte (min/max/avg)
  timeline, // Zeitliche Abfolge
  badge,    // Farbige Status-Labels
  
  // Compare-Morphs (Vergleich) - Legacy-Aliase
  compareMorph,
  compareBar,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  erstelleFarben,
  
  // Neue Compare-Utilities
  compareByType,
  detectType,
  createSection,
  createHeader
};

// Log registrierte Morphs
debug.morphs('registry', { 
  primitives: ['text', 'number', 'boolean', 'tag', 'range', 'list', 'object', 'image', 'link', 'pie', 'bar', 'radar', 'rating', 'progress', 'stats', 'timeline', 'badge'],
  features: ['suche', 'perspektiven', 'header'],
  compare: ['compareMorph', 'compareBar', 'compareRating', 'compareTag', 'compareList', 'compareImage', 'compareRadar', 'comparePie', 'compareText']
});

// ============================================================================
// EXPORTS
// ============================================================================
export { 
  // Primitives
  text, number, boolean, tag, range, list, object, image, link, 
  pie, bar, radar, rating, progress, stats, timeline, badge,
  
  // Features
  suche, perspektiven, header,
  
  // Compare Morphs
  compareMorph, compareBar, compareRating, compareTag, compareList, 
  compareImage, compareRadar, comparePie, compareText,
  
  // Compare Utilities
  erstelleFarben, detectType, createSection, createHeader, compareByType
};

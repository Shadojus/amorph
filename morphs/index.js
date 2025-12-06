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
// COMPARE - Generische Compare-Wrapper (aus primitives/)
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
  compareText as compareTextMorph,
  compareTimeline as compareTimelineMorph,
  compareRange as compareRangeMorph,
  compareProgress as compareProgressMorph,
  compareStats as compareStatsMorph,
  compareBoolean as compareBooleanMorph,
  compareObject as compareObjectMorph
} from './compare/primitives/index.js';
import { erstelleFarben, detectType, createSection, createHeader, setAktivePerspektivenFarben } from './compare/base.js';

// Smart Composites - Intelligente Morph-Kombinationen
import { 
  smartCompare, 
  diffCompare, 
  analyzeItems, 
  findRelatedFields 
} from './compare/composites.js';

// compareByData aus compare/index.js
import { compareByData } from './compare/index.js';

// Legacy-Alias für compareMorph (wird von vergleich/index.js genutzt)
const compareMorph = (feldName, typ, items, config) => {
  // Container mit Feldname als Header + Abwahl-Button
  const container = document.createElement('div');
  container.className = 'compare-section';
  container.dataset.feldName = feldName;
  
  const header = document.createElement('div');
  header.className = 'compare-section-header';
  
  // Label
  const label = document.createElement('span');
  label.className = 'compare-section-label';
  label.textContent = config?.label || feldName;
  header.appendChild(label);
  
  // Abwahl-Button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'compare-section-remove';
  removeBtn.type = 'button';
  removeBtn.title = `${config?.label || feldName} abwählen`;
  removeBtn.innerHTML = '×';
  removeBtn.dataset.feldName = feldName;
  header.appendChild(removeBtn);
  
  container.appendChild(header);
  
  // Items werden direkt durchgereicht - vergleich/index.js baut sie korrekt
  // mit: {id, name, wert, farbe, textFarbe, farbKlasse, lineFarbe, bgFarbe, glowFarbe}
  const content = compareByType(typ, items, config);
  
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
const compareTimeline = compareTimelineMorph;
const compareRange = compareRangeMorph;
const compareProgress = compareProgressMorph;
const compareStats = compareStatsMorph;
const compareBoolean = compareBooleanMorph;
const compareObject = compareObjectMorph;

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
  
  // Compare-Morphs (Vergleich) - Alle Typen
  compareMorph,
  compareBar,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareRange,
  compareProgress,
  compareBoolean,
  compareStats,
  compareObject,
  
  // Compare-Composites (Intelligente Kombinations-Morphs)
  smartCompare,
  diffCompare,
  
  // Compare-Utilities
  erstelleFarben,
  setAktivePerspektivenFarben,
  compareByType,
  compareByData,
  detectType,
  createSection,
  createHeader
};

// Log registrierte Morphs
debug.morphs('registry', { 
  primitives: ['text', 'number', 'boolean', 'tag', 'range', 'list', 'object', 'image', 'link', 'pie', 'bar', 'radar', 'rating', 'progress', 'stats', 'timeline', 'badge'],
  features: ['suche', 'perspektiven', 'header'],
  compare: ['compareMorph', 'compareBar', 'compareRating', 'compareTag', 'compareList', 'compareImage', 'compareRadar', 'comparePie', 'compareText', 'compareTimeline', 'compareRange', 'compareProgress', 'compareBoolean', 'compareStats', 'compareObject'],
  composites: ['smartCompare', 'diffCompare']
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
  
  // Compare Morphs - Alle
  compareMorph, compareBar, compareRating, compareTag, compareList, 
  compareImage, compareRadar, comparePie, compareText, compareTimeline,
  compareRange, compareProgress, compareBoolean, compareStats, compareObject,
  
  // Composites
  smartCompare, diffCompare,
  
  // Compare Utilities
  erstelleFarben, setAktivePerspektivenFarben, detectType, createSection, createHeader, compareByType, compareByData
};

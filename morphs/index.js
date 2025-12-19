// ============================================================================
// PRIMITIVES - Domänenunabhängige Basis-Morphs
// ============================================================================
import { text } from './primitives/text/text.js';
import { number } from './primitives/number/number.js';
import { boolean } from './primitives/boolean/boolean.js';
import { tag } from './primitives/tag/tag.js';
import { range } from './primitives/range/range.js';
import { list } from './primitives/list/list.js';
import { object } from './primitives/object/object.js';
import { image } from './primitives/image/image.js';
import { link } from './primitives/link/link.js';
import { pie } from './primitives/pie/pie.js';
import { bar } from './primitives/bar/bar.js';
import { radar } from './primitives/radar/radar.js';
import { progress } from './primitives/progress/progress.js';
import { stats } from './primitives/stats/stats.js';
import { timeline } from './primitives/timeline/timeline.js';
import { badge } from './primitives/badge/badge.js';
import { lifecycle } from './primitives/lifecycle/lifecycle.js';

// Erweiterte Morphs - Charts & Visualisierungen
import { sparkline } from './primitives/sparkline/sparkline.js';
import { slopegraph } from './primitives/slopegraph/slopegraph.js';
import { heatmap } from './primitives/heatmap/heatmap.js';
import { gauge } from './primitives/gauge/gauge.js';

// Neue Kirk-Morphs (Session 1)
import { bubble } from './primitives/bubble/bubble.js';
import { boxplot } from './primitives/boxplot/boxplot.js';
import { treemap } from './primitives/treemap/treemap.js';
import { stackedbar } from './primitives/stackedbar/stackedbar.js';
import { dotplot } from './primitives/dotplot/dotplot.js';
import { sunburst } from './primitives/sunburst/sunburst.js';

// Neue Kirk-Morphs (Session 2)
import flow from './primitives/flow/flow.js';
import groupedbar from './primitives/groupedbar/groupedbar.js';
import scatterplot from './primitives/scatterplot/scatterplot.js';
import lollipop from './primitives/lollipop/lollipop.js';
import pictogram from './primitives/pictogram/pictogram.js';

// Erweiterte Morphs - Spezial-Darstellungen
import { dosage } from './primitives/dosage/dosage.js';
import { currency } from './primitives/currency/currency.js';
import { citation } from './primitives/citation/citation.js';
import { calendar } from './primitives/calendar/calendar.js';
import { steps } from './primitives/steps/steps.js';
import { map } from './primitives/map/map.js';
import { hierarchy } from './primitives/hierarchy/hierarchy.js';
import { network } from './primitives/network/network.js';
import { comparison } from './primitives/comparison/comparison.js';
import { severity } from './primitives/severity/severity.js';

// ============================================================================
// FEATURE-MORPHS - Systemweite Features
// ============================================================================
import { suche } from '../config/suche.js';
import { perspektiven } from '../config/perspektiven.js';
import { header } from '../config/header.js';

// ============================================================================
// COMPARE - Generische Compare-Wrapper (aus primitives/)
// ============================================================================
import { 
  compareByType,
  compareBar as compareBarMorph, 
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
  pie,        // Kreisdiagramm für Verteilungen
  bar,        // Balkendiagramm für Vergleiche
  radar,      // Radar-Chart für Profile (3+ Achsen)
  progress,   // Fortschrittsbalken
  stats,      // statistics-Karte (min/max/avg)
  timeline,   // Zeitliche Abfolge
  badge,      // Farbige Status-Labels
  lifecycle,  // Lebenszyklen / Phasen
  
  // Erweiterte Chart-Morphs
  sparkline,  // Mini-Trend-Linie
  slopegraph, // Vorher/Nachher-Vergleich
  heatmap,    // Farbcodierte Matrix
  gauge,      // Tachometer-Anzeige
  
  // Neue Kirk-Morphs (Session 1)
  bubble,     // Proportionale Kreise
  boxplot,    // Box-and-Whisker
  treemap,    // Flächen-Tiles
  stackedbar, // Gestapelte Balken
  dotplot,    // Kategorie-Scatter
  sunburst,   // Radiale Hierarchie
  
  // Neue Kirk-Morphs (Session 2)
  flow,       // Organische Ströme
  groupedbar, // Gruppierte Balken
  scatterplot,// X/Y-Korrelation
  lollipop,   // Elegante Balken
  pictogram,  // Icon-Wiederholung
  
  // Spezial-Morphs
  dosage,     // Dosierungsanzeige
  currency,   // Währungsformatierung
  citation,   // Quellenangaben
  calendar,   // Kalender/Datum-Darstellung
  steps,      // Schrittfolgen
  map,        // Geo-Karte
  hierarchy,  // Baumstruktur
  network,    // Netzwerk-Graph
  comparison, // Vergleichsdarstellung
  severity,   // Schweregrad-Anzeige
  
  // Compare-Morphs (Vergleich) - Alle Typen
  compareMorph,
  compareBar,
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
  primitives: ['text', 'number', 'boolean', 'tag', 'range', 'list', 'object', 'image', 'link', 'pie', 'bar', 'radar', 'progress', 'stats', 'timeline', 'badge', 'lifecycle'],
  extended: ['sparkline', 'slopegraph', 'heatmap', 'gauge', 'dosage', 'currency', 'citation', 'calendar', 'steps', 'map', 'hierarchy', 'network', 'comparison', 'severity'],
  kirkMorphs: ['bubble', 'boxplot', 'treemap', 'stackedbar', 'dotplot', 'sunburst', 'flow', 'groupedbar', 'scatterplot', 'lollipop', 'pictogram'],
  features: ['suche', 'perspektiven', 'header'],
  compare: ['compareMorph', 'compareBar', 'compareTag', 'compareList', 'compareImage', 'compareRadar', 'comparePie', 'compareText', 'compareTimeline', 'compareRange', 'compareProgress', 'compareBoolean', 'compareStats', 'compareObject'],
  composites: ['smartCompare', 'diffCompare']
});

// ============================================================================
// EXPORTS
// ============================================================================
export { 
  // Primitives
  text, number, boolean, tag, range, list, object, image, link, 
  pie, bar, radar, progress, stats, timeline, badge, lifecycle,
  
  // Extended Charts & Visualizations
  sparkline, slopegraph, heatmap, gauge,
  
  // Neue Kirk-Morphs
  bubble, boxplot, treemap, stackedbar, dotplot, sunburst,
  flow, groupedbar, scatterplot, lollipop, pictogram,
  
  // Special Morphs
  dosage, currency, citation, calendar, steps, map, hierarchy, network, comparison, severity,
  
  // Features
  suche, perspektiven, header,
  
  // Compare Morphs - Alle
  compareMorph, compareBar, compareTag, compareList, 
  compareImage, compareRadar, comparePie, compareText, compareTimeline,
  compareRange, compareProgress, compareBoolean, compareStats, compareObject,
  
  // Composites
  smartCompare, diffCompare,
  
  // Compare Utilities
  erstelleFarben, setAktivePerspektivenFarben, detectType, createSection, createHeader, compareByType, compareByData
};

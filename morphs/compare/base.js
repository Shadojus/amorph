/**
 * COMPARE BASE - Utilities for Compare-Morphs
 * 
 * Common functions for all Compare-Morphs:
 * - Color assignment for items
 * - Section/Container creation
 * - Type detection (config-driven from morphs.yaml)
 * - Item name extraction with robust fallbacks
 * 
 * DATA-DRIVEN: Keywords and rules come from config/morphs.yaml!
 */

import { debug } from '../../observer/debug.js';

// Colors config is set externally (from morphs.yaml)
let colorsConfig = null;

// Detection config is set externally (from morphs.yaml)
let detectionConfig = null;

// Item Colors: Only RGB for distance calculation
// Actual colors come from pilz-farben.css via CSS classes
// OVER THE TOP NEON - maximum saturation!
const FALLBACK_COLORS = [
  { index: 0, name: 'Electric Cyan', rgb: [0, 255, 255] },
  { index: 1, name: 'Electric Magenta', rgb: [255, 0, 255] },
  { index: 2, name: 'Radioactive Green', rgb: [0, 255, 0] },
  { index: 3, name: 'Hot Pink', rgb: [255, 0, 150] },
  { index: 4, name: 'Laser Yellow', rgb: [255, 255, 0] },
  { index: 5, name: 'Blazing Orange', rgb: [255, 100, 0] },
  { index: 6, name: 'Electric Blue', rgb: [0, 150, 255] },
  { index: 7, name: 'Ultraviolet', rgb: [180, 0, 255] },
  { index: 8, name: 'Nuclear Red', rgb: [255, 0, 50] },
  { index: 9, name: 'Toxic Lime', rgb: [190, 255, 0] },
  { index: 10, name: 'Plasma Aqua', rgb: [0, 255, 180] },
  { index: 11, name: 'Lava Coral', rgb: [255, 50, 100] }
];

// Cache for active perspective colors
let activePerspectiveColors = [];

/**
 * Gets the display name for an item with robust fallbacks
 * Handles undefined, null, and empty string cases
 * @param {Object} item - The item object with name/id properties
 * @param {number} index - Fallback index
 * @returns {string} Display name
 */
export function getItemDisplayName(item, index = 0) {
  const name = item?.name;
  const id = item?.id;
  
  // Check if name is valid (not undefined, not 'undefined' string, not empty)
  if (name && name !== 'undefined' && String(name).trim() !== '') {
    return String(name);
  }
  
  // Check if id is valid
  if (id && id !== 'undefined' && String(id).trim() !== '') {
    return String(id);
  }
  
  // Fallback to index
  return `#${index + 1}`;
}

/**
 * Calculates the color distance between two RGB values
 * Uses euclidean distance in RGB space
 */
function colorDistance(rgb1, rgb2) {
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Extracts RGB values from an rgba() string
 */
function parseRgba(rgbaString) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

/**
 * Sets the active perspective colors (called by compare feature)
 * @param {string[]} colors - Array of rgba() color strings
 */
export function setActivePerspectiveColors(colors) {
  activePerspectiveColors = colors
    .map(f => parseRgba(f))
    .filter(Boolean);
  
  debug.morphs('Active perspective colors set', { 
    count: activePerspectiveColors.length,
    colors: activePerspectiveColors 
  });
}

// Legacy alias for backwards compatibility
export const setAktivePerspektivenFarben = setActivePerspectiveColors;

/**
 * Filters colors that are too similar to active perspectives
 * @param {Array} palette - Array of color objects {name, rgb, color}
 * @param {number} threshold - Minimum distance (0-255)
 */
function filterColors(palette, threshold = 80) {
  if (activePerspectiveColors.length === 0) {
    return palette;
  }
  
  const filtered = palette.filter(color => {
    // Check distance to each active perspective color
    for (const perspColor of activePerspectiveColors) {
      const distance = colorDistance(color.rgb, perspColor);
      if (distance < threshold) {
        debug.morphs(`Color ${color.name} too similar to perspective`, { distance, threshold });
        return false;
      }
    }
    return true;
  });
  
  debug.morphs('Colors filtered', { 
    original: palette.length, 
    filtered: filtered.length,
    activePerspectives: activePerspectiveColors.length 
  });
  
  // If too few colors left, take those with greatest distance (minimum 6)
  if (filtered.length < 2) {
    const withDistance = palette.map(color => {
      const minDistance = Math.min(...activePerspectiveColors.map(pc => colorDistance(color.rgb, pc)));
      return { ...color, distance: minDistance };
    });
    withDistance.sort((a, b) => b.distance - a.distance);
    return withDistance.slice(0, Math.min(6, palette.length));
  }
  
  return filtered;
}

/**
 * Sets the colors configuration (from morphs.yaml)
 */
export function setColorsConfig(config) {
  colorsConfig = config?.colors || config?.farben || null;
  debug.morphs('Compare colors config loaded', { 
    items: colorsConfig?.items?.length || 0,
    diagrams: colorsConfig?.diagrams?.length || colorsConfig?.diagramme?.length || 0
  });
}

// Legacy alias for backwards compatibility
export const setFarbenConfig = setColorsConfig;

/**
 * Sets the detection configuration (from morphs.yaml)
 * IMPORTANT: Makes detectType config-driven instead of hardcoded!
 */
export function setDetectionConfig(config) {
  detectionConfig = config?.detection || config?.erkennung || null;
  debug.morphs('Compare detection config loaded', { 
    hasBadge: !!detectionConfig?.badge,
    keywords: detectionConfig?.badge?.keywords?.length || 0
  });
}

// Legacy alias for backwards compatibility
export const setErkennungConfig = setDetectionConfig;

/**
 * Gets the configured colors
 * @param {string} type - 'items' or 'diagrams'
 * @returns {Array} Array of color objects or strings
 */
export function getColors(type = 'items') {
  const configColors = colorsConfig?.[type] || colorsConfig?.fungi;
  
  // If config available and array of objects with rgb
  if (Array.isArray(configColors) && configColors[0]?.rgb) {
    return configColors;
  }
  
  return FALLBACK_COLORS;
}

// Legacy alias for backwards compatibility
export const getFarben = getColors;

/**
 * Creates color assignment for items
 * Automatically filters colors that are too similar to active perspectives
 * @param {Array} itemIds - Array of item IDs
 * @returns {Map} ID → {colorIndex: number, colorClass: string, fill: rgba, text: rgba, line: rgba}
 */
export function createColors(itemIds) {
  const colors = new Map();
  
  // Get palette and filter by active perspectives
  const fullPalette = getColors('items');
  const threshold = colorsConfig?.similarity_threshold || colorsConfig?.aehnlichkeit_schwellenwert || 80;
  const filtered = filterColors(fullPalette, threshold);
  
  debug.morphs('createColors', { 
    items: itemIds.length, 
    paletteFull: fullPalette.length,
    paletteFiltered: filtered.length,
    activePerspectives: activePerspectiveColors.length
  });
  
  itemIds.forEach((id, i) => {
    const normalizedId = String(id);
    const paletteIndex = i % filtered.length;
    const colorObj = filtered[paletteIndex];
    
    // Use original index from palette for CSS class
    // If no index available, use palette index
    const colorIndex = colorObj?.index ?? paletteIndex;
    const colorClass = `pilz-farbe-${colorIndex}`;
    
    // Generate from RGB if available
    // BUGFIX: RGB could be string from YAML parser!
    let rgb = colorObj?.rgb;
    let r, g, b;
    
    if (Array.isArray(rgb)) {
      [r, g, b] = rgb;
    } else if (typeof rgb === 'string') {
      // YAML parsed it as string, e.g. "[0, 255, 255]"
      const match = rgb.match(/\[?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]?/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      } else {
        r = g = b = 100;
      }
    } else {
      r = g = b = 100;
    }
    
    colors.set(normalizedId, {
      colorIndex,
      colorClass,
      // Legacy aliases for backwards compatibility
      farbIndex: colorIndex,
      farbKlasse: colorClass,
      rgb: `${r}, ${g}, ${b}`,
      fill: `rgba(${r}, ${g}, ${b}, 0.65)`,
      text: `rgba(${r}, ${g}, ${b}, 0.95)`,
      line: `rgba(${r}, ${g}, ${b}, 0.80)`,
      bg: `rgba(${r}, ${g}, ${b}, 0.20)`,
      glow: `rgba(${r}, ${g}, ${b}, 0.60)`
    });
  });
  
  return colors;
}

// Legacy alias for backwards compatibility
export const erstelleFarben = createColors;

/**
 * Creates a section container with optional deselect button
 * @param {string} label - Heading
 * @param {string} color - Accent color (optional)
 * @param {string} fieldName - Field name for deselect functionality (optional)
 */
export function createSection(label, color = null, fieldName = null) {
  const section = document.createElement('div');
  section.className = 'compare-section';
  
  if (color) {
    section.style.setProperty('--section-color', color);
  }
  
  // Field name as data attribute for later reference
  if (fieldName) {
    section.dataset.fieldName = fieldName;
  }
  
  const header = document.createElement('div');
  header.className = 'compare-section-header';
  
  // Label text
  const labelSpan = document.createElement('span');
  labelSpan.className = 'compare-section-label';
  labelSpan.textContent = label;
  header.appendChild(labelSpan);
  
  // Deselect button (only if fieldName provided)
  if (fieldName) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'compare-section-remove';
    removeBtn.type = 'button';
    removeBtn.title = `Deselect ${label}`;
    removeBtn.innerHTML = '×';
    removeBtn.dataset.fieldName = fieldName;
    header.appendChild(removeBtn);
  }
  
  section.appendChild(header);

  const content = document.createElement('div');
  content.className = 'compare-section-content';
  section.appendChild(content);

  // Helper um Content hinzuzufügen
  section.addContent = (el) => content.appendChild(el);

  return section;
}

/**
 * Creates section only if field hasn't been rendered yet (deduplication)
 * 
 * @param {string} fieldName - Unique field name for deduplication
 * @param {string} label - Section heading
 * @param {string} color - Accent color (optional)
 * @param {Set} skipFields - Set of already rendered field names
 * @returns {Object|null} Section or null if already rendered
 */
export function createSectionIfNew(fieldName, label, color = null, skipFields = null) {
  // If skipFields exists and field already rendered → null
  if (skipFields && skipFields.has(fieldName)) {
    debug.morphs('Section skipped (already rendered)', { fieldName });
    return null;
  }
  
  // Mark field as rendered
  if (skipFields) {
    skipFields.add(fieldName);
  }
  
  // Create normal section WITH fieldName for deselect button
  return createSection(label, color, fieldName);
}

/**
 * Creates a perspective header
 */
export function createHeader(config) {
  const { symbol, title, count, colors, farben } = config;
  
  const header = document.createElement('div');
  header.className = 'compare-perspective-header';
  
  const colorArray = colors || farben;
  if (colorArray?.[0]) {
    header.style.setProperty('--p-color', colorArray[0]);
  }
  
  header.innerHTML = `
    <span class="compare-symbol">${symbol || ''}</span>
    <span class="compare-title">${title || ''}</span>
    <span class="compare-count">${count || 0} Items</span>
  `;
  
  return header;
}

/**
 * Creates legend for items
 */
export function createLegend(items) {
  const legend = document.createElement('div');
  legend.className = 'compare-legende';
  
  items.forEach(item => {
    const el = document.createElement('span');
    el.className = 'compare-legende-item';
    
    // Use inline styles for colors
    const dotColor = item.farbe || item.fill || '';
    const textColor = item.textFarbe || item.text || '';
    
    el.innerHTML = `
      <span class="legende-dot" style="background:${dotColor}"></span>
      <span class="legende-name" style="color:${textColor}">${item.name}</span>
    `;
    legend.appendChild(el);
  });

  return legend;
}

// Legacy alias for backwards compatibility
export const createLegende = createLegend;

// =============================================================================
// TYPE DETECTION - 100% CONFIG-DRIVEN (from morphs.yaml)
// =============================================================================

/**
 * Helper: Ensures we have an array
 * (YAML parser can sometimes return string instead of array)
 */
function ensureArray(val, fallback) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim());
  return fallback;
}

/**
 * DATA-DRIVEN: Detects the type from the data structure
 * 
 * IMPORTANT: Uses detectionConfig from morphs.yaml!
 * No hardcoded keywords anymore.
 */
export function detectType(value) {
  if (value === null || value === undefined) return 'empty';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return detectNumberType(value);
  if (typeof value === 'string') return detectStringType(value);
  if (Array.isArray(value)) return detectArrayType(value);
  if (typeof value === 'object') return detectObjectType(value);
  return 'text';
}

/**
 * Detects the best morph for numbers
 * Mirrors core/pipeline.js detectNumberType for consistency
 */
function detectNumberType(value) {
  const cfg = detectionConfig || {};
  
  // Progress: 0-100 integers - Kirk: Progress bars
  const progress = cfg.progress || { min: 0, max: 100, integersOnly: true };
  if (value >= progress.min && value <= progress.max && (!progress.integersOnly || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

/**
 * Detects the best morph for strings
 * Mirrors core/pipeline.js detectStringType for consistency
 */
function detectStringType(value) {
  // Ensure value is a string
  if (typeof value !== 'string') {
    return 'text';
  }
  const lower = value.toLowerCase().trim();
  const cfg = detectionConfig?.badge || {};
  
  /* ─── LINK: URL patterns ─── */
  if (/^https?:\/\/|^www\./i.test(value)) {
    return 'link';
  }
  
  /* ─── IMAGE: Image file paths ─── */
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(value)) {
    return 'image';
  }
  
  /* ─── BADGE: Status keywords (short + semantically meaningful) ─── */
  const keywords = cfg.keywords || [
    // Availability
    'active', 'inactive', 'yes', 'no', 'online', 'offline',
    'open', 'closed', 'available', 'unavailable', 'enabled', 'disabled',
    // Edibility (Kirk: semantic colors!)
    'edible', 'toxic', 'deadly', 'poisonous', 'choice', 'caution',
    'essbar', 'giftig', 'tödlich', 'bedingt',
    // Quality/Status
    'good', 'bad', 'excellent', 'poor', 'warning', 'danger', 'safe',
    'pending', 'approved', 'rejected', 'complete', 'incomplete',
    // Categories
    'high', 'medium', 'low', 'critical', 'normal', 'none'
  ];
  const maxLength = cfg.maxLength || 25;
  
  if (value.length <= maxLength && keywords.some(kw => typeof kw === 'string' && lower.includes(kw.toLowerCase()))) {
    return 'badge';
  }
  
  /* ─── TAG: Short strings without status meaning ─── */
  if (value.length <= 20 && !value.includes(' ') || value.length <= 15) {
    return 'tag';
  }
  
  return 'text';
}

/**
 * Detects the best morph for arrays
 * Mirrors core/pipeline.js detectArrayType for consistency
 */
function detectArrayType(value) {
  if (value.length === 0) return 'list';
  
  const first = value[0];
  const cfg = detectionConfig?.array || {};
  
  // String arrays → List
  if (typeof first === 'string') return 'list';
  
  // Object arrays: analyze structure
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    /* ─── FLOW: from/to connections ─── */
    const flowFromKeys = ['from', 'von', 'source', 'quelle'];
    const flowToKeys = ['to', 'nach', 'target', 'ziel'];
    const hasFlowFrom = flowFromKeys.some(k => k in first);
    const hasFlowTo = flowToKeys.some(k => k in first);
    if (hasFlowFrom && hasFlowTo) {
      return 'flow';
    }
    
    /* ─── PICTOGRAM: icon + count ─── */
    const pictogramIconKeys = ['icon', 'symbol', 'emoji'];
    const pictogramCountKeys = ['count', 'anzahl'];
    const hasIcon = pictogramIconKeys.some(k => k in first);
    const hasPictogramCount = pictogramCountKeys.some(k => k in first && typeof first[k] === 'number');
    if (hasIcon && hasPictogramCount) {
      return 'pictogram';
    }
    
    /* ─── SCATTERPLOT: x/y coordinates ─── */
    const hasExplicitXY = ('x' in first && 'y' in first && 
                          typeof first.x === 'number' && typeof first.y === 'number');
    if (hasExplicitXY) {
      return 'scatterplot';
    }
    
    /* ─── GROUPEDBAR: category + multiple numeric series ─── */
    const categoryKeys = ['kategorie', 'category', 'jahr', 'year'];
    const hasGroupedCategory = categoryKeys.some(k => k in first);
    const genericValueKeys = ['value', 'wert', 'count', 'anzahl', 'amount', 'menge', 'score', 'x', 'y', 'id', 'index'];
    const seriesKeys = keys.filter(k => 
      typeof first[k] === 'number' && 
      !categoryKeys.includes(k) && 
      !genericValueKeys.includes(k)
    );
    if (hasGroupedCategory && seriesKeys.length >= 2) {
      return 'groupedbar';
    }
    
    /* ─── LOLLIPOP: rank/position or diverging values ─── */
    const lollipopRankKeys = ['rank', 'ranking', 'position', 'platz'];
    const hasRankingHint = lollipopRankKeys.some(k => k in first);
    if (hasRankingHint) {
      return 'lollipop';
    }
    const lollipopValueKeys = ['gap', 'abweichung', 'difference', 'differenz', 'delta'];
    const hasLollipopValue = lollipopValueKeys.some(k => k in first && typeof first[k] === 'number');
    if (hasLollipopValue) {
      const hasDivergingData = value.some(v => {
        const val = lollipopValueKeys.reduce((acc, k) => acc ?? v[k], null);
        return typeof val === 'number' && val < 0;
      });
      if (hasDivergingData) return 'lollipop';
    }
    
    /* ─── BOXPLOT: statistical distribution (min, q1, median, q3, max) ─── */
    const boxplotKeys = ['min', 'q1', 'median', 'q3', 'max', 'quartile1', 'quartile3', 'iqr'];
    const boxplotMatches = boxplotKeys.filter(k => k in first).length;
    if (boxplotMatches >= 3) {
      return 'boxplot';
    }
    
    /* ─── BUBBLE: size/radius + label (no children) ─── */
    const bubbleSizeKeys = ['size', 'radius', 'r', 'groesse', 'magnitude', 'area'];
    const bubbleLabelKeys = ['label', 'name', 'bezeichnung', 'titel'];
    const hasBubbleSize = bubbleSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasBubbleLabel = bubbleLabelKeys.some(k => k in first);
    const hasBubbleChildren = 'children' in first && Array.isArray(first.children);
    if (hasBubbleSize && hasBubbleLabel && !hasBubbleChildren) {
      return 'bubble';
    }
    
    /* ─── SUNBURST: children + value (no change) ─── */
    const hasSunburstChildren = 'children' in first && Array.isArray(first.children);
    const hasSunburstValue = ('value' in first || 'size' in first || 'wert' in first) && 
                             typeof (first.value ?? first.size ?? first.wert) === 'number';
    const hasSunburstChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    if (hasSunburstChildren && hasSunburstValue && !hasSunburstChange) {
      return 'sunburst';
    }
    
    /* ─── TREEMAP: children or size+change ─── */
    const hasTreemapChildren = 'children' in first && Array.isArray(first.children);
    if (hasTreemapChildren) {
      return 'treemap';
    }
    const treemapSizeKeys = ['size', 'value', 'wert', 'area', 'flaeche'];
    const hasTreemapSize = treemapSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasTreemapChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    if (hasTreemapSize && hasTreemapChange && value.length >= 3) {
      return 'treemap';
    }
    
    /* ─── STACKEDBAR: segments array or percentage values ─── */
    const stackedSegmentKeys = ['segments', 'teile', 'parts', 'anteile', 'slices'];
    const hasStackedSegments = stackedSegmentKeys.some(k => k in first && Array.isArray(first[k]));
    if (hasStackedSegments) {
      return 'stackedbar';
    }
    const percentKeys = keys.filter(k => {
      const val = first[k];
      return typeof val === 'number' && val >= 0 && val <= 100;
    });
    const percentSum = percentKeys.reduce((sum, k) => sum + first[k], 0);
    const looksLikePercents = percentKeys.length >= 2 && percentSum >= 95 && percentSum <= 105;
    const hasStackedCategory = ('kategorie' in first || 'category' in first || 'label' in first || 'name' in first);
    if (looksLikePercents && hasStackedCategory && percentKeys.length >= 3) {
      return 'stackedbar';
    }
    
    /* ─── DOTPLOT: category + value (scatter per category) ─── */
    const dotplotCategoryKeys = ['category', 'kategorie', 'label', 'gruppe', 'group'];
    const dotplotValueKeys = ['value', 'wert', 'x', 'point', 'punkte', 'points', 'values', 'dots'];
    const hasDotplotCategory = dotplotCategoryKeys.some(k => k in first);
    const hasDotplotValue = dotplotValueKeys.some(k => k in first);
    // Dotplot: category + value (simple structure, different from scatterplot x/y)
    if (hasDotplotCategory && hasDotplotValue && !('y' in first)) {
      return 'dotplot';
    }
    
    /* ─── SLOPEGRAPH: before/after comparison ─── */
    const slopeKeys = ['vorher', 'nachher', 'before', 'after', 'start', 'end', 'v1', 'v2', 'alt', 'neu'];
    const hasSlopeStructure = slopeKeys.filter(k => k in first).length >= 2;
    const hasSlopeName = 'name' in first || 'label' in first;
    if (hasSlopeStructure && hasSlopeName) {
      return 'slopegraph';
    }
    
    /* ─── LIFECYCLE: phase/stage ─── */
    const lifecycleKeys = ['phase', 'stage', 'stadium', 'schritt', 'stufe'];
    if (lifecycleKeys.some(k => k in first)) {
      return 'lifecycle';
    }
    
    /* ─── STEPS: step/order + action/text ─── */
    const stepsKeys = ['step', 'order', 'nummer', 'reihenfolge'];
    if (stepsKeys.some(k => k in first) && ('action' in first || 'beschreibung' in first || 'text' in first || 'label' in first)) {
      return 'steps';
    }
    
    /* ─── CALENDAR: month + active ─── */
    const calendarKeys = ['month', 'monat', 'saison', 'season'];
    if (calendarKeys.some(k => k in first) && ('active' in first || 'aktiv' in first || 'available' in first)) {
      return 'calendar';
    }
    
    /* ─── TIMELINE: date/time + event ─── */
    const timelineCfg = cfg.timeline || {};
    const timelineKeys = ensureArray(timelineCfg.requiredKeys || timelineCfg.benoetigtKeys, ['date', 'time', 'datum', 'zeit', 'period', 'year', 'jahr']);
    if (timelineKeys.some(k => k in first) && ('event' in first || 'ereignis' in first || 'description' in first || 'label' in first)) {
      return 'timeline';
    }
    
    /* ─── RADAR: axis + value (min 3 items) ─── */
    const radarCfg = cfg.radar || {};
    const radarKeys = ensureArray(radarCfg.requiredKeys || radarCfg.benoetigtKeys, ['axis', 'achse', 'dimension', 'factor', 'faktor', 'kategorie']);
    const radarValueKeys = ['value', 'wert', 'score', 'rating', 'level'];
    const hasRadarAxis = radarKeys.some(k => k in first);
    const hasRadarValue = radarValueKeys.some(k => k in first);
    if (value.length >= 3 && hasRadarAxis && hasRadarValue) {
      return 'radar';
    }
    
    /* ─── HIERARCHY: level/parent/children ─── */
    const hierarchyKeys = ['level', 'ebene', 'parent', 'children', 'kinder', 'rank', 'taxonomy'];
    if (hierarchyKeys.some(k => k in first)) {
      return 'hierarchy';
    }
    
    /* ─── NETWORK: connections (not flow) ─── */
    const networkConnectionKeys = ['connections', 'relations', 'verbindungen'];
    const networkNameKeys = ['name', 'partner', 'organism'];
    const networkTypeKeys = ['type', 'relationship', 'typ', 'beziehung'];
    const hasFlowPattern = flowFromKeys.some(k => k in first) && flowToKeys.some(k => k in first);
    const hasNetworkConnections = networkConnectionKeys.some(k => k in first && Array.isArray(first[k]));
    const hasNetworkStructure = networkNameKeys.some(k => k in first) && networkTypeKeys.some(k => k in first);
    if (!hasFlowPattern && (hasNetworkConnections || hasNetworkStructure)) {
      return 'network';
    }
    
    /* ─── SEVERITY: severity/risk level + type ─── */
    const severityKeys = ['schwere', 'severity', 'level', 'bedrohung', 'risiko', 'gefahr', 'grade'];
    const severityTypeKeys = ['typ', 'type', 'art', 'kategorie', 'label'];
    const severityStringLevels = ['trivial', 'minor', 'moderate', 'severe', 'critical', 'gering', 'mittel', 'hoch', 'kritisch'];
    const hasSeverityValue = severityKeys.some(k => {
      if (!(k in first)) return false;
      const val = first[k];
      if (typeof val === 'number') return true;
      if (typeof val === 'string' && severityStringLevels.includes(val.toLowerCase())) return true;
      return false;
    });
    const hasSeverityType = severityTypeKeys.some(k => k in first);
    if (hasSeverityValue && hasSeverityType) {
      return 'severity';
    }
    
    /* ─── PIE vs BAR: label/value structures ─── */
    const labelKeys = ['label', 'name', 'kategorie', 'category', 'item', 'typ', 'type', 'method', 'methode'];
    const valueKeys = ['value', 'wert', 'count', 'anzahl', 'amount', 'menge', 'score', 'percent', 'prozent', 'suitability', 'rating'];
    const hasLabel = labelKeys.some(k => k in first);
    const hasValue = valueKeys.some(k => k in first && typeof first[k] === 'number');
    if (hasLabel && hasValue) {
      return value.length <= 6 ? 'pie' : 'bar';
    }
    
    /* ─── BAR: only value (no label) ─── */
    if (hasValue && !hasLabel) {
      return 'bar';
    }
  }
  
  /* ─── SPARKLINE: numeric array (≥3 values) ─── */
  if (value.every(v => typeof v === 'number')) {
    return value.length >= 3 ? 'sparkline' : 'bar';
  }
  
  /* ─── HEATMAP: 2D numeric matrix ─── */
  if (value.every(v => Array.isArray(v) && v.every(n => typeof n === 'number'))) {
    if (value.length >= 2 && value[0].length >= 2) {
      return 'heatmap';
    }
  }
  
  return 'list';
}

/**
 * Detects the best morph for objects
 * Mirrors core/pipeline.js detectObjectType for consistency
 */
function detectObjectType(value) {
  const keys = Object.keys(value);
  const cfg = detectionConfig?.object || detectionConfig?.objekt || {};
  
  /* ─── MAP: Geographic coordinates ─── */
  const mapKeys = ['lat', 'latitude', 'lng', 'longitude', 'lon', 'breitengrad', 'laengengrad'];
  const hasCoordinates = mapKeys.filter(k => k in value).length >= 2;
  if (hasCoordinates) {
    return 'map';
  }
  
  /* ─── CITATION: Source references ─── */
  const citationKeys = ['author', 'autor', 'authors', 'autoren', 'year', 'jahr', 'title', 'titel'];
  const citationMatches = citationKeys.filter(k => k in value).length;
  if (citationMatches >= 2) {
    return 'citation';
  }
  
  /* ─── DOSAGE: Medical dosage ─── */
  const dosageKeys = ['dose', 'dosis', 'dosierung', 'amount', 'menge'];
  const dosageUnitKeys = ['unit', 'einheit', 'frequency', 'frequenz'];
  const hasDosage = dosageKeys.some(k => k in value) && dosageUnitKeys.some(k => k in value);
  if (hasDosage) {
    return 'dosage';
  }
  
  /* ─── CURRENCY: Money values ─── */
  const currencyKeys = ['currency', 'waehrung', 'curr'];
  const amountKeys = ['amount', 'betrag', 'price', 'preis', 'cost', 'kosten'];
  const hasCurrency = currencyKeys.some(k => k in value) && amountKeys.some(k => k in value);
  if (hasCurrency) {
    return 'currency';
  }
  
  /* ─── GAUGE: Score with zones/ranges ─── */
  const hasGaugeValue = ('value' in value || 'wert' in value || 'score' in value);
  const hasGaugeZones = ('zones' in value || 'zonen' in value || 'bereiche' in value);
  const hasGaugeMinMax = ('min' in value && 'max' in value);
  if (hasGaugeValue && (hasGaugeZones || hasGaugeMinMax)) {
    if (hasGaugeZones || (!('avg' in value) && !('mean' in value) && !('median' in value))) {
      return 'gauge';
    }
  }
  
  /* ─── COMPARISON: Before/after with numbers ─── */
  const comparisonKeys = ['vorher', 'nachher', 'before', 'after', 'from', 'to', 'alt', 'neu'];
  const comparisonMatches = comparisonKeys.filter(k => k in value && typeof value[k] === 'number').length;
  if (comparisonMatches >= 2) {
    return 'comparison';
  }
  // Year comparison: {2020: 500, 2024: 300}
  const yearKeys = keys.filter(k => /^\d{4}$/.test(k));
  if (yearKeys.length >= 2 && yearKeys.every(k => typeof value[k] === 'number')) {
    return 'comparison';
  }
  
  /* ─── SLOPEGRAPH: Before/after with sub-objects ─── */
  const slopeObjKeys = ['vorher', 'nachher', 'before', 'after'];
  const hasSlopeObjects = slopeObjKeys.filter(k => k in value && typeof value[k] === 'object').length >= 2;
  if (hasSlopeObjects) {
    return 'slopegraph';
  }
  // Year comparison with objects: {2020: {...}, 2023: {...}}
  const jahrKeys = keys.filter(k => /^\d{4}$/.test(k));
  if (jahrKeys.length >= 2 && jahrKeys.every(k => typeof value[k] === 'object')) {
    return 'slopegraph';
  }
  
  /* ─── SUNBURST: name + children hierarchy ─── */
  const hasSunburstName = 'name' in value || 'label' in value;
  const hasSunburstChildren = 'children' in value && Array.isArray(value.children);
  if (hasSunburstName && hasSunburstChildren) {
    return 'sunburst';
  }
  
  /* ─── PICTOGRAM: count (+ optional icon) ─── */
  const pictogramCountKeys = ['count', 'anzahl', 'amount', 'value'];
  const hasPictogramCount = pictogramCountKeys.some(k => k in value && typeof value[k] === 'number');
  const hasPictogramIcon = 'icon' in value || 'symbol' in value || 'emoji' in value;
  if (hasPictogramCount && (hasPictogramIcon || keys.length <= 3)) {
    // Pictogram if has count + icon, or just count with few keys
    if (hasPictogramIcon) {
      return 'pictogram';
    }
  }
  
  /* ─── SEVERITY: level + label ─── */
  const severityLevelKeys = ['level', 'severity', 'grade', 'tier', 'schwere'];
  const severityLabelKeys = ['label', 'description', 'name', 'beschreibung'];
  const hasSeverityLevel = severityLevelKeys.some(k => k in value);
  const hasSeverityLabel = severityLabelKeys.some(k => k in value);
  if (hasSeverityLevel && hasSeverityLabel) {
    return 'severity';
  }
  
  /* ─── STATS: Statistical values (min/max/avg) ─── */
  const statsCfg = cfg.stats || {};
  const statsKeys = ensureArray(statsCfg.requiredKeys || statsCfg.benoetigtKeys, ['min', 'max', 'avg', 'mean', 'median', 'durchschnitt', 'mittelwert']);
  const statsMatches = statsKeys.filter(k => k in value).length;
  if (statsMatches >= 3) {
    return 'stats';
  }
  
  /* ─── RANGE: Min/Max only ─── */
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.requiredKeys || rangeCfg.benoetigtKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in value) && statsMatches < 3) {
    return 'range';
  }
  
  /* ─── PROGRESS: Progress bar ─── */
  const progressCfg = cfg.progress || {};
  const progressKeys = ensureArray(progressCfg.requiredKeys || progressCfg.benoetigtKeys, ['value', 'wert', 'current', 'aktuell', 'progress', 'fortschritt']);
  const progressMaxKeys = ['max', 'total', 'gesamt', 'von'];
  const hasProgressValue = progressKeys.some(k => k in value);
  const hasProgressMax = progressMaxKeys.some(k => k in value);
  if (hasProgressValue && hasProgressMax) {
    return 'progress';
  }
  
  /* ─── BADGE: Status objects ─── */
  const badgeCfg = cfg.badge || {};
  const badgeKeys = ensureArray(badgeCfg.requiredKeys || badgeCfg.benoetigtKeys, ['status']);
  const badgeAltKeys = ensureArray(badgeCfg.alternativeKeys, ['variant', 'typ', 'type', 'zustand', 'state']);
  if (badgeKeys.some(k => k in value) || badgeAltKeys.some(k => k in value)) {
    return 'badge';
  }
  
  /* ─── PIE: Only numeric values (2-6 keys) ─── */
  const pieCfg = cfg.pie || { onlyNumeric: true, nurNumerisch: true, minKeys: 2, maxKeys: 6 };
  const allNumeric = keys.every(k => typeof value[k] === 'number');
  if ((pieCfg.onlyNumeric !== false && pieCfg.nurNumerisch !== false) && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 6)) {
    return 'pie';
  }
  
  return 'object';
}

export default {
  // New English function names
  setColorsConfig,
  setDetectionConfig,
  setActivePerspectiveColors,
  getColors,
  createColors,
  createSection,
  createHeader,
  createLegend,
  detectType,
  // Legacy German aliases for backwards compatibility
  setFarbenConfig,
  setErkennungConfig,
  setAktivePerspektivenFarben,
  getFarben,
  erstelleFarben,
  createLegende
};
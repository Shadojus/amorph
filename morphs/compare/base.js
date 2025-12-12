/**
 * COMPARE BASE - Utilities for Compare-Morphs
 * 
 * Common functions for all Compare-Morphs:
 * - Color assignment for items
 * - Section/Container creation
 * - Type detection (config-driven from morphs.yaml)
 * 
 * DATA-DRIVEN: Keywords and rules come from config/morphs.yaml!
 */

import { debug } from '../../../observer/debug.js';

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
      fill: `rgba(${r}, ${g}, ${b}, 0.24)`,
      text: `rgba(${r}, ${g}, ${b}, 0.85)`,
      line: `rgba(${r}, ${g}, ${b}, 0.70)`,
      bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
      glow: `rgba(${r}, ${g}, ${b}, 0.50)`
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
    // Apply pilz-farbe-X class for CSS custom properties
    const colorClass = item.farbKlasse || item.colorClass || '';
    el.className = `compare-legende-item ${colorClass}`;
    el.innerHTML = `
      <span class="legende-dot"></span>
      <span class="legende-name">${item.name}</span>
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
 * Rules come from config/morphs.yaml → detection
 */
function detectNumberType(value) {
  const cfg = detectionConfig || {};
  
  // Rating: from config or fallback 0-10 with decimals
  const rating = cfg.rating || { min: 0, max: 10, decimals: true, dezimalstellen: true };
  if (value >= rating.min && value <= rating.max && (rating.decimals || rating.dezimalstellen) && !Number.isInteger(value)) {
    return 'rating';
  }
  
  // Progress: from config or fallback 0-100 integer
  const progress = cfg.progress || { min: 0, max: 100, integer: true, ganzzahl: true };
  if (value >= progress.min && value <= progress.max && (!(progress.integer || progress.ganzzahl) || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

/**
 * Detects the best morph for strings
 * Keywords come from config/morphs.yaml → detection.badge
 * 
 * NO HARDCODED KEYWORDS ANYMORE!
 */
function detectStringType(value) {
  const lower = value.toLowerCase().trim();
  const cfg = detectionConfig?.badge || {};
  
  // Badge: Keywords ONLY from config (fallback is empty = pure text)
  // This guarantees 100% data-drivenness
  const keywords = cfg.keywords || [];
  const maxLength = cfg.maxLength || cfg.maxLaenge || 25;
  
  if (keywords.length > 0 && value.length <= maxLength && keywords.some(kw => lower.includes(kw.toLowerCase()))) {
    return 'badge';
  }
  
  return 'text';
}

/**
 * Detects the best morph for arrays
 * Rules come from config/morphs.yaml → detection.array
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
    
    // Radar: from config or fallback
    const radarCfg = cfg.radar || {};
    const radarKeys = ensureArray(radarCfg.requiredKeys || radarCfg.benoetigtKeys, ['axis', 'value']);
    const radarAltKeys = ensureArray(radarCfg.alternativeKeys, ['dimension', 'score', 'factor']);
    const allRadarKeys = [...radarKeys, ...radarAltKeys];
    if (value.length >= (radarCfg.minItems || 3) && allRadarKeys.some(k => k in first)) {
      return 'radar';
    }
    
    // Timeline: from config or fallback
    const timelineCfg = cfg.timeline || {};
    const timelineKeys = ensureArray(timelineCfg.requiredKeys || timelineCfg.benoetigtKeys, ['date', 'event']);
    const timelineAltKeys = ensureArray(timelineCfg.alternativeKeys, ['time', 'datum', 'month', 'monat', 'period', 'periode', 'label']);
    const allTimelineKeys = [...timelineKeys, ...timelineAltKeys];
    if (allTimelineKeys.some(k => k in first)) {
      return 'timeline';
    }
    
    // Bar/Pie: from config or fallback
    const barCfg = cfg.bar || {};
    const pieCfg = cfg.pie || {};
    const labelKeys = ensureArray(barCfg.requiredKeys || barCfg.benoetigtKeys || pieCfg.requiredKeys || pieCfg.benoetigtKeys, ['label', 'value']);
    const valueAltKeys = ensureArray(barCfg.alternativeKeys || pieCfg.alternativeKeys, ['name', 'amount', 'count', 'score']);
    const hasLabel = labelKeys.some(k => k in first);
    const hasValue = valueAltKeys.some(k => k in first) || 'value' in first;
    
    if (hasLabel && hasValue) {
      return value.length <= 6 ? 'pie' : 'bar';
    }
  }
  
  // Number arrays → Bar
  if (value.every(v => typeof v === 'number')) {
    return 'bar';
  }
  
  return 'list';
}

/**
 * Detects the best morph for objects
 * Rules come from config/morphs.yaml → detection.object
 */
function detectObjectType(value) {
  const keys = Object.keys(value);
  const cfg = detectionConfig?.object || detectionConfig?.objekt || {};
  
  // Range: from config or fallback (min + max)
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.requiredKeys || rangeCfg.benoetigtKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in value) && keys.length <= (rangeCfg.maxKeys || 3)) {
    // Check if it's stats (also has avg/mean)
    const statsCfg = cfg.stats || {};
    const statsKeys = ensureArray(statsCfg.requiredKeys || statsCfg.benoetigtKeys, ['min', 'max', 'avg']);
    if (statsKeys.filter(k => k in value).length >= 3) {
      return 'stats';
    }
    return 'range';
  }
  
  // Pie: from config or fallback (only numeric values)
  const pieCfg = cfg.pie || { onlyNumeric: true, nurNumerisch: true, minKeys: 2, maxKeys: 8 };
  const allNumeric = keys.every(k => typeof value[k] === 'number');
  if ((pieCfg.onlyNumeric !== false && pieCfg.nurNumerisch !== false) && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 8)) {
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
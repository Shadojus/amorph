/**
 * Transformation Pipeline
 * DATA → MORPHS → DOM
 * 
 * DATA-DRIVEN: Morphs are detected from data structure!
 * Detection rules come from config/morphs.yaml
 */

import { morphs } from '../morphs/index.js';
import { debug } from '../observer/debug.js';
import { getFeldMorphs, getVersteckteFelder, getFeldConfig, sortBySchemaOrder } from '../util/semantic.js';

// Detection config loaded on first call
let detectionConfig = null;

/**
 * Sets the detection configuration (from morphs.yaml)
 */
export function setErkennungConfig(config) {
  detectionConfig = config?.erkennung || null;
  debug.detection('Detection config loaded', { 
    hasBadge: !!detectionConfig?.badge,
    hasRating: !!detectionConfig?.rating,
    hasProgress: !!detectionConfig?.progress,
    objectRules: Object.keys(detectionConfig?.objekt || {}).length,
    arrayRules: Object.keys(detectionConfig?.array || {}).length
  });
}

export function transform(daten, config, customMorphs = {}) {
  debug.render('Transform start', { 
    type: Array.isArray(daten) ? 'array' : typeof daten,
    count: Array.isArray(daten) ? daten.length : 1
  });
  
  // Load detection config from morphs.yaml if available
  if (!detectionConfig && config?.morphs?.erkennung) {
    setErkennungConfig(config.morphs);
  }
  
  const allMorphs = { ...morphs, ...customMorphs };
  
  // Load field morphs from schema (as fallback/override)
  const schemaFieldMorphs = getFeldMorphs();
  const hiddenFields = getVersteckteFelder();
  
  function morphField(value, fieldName = null) {
    // Skip hidden fields
    if (fieldName && hiddenFields.includes(fieldName)) {
      return null;
    }
    
    // Skip empty values (null, undefined, empty strings, empty arrays)
    if (value === null || value === undefined) return null;
    if (value === '') return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return null;
    
    const type = detectType(value);
    const morphName = findMorph(type, value, fieldName, config.morphs, schemaFieldMorphs);
    
    // Debug: Log type detection
    debug.detection('Type detection', { fieldName, type, morphName, valueType: typeof value, isArray: Array.isArray(value) });
    
    let morph = allMorphs[morphName];
    let actualMorphName = morphName;
    
    // Debug: track medicine fields
    const medicineFields = ['medicineisch', 'traditionelle_medicine', 'therapeutische_kategorien', 'wirkungsprofil', 'wirkstoffe', 'safety_score', 'nebenwirkungen', 'dosierung'];
    if (fieldName && medicineFields.includes(fieldName)) {
      debug.warn('Medicine field found', { fieldName, type, morphName, valueType: typeof value, isArray: Array.isArray(value) });
    }
    
    if (!morph) {
      debug.warn(`Morph not found: ${morphName}, using text`);
      morph = allMorphs.text;
      actualMorphName = 'text';
    }
    
    // Build config: morphs.yaml + schema.yaml field config
    const morphConfig = getMorphConfig(actualMorphName, fieldName, config);
    const element = morph(value, morphConfig, morphField);
    
    // Morph returned nothing → fallback to empty span
    if (!element) {
      debug.warn(`Morph ${actualMorphName} returned null/undefined`, { fieldName, value });
      // Create empty element instead of returning null
      const fallback = document.createElement('span');
      fallback.className = 'amorph-empty';
      fallback.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      const container = document.createElement('amorph-container');
      container.setAttribute('data-morph', morphName);
      container.setAttribute('data-fallback', 'true');
      if (fieldName) container.setAttribute('data-field', fieldName);
      container.appendChild(fallback);
      return container;
    }
    
    if (!(element instanceof Node)) {
      debug.warn(`Morph ${actualMorphName} did not return a Node`, { fieldName, type: typeof element });
      return null;
    }
    
    // Wrap in container
    const container = document.createElement('amorph-container');
    container.setAttribute('data-morph', morphName);
    if (fieldName) container.setAttribute('data-field', fieldName);
    container.appendChild(element);
    
    return container;
  }
  
  // Array of objects: Each object as a unit
  if (Array.isArray(daten)) {
    const fragment = document.createDocumentFragment();
    for (const item of daten) {
      const itemContainer = document.createElement('amorph-container');
      itemContainer.setAttribute('data-morph', 'item');
      itemContainer.className = 'amorph-item';
      
      // ID for selection system
      const itemId = item.id || item.slug || JSON.stringify(item).slice(0, 50);
      itemContainer.dataset.itemId = itemId;
      // Data as JSON for later access (for detail/compare)
      itemContainer.dataset.itemData = JSON.stringify(item);
      
      // Keyboard navigation: Make focusable
      itemContainer.setAttribute('tabindex', '0');
      
      if (typeof item === 'object' && item !== null) {
        // Render fields in schema order
        const sortedEntries = sortBySchemaOrder(item);
        
        // Debug: Check if medicine fields exist in item
        const medicineFields = ['medicineisch', 'traditionelle_medicine', 'therapeutische_kategorien', 'wirkungsprofil', 'wirkstoffe'];
        const presentMedicineFields = medicineFields.filter(f => f in item);
        if (presentMedicineFields.length > 0) {
          debug.warn('Item has medicine fields', { itemName: item.name, fields: presentMedicineFields, totalKeys: Object.keys(item).length });
        }
        
        for (const [key, value] of sortedEntries) {
          const morphed = morphField(value, key);
          if (morphed) {
            itemContainer.appendChild(morphed);
          } else {
            // Debug: Why was the field not rendered?
            const isEmptyArray = Array.isArray(value) && value.length === 0;
            const isEmptyObj = typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
            if (!isEmptyArray && !isEmptyObj && value !== null && value !== undefined && value !== '') {
              debug.warn('Field not rendered', { key, valueType: typeof value, isArray: Array.isArray(value), arrayLen: Array.isArray(value) ? value.length : 0 });
            }
          }
        }
      } else {
        const morphed = morphField(item);
        if (morphed) itemContainer.appendChild(morphed);
      }
      
      fragment.appendChild(itemContainer);
    }
    return fragment;
  }
  
  // Single object
  if (typeof daten === 'object' && daten !== null) {
    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(daten)) {
      const morphed = morphField(value, key);
      if (morphed) fragment.appendChild(morphed);
    }
    return fragment;
  }
  
  return morphField(daten);
}

function detectType(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return detectNumberType(value);
  if (typeof value === 'string') return detectStringType(value);
  
  if (Array.isArray(value)) {
    return detectArrayType(value);
  }
  
  if (typeof value === 'object') {
    return detectObjectType(value);
  }
  
  return 'unknown';
}

/**
 * Detects the best morph for numbers
 * Rules come from config/morphs.yaml → detection
 */
function detectNumberType(value) {
  const cfg = detectionConfig || {};
  
  // Rating: from config or fallback 0-10 with decimals
  const rating = cfg.rating || { min: 0, max: 10, decimalsRequired: true };
  if (value >= rating.min && value <= rating.max && rating.decimalsRequired && !Number.isInteger(value)) {
    return 'rating';
  }
  
  // Progress: from config or fallback 0-100 integer
  const progress = cfg.progress || { min: 0, max: 100, integersOnly: true };
  if (value >= progress.min && value <= progress.max && (!progress.integersOnly || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

/**
 * Detects the best morph for strings
 * Keywords come from config/morphs.yaml → detection.badge
 */
function detectStringType(value) {
  const lower = value.toLowerCase().trim();
  const cfg = detectionConfig?.badge || {};
  
  // Badge: Keywords from config or fallback
  const keywords = cfg.keywords || [
    'active', 'inactive', 'yes', 'no', 'online', 'offline',
    'open', 'closed', 'available', 'unavailable', 'edible', 'toxic', 'deadly'
  ];
  const maxLength = cfg.maxLength || 25;
  
  if (value.length <= maxLength && keywords.some(kw => lower.includes(kw))) {
    return 'badge';
  }
  
  return 'string';
}

/**
 * Detects the best morph for arrays
 * Rules come from config/morphs.yaml → detection.array
 */
function detectArrayType(value) {
  if (value.length === 0) return 'array';
  
  const first = value[0];
  const cfg = detectionConfig?.array || {};
  
  // Helper: Ensure we have an array
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  // All elements are objects?
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    // Lifecycle: Arrays with phase/step structure (check FIRST before other rules!)
    const lifecycleKeys = ['phase', 'step', 'stage', 'stadium', 'schritt'];
    if (lifecycleKeys.some(k => k in first)) {
      return 'lifecycle';
    }
    
    // Radar: from config or fallback
    const radarCfg = cfg.radar || {};
    const radarKeys = ensureArray(radarCfg.requiredKeys, ['axis', 'value', 'score', 'dimension', 'factor']);
    if (value.length >= (radarCfg.minItems || 3) && 
        radarKeys.some(k => k in first)) {
      return 'radar';
    }
    
    // Timeline: from config or fallback
    const timelineCfg = cfg.timeline || {};
    const timelineKeys = ensureArray(timelineCfg.requiredKeys, ['date', 'time', 'month', 'period']);
    if (timelineKeys.some(k => k in first)) {
      return 'timeline';
    }
    
    // Pie/Bar: Arrays with label/value structure (from config)
    const arrayCfg = cfg.array || cfg || {};
    const pieCfg = arrayCfg.pie || {};
    const barCfg = arrayCfg.bar || {};
    const labelKeys = ensureArray(pieCfg.requiredKeys || barCfg.requiredKeys, ['label', 'name', 'category']);
    const valueKeys = ensureArray(pieCfg.alternativeKeys || barCfg.alternativeKeys, ['value', 'count', 'amount', 'score']);
    const hasLabel = labelKeys.some(k => k in first);
    const hasValue = valueKeys.some(k => k in first);
    if (hasLabel && hasValue) {
      return value.length <= 6 ? 'pie' : 'bar';
    }
  }
  
  // All elements are numbers → Bar Chart
  if (value.every(v => typeof v === 'number')) {
    return 'bar';
  }
  
  return 'array';
}

/**
 * Detects the best morph for objects
 * Rules come from config/morphs.yaml → detection.object
 */
function detectObjectType(value) {
  const keys = Object.keys(value);
  const cfg = detectionConfig?.objekt || {};
  
  // Helper: Ensure we have an array (YAML parser may return string)
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  // Range: from config or fallback (min + max)
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.requiredKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in value)) {
    // Check if it's Stats (has additional avg/mean)
    const statsCfg = cfg.stats || {};
    const statsKeys = ensureArray(statsCfg.requiredKeys, ['min', 'max', 'avg', 'mean', 'median']);
    if (statsKeys.filter(k => k in value).length >= 3) {
      return 'stats';
    }
    return 'range';
  }
  
  // Rating: from config or fallback (has rating/score/stars field)
  const ratingCfg = cfg.rating || {};
  const ratingKeys = ensureArray(ratingCfg.requiredKeys, ['rating']);
  const ratingAltKeys = ensureArray(ratingCfg.alternativeKeys, ['score', 'stars']);
  if (ratingKeys.some(k => k in value) || ratingAltKeys.some(k => k in value)) {
    return 'rating';
  }
  
  // Progress: from config or fallback (value/current + max/total)
  const progressCfg = cfg.progress || {};
  const progressKeys = ensureArray(progressCfg.requiredKeys, ['value']);
  const progressAltKeys = ensureArray(progressCfg.alternativeKeys, ['current', 'max', 'total']);
  const hasProgressPrimary = progressKeys.some(k => k in value) || progressAltKeys.filter(k => ['current'].includes(k)).some(k => k in value);
  const hasProgressMax = ['max', 'total'].some(k => k in value);
  if (hasProgressPrimary && hasProgressMax) {
    return 'progress';
  }
  
  // Badge: from config or fallback (status/variant field)
  const badgeCfg = cfg.badge || {};
  const badgeKeys = ensureArray(badgeCfg.requiredKeys, ['status']);
  const badgeAltKeys = ensureArray(badgeCfg.alternativeKeys, ['variant']);
  if (badgeKeys.some(k => k in value) || badgeAltKeys.some(k => k in value)) {
    return 'badge';
  }
  
  // Pie: from config or fallback (only numeric values)
  const pieCfg = cfg.pie || { numericOnly: true, minKeys: 2, maxKeys: 8 };
  const allNumeric = keys.every(k => typeof value[k] === 'number');
  if (pieCfg.numericOnly && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 8)) {
    return 'pie';
  }
  
  return 'object';
}

function findMorph(type, value, fieldName, morphConfig, schemaFieldMorphs = {}) {
  // 1. Explicit field assignment from morphs.yaml
  if (fieldName && morphConfig?.felder?.[fieldName]) {
    return morphConfig.felder[fieldName];
  }
  
  // 2. Field type from schema (Single Source of Truth)
  if (fieldName && schemaFieldMorphs[fieldName]) {
    return schemaFieldMorphs[fieldName];
  }
  
  // 3. Check rules
  if (morphConfig?.regeln) {
    for (const rule of morphConfig.regeln) {
      if (matchesRule(rule, type, value)) {
        return rule.morph;
      }
    }
  }
  
  // 4. Default mapping (extended with new morphs)
  const defaults = {
    // Base types
    'string': 'text',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'list',
    'object': 'object',
    'range': 'range',
    'null': 'text',
    
    // Visual morphs (auto-detected)
    'pie': 'pie',
    'bar': 'bar',
    'radar': 'radar',
    'rating': 'rating',
    'progress': 'progress',
    'stats': 'stats',
    'timeline': 'timeline',
    'badge': 'badge',
    'lifecycle': 'lifecycle'
  };
  
  return defaults[type] || 'text';
}

function matchesRule(rule, type, value) {
  // Support both 'type' and 'typ' (German from config.js mapping)
  const ruleType = rule.type || rule.typ;
  if (ruleType && ruleType !== type) return false;
  
  if (rule.has && typeof value === 'object') {
    return rule.has.every(key => key in value);
  }
  
  // Support both 'maxLength' and 'maxLaenge' (German from config.js mapping)
  const maxLen = rule.maxLength || rule.maxLaenge;
  if (maxLen && typeof value === 'string') {
    return value.length <= maxLen;
  }
  return true;
}

/**
 * Build morph config from:
 * 1. morphs.yaml config (generic)
 * 2. schema.yaml field-config (field-specific, overrides)
 */
function getMorphConfig(morphName, fieldName, config) {
  // Base config from morphs.yaml
  const baseConfig = config?.morphs?.config?.[morphName] || {};
  
  // Field-specific config from schema
  const fieldConfig = fieldName ? getFeldConfig(fieldName) : {};
  
  // Merge: Schema overrides morphs.yaml
  const merged = { ...baseConfig };
  
  // Colors from schema (for tags)
  if (fieldConfig.farben) {
    merged.farben = { ...baseConfig.farben, ...fieldConfig.farben };
  }
  
  // Unit from schema (for ranges)
  if (fieldConfig.einheit) {
    merged.einheit = fieldConfig.einheit;
  }
  
  // Label from schema
  if (fieldConfig.label) {
    merged.label = fieldConfig.label;
  }
  
  return merged;
}

export async function render(container, data, config) {
  debug.render('Render start', { 
    hasData: !!data, 
    count: Array.isArray(data) ? data.length : (data ? 1 : 0) 
  });
  
  // Remove empty state
  const emptyState = container.querySelector('.amorph-empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  // Only clear the data area, not the features!
  // Features have data-feature attribute, data items have data-morph="item"
  const dataItems = container.querySelectorAll(':scope > amorph-container[data-morph="item"]');
  debug.render('Removing old items', { count: dataItems.length });
  for (const item of dataItems) {
    item.remove();
  }
  
  // If no data, render nothing
  if (!data || (Array.isArray(data) && data.length === 0)) {
    debug.render('No data to render');
    container.dispatchEvent(new CustomEvent('amorph:rendered', {
      detail: { count: 0, timestamp: Date.now() }
    }));
    return;
  }
  
  const dom = transform(data, config);
  container.appendChild(dom);
  
  const count = Array.isArray(data) ? data.length : 1;
  debug.render('Render complete', { count });
  
  container.dispatchEvent(new CustomEvent('amorph:rendered', {
    detail: { count, timestamp: Date.now() }
  }));
}

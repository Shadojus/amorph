/**
 * Object Type Detection
 * Detects map, citation, dosage, currency, gauge, stats, range, etc. from objects
 * 
 * @module core/detection/object
 */

/**
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/**
 * Helper: Convert string or array to array
 * @param {string|string[]|undefined} val - Value to convert
 * @param {string[]} fallback - Fallback array
 * @returns {string[]}
 */
function ensureArray(val, fallback) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim());
  return fallback;
}

/**
 * Detects the appropriate type for an object value
 * 
 * Priority: Specific patterns before generic ones!
 * 
 * MAP: Geographic coordinates (lat/lng)
 * CITATION: Source references (author/year/title)
 * DOSAGE: Dosage information (dose/amount + unit)
 * CURRENCY: Currency amounts (amount + currency)
 * GAUGE: Score with min/max/zones
 * COMPARISON: Before/after with numbers
 * SLOPEGRAPH: Before/after with objects
 * STATS: Statistical values (min/max/avg)
 * RANGE: Only min/max (without further stats)
 * RATING: Ratings (rating/score/stars)
 * PROGRESS: Progress (value/current + max/total)
 * BADGE: Status objects (status/variant)
 * PIE: Only numeric values (2-8 keys)
 * OBJECT: Fallback for complex objects
 * 
 * @param {object} value - The object value to analyze
 * @param {DetectionConfig|null} config - Detection configuration from morphs.yaml
 * @returns {string} The detected type
 */
export function detectObjectType(value, config = null) {
  const keys = Object.keys(value);
  const cfg = config?.objekt || {};
  
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
  
  /* ─── DOSAGE: Dosage information ─── */
  const dosageKeys = ['dose', 'dosis', 'dosierung', 'amount', 'menge'];
  const dosageUnitKeys = ['unit', 'einheit', 'frequency', 'frequenz'];
  const hasDosage = dosageKeys.some(k => k in value) && dosageUnitKeys.some(k => k in value);
  if (hasDosage) {
    return 'dosage';
  }
  
  /* ─── CURRENCY: Currency amounts ─── */
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
  
  /* ─── COMPARISON: Simple before/after comparison with numbers ─── */
  const comparisonKeys = ['vorher', 'nachher', 'before', 'after', 'from', 'to', 'alt', 'neu'];
  const comparisonMatches = comparisonKeys.filter(k => k in value && typeof value[k] === 'number').length;
  if (comparisonMatches >= 2) {
    return 'comparison';
  }
  
  // Year comparison with numbers: {2020: 500, 2024: 300}
  const yearKeys = keys.filter(k => /^\d{4}$/.test(k));
  if (yearKeys.length >= 2 && yearKeys.every(k => typeof value[k] === 'number')) {
    return 'comparison';
  }
  
  /* ─── SLOPEGRAPH: Object with before/after sub-objects ─── */
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
  
  /* ─── STATS: Statistical values ─── */
  const statsCfg = cfg.stats || {};
  const statsKeys = ensureArray(statsCfg.requiredKeys, ['min', 'max', 'avg', 'mean', 'median', 'durchschnitt', 'mittelwert']);
  const statsMatches = statsKeys.filter(k => k in value).length;
  if (statsMatches >= 3) {
    return 'stats';
  }
  
  /* ─── RANGE: Min/Max range ─── */
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.requiredKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in value) && statsMatches < 3) {
    return 'range';
  }
  
  /* ─── RATING: Ratings ─── */
  const ratingCfg = cfg.rating || {};
  const ratingKeys = ensureArray(ratingCfg.requiredKeys, ['rating', 'bewertung']);
  const ratingAltKeys = ensureArray(ratingCfg.alternativeKeys, ['score', 'stars', 'sterne', 'punkte']);
  if (ratingKeys.some(k => k in value) || ratingAltKeys.some(k => k in value)) {
    return 'rating';
  }
  
  /* ─── PROGRESS: Progress display ─── */
  const progressCfg = cfg.progress || {};
  const progressKeys = ensureArray(progressCfg.requiredKeys, ['value', 'wert', 'current', 'aktuell', 'progress', 'fortschritt']);
  const progressMaxKeys = ['max', 'total', 'gesamt', 'von'];
  const hasProgressValue = progressKeys.some(k => k in value);
  const hasProgressMax = progressMaxKeys.some(k => k in value);
  if (hasProgressValue && hasProgressMax) {
    return 'progress';
  }
  
  /* ─── BADGE: Status objects ─── */
  const badgeCfg = cfg.badge || {};
  const badgeKeys = ensureArray(badgeCfg.requiredKeys, ['status']);
  const badgeAltKeys = ensureArray(badgeCfg.alternativeKeys, ['variant', 'typ', 'type', 'zustand', 'state']);
  if (badgeKeys.some(k => k in value) || badgeAltKeys.some(k => k in value)) {
    return 'badge';
  }
  
  /* ─── PIE: Only numeric values ─── */
  const pieCfg = cfg.pie || { numericOnly: true, minKeys: 2, maxKeys: 6 };
  const allNumeric = keys.every(k => typeof value[k] === 'number');
  if (pieCfg.numericOnly && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 6)) {
    return 'pie';
  }
  
  return 'object';
}

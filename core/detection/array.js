/**
 * Array Type Detection
 * Detects sparkline, heatmap, timeline, radar, bar, pie, etc. from arrays
 * 
 * Kirk principle: Chart selection based on data structure!
 * 
 * @module core/detection/array
 */

/**
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/**
 * Helper: Convert string or array to array
 * @param {*} val - Value to convert
 * @param {string[]} fallback - Fallback array
 * @returns {string[]}
 */
function ensureArray(val, fallback) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim());
  return fallback;
}

/**
 * Detects the appropriate type for an array value
 * 
 * PRIORITY: Specific patterns before generic ones!
 * 
 * SPARKLINE: Numeric array (all numbers)
 * SLOPEGRAPH: Array with before/after structure
 * HEATMAP: 2D matrix (array of arrays with numbers)
 * LIFECYCLE: Phase/Step structure
 * TIMELINE: Time-based events (date/time/month)
 * RADAR: Multi-dimensional data (3+ axes)
 * HIERARCHY: Nested levels (level/parent)
 * NETWORK: Relationship data (connections/relations)
 * STEPS: Process steps (step/order)
 * CALENDAR: Month/season data
 * PIE: Few categories (≤6) with label/value
 * BAR: Many categories (>6) with label/value
 * SEVERITY: Severity grades
 * LIST: Fallback for all other arrays
 * 
 * Kirk Morphs Session 1: bubble, boxplot, treemap, stackedbar, dotplot, sunburst
 * Kirk Morphs Session 2: flow, scatterplot, groupedbar, lollipop, pictogram
 * 
 * @param {Array} value - The array value to analyze
 * @param {DetectionConfig|null} config - Detection configuration from morphs.yaml
 * @returns {string} The detected type
 */
export function detectArrayType(value, config = null) {
  if (value.length === 0) return 'array';
  
  const first = value[0];
  const cfg = config?.array || {};
  
  /* ═══════════════════════════════════════════════════════════════════════════════
   * KIRK SESSION 2 - NEW HIGH-PRIORITY PATTERNS
   * Flow, Scatterplot, Groupedbar, Lollipop, Pictogram
   * 
   * IMPORTANT: Order is critical for unambiguous detection!
   * More specific patterns MUST come before more generic ones.
   * ═══════════════════════════════════════════════════════════════════════════════
   */
  
  // From here: Check object arrays (before numeric arrays!)
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    /* ─── FLOW: Organic streams/connections (DESIGN BASIS!) ─── */
    const flowFromKeys = ['from', 'von', 'source', 'quelle'];
    const flowToKeys = ['to', 'nach', 'target', 'ziel'];
    const hasFlowFrom = flowFromKeys.some(k => k in first);
    const hasFlowTo = flowToKeys.some(k => k in first);
    const hasFlowFromTo = hasFlowFrom && hasFlowTo;
    const hasExplicitFlows = ('flows' in first && Array.isArray(first.flows)) ||
                             ('edges' in first && Array.isArray(first.edges) && 
                              first.edges[0] && ('weight' in first.edges[0] || 'value' in first.edges[0]));
    if (hasFlowFromTo || hasExplicitFlows) {
      return 'flow';
    }
    
    /* ─── PICTOGRAM: Countable quantities with EXPLICIT icon ─── */
    const pictogramIconKeys = ['icon', 'symbol', 'emoji'];
    const pictogramCountKeys = ['count', 'anzahl'];
    const hasIcon = pictogramIconKeys.some(k => k in first);
    const hasPictogramCount = pictogramCountKeys.some(k => k in first && typeof first[k] === 'number');
    if (hasIcon && hasPictogramCount) {
      return 'pictogram';
    }
    
    /* ─── SCATTERPLOT: X/Y coordinates for correlation analysis ─── */
    const hasExplicitXY = ('x' in first && 'y' in first && 
                          typeof first.x === 'number' && typeof first.y === 'number');
    if (hasExplicitXY) {
      return 'scatterplot';
    }
    
    /* ─── GROUPEDBAR: Multiple series per category ─── */
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
    
    /* ─── LOLLIPOP: Rankings with divergence or explicit rank ─── */
    const lollipopRankKeys = ['rank', 'ranking', 'position', 'platz'];
    const hasRankingHint = lollipopRankKeys.some(k => k in first);
    const lollipopValueKeys = ['gap', 'abweichung', 'difference', 'differenz', 'delta'];
    const hasLollipopValue = lollipopValueKeys.some(k => k in first && typeof first[k] === 'number');
    if (hasRankingHint) {
      return 'lollipop';
    }
    if (hasLollipopValue) {
      const hasDivergingData = value.some(v => {
        const val = lollipopValueKeys.reduce((acc, k) => acc ?? v[k], null);
        return typeof val === 'number' && val < 0;
      });
      if (hasDivergingData) {
        return 'lollipop';
      }
    }
    
    /* ═══════════════════════════════════════════════════════════════════════════════
     * KIRK SESSION 1 - MORPHS (bubble, boxplot, treemap, stackedbar, dotplot, sunburst)
     * ═══════════════════════════════════════════════════════════════════════════════
     */
    
    /* ─── BOXPLOT: Statistical distributions (5-Number Summary) ─── */
    const boxplotKeys = ['min', 'q1', 'median', 'q3', 'max', 'quartile1', 'quartile3', 'iqr'];
    const boxplotMatches = boxplotKeys.filter(k => k in first).length;
    if (boxplotMatches >= 3) {
      return 'boxplot';
    }
    
    /* ─── BUBBLE: Proportional circles (size/radius) ─── */
    const bubbleSizeKeys = ['size', 'radius', 'r', 'groesse', 'magnitude', 'area'];
    const bubbleLabelKeys = ['label', 'name', 'bezeichnung', 'titel'];
    const hasBubbleSize = bubbleSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasBubbleLabel = bubbleLabelKeys.some(k => k in first);
    const hasBubbleChildren = 'children' in first && Array.isArray(first.children);
    if (hasBubbleSize && hasBubbleLabel && !hasBubbleChildren) {
      return 'bubble';
    }
    
    /* ─── SUNBURST: Radial hierarchy (children + value) ─── */
    const hasSunburstChildren = 'children' in first && Array.isArray(first.children);
    const hasSunburstValue = ('value' in first || 'size' in first || 'wert' in first) && 
                             typeof (first.value ?? first.size ?? first.wert) === 'number';
    const hasSunburstChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    if (hasSunburstChildren && hasSunburstValue && !hasSunburstChange) {
      return 'sunburst';
    }
    
    /* ─── TREEMAP: Area-proportional tiles ─── */
    const hasTreemapChildren = 'children' in first && Array.isArray(first.children);
    const treemapSizeKeys = ['size', 'value', 'wert', 'area', 'flaeche'];
    const hasTreemapSize = treemapSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasTreemapChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    if (hasTreemapChildren) {
      return 'treemap';
    }
    if (hasTreemapSize && hasTreemapChange && value.length >= 3) {
      return 'treemap';
    }
    
    /* ─── STACKEDBAR: Stacked bars (parts sum up) ─── */
    const stackedSegmentKeys = ['segments', 'teile', 'parts', 'anteile', 'slices'];
    const hasStackedSegments = stackedSegmentKeys.some(k => k in first && Array.isArray(first[k]));
    const percentKeys = keys.filter(k => {
      const val = first[k];
      return typeof val === 'number' && val >= 0 && val <= 100;
    });
    const percentSum = percentKeys.reduce((sum, k) => sum + first[k], 0);
    const looksLikePercents = percentKeys.length >= 2 && percentSum >= 95 && percentSum <= 105;
    if (hasStackedSegments) {
      return 'stackedbar';
    }
    const hasStackedCategory = ('kategorie' in first || 'category' in first || 'label' in first || 'name' in first);
    if (looksLikePercents && hasStackedCategory && percentKeys.length >= 3) {
      return 'stackedbar';
    }
    
    /* ─── DOTPLOT: Category scatter (single points per category) ─── */
    const dotplotPointKeys = ['punkte', 'points', 'werte', 'values', 'dots'];
    const hasDotplotPoints = dotplotPointKeys.some(k => k in first && Array.isArray(first[k]));
    const hasDotplotCategory = ('kategorie' in first || 'category' in first || 'gruppe' in first || 'group' in first);
    if (hasDotplotPoints && hasDotplotCategory) {
      return 'dotplot';
    }
  }
  
  /* ─── SPARKLINE: Purely numeric array → Inline trend ─── */
  if (value.every(v => typeof v === 'number')) {
    if (value.length >= 3) {
      return 'sparkline';
    }
    return 'bar';
  }
  
  /* ─── HEATMAP: 2D matrix (array of arrays) ─── */
  if (value.every(v => Array.isArray(v) && v.every(n => typeof n === 'number'))) {
    if (value.length >= 2 && value[0].length >= 2) {
      return 'heatmap';
    }
  }
  
  // From here: Array of objects (existing logic)
  if (typeof first !== 'object' || first === null) {
    return 'array';
  }
  
  const keys = Object.keys(first);
  
  /* ─── SLOPEGRAPH: Before-after comparison ─── */
  const slopeKeys = ['vorher', 'nachher', 'before', 'after', 'start', 'end', 'v1', 'v2', 'alt', 'neu'];
  const hasSlopeStructure = slopeKeys.filter(k => k in first).length >= 2;
  const hasSlopeName = 'name' in first || 'label' in first;
  if (hasSlopeStructure && hasSlopeName) {
    return 'slopegraph';
  }
  
  /* ─── LIFECYCLE: Phases/stages of a process ─── */
  const lifecycleKeys = ['phase', 'stage', 'stadium', 'schritt', 'stufe'];
  if (lifecycleKeys.some(k => k in first)) {
    return 'lifecycle';
  }
  
  /* ─── STEPS: Step-by-step instructions ─── */
  const stepsKeys = ['step', 'order', 'nummer', 'reihenfolge'];
  if (stepsKeys.some(k => k in first) && ('action' in first || 'beschreibung' in first || 'text' in first || 'label' in first)) {
    return 'steps';
  }
  
  /* ─── TIMELINE: Time-based events ─── */
  const timelineCfg = cfg.timeline || {};
  const timelineKeys = ensureArray(timelineCfg.requiredKeys, ['date', 'time', 'datum', 'zeit', 'period', 'year', 'jahr']);
  if (timelineKeys.some(k => k in first) && ('event' in first || 'ereignis' in first || 'description' in first || 'label' in first)) {
    return 'timeline';
  }
  
  /* ─── CALENDAR: Month/season calendar ─── */
  const calendarKeys = ['month', 'monat', 'saison', 'season'];
  if (calendarKeys.some(k => k in first) && ('active' in first || 'aktiv' in first || 'available' in first)) {
    return 'calendar';
  }
  
  /* ─── RADAR: Multi-dimensional profiles (min 3 axes!) ─── */
  const radarCfg = cfg.radar || {};
  const radarKeys = ensureArray(radarCfg.requiredKeys, ['axis', 'achse', 'dimension', 'factor', 'faktor', 'kategorie']);
  const radarValueKeys = ['value', 'wert', 'score', 'rating', 'level'];
  const hasRadarAxis = radarKeys.some(k => k in first);
  const hasRadarValue = radarValueKeys.some(k => k in first);
  if (value.length >= 3 && hasRadarAxis && hasRadarValue) {
    return 'radar';
  }
  
  /* ─── HIERARCHY: Nested structures ─── */
  const hierarchyKeys = ['level', 'ebene', 'parent', 'children', 'kinder', 'rank', 'taxonomy'];
  if (hierarchyKeys.some(k => k in first)) {
    return 'hierarchy';
  }
  
  /* ─── NETWORK: Relationship networks (NOT Flow!) ─── */
  const networkConnectionKeys = ['connections', 'relations', 'verbindungen'];
  const networkNameKeys = ['name', 'partner', 'organism'];
  const networkTypeKeys = ['type', 'relationship', 'typ', 'beziehung'];
  const flowFromKeys = ['from', 'von', 'source', 'quelle'];
  const flowToKeys = ['to', 'nach', 'target', 'ziel'];
  const hasFlowPattern = flowFromKeys.some(k => k in first) && flowToKeys.some(k => k in first);
  const hasNetworkConnections = networkConnectionKeys.some(k => k in first && Array.isArray(first[k]));
  const hasNetworkStructure = networkNameKeys.some(k => k in first) && networkTypeKeys.some(k => k in first);
  if (!hasFlowPattern && (hasNetworkConnections || hasNetworkStructure)) {
    return 'network';
  }
  
  /* ─── SEVERITY: Severity grades/warnings ─── */
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
  
  /* ─── PIE vs BAR: Label/Value structures ─── */
  const labelKeys = ['label', 'name', 'kategorie', 'category', 'item', 'typ', 'type', 'method', 'methode'];
  const valueKeys = ['value', 'wert', 'count', 'anzahl', 'amount', 'menge', 'score', 'percent', 'prozent', 'suitability', 'rating'];
  const hasLabel = labelKeys.some(k => k in first);
  const hasValue = valueKeys.some(k => k in first && typeof first[k] === 'number');
  
  if (hasLabel && hasValue) {
    return value.length <= 6 ? 'pie' : 'bar';
  }
  
  /* ─── BAR: Only value (without explicit label) ─── */
  if (hasValue && !hasLabel) {
    return 'bar';
  }
  
  return 'array';
}

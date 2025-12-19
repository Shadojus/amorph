/**
 * Shared Type Detection Configuration
 * 
 * SINGLE SOURCE OF TRUTH für Client & Server Typ-Erkennung.
 * Wird von core/pipeline.js UND src/lib/ssr-morphs.ts verwendet.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE KEYWORDS (semantische Status-Begriffe)
// ═══════════════════════════════════════════════════════════════════════════════

export const BADGE_KEYWORDS = {
  success: [
    'active', 'yes', 'available', 'enabled', 'online', 'open',
    'edible', 'safe', 'good', 'choice', 'excellent',
    'essbar', 'approved', 'complete', 'common'
  ],
  danger: [
    'toxic', 'deadly', 'poisonous', 'danger', 'critical',
    'giftig', 'tödlich', 'rejected', 'error', 'fatal'
  ],
  warning: [
    'caution', 'warning', 'medium', 'bedingt', 'pending',
    'ungenießbar', 'partial', 'limited'
  ],
  muted: [
    'inactive', 'no', 'unavailable', 'disabled', 'offline', 'closed',
    'poor', 'none', 'unknown', 'n/a'
  ]
} as const;

export const ALL_BADGE_KEYWORDS = [
  ...BADGE_KEYWORDS.success,
  ...BADGE_KEYWORDS.danger,
  ...BADGE_KEYWORDS.warning,
  ...BADGE_KEYWORDS.muted,
  // Zusätzliche neutrale Keywords
  'high', 'low', 'rare', 'uncommon', 'endangered', 'protected'
];

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD NAME PATTERNS (Feld-basierte Typ-Erkennung)
// ═══════════════════════════════════════════════════════════════════════════════

export const FIELD_PATTERNS = {
  // Felder die IMMER als bestimmter Typ erkannt werden
  progress: [
    /percent(age)?$/i, /prozent$/i, /_pct$/i,
    /completion$/i, /progress$/i, /fortschritt$/i
  ],
  date: [
    /date$/i, /datum$/i, /_at$/i, /created$/i, /updated$/i,
    /jahr$/i, /year$/i, /month$/i, /monat$/i
  ],
  image: [
    /image$/i, /bild$/i, /photo$/i, /foto$/i, /picture$/i,
    /thumbnail$/i, /avatar$/i, /icon$/i
  ],
  link: [
    /url$/i, /link$/i, /href$/i, /website$/i, /homepage$/i
  ],
  currency: [
    /price$/i, /preis$/i, /cost$/i, /kosten$/i, /amount$/i,
    /betrag$/i, /_eur$/i, /_usd$/i
  ],
  // Felder die als number behandelt werden (nicht rating/progress)
  forceNumber: [
    /count$/i, /anzahl$/i, /total$/i, /summe$/i,
    /id$/i, /index$/i, /position$/i, /order$/i
  ],
  // SVG-Visualisierungen
  sparkline: [
    /sparkline$/i, /trend$/i, /verlauf$/i, /history$/i,
    /timeseries$/i, /zeitreihe$/i
  ],
  gauge: [
    /gauge$/i, /meter$/i, /dial$/i, /level$/i
  ],
  radar: [
    /radar$/i, /spider$/i, /profile$/i, /profil$/i
  ],
  heatmap: [
    /heatmap$/i, /matrix$/i, /grid$/i, /correlation$/i
  ],
  pie: [
    /pie$/i, /donut$/i, /anteil$/i, /composition$/i, /verteilung$/i
  ]
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// NUMERIC THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════════

export const NUMERIC_THRESHOLDS = {
  progress: { min: 0, max: 100, integersOnly: true }
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// STRING LENGTH LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

export const STRING_LIMITS = {
  badge: { maxLength: 30 },
  tag: { maxLength: 25, noSpaces: true }
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DETECTION FUNCTION (shared logic)
// ═══════════════════════════════════════════════════════════════════════════════

export type MorphType = 
  | 'null' | 'boolean' | 'number' | 'progress'
  | 'text' | 'link' | 'image' | 'badge' | 'tag' | 'date'
  | 'list' | 'tags' | 'range' | 'object' | 'hierarchy'
  | 'timeline' | 'steps' | 'map' | 'stats' | 'currency'
  // SVG-basierte Morphs (SSR)
  | 'sparkline' | 'gauge' | 'radar' | 'heatmap' | 'pie' | 'donut';

/**
 * Prüft ob ein Feldname zu einem Pattern passt
 */
function matchesFieldPattern(fieldName: string | undefined, patterns: readonly RegExp[]): boolean {
  if (!fieldName) return false;
  return patterns.some(pattern => pattern.test(fieldName));
}

/**
 * Zentrale Typ-Erkennung (für Client & Server)
 */
export function detectType(value: any, fieldName?: string): MorphType {
  // Null/Undefined
  if (value === null || value === undefined) return 'null';
  
  // Boolean
  if (typeof value === 'boolean') return 'boolean';
  
  // Number
  if (typeof value === 'number') {
    // Feld-basierte Erkennung hat Priorität
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.progress)) return 'progress';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.date)) return 'number'; // Jahre als Zahl
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.currency)) return 'currency';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.forceNumber)) return 'number';
    
    // Wert-basierte Erkennung
    const { progress } = NUMERIC_THRESHOLDS;
    if (value >= progress.min && value <= progress.max && 
        (!progress.integersOnly || Number.isInteger(value))) return 'progress';
    
    return 'number';
  }
  
  // String
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    
    // Feld-basierte Erkennung
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.image)) return 'image';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.link)) return 'link';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.date)) return 'date';
    
    // URL-Pattern
    if (/^https?:\/\/|^www\./i.test(trimmed)) return 'link';
    
    // Image-Pattern
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(trimmed)) return 'image';
    
    // ISO Date Pattern
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return 'date';
    
    // Badge (kurz + semantisches Keyword)
    if (trimmed.length <= STRING_LIMITS.badge.maxLength && 
        ALL_BADGE_KEYWORDS.some(kw => lower.includes(kw))) {
      return 'badge';
    }
    
    // Tag (kurz, keine Leerzeichen)
    if (trimmed.length <= STRING_LIMITS.tag.maxLength && !trimmed.includes(' ')) {
      return 'tag';
    }
    
    return 'text';
  }
  
  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return 'list';
    
    const first = value[0];
    
    // Feld-basierte Erkennung für Visualisierungen
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.sparkline)) return 'sparkline';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.heatmap)) return 'heatmap';
    
    // Zahlen-Array → Sparkline (wenn genug Werte)
    if (typeof first === 'number' && value.length >= 3 && value.every(v => typeof v === 'number')) {
      return 'sparkline';
    }
    
    // String-Array → Tags
    if (typeof first === 'string' && first.length <= 40) return 'tags';
    
    // Object-Array mit speziellen Keys
    if (typeof first === 'object' && first !== null) {
      if ('step' in first || 'phase' in first || 'action' in first) return 'steps';
      if ('date' in first || 'year' in first || 'time' in first) return 'timeline';
    }
    
    return 'list';
  }
  
  // Object
  if (typeof value === 'object') {
    // Feld-basierte Erkennung für Visualisierungen
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.gauge)) return 'gauge';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.radar)) return 'radar';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.pie)) return 'pie';
    if (matchesFieldPattern(fieldName, FIELD_PATTERNS.heatmap)) return 'heatmap';
    
    // Range: {min, max}
    if ('min' in value && 'max' in value) return 'range';
    
    // Location: {lat, lon}
    if ('lat' in value && ('lon' in value || 'lng' in value)) return 'map';
    
    // Stats: {value, unit}
    if ('value' in value && 'unit' in value) return 'stats';
    
    // Gauge: {value, max}
    if ('value' in value && 'max' in value && typeof value.value === 'number') return 'gauge';
    
    // Hierarchy: {children} oder {parent}
    if ('children' in value || 'parent' in value) return 'hierarchy';
    
    // Radar: alle Werte sind Zahlen
    const values = Object.values(value);
    if (values.length >= 3 && values.every(v => typeof v === 'number')) {
      return 'radar';
    }
    
    return 'object';
  }
  
  return 'text';
}

/**
 * Bestimmt Badge-Farbe basierend auf Wert
 */
export function getBadgeVariant(value: string): 'success' | 'danger' | 'warning' | 'muted' | 'default' {
  const lower = value.toLowerCase();
  
  if (BADGE_KEYWORDS.success.some(kw => lower.includes(kw))) return 'success';
  if (BADGE_KEYWORDS.danger.some(kw => lower.includes(kw))) return 'danger';
  if (BADGE_KEYWORDS.warning.some(kw => lower.includes(kw))) return 'warning';
  if (BADGE_KEYWORDS.muted.some(kw => lower.includes(kw))) return 'muted';
  
  return 'default';
}

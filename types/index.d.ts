/**
 * AMORPH Type Definitions
 * TypeScript definitions for JSDoc type checking
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/** Morph function signature - transforms data to DOM */
export type MorphFunction = (
  value: unknown,
  config?: MorphConfig,
  morphField?: (value: unknown, fieldName?: string) => HTMLElement | null
) => HTMLElement | null;

/** Configuration passed to morph functions */
export interface MorphConfig {
  label?: string;
  einheit?: string;
  unit?: string;
  farben?: Record<string, string>;
  colors?: Record<string, string>;
  maxLength?: number;
  maxLaenge?: number;
  sort?: boolean;
  showScale?: boolean;
  showSummary?: boolean;
  showReference?: boolean;
  showRank?: boolean;
  colorByValue?: boolean;
  annotation?: string;
  titel?: string;
  title?: string;
  [key: string]: unknown;
}

/** Detected data types */
export type DetectedType = 
  // Primitives
  | 'null' | 'boolean' | 'number' | 'string' | 'text'
  // Numbers
  | 'progress'
  // Strings
  | 'link' | 'image' | 'badge' | 'tag'
  // Arrays
  | 'array' | 'list' | 'sparkline' | 'heatmap' | 'lifecycle' | 'timeline' 
  | 'steps' | 'calendar' | 'radar' | 'hierarchy' | 'network' | 'severity'
  | 'pie' | 'bar' | 'slopegraph' | 'flow' | 'scatterplot' | 'groupedbar'
  | 'stackedbar' | 'boxplot' | 'dotplot' | 'lollipop' | 'sunburst' 
  | 'treemap' | 'bubble' | 'pictogram'
  // Objects
  | 'object' | 'map' | 'citation' | 'dosage' | 'currency' | 'gauge'
  | 'comparison' | 'stats' | 'range'
  // Unknown
  | 'unknown';

// ============================================================================
// DATA TYPES
// ============================================================================

/** Base item structure */
export interface DataItem {
  id?: string | number;
  slug?: string;
  name?: string;
  [key: string]: unknown;
}

/** Bar chart data point */
export interface BarDataPoint {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  change?: number;
  highlight?: boolean;
}

/** Radar chart data point */
export interface RadarDataPoint {
  axis: string;
  value: number;
}

/** Timeline event */
export interface TimelineEvent {
  date?: string;
  time?: string;
  event?: string;
  label?: string;
  description?: string;
}

/** Lifecycle phase */
export interface LifecyclePhase {
  phase?: string;
  stage?: string;
  duration?: string;
  description?: string;
}

/** Flow connection */
export interface FlowConnection {
  from: string;
  to: string;
  value?: number;
  weight?: number;
}

/** Network node */
export interface NetworkNode {
  name: string;
  connections?: string[];
  type?: string;
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

/** Detection configuration from morphs.yaml */
export interface DetectionConfig {
  badge?: {
    keywords?: string[];
    maxLength?: number;
  };
  progress?: {
    min?: number;
    max?: number;
    integersOnly?: boolean;
  };
  objekt?: Record<string, unknown>;
  array?: Record<string, unknown>;
}

/** Data source configuration */
export interface DataSourceConfig {
  quelle: {
    typ: 'json' | 'json-multi' | 'json-perspektiven' | 'json-universe' | 'json-universe-optimized' | 'pocketbase' | 'rest';
    url?: string;
    indexUrl?: string;
    baseUrl?: string;
    dataPath?: string;
    headers?: Record<string, string>;
    sammlung?: string;
  };
}

/** Feature configuration */
export interface FeatureConfig {
  aktiv?: string[];
  [featureName: string]: unknown;
}

/** Schema configuration */
export interface SchemaConfig {
  meta?: {
    nameField?: string;
    idField?: string;
    bildField?: string;
  };
  kern?: Record<string, unknown>;
  felder?: Record<string, unknown>;
  reihenfolge?: string[];
  semantik?: Record<string, unknown>;
  perspektiven?: Record<string, PerspectiveConfig>;
}

/** Perspective configuration */
export interface PerspectiveConfig {
  id: string;
  name: string;
  symbol: string;
  farben?: string[];
  colors?: string[];
  felder?: string[];
  fields?: string[];
  keywords?: string[];
}

// ============================================================================
// FEATURE TYPES
// ============================================================================

/** Feature context provided to feature init functions */
export interface FeatureContext {
  dom: HTMLDivElement;
  config: Readonly<Record<string, unknown>>;
  container: HTMLElement;
  dataSource: DataSource;
  on: (event: string, handler: EventListener) => void;
  emit: (event: string, detail?: unknown) => void;
  fetch: (query: QueryOptions) => Promise<DataItem[]>;
  search: (query: string) => Promise<DataItem[]>;
  requestRender: (detail?: Record<string, unknown>) => void;
  mount: (position?: InsertPosition) => void;
  destroy: () => void;
}

/** Query options for data source */
export interface QueryOptions {
  search?: string;
  limit?: number;
  offset?: number;
  filter?: string;
}

/** Data source interface */
export interface DataSource {
  query: (options: QueryOptions) => Promise<DataItem[]>;
  getBySlug: (slug: string) => Promise<DataItem | null>;
  getById: (id: string | number) => Promise<DataItem | null>;
  getMatchedTerms?: () => Set<string>;
  loadMore?: (offset: number, limit: number) => Promise<{ items: DataItem[]; hasMore: boolean }>;
  getTotalCount?: () => number;
  ensureFullData?: (activePerspectives?: string[]) => Promise<DataItem[]>;
}

// ============================================================================
// COMPARE TYPES
// ============================================================================

/** Item prepared for compare morphs */
export interface CompareItem {
  id: string;
  name: string;
  data: Record<string, unknown>;
  farbKlasse: string;
  farbe?: string;
  textFarbe?: string;
  lineFarbe?: string;
  bgFarbe?: string;
  glowFarbe?: string;
}

/** Color assignment for compare items */
export interface ColorAssignment {
  farbIndex: number;
  farbKlasse: string;
  fill: string;
  text: string;
  line: string;
  bg: string;
  glow: string;
}

// ============================================================================
// OBSERVER TYPES
// ============================================================================

/** Debug log entry */
export interface DebugEntry {
  time: string;
  elapsed: number;
  category: string;
  message: string;
  data: unknown;
  timestamp: number;
}

/** Debug observer stats */
export interface DebugStats {
  [category: string]: number;
}

// ============================================================================
// GLOBAL AUGMENTATION
// ============================================================================

declare global {
  interface Window {
    amorph?: {
      destroy: () => void;
      reload: () => Promise<void>;
      search: (query: string) => Promise<DataItem[]>;
      getData: () => DataItem[];
    };
    amorphObservers?: {
      interaction: unknown;
      rendering: unknown;
      session: unknown;
    };
    amorphObserverStats?: () => DebugStats;
  }
}

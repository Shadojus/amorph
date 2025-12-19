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
 * Formatiert Feldnamen human-readable
 * PROTEIN_G → Protein (g)
 * spore_size_um → Spore Size (µm)
 * snake_case → Title Case
 * _internal → Internal (removes leading underscore)
 */
export function formatFieldLabel(key) {
  // Bekannte Einheiten-Suffixe erkennen
  const unitMap = {
    '_g': ' (g)',
    '_mg': ' (mg)',
    '_ug': ' (µg)',
    '_um': ' (µm)',
    '_mm': ' (mm)',
    '_cm': ' (cm)',
    '_m': ' (m)',
    '_kg': ' (kg)',
    '_l': ' (L)',
    '_ml': ' (ml)',
    '_pct': ' (%)',
    '_percent': ' (%)'
  };
  
  let label = String(key || '');
  
  // Remove leading underscore if present
  if (label.startsWith('_')) {
    label = label.slice(1);
  }
  
  let unit = '';
  
  // Prüfe auf Einheit am Ende
  for (const [suffix, unitStr] of Object.entries(unitMap)) {
    if (label.toLowerCase().endsWith(suffix)) {
      unit = unitStr;
      label = label.slice(0, -suffix.length);
      break;
    }
  }
  
  // snake_case und UPPER_CASE zu Title Case
  label = label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  
  return label + unit;
}

/**
 * Sets the detection configuration (from morphs.yaml)
 */
export function setErkennungConfig(config) {
  detectionConfig = config?.erkennung || null;
  debug.detection('Detection config loaded', { 
    hasBadge: !!detectionConfig?.badge,
    hasProgress: !!detectionConfig?.progress,
    objectRules: Object.keys(detectionConfig?.objekt || {}).length,
    arrayRules: Object.keys(detectionConfig?.array || {}).length
  });
}

export function transform(daten, config, customMorphs = {}) {
  debug.render('Transform start', { 
    type: Array.isArray(daten) ? 'array' : typeof daten,
    count: Array.isArray(daten) ? daten.length : 1,
    configNull: config === null,
    configUndefined: config === undefined,
    datenNull: daten === null
  });
  
  // Load detection config from morphs.yaml if available
  if (!detectionConfig && config?.morphs?.erkennung) {
    setErkennungConfig(config.morphs);
  }
  
  const allMorphs = { ...morphs, ...customMorphs };
  
  // Load field morphs from schema (as fallback/override)
  const schemaFieldMorphs = getFeldMorphs();
  const hiddenFields = getVersteckteFelder();
  
  // Interne Felder die NIEMALS angezeigt werden sollen (System-Metadaten)
  const internalFields = new Set([
    '_baseUrl', '_loadedPerspectives', '_perspektiven', '_kingdom', 
    '_collection', '_indexData', '_cacheKey', '_timestamp'
  ]);
  
  function morphField(value, fieldName = null) {
    // Skip internal system fields (always hidden)
    if (fieldName && (internalFields.has(fieldName) || fieldName.startsWith('_'))) {
      return null;
    }
    
    // Skip hidden fields from schema
    if (fieldName && hiddenFields.includes(fieldName)) {
      return null;
    }
    
    // Skip empty values (null, undefined, empty strings, empty arrays)
    if (value === null || value === undefined) return null;
    if (value === '') return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return null;
    
    let type, morphName;
    try {
      type = detectType(value);
      morphName = findMorph(type, value, fieldName, config?.morphs, schemaFieldMorphs);
    } catch (detectError) {
      debug.error('Detection/findMorph failed', { 
        fieldName, 
        valueType: typeof value,
        valueNull: value === null,
        error: detectError.message 
      });
      throw detectError;
    }
    
    // Debug: Log type detection
    debug.detection('Type detection', { fieldName, type, morphName, valueType: typeof value, isArray: Array.isArray(value) });
    
    let morph = allMorphs[morphName];
    let actualMorphName = morphName;
    
    if (!morph) {
      debug.warn(`Morph not found: ${morphName}, using text`);
      morph = allMorphs.text;
      actualMorphName = 'text';
    }
    
    // Build config: morphs.yaml + schema.yaml field config
    const morphConfig = getMorphConfig(actualMorphName, fieldName, config);
    let element;
    try {
      element = morph(value, morphConfig, morphField);
    } catch (morphError) {
      debug.error('Morph execution failed', { 
        morphName: actualMorphName, 
        fieldName, 
        valueType: typeof value,
        error: morphError.message,
        stack: morphError.stack?.split('\n').slice(0, 3).join('\n')
      });
      throw morphError;
    }
    
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
    if (fieldName) {
      container.setAttribute('data-field', fieldName);
      // Human-readable Label
      container.setAttribute('data-label', formatFieldLabel(fieldName));
    }
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
        debug.render('Sorting item fields', { itemName: item.name, itemSlug: item.slug, keys: Object.keys(item).length });
        const sortedEntries = sortBySchemaOrder(item);
        
        // === STICKY HEADER: Bild + Name + wissenschaftlicher Name ===
        const headerFields = ['bild', 'image', 'name', 'wissenschaftlich', 'scientific_name'];
        const stickyHeader = document.createElement('div');
        stickyHeader.className = 'amorph-item-header';
        
        const scrollContent = document.createElement('div');
        scrollContent.className = 'amorph-item-content';
        
        // Debug: Check if medicine fields exist in item
        const medicineFields = ['medicineisch', 'traditionelle_medicine', 'therapeutische_kategorien', 'wirkungsprofil', 'wirkstoffe'];
        const presentMedicineFields = medicineFields.filter(f => f in item);
        if (presentMedicineFields.length > 0) {
          debug.warn('Item has medicine fields', { itemName: item.name, fields: presentMedicineFields, totalKeys: Object.keys(item).length });
        }
        
        for (const [key, value] of sortedEntries) {
          const morphed = morphField(value, key);
          if (morphed) {
            // Header-Felder in sticky header, Rest in scrollbaren Content
            if (headerFields.includes(key)) {
              stickyHeader.appendChild(morphed);
            } else {
              scrollContent.appendChild(morphed);
            }
          } else {
            // Debug: Why was the field not rendered?
            // Only warn if the field is not hidden and not empty
            const isEmptyArray = Array.isArray(value) && value.length === 0;
            const isEmptyObj = typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
            const isHidden = hiddenFields.includes(key) || key.startsWith('_');
            if (!isHidden && !isEmptyArray && !isEmptyObj && value !== null && value !== undefined && value !== '') {
              debug.warn('Field not rendered', { key, valueType: typeof value, isArray: Array.isArray(value), arrayLen: Array.isArray(value) ? value.length : 0 });
            }
          }
        }
        
        // Header nur hinzufügen wenn Inhalt
        if (stickyHeader.children.length > 0) {
          itemContainer.appendChild(stickyHeader);
        }
        // Content nur hinzufügen wenn Inhalt
        if (scrollContent.children.length > 0) {
          itemContainer.appendChild(scrollContent);
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

// Export für Tests
export function detectType(value) {
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

/* ═══════════════════════════════════════════════════════════════════════════════
 * NUMBER TYPE DETECTION (Kirk: Kontextgerechte Zahlen-Darstellung)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PROGRESS: 0-100 Ganzzahlen (Kirk: Fortschrittsbalken)
 *   → Prozentuale Werte, Completion-Status
 *   → Beispiel: 75, 100, 33
 * 
 * NUMBER: Alle anderen numerischen Werte
 *   → Werte >100 oder negative Werte
 *   → Dezimalwerte
 *   → Standardanzeige für beliebige Zahlen
 */
function detectNumberType(value) {
  const cfg = detectionConfig || {};
  
  // Progress: 0-100 Ganzzahlen - Kirk: Fortschrittsbalken
  const progress = cfg.progress || { min: 0, max: 100, integersOnly: true };
  if (value >= progress.min && value <= progress.max && (!progress.integersOnly || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STRING TYPE DETECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * LINK: URL-Pattern erkannt (http://, https://, www.)
 *   → Externe/interne Links, klickbar
 * 
 * IMAGE: Bildpfad erkannt (.jpg, .png, .webp, .svg, .gif)
 *   → Bildanzeige mit Vorschau
 * 
 * BADGE: Status-Keywords + kurze Länge (≤25 Zeichen)
 *   → Farbcodierte Status-Anzeigen: active, edible, toxic, etc.
 *   → Kirk: Semantische Farben für Zustände
 * 
 * TAG: Kurze Strings (≤20 Zeichen) ohne Status-Semantik
 *   → Kategorien, Labels, kurze Begriffe
 * 
 * TEXT: Alle anderen Strings
 *   → Standard-Textanzeige
 */
function detectStringType(value) {
  // Ensure value is a string before calling toLowerCase
  if (typeof value !== 'string') {
    return 'text';
  }
  const lower = value.toLowerCase().trim();
  const cfg = detectionConfig?.badge || {};
  
  /* ─── LINK: URL-Patterns ─── */
  if (/^https?:\/\/|^www\./i.test(value)) {
    return 'link';
  }
  
  /* ─── IMAGE: Bildpfade ─── */
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(value)) {
    return 'image';
  }
  
  /* ─── BADGE: Status-Keywords (kurz + semantisch bedeutsam) ─── */
  const keywords = cfg.keywords || [
    // Verfügbarkeit
    'active', 'inactive', 'yes', 'no', 'online', 'offline',
    'open', 'closed', 'available', 'unavailable', 'enabled', 'disabled',
    // Essbarkeit (Kirk: semantische Farben!)
    'edible', 'toxic', 'deadly', 'poisonous', 'choice', 'caution',
    'essbar', 'giftig', 'tödlich', 'bedingt',
    // Qualität/Status
    'good', 'bad', 'excellent', 'poor', 'warning', 'danger', 'safe',
    'pending', 'approved', 'rejected', 'complete', 'incomplete',
    // Kategorien
    'high', 'medium', 'low', 'critical', 'normal', 'none'
  ];
  const maxLength = cfg.maxLength || 25;
  
  // Ensure keywords are strings before comparison
  if (value.length <= maxLength && keywords.some(kw => typeof kw === 'string' && lower.includes(kw.toLowerCase()))) {
    return 'badge';
  }
  
  /* ─── TAG: Kurze Strings ohne Status-Bedeutung ─── */
  if (value.length <= 20 && !value.includes(' ') || value.length <= 15) {
    return 'tag';
  }
  
  return 'string';
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ARRAY TYPE DETECTION (Kirk: Chart-Auswahl nach Datenstruktur)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRIORITÄT: Spezifische Muster vor generischen!
 * 
 * SPARKLINE: Numerisches Array (alle Zahlen)
 *   → Kirk: Inline-Trends für Zeitreihen
 *   → Kompakte Darstellung von Entwicklungen
 *   → Beispiel: [12, 45, 23, 67, 34]
 * 
 * SLOPEGRAPH: Array mit vorher/nachher Struktur
 *   → Kirk: Vorher-Nachher-Vergleiche, Ranking-Änderungen
 *   → Beispiel: [{name: "A", vorher: 10, nachher: 20}, ...]
 * 
 * HEATMAP: 2D-Matrix (Array von Arrays mit Zahlen)
 *   → Kirk: Matrix-Visualisierung, Korrelationen
 *   → Beispiel: [[1,2,3], [4,5,6], [7,8,9]]
 * 
 * LIFECYCLE: Phase/Step-Struktur (Prozessschritte)
 *   → Lebenszyklus, Prozessabläufe mit Phasen
 *   → Beispiel: [{phase: "Spore", duration: "2 weeks"}, ...]
 * 
 * TIMELINE: Zeitbasierte Events (date/time/month)
 *   → Kirk: Zeitreihen mit Ereignissen
 *   → Beispiel: [{date: "2023-01", event: "Start"}, ...]
 * 
 * RADAR: Mehrdimensionale Daten (3+ Achsen)
 *   → Kirk: Profile, Skill-Charts, Vergleiche
 *   → Min. 3 Achsen benötigt!
 *   → Beispiel: [{axis: "Geschmack", value: 80}, ...]
 * 
 * HIERARCHY: Verschachtelte Ebenen (level/parent)
 *   → Taxonomien, Baumstrukturen
 *   → Beispiel: [{name: "Root", level: 0}, {name: "Child", level: 1}]
 * 
 * NETWORK: Beziehungsdaten (connections/relations)
 *   → Kirk: Netzwerk-Visualisierungen
 *   → Beispiel: [{name: "A", connections: ["B", "C"]}, ...]
 * 
 * STEPS: Prozessschritte (step/order)
 *   → Anleitungen, Workflows
 *   → Beispiel: [{step: 1, action: "Sammeln"}, ...]
 * 
 * CALENDAR: Monats/Saison-Daten
 *   → Verfügbarkeitskalender
 *   → Beispiel: [{month: "Jan", active: true}, ...]
 * 
 * PIE: Wenige Kategorien (≤6) mit label/value
 *   → Kirk: Proportionen, Anteile (max 6 Slices!)
 *   → Beispiel: [{label: "A", value: 30}, {label: "B", value: 70}]
 * 
 * BAR: Viele Kategorien (>6) mit label/value
 *   → Kirk: Kategorienvergleiche, Rankings
 *   → Beispiel: [{label: "Item1", value: 45}, ...]
 * 
 * SEVERITY: Schweregrade/Bedrohungen
 *   → Kirk: Kritische Werte hervorheben
 *   → Beispiel: [{typ: "Risiko", schwere: 80}, ...]
 * 
 * LIST: Fallback für alle anderen Arrays
 *   → Einfache Auflistung
 */
function detectArrayType(value) {
  if (value.length === 0) return 'array';
  
  const first = value[0];
  const cfg = detectionConfig?.array || {};
  
  // Helper: Array aus String oder Array
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  /* ═══════════════════════════════════════════════════════════════════════════════
   * KIRK SESSION 2 - NEUE HOCHPRIORITÄTS-MUSTER
   * Flow, Scatterplot, Groupedbar, Lollipop, Pictogram
   * 
   * WICHTIG: Reihenfolge ist entscheidend für eindeutige Erkennung!
   * Spezifischere Muster MÜSSEN vor generischeren kommen.
   * ═══════════════════════════════════════════════════════════════════════════════
   */
  
  // Ab hier: Objekt-Arrays prüfen (vor numerischen Arrays!)
  if (typeof first === 'object' && first !== null) {
    const keys = Object.keys(first);
    
    /* ─── FLOW: Organische Ströme/Verbindungen (DESIGN-BASIS!) ─── */
    // Kirk: Flow-Diagramme für Verbindungen zwischen Entitäten
    // SPEZIFISCH: Braucht BEIDE from UND to (nicht nur connections!)
    // Pattern 1: from/to Paare (EINDEUTIG für Flow!)
    const flowFromKeys = ['from', 'von', 'source', 'quelle'];
    const flowToKeys = ['to', 'nach', 'target', 'ziel'];
    const hasFlowFrom = flowFromKeys.some(k => k in first);
    const hasFlowTo = flowToKeys.some(k => k in first);
    const hasFlowFromTo = hasFlowFrom && hasFlowTo;
    // Pattern 2: Explizite flows/edges mit Gewichtung (nicht nur connections!)
    const hasExplicitFlows = ('flows' in first && Array.isArray(first.flows)) ||
                             ('edges' in first && Array.isArray(first.edges) && 
                              first.edges[0] && ('weight' in first.edges[0] || 'value' in first.edges[0]));
    if (hasFlowFromTo || hasExplicitFlows) {
      return 'flow';
    }
    
    /* ─── PICTOGRAM: Zählbare Mengen mit EXPLIZITEM Icon ─── */
    // Kirk: Isotype-inspirierte Icon-Wiederholung
    // SPEZIFISCH: Braucht icon/symbol/emoji UND count/anzahl
    const pictogramIconKeys = ['icon', 'symbol', 'emoji'];
    const pictogramCountKeys = ['count', 'anzahl'];
    const hasIcon = pictogramIconKeys.some(k => k in first);
    const hasPictogramCount = pictogramCountKeys.some(k => k in first && typeof first[k] === 'number');
    // NUR wenn explizites Icon vorhanden - sonst andere Morphs!
    if (hasIcon && hasPictogramCount) {
      return 'pictogram';
    }
    
    /* ─── SCATTERPLOT: X/Y Koordinaten für Korrelationsanalyse ─── */
    // Kirk: Streudiagramm mit Trendlinie
    // SPEZIFISCH: Braucht EXPLIZITE x/y Keys (nicht beliebige numerische!)
    const hasExplicitXY = ('x' in first && 'y' in first && 
                          typeof first.x === 'number' && typeof first.y === 'number');
    if (hasExplicitXY) {
      return 'scatterplot';
    }
    
    /* ─── GROUPEDBAR: Mehrere Serien pro Kategorie ─── */
    // Kirk: Gruppierte Balken für Mehrfachvergleiche (Messi Goals/Games)
    // SPEZIFISCH: Braucht Kategorie-Key UND mindestens 2 BENANNTE numerische Serien
    // Die Serien-Keys sollten keine generischen value/wert sein!
    const categoryKeys = ['kategorie', 'category', 'jahr', 'year'];
    const hasGroupedCategory = categoryKeys.some(k => k in first);
    // Numerische Keys die NICHT generisch sind (value, wert, count, etc.)
    const genericValueKeys = ['value', 'wert', 'count', 'anzahl', 'amount', 'menge', 'score', 'x', 'y', 'id', 'index'];
    const seriesKeys = keys.filter(k => 
      typeof first[k] === 'number' && 
      !categoryKeys.includes(k) && 
      !genericValueKeys.includes(k)
    );
    // Groupedbar NUR wenn spezifische Serien-Namen (wie "tore", "spiele", "goals", "games")
    if (hasGroupedCategory && seriesKeys.length >= 2) {
      return 'groupedbar';
    }
    
    /* ─── LOLLIPOP: Rankings mit Divergenz oder explizitem Rank ─── */
    // Kirk: Elegante Alternative zum Balkendiagramm
    // SPEZIFISCH: Braucht rank/position ODER divergierende (pos+neg) Werte
    const lollipopRankKeys = ['rank', 'ranking', 'position', 'platz'];
    const hasRankingHint = lollipopRankKeys.some(k => k in first);
    const lollipopValueKeys = ['gap', 'abweichung', 'difference', 'differenz', 'delta'];
    const hasLollipopValue = lollipopValueKeys.some(k => k in first && typeof first[k] === 'number');
    // Pattern 1: Expliziter Rank
    if (hasRankingHint) {
      return 'lollipop';
    }
    // Pattern 2: Divergierende Werte (mindestens ein negativer)
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
    
    /* ─── BOXPLOT: Statistische Verteilungen (5-Number Summary) ─── */
    // Kirk: Box-and-Whisker für Verteilungsanalyse
    // SPEZIFISCH: Braucht min, q1, median, q3, max (oder Teilmenge davon)
    const boxplotKeys = ['min', 'q1', 'median', 'q3', 'max', 'quartile1', 'quartile3', 'iqr'];
    const boxplotMatches = boxplotKeys.filter(k => k in first).length;
    // Mindestens 3 dieser Keys (z.B. min, median, max ODER q1, median, q3)
    if (boxplotMatches >= 3) {
      return 'boxplot';
    }
    
    /* ─── BUBBLE: Proportionale Kreise (size/radius) ─── */
    // Kirk: Bubble Charts für Mengenvergleiche
    // SPEZIFISCH: Braucht size/radius/r + label/name ABER KEINE children (das wäre Treemap/Sunburst!)
    const bubbleSizeKeys = ['size', 'radius', 'r', 'groesse', 'magnitude', 'area'];
    const bubbleLabelKeys = ['label', 'name', 'bezeichnung', 'titel'];
    const hasBubbleSize = bubbleSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasBubbleLabel = bubbleLabelKeys.some(k => k in first);
    const hasBubbleChildren = 'children' in first && Array.isArray(first.children);
    // Bubble NUR wenn explizit size/radius vorhanden UND KEINE children
    if (hasBubbleSize && hasBubbleLabel && !hasBubbleChildren) {
      return 'bubble';
    }
    
    /* ─── SUNBURST: Radiale Hierarchie (children + value) ─── */
    // Kirk: Konzentrische Ringe für hierarchische Proportionen
    // SPEZIFISCH: Braucht children Array + value/size
    // Unterschied zu Treemap: Sunburst ist radial, hat KEIN change (Treemap-Ding)
    const hasSunburstChildren = 'children' in first && Array.isArray(first.children);
    const hasSunburstValue = ('value' in first || 'size' in first || 'wert' in first) && 
                             typeof (first.value ?? first.size ?? first.wert) === 'number';
    const hasSunburstChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    // Sunburst: hierarchisch mit children + Werten ABER OHNE change (das wäre Treemap)
    if (hasSunburstChildren && hasSunburstValue && !hasSunburstChange) {
      return 'sunburst';
    }
    
    /* ─── TREEMAP: Flächenproportionale Kacheln ─── */
    // Kirk: Treemap für hierarchische Teil-Ganzes-Beziehungen
    // SPEZIFISCH: Braucht children Array ODER items mit size/value in flacher Struktur
    // Unterschied zu Sunburst: Treemap ist rechteckig, hat oft `change` für Veränderung
    // Pattern 1: Hierarchisch mit children (ohne radiale Sunburst-Präferenz)
    const hasTreemapChildren = 'children' in first && Array.isArray(first.children);
    // Pattern 2: Flache Struktur mit size/value + optional change/veraenderung
    const treemapSizeKeys = ['size', 'value', 'wert', 'area', 'flaeche'];
    const hasTreemapSize = treemapSizeKeys.some(k => k in first && typeof first[k] === 'number');
    const hasTreemapChange = 'change' in first || 'veraenderung' in first || 'delta' in first;
    // Treemap wenn hierarchisch mit children
    if (hasTreemapChildren) {
      return 'treemap';
    }
    // ODER wenn flach mit size + change (für Change-Treemaps wie FinViz)
    if (hasTreemapSize && hasTreemapChange && value.length >= 3) {
      return 'treemap';
    }
    
    /* ─── STACKEDBAR: Gestapelte Balken (Teile summieren sich) ─── */
    // Kirk: 100% Stacked Bar für Teil-Ganzes-Verhältnisse
    // SPEZIFISCH: Braucht segments/teile Array ODER mehrere %-Werte
    const stackedSegmentKeys = ['segments', 'teile', 'parts', 'anteile', 'slices'];
    const hasStackedSegments = stackedSegmentKeys.some(k => k in first && Array.isArray(first[k]));
    // Pattern 2: Mehrere Prozentwerte die sich zu ~100 summieren
    const percentKeys = keys.filter(k => {
      const val = first[k];
      return typeof val === 'number' && val >= 0 && val <= 100;
    });
    const percentSum = percentKeys.reduce((sum, k) => sum + first[k], 0);
    const looksLikePercents = percentKeys.length >= 2 && percentSum >= 95 && percentSum <= 105;
    if (hasStackedSegments) {
      return 'stackedbar';
    }
    // Stacked wenn es wie Prozente aussieht UND Kategorie vorhanden
    const hasStackedCategory = ('kategorie' in first || 'category' in first || 'label' in first || 'name' in first);
    if (looksLikePercents && hasStackedCategory && percentKeys.length >= 3) {
      return 'stackedbar';
    }
    
    /* ─── DOTPLOT: Kategorie-Scatter (einzelne Punkte pro Kategorie) ─── */
    // Kirk: Dotplot für Verteilungen innerhalb Kategorien
    // SPEZIFISCH: Braucht kategorie + punkte/points Array ODER werte Array
    const dotplotPointKeys = ['punkte', 'points', 'werte', 'values', 'dots'];
    const hasDotplotPoints = dotplotPointKeys.some(k => k in first && Array.isArray(first[k]));
    const hasDotplotCategory = ('kategorie' in first || 'category' in first || 'gruppe' in first || 'group' in first);
    if (hasDotplotPoints && hasDotplotCategory) {
      return 'dotplot';
    }
  }
  
  /* ─── SPARKLINE: Rein numerisches Array → Inline-Trend ─── */
  // Kirk: Sparklines für kompakte Zeitreihen-Darstellung
  if (value.every(v => typeof v === 'number')) {
    // Mindestens 3 Werte für einen sinnvollen Trend
    if (value.length >= 3) {
      return 'sparkline';
    }
    return 'bar'; // Fallback für 2 Werte
  }
  
  /* ─── HEATMAP: 2D-Matrix (Array von Arrays) ─── */
  // Kirk: Heatmap für Matrix-Daten, Korrelationen
  if (value.every(v => Array.isArray(v) && v.every(n => typeof n === 'number'))) {
    if (value.length >= 2 && value[0].length >= 2) {
      return 'heatmap';
    }
  }
  
  // Ab hier: Array von Objekten (existierende Logik)
  if (typeof first !== 'object' || first === null) {
    return 'array';
  }
  
  const keys = Object.keys(first);
  
  /* ─── SLOPEGRAPH: Vorher-Nachher Vergleich ─── */
  // Kirk: Slopegraph zeigt Veränderungen zwischen zwei Zeitpunkten
  // SPEZIFISCH: Braucht ZWEI der vorher/nachher Keys UND name/label
  const slopeKeys = ['vorher', 'nachher', 'before', 'after', 'start', 'end', 'v1', 'v2', 'alt', 'neu'];
  const hasSlopeStructure = slopeKeys.filter(k => k in first).length >= 2;
  const hasSlopeName = 'name' in first || 'label' in first;
  if (hasSlopeStructure && hasSlopeName) {
    return 'slopegraph';
  }
  
  /* ─── LIFECYCLE: Phasen/Stadien eines Prozesses ─── */
  // Lebenszyklus mit phase/stadium/stage
  const lifecycleKeys = ['phase', 'stage', 'stadium', 'schritt', 'stufe'];
  if (lifecycleKeys.some(k => k in first)) {
    return 'lifecycle';
  }
  
  /* ─── STEPS: Schrittweise Anleitungen ─── */
  // Workflows, Anleitungen mit step/order + label/action/beschreibung
  const stepsKeys = ['step', 'order', 'nummer', 'reihenfolge'];
  if (stepsKeys.some(k => k in first) && ('action' in first || 'beschreibung' in first || 'text' in first || 'label' in first)) {
    return 'steps';
  }
  
  /* ─── TIMELINE: Zeitbasierte Ereignisse ─── */
  // Kirk: Zeitreihen mit date/time/month
  const timelineCfg = cfg.timeline || {};
  const timelineKeys = ensureArray(timelineCfg.requiredKeys, ['date', 'time', 'datum', 'zeit', 'period', 'year', 'jahr']);
  if (timelineKeys.some(k => k in first) && ('event' in first || 'ereignis' in first || 'description' in first || 'label' in first)) {
    return 'timeline';
  }
  
  /* ─── CALENDAR: Monats/Saison-Kalender ─── */
  // Verfügbarkeitskalender mit month/monat + active
  const calendarKeys = ['month', 'monat', 'saison', 'season'];
  if (calendarKeys.some(k => k in first) && ('active' in first || 'aktiv' in first || 'available' in first)) {
    return 'calendar';
  }
  
  /* ─── RADAR: Mehrdimensionale Profile (min 3 Achsen!) ─── */
  // Kirk: Radar für Profile, Skill-Charts
  const radarCfg = cfg.radar || {};
  const radarKeys = ensureArray(radarCfg.requiredKeys, ['axis', 'achse', 'dimension', 'factor', 'faktor', 'kategorie']);
  const radarValueKeys = ['value', 'wert', 'score', 'rating', 'level'];
  const hasRadarAxis = radarKeys.some(k => k in first);
  const hasRadarValue = radarValueKeys.some(k => k in first);
  if (value.length >= 3 && hasRadarAxis && hasRadarValue) {
    return 'radar';
  }
  
  /* ─── HIERARCHY: Verschachtelte Strukturen ─── */
  // Taxonomien, Baumstrukturen mit level/rank/parent/children
  const hierarchyKeys = ['level', 'ebene', 'parent', 'children', 'kinder', 'rank', 'taxonomy'];
  if (hierarchyKeys.some(k => k in first)) {
    return 'hierarchy';
  }
  
  /* ─── NETWORK: Beziehungsnetzwerke (NICHT Flow!) ─── */
  // Kirk: Connection/Flow Diagramme
  // UNTERSCHEIDUNG zu Flow:
  // - Flow: hat from/to ODER edges mit weight → organische Ströme
  // - Network: hat connections/relations OHNE from/to → Knotennetzwerk
  // Pattern 1: Explizite connections Array (OHNE from/to!)
  const networkConnectionKeys = ['connections', 'relations', 'verbindungen'];
  const networkNameKeys = ['name', 'partner', 'organism'];
  const networkTypeKeys = ['type', 'relationship', 'typ', 'beziehung'];
  // Prüfe ob NICHT Flow-Pattern (from/to)
  const flowFromKeys = ['from', 'von', 'source', 'quelle'];
  const flowToKeys = ['to', 'nach', 'target', 'ziel'];
  const hasFlowPattern = flowFromKeys.some(k => k in first) && flowToKeys.some(k => k in first);
  // Network nur wenn connections OHNE Flow-Pattern
  const hasNetworkConnections = networkConnectionKeys.some(k => k in first && Array.isArray(first[k]));
  const hasNetworkStructure = networkNameKeys.some(k => k in first) && networkTypeKeys.some(k => k in first);
  if (!hasFlowPattern && (hasNetworkConnections || hasNetworkStructure)) {
    return 'network';
  }
  
  /* ─── SEVERITY: Schweregrad/Warnungen ─── */
  // Kirk: Kritische Werte visuell hervorheben
  // Unterstützt numerische Werte (0-100) und String-Level (trivial, minor, moderate, severe, critical)
  const severityKeys = ['schwere', 'severity', 'level', 'bedrohung', 'risiko', 'gefahr', 'grade'];
  const severityTypeKeys = ['typ', 'type', 'art', 'kategorie', 'label'];
  const severityStringLevels = ['trivial', 'minor', 'moderate', 'severe', 'critical', 'gering', 'mittel', 'hoch', 'kritisch'];
  const hasSeverityValue = severityKeys.some(k => {
    if (!(k in first)) return false;
    const val = first[k];
    // Numerisch: 0-100
    if (typeof val === 'number') return true;
    // String-Level
    if (typeof val === 'string' && severityStringLevels.includes(val.toLowerCase())) return true;
    return false;
  });
  const hasSeverityType = severityTypeKeys.some(k => k in first);
  if (hasSeverityValue && hasSeverityType) {
    return 'severity';
  }
  
  /* ─── PIE vs BAR: Label/Value Strukturen ─── */
  // Kirk: Pie für wenige Kategorien (≤6), Bar für viele (>6)
  const labelKeys = ['label', 'name', 'kategorie', 'category', 'item', 'typ', 'type', 'method', 'methode'];
  const valueKeys = ['value', 'wert', 'count', 'anzahl', 'amount', 'menge', 'score', 'percent', 'prozent', 'suitability', 'rating'];
  const hasLabel = labelKeys.some(k => k in first);
  const hasValue = valueKeys.some(k => k in first && typeof first[k] === 'number');
  
  if (hasLabel && hasValue) {
    // Kirk: Pie max 6 Slices, darüber Bar Chart
    return value.length <= 6 ? 'pie' : 'bar';
  }
  
  /* ─── BAR: Nur Value (ohne explizites Label) ─── */
  // Index wird als Label verwendet
  if (hasValue && !hasLabel) {
    return 'bar';
  }
  
  return 'array';
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * OBJECT TYPE DETECTION (Kirk: Chart-Auswahl nach Datenstruktur)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRIORITÄT: Spezifische Muster vor generischen!
 * 
 * MAP: Geografische Koordinaten (lat/lng)
 *   → Kirk: Geografische Visualisierungen
 *   → Beispiel: {lat: 48.1, lng: 11.5, name: "München"}
 * 
 * CITATION: Quellenangaben (author/year/title)
 *   → Wissenschaftliche Referenzen
 *   → Beispiel: {author: "Kirk", year: 2016, title: "Data Vis"}
 * 
 * DOSAGE: Dosierungsangaben (dose/amount + unit)
 *   → Medizinische/Rezept-Daten
 *   → Beispiel: {dose: 500, unit: "mg", frequency: "daily"}
 * 
 * CURRENCY: Währungsangaben (amount + currency)
 *   → Finanzielle Werte
 *   → Beispiel: {amount: 19.99, currency: "EUR"}
 * 
 * GAUGE: Score mit Min/Max/Zonen
 *   → Kirk: Tachometer-Anzeigen für Scores
 *   → Beispiel: {value: 75, min: 0, max: 100, zones: [...]}
 * 
 * SLOPEGRAPH: Objekt mit vorher/nachher Sub-Objekten
 *   → Kirk: Vorher-Nachher-Vergleiche
 *   → Beispiel: {vorher: {A: 10}, nachher: {A: 20}}
 * 
 * STATS: Statistische Kennzahlen (min/max/avg)
 *   → Kirk: Box-Plots, Verteilungsanalysen
 *   → Beispiel: {min: 5, max: 100, avg: 42, median: 38}
 * 
 * RANGE: Nur Min/Max (ohne weitere Stats)
 *   → Wertebereiche, Spannen
 *   → Beispiel: {min: 10, max: 25}
 * 
 * PROGRESS: Fortschritt (value/current + max/total)
 *   → Fortschrittsbalken
 *   → Beispiel: {current: 75, total: 100}
 * 
 * BADGE: Status-Objekte (status/variant)
 *   → Kirk: Semantische Farben für Zustände
 *   → Beispiel: {status: "active", label: "Online"}
 * 
 * PIE: Nur numerische Werte (2-8 Keys)
 *   → Kirk: Proportionen, Anteile
 *   → Beispiel: {Protein: 26, Fett: 8, Kohlenhydrate: 52}
 * 
 * OBJECT: Fallback für komplexe Objekte
 *   → Rekursive Darstellung
 */
function detectObjectType(value) {
  const keys = Object.keys(value);
  const cfg = detectionConfig?.objekt || {};
  
  // Helper: Array aus String oder Array
  const ensureArray = (val, fallback) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim());
    return fallback;
  };
  
  /* ─── MAP: Geografische Koordinaten ─── */
  // Kirk: Choropleth Maps, Symbol Maps
  const mapKeys = ['lat', 'latitude', 'lng', 'longitude', 'lon', 'breitengrad', 'laengengrad'];
  const hasCoordinates = mapKeys.filter(k => k in value).length >= 2;
  if (hasCoordinates) {
    return 'map';
  }
  
  /* ─── CITATION: Quellenangaben ─── */
  // Wissenschaftliche Referenzen
  const citationKeys = ['author', 'autor', 'authors', 'autoren', 'year', 'jahr', 'title', 'titel'];
  const citationMatches = citationKeys.filter(k => k in value).length;
  if (citationMatches >= 2) {
    return 'citation';
  }
  
  /* ─── DOSAGE: Dosierungsangaben ─── */
  // Medizinische Daten
  const dosageKeys = ['dose', 'dosis', 'dosierung', 'amount', 'menge'];
  const dosageUnitKeys = ['unit', 'einheit', 'frequency', 'frequenz'];
  const hasDosage = dosageKeys.some(k => k in value) && dosageUnitKeys.some(k => k in value);
  if (hasDosage) {
    return 'dosage';
  }
  
  /* ─── CURRENCY: Währungsangaben ─── */
  // Finanzielle Werte
  const currencyKeys = ['currency', 'waehrung', 'curr'];
  const amountKeys = ['amount', 'betrag', 'price', 'preis', 'cost', 'kosten'];
  const hasCurrency = currencyKeys.some(k => k in value) && amountKeys.some(k => k in value);
  if (hasCurrency) {
    return 'currency';
  }
  
  /* ─── GAUGE: Score mit Zonen/Bereichen ─── */
  // Kirk: Tachometer für Scores
  const hasGaugeValue = ('value' in value || 'wert' in value || 'score' in value);
  const hasGaugeZones = ('zones' in value || 'zonen' in value || 'bereiche' in value);
  const hasGaugeMinMax = ('min' in value && 'max' in value);
  if (hasGaugeValue && (hasGaugeZones || hasGaugeMinMax)) {
    // Unterscheide Gauge von Stats: Gauge hat Zonen oder ist ein einzelner Score
    if (hasGaugeZones || (!('avg' in value) && !('mean' in value) && !('median' in value))) {
      return 'gauge';
    }
  }
  
  /* ─── COMPARISON: Einfacher Vorher-Nachher-Vergleich mit Zahlen ─── */
  // Einzelwerte: vorher/nachher als Zahlen (nicht Objekte!)
  const comparisonKeys = ['vorher', 'nachher', 'before', 'after', 'from', 'to', 'alt', 'neu'];
  const comparisonMatches = comparisonKeys.filter(k => k in value && typeof value[k] === 'number').length;
  if (comparisonMatches >= 2) {
    return 'comparison';
  }
  
  // Jahres-Vergleich mit Zahlen: {2020: 500, 2024: 300}
  const yearKeys = keys.filter(k => /^\d{4}$/.test(k));
  if (yearKeys.length >= 2 && yearKeys.every(k => typeof value[k] === 'number')) {
    return 'comparison';
  }
  
  /* ─── SLOPEGRAPH: Objekt mit vorher/nachher Sub-Objekten ─── */
  // Kirk: Vorher-Nachher Vergleich auf Objekt-Ebene (komplexe Daten)
  const slopeObjKeys = ['vorher', 'nachher', 'before', 'after'];
  const hasSlopeObjects = slopeObjKeys.filter(k => k in value && typeof value[k] === 'object').length >= 2;
  if (hasSlopeObjects) {
    return 'slopegraph';
  }
  
  // Jahres-Vergleich mit Objekten: {2020: {...}, 2023: {...}}
  const jahrKeys = keys.filter(k => /^\d{4}$/.test(k));
  if (jahrKeys.length >= 2 && jahrKeys.every(k => typeof value[k] === 'object')) {
    return 'slopegraph';
  }
  
  /* ─── STATS: Statistische Kennzahlen ─── */
  // Kirk: Box-Plots, Verteilungen
  const statsCfg = cfg.stats || {};
  const statsKeys = ensureArray(statsCfg.requiredKeys, ['min', 'max', 'avg', 'mean', 'median', 'durchschnitt', 'mittelwert']);
  const statsMatches = statsKeys.filter(k => k in value).length;
  if (statsMatches >= 3) {
    return 'stats';
  }
  
  /* ─── RANGE: Min/Max Bereich ─── */
  // Wertebereiche (einfacher als Stats)
  const rangeCfg = cfg.range || {};
  const rangeKeys = ensureArray(rangeCfg.requiredKeys, ['min', 'max']);
  if (rangeKeys.every(k => k in value) && statsMatches < 3) {
    return 'range';
  }
  
  /* ─── PROGRESS: Fortschrittsanzeige ─── */
  // Fortschrittsbalken
  const progressCfg = cfg.progress || {};
  const progressKeys = ensureArray(progressCfg.requiredKeys, ['value', 'wert', 'current', 'aktuell', 'progress', 'fortschritt']);
  const progressMaxKeys = ['max', 'total', 'gesamt', 'von'];
  const hasProgressValue = progressKeys.some(k => k in value);
  const hasProgressMax = progressMaxKeys.some(k => k in value);
  if (hasProgressValue && hasProgressMax) {
    return 'progress';
  }
  
  /* ─── BADGE: Status-Objekte ─── */
  // Kirk: Semantische Farben für Zustände
  const badgeCfg = cfg.badge || {};
  const badgeKeys = ensureArray(badgeCfg.requiredKeys, ['status']);
  const badgeAltKeys = ensureArray(badgeCfg.alternativeKeys, ['variant', 'typ', 'type', 'zustand', 'state']);
  if (badgeKeys.some(k => k in value) || badgeAltKeys.some(k => k in value)) {
    return 'badge';
  }
  
  /* ─── PIE: Nur numerische Werte ─── */
  // Kirk: Pie Charts für Proportionen (MAX 6 Kategorien!)
  const pieCfg = cfg.pie || { numericOnly: true, minKeys: 2, maxKeys: 6 };
  const allNumeric = keys.every(k => typeof value[k] === 'number');
  if (pieCfg.numericOnly && allNumeric && 
      keys.length >= (pieCfg.minKeys || 2) && 
      keys.length <= (pieCfg.maxKeys || 6)) {
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
    'progress': 'progress',
    'stats': 'stats',
    'timeline': 'timeline',
    'badge': 'badge',
    'lifecycle': 'lifecycle',
    'tag': 'tag',
    
    // New Kirk-based morphs (Session 1)
    'sparkline': 'sparkline',
    'slopegraph': 'slopegraph',
    'heatmap': 'heatmap',
    'bubble': 'bubble',
    'boxplot': 'boxplot',
    'treemap': 'treemap',
    'stackedbar': 'stackedbar',
    'dotplot': 'dotplot',
    'sunburst': 'sunburst',
    
    // New Kirk-based morphs (Session 2)
    'flow': 'flow',
    'groupedbar': 'groupedbar',
    'scatterplot': 'scatterplot',
    'lollipop': 'lollipop',
    'pictogram': 'pictogram',
    
    // Extended morphs
    'map': 'map',
    'citation': 'citation',
    'dosage': 'dosage',
    'currency': 'currency',
    'gauge': 'gauge',
    'hierarchy': 'hierarchy',
    'network': 'network',
    'steps': 'steps',
    'calendar': 'calendar',
    'severity': 'severity',
    'comparison': 'comparison',
    'link': 'link',
    'image': 'image'
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
    count: Array.isArray(data) ? data.length : (data ? 1 : 0),
    dataType: typeof data,
    isArray: Array.isArray(data),
    configKeys: config ? Object.keys(config) : null
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
  
  try {
    debug.render('Calling transform', { dataLength: Array.isArray(data) ? data.length : 1 });
    const dom = transform(data, config);
    debug.render('Transform complete, appending to container');
    container.appendChild(dom);
  } catch (transformError) {
    debug.error('Transform failed', { 
      error: transformError.message, 
      stack: transformError.stack?.split('\n').slice(0, 5).join('\n')
    });
    throw transformError;
  }
  
  const count = Array.isArray(data) ? data.length : 1;
  debug.render('Render complete', { count });
  
  container.dispatchEvent(new CustomEvent('amorph:rendered', {
    detail: { count, timestamp: Date.now() }
  }));
}

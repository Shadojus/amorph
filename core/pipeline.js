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
 */
function formatFieldLabel(key) {
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
            const isEmptyArray = Array.isArray(value) && value.length === 0;
            const isEmptyObj = typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
            if (!isEmptyArray && !isEmptyObj && value !== null && value !== undefined && value !== '') {
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

/* ═══════════════════════════════════════════════════════════════════════════════
 * NUMBER TYPE DETECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * RATING: 0-10 mit Dezimalstellen (z.B. 7.5, 8.2)
 *   → Kleine Skala, typisch für Bewertungen
 *   → Dezimalen zeigen Präzision (vs. ganzzahlige Progress-Werte)
 * 
 * PROGRESS: 0-100 Ganzzahlen (z.B. 75, 100)
 *   → Prozentuale Werte, Fortschrittsbalken
 *   → Ganzzahlen unterscheiden von Rating
 * 
 * NUMBER: Alle anderen numerischen Werte
 *   → Standardanzeige für beliebige Zahlen
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
  
  // Ab hier: Array von Objekten
  if (typeof first !== 'object' || first === null) {
    return 'array';
  }
  
  const keys = Object.keys(first);
  
  /* ─── SLOPEGRAPH: Vorher-Nachher Vergleich ─── */
  // Kirk: Slopegraph zeigt Veränderungen zwischen zwei Zeitpunkten
  const slopeKeys = ['vorher', 'nachher', 'before', 'after', 'start', 'end', 'v1', 'v2', 'alt', 'neu'];
  const hasSlopeStructure = slopeKeys.filter(k => k in first).length >= 2;
  if (hasSlopeStructure && 'name' in first || 'label' in first) {
    return 'slopegraph';
  }
  
  /* ─── LIFECYCLE: Phasen/Stadien eines Prozesses ─── */
  // Lebenszyklus mit phase/stadium/stage
  const lifecycleKeys = ['phase', 'stage', 'stadium', 'schritt', 'stufe'];
  if (lifecycleKeys.some(k => k in first)) {
    return 'lifecycle';
  }
  
  /* ─── STEPS: Schrittweise Anleitungen ─── */
  // Workflows, Anleitungen mit step/order
  const stepsKeys = ['step', 'order', 'nummer', 'reihenfolge'];
  if (stepsKeys.some(k => k in first) && ('action' in first || 'beschreibung' in first || 'text' in first)) {
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
  // Taxonomien, Baumstrukturen
  const hierarchyKeys = ['level', 'ebene', 'parent', 'children', 'kinder'];
  if (hierarchyKeys.some(k => k in first)) {
    return 'hierarchy';
  }
  
  /* ─── NETWORK: Beziehungsnetzwerke ─── */
  // Kirk: Connection/Flow Diagramme
  const networkKeys = ['connections', 'relations', 'verbindungen', 'links', 'edges'];
  if (networkKeys.some(k => k in first)) {
    return 'network';
  }
  
  /* ─── SEVERITY: Schweregrad/Warnungen ─── */
  // Kirk: Kritische Werte visuell hervorheben
  const severityKeys = ['schwere', 'severity', 'level', 'bedrohung', 'risiko', 'gefahr'];
  const severityTypeKeys = ['typ', 'type', 'art', 'kategorie'];
  const hasSeverityValue = severityKeys.some(k => k in first && typeof first[k] === 'number');
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
 * RATING: Bewertungen (rating/score/stars)
 *   → Kirk: Rating-Anzeigen mit Sternen/Punkten
 *   → Beispiel: {rating: 4.5, max: 5}
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
  
  /* ─── SLOPEGRAPH: Objekt mit vorher/nachher ─── */
  // Kirk: Vorher-Nachher Vergleich auf Objekt-Ebene
  const slopeObjKeys = ['vorher', 'nachher', 'before', 'after'];
  const hasSlopeObjects = slopeObjKeys.filter(k => k in value && typeof value[k] === 'object').length >= 2;
  if (hasSlopeObjects) {
    return 'slopegraph';
  }
  
  // Jahres-Vergleich: {2020: {...}, 2023: {...}}
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
  
  /* ─── RATING: Bewertungen ─── */
  // Kirk: Sterne/Punkte-Bewertungen
  const ratingCfg = cfg.rating || {};
  const ratingKeys = ensureArray(ratingCfg.requiredKeys, ['rating', 'bewertung']);
  const ratingAltKeys = ensureArray(ratingCfg.alternativeKeys, ['score', 'stars', 'sterne', 'punkte']);
  if (ratingKeys.some(k => k in value) || ratingAltKeys.some(k => k in value)) {
    return 'rating';
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
  // Kirk: Pie Charts für Proportionen (2-8 Kategorien)
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
    'lifecycle': 'lifecycle',
    'tag': 'tag',
    
    // New Kirk-based morphs
    'sparkline': 'sparkline',
    'slopegraph': 'slopegraph',
    'heatmap': 'heatmap',
    
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

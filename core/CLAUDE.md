# Core

Das Herz von AMORPH - Konfiguration, Transformation, Container.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `config.js` | 543 | YAML-Konfigurationsloader, Schema modular |
| `pipeline.js` | 880 | Daten → DOM Transformation, Typ-Erkennung |
| `container.js` | 72 | Web Component `<amorph-container>` |

---

## config.js

Lädt alle YAML-Konfigurationen mit Cache-Busting.

### Haupt-Export

```javascript
loadConfig(basePath = './config/') → Promise<{
  manifest,    // App-Name, Version, Branding
  daten,       // Datenquellen-Config
  morphs,      // Morph-Erkennung, Farben, Config
  features,    // Aktive Features
  observer,    // Debug-Config
  schema       // Modulares Schema
}>
```

### Config-Dateien (CONFIG_FILES)

```javascript
['manifest.yaml', 'daten.yaml', 'morphs.yaml', 'observer.yaml', 'features.yaml']
```

- `manifest.yaml` + `daten.yaml` = **required**
- Andere = optional

### Schema modular laden (loadSchemaModular)

```javascript
schema = {
  meta: {},           // aus basis.yaml (nameField, idField, bildField)
  kern: {},           // aus basis.yaml (Kern-Felder)
  felder: {},         // aus kern kopiert
  reihenfolge: [],    // aus Perspektiven abgeleitet
  semantik: {},       // aus semantik.yaml
  perspektiven: {}    // aus perspektiven/*.yaml
}
```

**Lade-Reihenfolge:**
1. `schema/basis.yaml` - meta, kern, erkennung
2. `schema/semantik.yaml` - Suche-Mappings
3. `schema/perspektiven/index.yaml` - aktive Perspektiven
4. `schema/perspektiven/*.yaml` - jede Perspektive mit felder, farben, keywords

### Morphs modular laden (loadMorphsModular)

```javascript
morphs = {
  erkennung: {
    badge: { keywords: [], maxLength: 25 },
    rating: { min: 0, max: 10, decimalsRequired: true },
    progress: { min: 0, max: 100, integersOnly: true },
    objekt: {},   // Objekt-Erkennungsregeln pro Morph
    array: {}     // Array-Erkennungsregeln pro Morph
  },
  config: {},     // Morph-spezifische Configs
  regeln: [],     // Fallback-Regeln
  badge: { variants: {}, colors: {} },
  farben: { palette: [], default: '...' }
}
```

### YAML-Parser (parseYAML)

Eigener YAML-Parser - unterstützt:
- Verschachtelte Objekte (Einrückung)
- Arrays (mit `-`)
- Inline-Kommentare (`# comment`)
- Quoted Strings (`"value"` oder `'value'`)
- Booleans (`true`, `false`)
- Numbers (Integer, Float)
- `null`
- Inline-Objekte in Arrays (`- key: value`)
- Mehrzeilige Strings (via Einrückung)

**Nicht unterstützt:**
- Anchors (`&`, `*`)
- Multi-document (`---`)
- Flow-Syntax (`{a: 1, b: 2}`)
- Block scalars (`|`, `>`)

---

## pipeline.js

Datengetriebene Transformation mit Kirk-Prinzipien.

### Haupt-Exports

```javascript
export function setErkennungConfig(config)  // Detection-Config setzen
export function transform(daten, config, customMorphs) → DocumentFragment
export async function render(container, data, config)
```

### Transform-Ablauf

```
daten (Array/Object)
  → morphField(value, fieldName)
    → detectType(value)
    → findMorph(type, value, fieldName, ...)
    → morph(value, config, morphField)
    → <amorph-container data-morph="..." data-field="..." data-label="...">
```

### Typ-Erkennung (detectType)

| Funktion | Erkennt |
|----------|---------|
| `detectNumberType(value)` | rating (0-10 mit Dezimal), progress (0-100 int), number |
| `detectStringType(value)` | link, image, badge, tag, string |
| `detectArrayType(value)` | sparkline, heatmap, slopegraph, lifecycle, steps, timeline, calendar, radar, hierarchy, network, severity, pie, bar, array |
| `detectObjectType(value)` | map, citation, dosage, currency, gauge, slopegraph, stats, range, rating, progress, badge, pie, object |

### Array-Typ-Erkennung (detectArrayType)

| Typ | Erkennung |
|-----|-----------|
| `sparkline` | Alle Zahlen, ≥3 Werte |
| `heatmap` | 2D-Matrix (Array von Arrays) |
| `slopegraph` | vorher/nachher + name/label |
| `lifecycle` | phase/stage/stadium Keys |
| `steps` | step/order + action/beschreibung |
| `timeline` | date/time + event/label |
| `calendar` | month/monat + active |
| `radar` | axis/achse + value, ≥3 Items |
| `hierarchy` | level/parent/children |
| `network` | connections/relations |
| `severity` | schwere/severity + typ/type |
| `pie` | label + value, ≤6 Items |
| `bar` | label + value, >6 Items |

### Objekt-Typ-Erkennung (detectObjectType)

| Typ | Erkennung |
|-----|-----------|
| `map` | lat/lng Koordinaten |
| `citation` | author + year/title |
| `dosage` | dose/dosis + unit |
| `currency` | currency + amount |
| `gauge` | value + zones oder min/max |
| `slopegraph` | vorher/nachher Sub-Objekte |
| `stats` | min + max + avg (≥3 Matches) |
| `range` | min + max (ohne avg) |
| `rating` | rating/score/stars Key |
| `progress` | value + max/total |
| `badge` | status Key |
| `pie` | Nur numerische Values, 2-8 Keys |

### Label-Formatierung (formatFieldLabel)

```javascript
formatFieldLabel('PROTEIN_G')     // → "Protein (g)"
formatFieldLabel('spore_size_um') // → "Spore Size (µm)"
formatFieldLabel('snake_case')    // → "Snake Case"
```

**Einheiten-Suffixe:**
`_g, _mg, _ug, _um, _mm, _cm, _m, _kg, _l, _ml, _pct, _percent`

### findMorph Priorität

1. Explizite Feld-Zuweisung aus `morphs.yaml`
2. Feld-Typ aus Schema (schemaFieldMorphs)
3. Regeln aus `morphs.yaml`
4. Default-Mapping (type → morph)

---

## container.js

Web Component für isolierte Morphs.

### AmorphContainer

```html
<amorph-container 
  data-morph="tag"
  data-field="essbarkeit"
  data-label="Essbarkeit"
  inline>
  <!-- Morph-Inhalt -->
</amorph-container>
```

### Inline-Morphs (automatisch)

```javascript
const INLINE_MORPHS = ['tag', 'badge', 'boolean', 'number', 'rating'];
```

### Shadow DOM Styles

```css
:host { display: block; contain: content; }
:host([inline]) { display: inline-block; }
:host([data-morph="item"]) { padding: 1rem; border-bottom: 1px solid; }
```

### Events

| Event | Wann |
|-------|------|
| `amorph:mounted` | connectedCallback, bubbles |
| `amorph:unmounted` | disconnectedCallback, bubbles |

### Registrierung

```javascript
customElements.define('amorph-container', AmorphContainer);
```

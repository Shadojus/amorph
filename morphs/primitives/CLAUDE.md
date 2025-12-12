# Primitives Morph Configurations

## Purpose
YAML configuration files for primitive (basic) morph types. Each file defines detection rules, configuration options, and styling for a specific data visualization.

## Structure
```
config/morphs/primitives/
├── index.yaml       # Primitives index and shared settings
├── CLAUDE.md        # This file
│
├── # BASIC TYPES
├── text.yaml        # Plain text strings
├── badge.yaml       # Status badges with semantic colors
├── tag.yaml         # Short label tags
├── number.yaml      # Numeric values
├── boolean.yaml     # True/false values
├── link.yaml        # Clickable URLs
├── image.yaml       # Image display
├── list.yaml        # Simple arrays
├── object.yaml      # Key-value objects
├── range.yaml       # Min-max ranges
├── rating.yaml      # Star ratings
├── progress.yaml    # Progress bars
├── stats.yaml       # Statistical summaries
│
├── # CHARTS
├── bar.yaml         # Bar charts
├── pie.yaml         # Pie/donut charts
├── radar.yaml       # Radar/spider charts
├── timeline.yaml    # Event timelines
│
├── # EXTENDED
├── map.yaml         # Geographic maps
├── hierarchy.yaml   # Tree structures
├── comparison.yaml  # Before/after
├── steps.yaml       # Process steps
├── lifecycle.yaml   # Phase circles
├── network.yaml     # Relationships
├── severity.yaml    # Warning levels
├── calendar.yaml    # Year calendars
├── gauge.yaml       # Tachometer gauges
├── citation.yaml    # Academic citations
├── currency.yaml    # Money amounts
└── dosage.yaml      # Medical dosages
```

## File Format
Each morph YAML file follows this structure:
```yaml
id: morphName
name: Human Readable Name
description: What this morph displays
category: primitives | charts | extended

detection:
  type: string | number | boolean | array | object
  requiredKeys: [...]
  alternativeKeys: [...]
  # Additional detection rules

config:
  # Morph-specific settings
```

## Detection Priority
1. Object with specific required keys → specific morph
2. Array with specific item structure → specific morph
3. String with keywords → badge
4. String with URL pattern → link
5. String with image pattern → image
6. Number in rating range (0-10, decimal) → rating
7. Number in progress range (0-100, integer) → progress
8. Fallback by type

## Adding New Morphs
1. Create `morphName.yaml` in this directory
2. Define detection rules and config
3. Create JS implementation in `morphs/primitives/`
4. Add CSS styles in `styles/morphs-extended.css`
5. Export from `morphs/primitives/index.js`



# Primitives - 28 Basis-Morphs

## Zweck

Domänenunabhängige, reine Funktionen die Datenstrukturen in DOM-Elemente transformieren.

## Wichtige Prinzipien

1. **Keine Domain-Logik** - Begriffe wie "Pilz", "Pflanze" sind VERBOTEN
2. **Reine Funktionen** - Kein globaler State, keine Side-Effects
3. **Datengetrieben** - Die Datenstruktur bestimmt die Darstellung

## Verfügbare Morphs (28)

### Basis-Typen
| Morph | Input | Output |
|-------|-------|--------|
| `text` | String | `<span>` |
| `number` | Number | `<span>` formatiert |
| `boolean` | Boolean | `<span>` Ja/Nein oder ✓/✗ |

### Tags & Badges
| Morph | Input | Output |
|-------|-------|--------|
| `tag` | String | Farbiger Chip |
| `badge` | String/Object | Status-Badge mit Icon |

### Listen & Objekte
| Morph | Input | Output |
|-------|-------|--------|
| `list` | Array | `<ul>` Liste |
| `object` | Object | `<dl>` Definition-Liste |

### Numerische Visualisierungen
| Morph | Input | Output |
|-------|-------|--------|
| `range` | `{min, max}` | Range-Visualisierung |
| `stats` | `{min, max, avg, ...}` | Statistik-Karte |
| `bar` | `[{label, value}]` | Horizontale Balken |
| `rating` | Number (0-5/10) | Sterne ★★★☆☆ |
| `progress` | Number (0-100) | Fortschrittsbalken |
| `gauge` | Number/Object | Halbkreis-Tachometer |

### Charts & Diagramme
| Morph | Input | Output |
|-------|-------|--------|
| `radar` | `[{axis, value}]` | Spider-Chart (SVG) |
| `pie` | `{key: value}` | Donut-Diagramm |

### Zeitliche Daten
| Morph | Input | Output |
|-------|-------|--------|
| `timeline` | `[{date, event}]` | Vertikale Timeline |
| `calendar` | Events/Months | Jahreskalender (Strip/Circle) |
| `lifecycle` | Phases Array | Zirkulärer Lebenszyklus |

### Medien & Links
| Morph | Input | Output |
|-------|-------|--------|
| `image` | URL/Object | `<figure>` mit `<img>` |
| `link` | URL/Object | `<a>` Link |

### Strukturelle Daten
| Morph | Input | Output |
|-------|-------|--------|
| `hierarchy` | Nested Object | Breadcrumb oder Baumansicht |
| `network` | Nodes/Edges | Beziehungs-Netzwerk (SVG) |
| `map` | Coordinates | Weltkarte mit Markern |
| `steps` | Steps Array | Nummerierte Schrittfolge |

### Spezial-Typen
| Morph | Input | Output |
|-------|-------|--------|
| `severity` | Level/Score | Farbcodierte Warnstufe (grün→rot) |
| `currency` | Amount/Object | Formatierte Währungsanzeige |
| `dosage` | Dose/Object | Medizinische Dosierung |
| `citation` | Reference/Array | Wissenschaftliche Zitation |
| `comparison` | Before/After | Trend-Vergleich mit Pfeil |

## Verwendung

```javascript
import { bar, radar, tag, gauge, calendar } from './morphs/primitives/index.js';

// Einzelner Morph
const element = bar([
  { label: 'A', value: 10 },
  { label: 'B', value: 25 }
]);

// Gauge
const gaugeEl = gauge({ value: 75, max: 100, label: 'Score' });

// Calendar
const calendarEl = calendar([
  { monat: 'März', ereignis: 'Frühlingsstart' },
  { monat: 'Sep-Nov', ereignis: 'Hauptsaison' }
]);
```

## Erweiterung

Neue Morphs hinzufügen:

1. Datei erstellen: `morphs/primitives/neu.js`
2. Export in `index.js` hinzufügen
3. Compare-Version in `morphs/compare/primitives/` erstellen
4. Keine Domain-Logik!
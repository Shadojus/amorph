# Detection Module

Type detection system for AMORPH's data-driven pipeline.

## Konzept

```
VALUE → detectType() → TYPE → findMorph() → MORPH_NAME
```

Dieses Modul analysiert Daten und bestimmt automatisch den passenden Visualisierungstyp.

## Module

| Datei | Funktion | Beschreibung |
|-------|----------|--------------|
| `index.js` | `detectType()` | Haupt-Einstiegspunkt, delegiert an Submodule |
| `number.js` | `detectNumberType()` | Erkennt rating, progress, number |
| `string.js` | `detectStringType()` | Erkennt link, image, badge, tag, text |
| `array.js` | `detectArrayType()` | Erkennt 25+ Chart-Typen |
| `object.js` | `detectObjectType()` | Erkennt 15+ Objekt-Typen |

## Erkennungs-Priorität

### Numbers
```
0-10        → rating (Sterne-Bewertung)
11-100 int  → progress (Fortschrittsbalken)
sonst       → number
```

### Strings
```
https://... → link
*.jpg       → image
"active"    → badge (Status-Keywords)
kurz        → tag (≤20 Zeichen)
sonst       → text
```

### Arrays (Priorität!)
```
flow → scatterplot → groupedbar → lollipop → pictogram →
boxplot → bubble → sunburst → treemap → stackedbar → dotplot →
sparkline → heatmap → slopegraph → lifecycle → steps →
timeline → calendar → radar → hierarchy → network →
severity → pie (≤6) → bar (>6) → list
```

### Objects
```
lat/lng     → map
author/year → citation
dose/unit   → dosage
amount/curr → currency
value/zones → gauge
min/max/avg → stats (3+)
min/max     → range (2)
rating      → rating
status      → badge
nur Zahlen  → pie (2-6 keys)
sonst       → object
```

## Konfiguration

Detection-Regeln können über `config/morphs.yaml` angepasst werden:

```yaml
erkennung:
  badge:
    keywords: [active, toxic, edible, ...]
    maxLength: 25
  rating:
    min: 0
    max: 10
  progress:
    min: 11
    max: 100
    integersOnly: true
```

## Usage

```javascript
import { detectType, setDetectionConfig } from './core/detection/index.js';

// Optional: Config setzen
setDetectionConfig({ erkennung: {...} });

// Typ erkennen
const type = detectType(myValue);  // z.B. 'bar', 'pie', 'badge'

// Morph finden
import { findMorph } from './core/detection/index.js';
const morphName = findMorph(type, value, fieldName, morphConfig, schemaFieldMorphs);
```

## Tests

```bash
npm run test -- tests/detection.test.js
```

## Kirk-Prinzipien

Dieses Modul implementiert die Kirk-Visualisierungsprinzipien:
- **Datenstruktur bestimmt Visualisierung**
- **Spezifische Muster vor generischen**
- **Pie max 6 Kategorien, darüber Bar**
- **Radar min 3 Achsen**

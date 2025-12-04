# Primitives - Basis-Morphs

## Zweck

Domänenunabhängige, reine Funktionen die Datenstrukturen in DOM-Elemente transformieren.

## Wichtige Prinzipien

1. **Keine Domain-Logik** - Begriffe wie "Pilz", "Pflanze", "Rezept" sind hier VERBOTEN
2. **Reine Funktionen** - Kein globaler State, keine Side-Effects
3. **Datengetrieben** - Die Datenstruktur bestimmt die Darstellung

## Verfügbare Morphs

| Morph | Input | Output |
|-------|-------|--------|
| `text` | String | `<span>` |
| `number` | Number | `<span>` formatiert |
| `boolean` | Boolean | `<span>` Ja/Nein oder ✓/✗ |
| `tag` | String | Farbiger Chip |
| `badge` | String/Object | Status-Badge mit Icon |
| `list` | Array | `<ul>` Liste |
| `object` | Object | `<dl>` Definition-Liste |
| `range` | `{min, max}` | Range-Visualisierung |
| `stats` | `{min, max, avg, ...}` | Statistik-Karte |
| `bar` | `[{label, value}]` | Horizontale Balken |
| `radar` | `[{axis, value}]` | Spider-Chart (SVG) |
| `pie` | `{key: value}` | Donut-Diagramm |
| `rating` | Number (0-5/10/100) | Sterne ★★★☆☆ |
| `progress` | Number (0-100) | Fortschrittsbalken |
| `timeline` | `[{date, event}]` | Vertikale Timeline |
| `image` | URL/Object | `<figure>` mit `<img>` |
| `link` | URL/Object | `<a>` Link |

## Verwendung

```javascript
import { bar, radar, tag } from './morphs/primitives/index.js';

// Einzelner Morph
const element = bar([
  { label: 'A', value: 10 },
  { label: 'B', value: 25 }
]);

// Alle Morphs als Map
import { primitives } from './morphs/primitives/index.js';
const morph = primitives[erkannterTyp];
const element = morph(wert, config);
```

## Config-Parameter

Jeder Morph akzeptiert ein `config` Objekt. Gemeinsame Parameter:

- `einheit` - Einheit für Zahlen (z.B. "°C", "%")
- `max` - Maximum für Skalierung
- `farben` - Farb-Mapping für Werte
- `label` - Beschriftung

## Erweiterung

Neue Morphs hinzufügen:

1. Datei erstellen: `morphs/primitives/neu.js`
2. Export in `index.js` hinzufügen
3. Keine Domain-Logik!

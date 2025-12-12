# Konfiguration

Eine Datei = Ein Aspekt. YAML als Single Source of Truth.

## Dateien

```
config/
├── manifest.yaml   ← App-Name, Version, Titel
├── daten.yaml      ← Datenquelle (JSON-Pfad)
├── morphs.yaml     ← Morph-Config, Typ-Erkennung
├── features.yaml   ← Aktive Features
├── observer.yaml   ← Debug, Analytics
└── schema/         ← Modulares Schema-System
    ├── basis.yaml      ← Kern-Konfiguration
    ├── felder.yaml     ← ~200 Feld-Definitionen
    ├── semantik.yaml   ← Such-Mappings
    └── perspektiven/   ← 17 Perspektiven-Dateien
```

## Schema-System (17 Perspektiven)

### perspektiven/index.yaml

```yaml
aktiv:
  - culinary
  - safety
  - cultivation
  - wissenschaft
  - medicine
  - statistics
  - chemistry
  - sensorik
  - ecology
  - temporal
  - geography
  - economy
  - conservation
  - culture
  - research
  - interactions
  - visual
```

### Perspektiven-Datei (z.B. chemistry.yaml)

```yaml
id: chemistry
name: chemistry
symbol: 🧪
farben: ['#9f7aea', '#805ad5', '#6b46c1', '#553c9a']
beschreibung: Chemische Zusammensetzung und Stoffwechsel
felder:
  - chemistry_primaer_metabolite
  - chemistry_sekundaer_metabolite
  - chemistry_volatilome
  - chemistry_enzyme
```

## Datengetriebene Erkennung

Pipeline erkennt Morphs automatisch aus Datenstruktur:

| Datenstruktur | Erkannter Morph |
|---------------|-----------------|
| `{ min: 0, max: 10 }` | `range` |
| `{ min, max, avg }` | `stats` |
| `[{ axis, value }]` (3+) | `radar` |
| `"essbar"` (keyword) | `badge` |
| `4.5` (0-10, dezimal) | `rating` |

## Neue Perspektive hinzufügen

1. Datei erstellen: `config/schema/perspektiven/meine_perspektive.yaml`
2. ID zu `perspektiven/index.yaml` hinzufügen
3. Felder in `felder.yaml` definieren
4. CSS in `styles/perspektiven.css` hinzufügen

**Kein Theme-Code nötig!** smartCompare erkennt Typen automatisch.

# Morphs

Reine Funktionen. Keine Klassen. Kein Zustand. **Keine Seiteneffekte!**

## Struktur

```
morphs/
├── index.js          ← Zentrale Registry + compareMorph()
├── primitives/       ← 28 Basis-Morphs (text, bar, radar, gauge, etc.)
├── compare/          ← Compare-Morphs (DATA-DRIVEN!)
│   ├── base.js       ← Utils: createColors(), detectType()
│   ├── index.js      ← Export aller Compare-Morphs
│   ├── primitives/   ← 16 Compare-Primitives
│   └── composites/   ← smartCompare, diffCompare
├── suche.js          ← Feature: Suchfeld
├── perspektiven.js   ← Feature: Perspektiven-Buttons
└── header.js         ← Feature: App-Header
```

## MORPH-PURITY REGEL

```javascript
// ✅ ERLAUBT in Morphs:
document.createElement()     // DOM erstellen
element.appendChild()        // DOM aufbauen
element.addEventListener()   // Lokale Events auf eigenem Element

// ❌ VERBOTEN in Morphs:
document.dispatchEvent()     // → Nur Features dürfen Events dispatchen!
document.addEventListener()  // → Nie global!
```

**Morphs sind REINE Transformationen:** `(wert, config) → HTMLElement`

## Data-Driven Compare System

Das Compare-System ist **100% datengetrieben** (KEIN themes/ Ordner mehr!):

```javascript
import { smartCompare } from './compare/composites/index.js';

// Automatische Typ-Erkennung + Gruppierung
const compareEl = smartCompare(items, {
  includeOnly: perspectiveFields  // Optional: Filter nach Perspektive
});
```

**Architektur:**
- `smartCompare()` → Analysiert Daten, gruppiert nach Kategorie
- `analyzeItems()` → Extrahiert Feldstruktur aus items[0].data
- `detectType()` → Bestimmt besten Morph für jeden Wert
- `TYPE_TO_CATEGORY` → Mappt Typen zu Kategorien (numeric, ranges, multidim, etc.)

## 28 Basis-Primitives

| Morph | Input | Output |
|-------|-------|--------|
| `text` | String | `<span>` |
| `number` | Number | `<span>` formatiert |
| `boolean` | Boolean | Ja/Nein |
| `tag` | String | Farbiger Chip |
| `badge` | String/Object | Status-Badge |
| `list` | Array | `<ul>` Liste |
| `object` | Object | `<dl>` Definition-Liste |
| `range` | `{min, max}` | Range-Visualisierung |
| `stats` | `{min, max, avg}` | Statistik-Karte |
| `bar` | `[{label, value}]` | Horizontale Balken |
| `radar` | `[{axis, value}]` | Spider-Chart |
| `pie` | `{key: value}` | Donut-Diagramm |
| `rating` | Number 0-10 | Sterne ★★★☆☆ |
| `progress` | Number 0-100 | Fortschrittsbalken |
| `timeline` | `[{date, event}]` | Vertikale Timeline |
| `image` | URL/Object | `<figure>` |
| `link` | URL/Object | `<a>` |
| `gauge` | Number/Object | Halbkreis-Tachometer |
| `calendar` | Events | Jahreskalender |
| `hierarchy` | Nested | Breadcrumb/Tree |
| `network` | Nodes/Edges | Beziehungs-Graph |
| `map` | Coordinates | Weltkarte |
| `lifecycle` | Phases | Zirkulärer Zyklus |
| `steps` | Steps | Schrittfolge |
| `severity` | Level | Farbcodierte Warnung |
| `currency` | Amount | Währungsanzeige |
| `dosage` | Dose | Dosierung |
| `citation` | Reference | Zitation |
| `comparison` | Before/After | Trend-Vergleich |

## Farb-System (CSS Single Source of Truth!)

```javascript
// base.js - createColors()
export function createColors(items) {
  return items.map((item, index) => ({
    name: item.name,
    colorIndex: index % 12,
    colorClass: `pilz-farbe-${index % 12}`
  }));
}
```

**CSS macht das Styling** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```
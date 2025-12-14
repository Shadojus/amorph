# Morphs

Morph-System: Daten → DOM Transformationen. Domänenunabhängig.

## Struktur

```
morphs/
├── index.js          ← Registry + Re-Exports (250 Zeilen)
├── index.yaml        ← Farb-Paletten + Fallback-Regeln
├── primitives/       ← 35+ Basis-Morphs
│   ├── index.js      ← Alle Primitive-Exports (147 Zeilen)
│   ├── index.yaml    ← Primitive-Configs
│   ├── index.css     ← Gemeinsame Styles
│   └── {morph}/      ← Je ein Ordner pro Morph
└── compare/          ← Vergleichs-Morphs
    ├── index.js      ← compareByData Export
    ├── base.js       ← Farben, Sections, detectType (549 Zeilen)
    ├── compare.css   ← Compare-Styles
    ├── composites.js ← Re-Export aus composites/
    ├── composites/   ← smartCompare, diffCompare
    └── primitives/   ← compareBar, compareTag, etc.
```

---

## index.js (250 Zeilen) - Registry

### Exportierte Morphs

#### Primitives (18)
```javascript
text, number, boolean, tag, range, list, object,
image, link, pie, bar, radar, rating, progress,
stats, timeline, badge, lifecycle
```

#### Extended Charts (4)
```javascript
sparkline, slopegraph, heatmap, gauge
```

#### Special (10)
```javascript
dosage, currency, citation, calendar, steps,
map, hierarchy, network, comparison, severity
```

#### Features (3)
```javascript
suche, perspektiven, header
```

#### Compare-Morphs (15)
```javascript
compareMorph, compareBar, compareRating, compareTag,
compareList, compareImage, compareRadar, comparePie,
compareText, compareTimeline, compareRange, compareProgress,
compareBoolean, compareStats, compareObject
```

#### Composites (2)
```javascript
smartCompare, diffCompare
```

#### Utilities (7)
```javascript
erstelleFarben, setAktivePerspektivenFarben, detectType,
createSection, createHeader, compareByType, compareByData
```

### compareMorph() - Legacy Wrapper

```javascript
compareMorph(feldName, typ, items, config) → div.compare-section
// - Header mit Label + Abwahl-Button
// - compareByType(typ, items, config) als Content
```

---

## index.yaml - Farb-Paletten

### Neon-Farben (12 Stück)

```yaml
colors:
  palette:
    - name: "Neon Cyan"
      rgb: [0, 255, 255]
      fill: "rgba(0, 255, 255, 0.24)"
      text: "rgba(0, 255, 255, 0.85)"
    - name: "Neon Magenta"
      rgb: [255, 0, 255]
    - name: "Neon Green"
      rgb: [0, 255, 128]
    - name: "Neon Pink"
      rgb: [255, 0, 128]
    - name: "Neon Yellow"
      rgb: [255, 255, 0]
    - name: "Neon Orange"
      rgb: [255, 128, 0]
    - name: "Neon Blue"
      rgb: [0, 128, 255]
    - name: "Neon Violet"
      rgb: [128, 0, 255]
    - name: "Neon Red"
      rgb: [255, 50, 50]
    - name: "Neon Lime"
      rgb: [200, 255, 0]
    - name: "Neon Turquoise"
      rgb: [0, 255, 200]
    - name: "Neon Coral"
      rgb: [255, 100, 100]
```

### Fallback-Regeln

```yaml
fallback:
  - type: range
    morph: range
  - type: string
    maxLength: 20
    morph: tag
  - type: array
    morph: list
  - type: boolean
    morph: boolean
```

---

## primitives/ - Basis-Morphs (35+)

### Kategorien

| Kategorie | Morphs |
|-----------|--------|
| **Text** | text, number, boolean, tag, badge |
| **Container** | list, object, range, stats |
| **Charts** | bar, radar, pie, rating, progress, timeline, sparkline, slopegraph, heatmap |
| **Media** | image, link |
| **Special** | map, hierarchy, comparison, steps, lifecycle, network, severity, calendar, gauge, citation, currency, dosage |

### Alias-Map

```javascript
string: text,
trend: sparkline,
slope: slopegraph,
matrix: heatmap,
tree: hierarchy,
diff: comparison,
process: steps,
phase: lifecycle,
graph: network,
warning: severity,
season: calendar,
score: gauge,
reference: citation,
money: currency,
dose: dosage
```

### Morph-Signatur

```javascript
function morph(value, config = {}) → HTMLElement
```

---

## compare/ - Vergleichs-Morphs

### base.js (549 Zeilen)

#### Farb-Management

```javascript
// Externe Config setzen
setColorsConfig(config)      // Farben aus morphs.yaml
setDetectionConfig(config)   // Erkennung aus morphs.yaml

// Perspektiven-Farben (für Filterung)
setAktivePerspektivenFarben(colors)  // Array von rgba() Strings

// Farben erstellen (filtert ähnliche zu Perspektiven)
erstelleFarben(itemIds) → Map<id, {
  farbIndex, farbKlasse,
  rgb, fill, text, line, bg, glow
}>
```

#### Farb-Filterung

- Vergleicht RGB-Distanz zu aktiven Perspektiven-Farben
- Filtert Farben mit Distanz < threshold (default: 80)
- Minimum 6 Farben bleiben erhalten

#### Section-Helpers

```javascript
createSection(label, color?, fieldName?) → div.compare-section
createSectionIfNew(fieldName, label, color, skipFields) → Section | null
createHeader({ symbol, title, count, colors }) → div.compare-perspective-header
createLegende(items) → div.compare-legende
```

#### detectType() - DATA-DRIVEN

```javascript
detectType(value) → string
// Ruft auf:
// - detectNumberType(value) → 'rating' | 'progress' | 'number'
// - detectStringType(value) → 'link' | 'image' | 'badge' | 'tag' | 'string'
// - detectArrayType(value)  → 'sparkline' | 'radar' | 'pie' | 'bar' | 'timeline' | 'lifecycle' | 'tag' | 'list'
// - detectObjectType(value) → 'map' | 'stats' | 'range' | 'gauge' | 'object'
```

### compare/primitives/ - Compare-Wrapper

Für jeden Primitive-Morph existiert ein Compare-Wrapper:

```javascript
compareBar(items, config)      // Bar-Chart Vergleich
compareRating(items, config)   // Rating-Vergleich
compareTag(items, config)      // Tag-Vergleich
compareList(items, config)     // Listen-Vergleich
compareImage(items, config)    // Bild-Galerie
compareRadar(items, config)    // Überlagerte Radar-Charts
comparePie(items, config)      // Mehrere Pie-Charts
compareText(items, config)     // Text-Vergleich
compareTimeline(items, config) // Timeline-Vergleich
compareRange(items, config)    // Bereichs-Vergleich
compareProgress(items, config) // Fortschritts-Vergleich
compareStats(items, config)    // Statistik-Vergleich
compareBoolean(items, config)  // Boolean-Vergleich
compareObject(items, config)   // Objekt-Vergleich
```

### compare/composites/ - Intelligente Kombinationen

#### smartCompare(items, config)

Automatische Diagramm-Generierung:

```javascript
smartCompare(items, { includeOnly?: string[] }) → HTMLElement

// 1. analyzeItems() - Alle Felder sammeln und kategorisieren
// 2. detectType() - Typ jedes Feldes erkennen
// 3. TYPE_TO_CATEGORY - Typ → Kategorie mappen
// 4. Felder nach Kategorie gruppieren
// 5. Pro Kategorie: renderComposite() oder compareByType()
```

**Analyse-Pipeline:**
```javascript
items → analyzeItems() → fields{} → detectType() → TYPE_TO_CATEGORY → renderGroup() → DOM
```

**includeOnly-Filter:**
- Wenn gesetzt: nur diese Felder werden verglichen
- Nutzen: Perspektiven-basierter Vergleich
```

#### diffCompare(items, config)

Unterschiede hervorheben:

```javascript
diffCompare(items, config) → HTMLElement

// Zeigt nur Felder die sich unterscheiden
// Hervorgehobene Differenzen
```

#### Type Categories

```javascript
TYPE_CATEGORIES = {
  metrics: ['number', 'rating', 'progress', 'gauge'],
  ranges: ['range', 'stats'],
  profiles: ['radar', 'pie', 'bar'],
  timelines: ['timeline', 'lifecycle', 'calendar'],
  categories: ['tag', 'badge', 'boolean']
}
```

---

## Item-Format (Compare)

```javascript
{
  id: string,
  name: string,
  wert: any,                    // Feld-Wert
  farbKlasse: 'pilz-farbe-0',   // CSS-Klasse
  farbe: 'rgba(0,255,255,0.24)', // fill (deprecated)
  textFarbe: 'rgba(0,255,255,0.85)',
  lineFarbe: 'rgba(0,255,255,0.70)',
  bgFarbe: 'rgba(0,255,255,0.12)',
  glowFarbe: 'rgba(0,255,255,0.50)'
}
```

---

## Neuer Morph

### 1. Primitive erstellen

```
morphs/primitives/meinmorph/
├── meinmorph.js
└── meinmorph.css
```

```javascript
// meinmorph.js
export function meinmorph(value, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-meinmorph';
  el.textContent = String(value);
  return el;
}
```

### 2. In primitives/index.js exportieren

```javascript
export { meinmorph } from './meinmorph/meinmorph.js';
```

### 3. In morphs/index.js registrieren

```javascript
import { meinmorph } from './primitives/meinmorph/meinmorph.js';
export const morphs = { ..., meinmorph };
```

### 4. Optional: Compare-Wrapper

```
morphs/compare/primitives/meinmorph.js
```

---

## Abhängigkeiten

```
index.js         → primitives/*, compare/*, config/*, observer/debug.js
primitives/index.js → primitives/*/
compare/base.js  → observer/debug.js
compare/composites.js → compare/composites/
compare/primitives/ → compare/base.js, morphs/primitives/*
```

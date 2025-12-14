# Compare Morphs

Datengetriebenes Vergleichssystem.

## Struktur

```
compare/
├── base.js         ← Utilities: createColors(), detectType(), createLegende()
├── index.js        ← Export aller Compare-Funktionen
├── compare.css     ← Compare-Styles
├── composites.js   ← Re-Export von composites/
├── primitives/     ← Compare-Varianten der Basis-Morphs
│   ├── index.js
│   ├── bar.js, barGroup.js
│   ├── boolean.js, image.js, list.js
│   ├── object.js, pie.js, progress.js
│   ├── radar.js, range.js, rating.js
│   ├── stats.js, tag.js, text.js, timeline.js
└── composites/     ← Intelligente Vergleiche
    ├── index.js
    ├── types.js      ← TYPE_CATEGORIES, TYPE_TO_CATEGORY
    ├── analyze.js    ← analyzeItems(), findRelatedFields()
    ├── render.js     ← renderFieldMorph(), render*Composite()
    ├── smartCompare.js
    └── diffCompare.js
```

## base.js - Utilities

```javascript
// Farben für Items erstellen (aus pilz-farben.css)
erstelleFarben(itemIds) → Map<id, {colorClass, fill, text, ...}>
createColors(itemIds)   // Alias

// Typ aus Datenstruktur erkennen
detectType(value) → string

// Legende erstellen
createLegende(items) → HTMLElement

// Section-Container
createSection(title) → HTMLElement
createHeader(title) → HTMLElement

// Perspektiven-Farben setzen
setAktivePerspektivenFarben(colors)
```

## primitives/ - Compare-Varianten

```javascript
import { 
  compareBar, compareBarGroup,
  compareRating, compareProgress,
  compareTag, compareList, compareBoolean,
  compareText, compareObject,
  compareRadar, comparePie,
  compareRange, compareStats,
  compareTimeline, compareImage,
  compareByType  // Automatische Auswahl
} from './primitives/index.js';

// Automatisch richtigen Compare-Morph wählen
const el = compareByType(type, items, config);
```

## composites/ - Intelligente Vergleiche

```javascript
import { 
  smartCompare,      // Hauptfunktion
  diffCompare,       // Unterschiede hervorheben
  analyzeItems,      // Felder analysieren
  findRelatedFields  // Verwandte Felder finden
} from './composites/index.js';

// Automatischer Vergleich
const el = smartCompare(items, {
  includeOnly: ['field1', 'field2']  // Optional: nur bestimmte Felder
});
```

## Datenfluss

```
items → analyzeItems() → fields{} → detectType() → TYPE_TO_CATEGORY → renderGroup() → DOM
```

## Typ-Kategorien

```javascript
TYPE_CATEGORIES = {
  numeric: ['number', 'rating', 'progress', 'bar'],
  ranges: ['range', 'stats'],
  multidim: ['radar', 'pie'],
  sequential: ['timeline', 'sparkline'],
  categorical: ['tag', 'badge', 'boolean', 'list'],
  textual: ['text', 'string', 'object'],
  media: ['image', 'link']
}
```

---

## Farb-Filterung (base.js)

### Problem
Wenn Perspektiven aktiv sind, haben diese eigene Farben.
Pilz-Farben sollten nicht zu ähnlich sein.

### Lösung
```javascript
setAktivePerspektivenFarben(colors);  // Setze Perspektiven-Farben
erstelleFarben(itemIds);              // Erstellt gefilterte Pilz-Farben
```

**Algorithmus:**
1. Berechne RGB-Distanz jeder Pilz-Farbe zu allen Perspektiven-Farben
2. Filtere Farben mit Distanz < threshold (default: 80)
3. Minimum 6 Farben bleiben erhalten
4. Fallback: Verwende alle 12 Farben wenn zu wenige übrig

> Farben kommen aus `styles/pilz-farben.css` (12 Neon-Farben).
};
```

## Farb-System (12 Neon)

```javascript
const farben = erstelleFarben(['steinpilz', 'fliegenpilz']);
// → Map {
//   'steinpilz': { colorClass: 'pilz-farbe-0', fill: '#00ffff', ... },
//   'fliegenpilz': { colorClass: 'pilz-farbe-1', fill: '#ff00ff', ... }
// }
```

Farben werden maximal distant gewählt (Perspektiven-Farben werden vermieden).

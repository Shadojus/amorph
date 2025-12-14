# Compare Composites

Intelligentes Vergleichssystem.

## Struktur

```
composites/
├── index.js        ← Exports
├── types.js        ← TYPE_CATEGORIES, TYPE_TO_CATEGORY, getCategory()
├── analyze.js      ← analyzeItems(), findRelatedFields(), calculateDiff()
├── render.js       ← renderFieldMorph(), render*Composite()
├── smartCompare.js ← Haupt-Entry-Point
└── diffCompare.js  ← Unterschiede hervorheben
```

## smartCompare

```javascript
import { smartCompare } from './composites/index.js';

const element = smartCompare(items, {
  includeOnly: ['field1', 'field2']  // Optional
});

// Intern:
// 1. analyzeItems(items) → Felder extrahieren
// 2. detectType(value) → Typ pro Feld
// 3. findRelatedFields(fields) → Nach Kategorie gruppieren
// 4. render*Composite() → Jede Gruppe rendern
```

## Datenfluss

```
items[0].data 
  → analyzeItems() 
  → fields{} 
  → detectType() 
  → TYPE_TO_CATEGORY 
  → renderGroup() 
  → DOM
```

## types.js

```javascript
TYPE_CATEGORIES = {
  numeric: ['number', 'rating', 'progress', 'bar'],
  ranges: ['range', 'stats'],
  multidim: ['radar', 'pie'],
  sequential: ['timeline', 'sparkline'],
  categorical: ['tag', 'badge', 'boolean', 'list'],
  textual: ['text', 'string', 'object'],
  media: ['image', 'link']
};

TYPE_TO_CATEGORY = {
  'number': 'numeric',
  'rating': 'numeric',
  'range': 'ranges',
  'radar': 'multidim',
  // ...
};

getCategory(type) → string
sameCategory(type1, type2) → boolean
```

## analyze.js

```javascript
// Felder aus Items extrahieren
analyzeItems(items) → {
  fieldName: {
    type: 'rating',
    values: [4.5, 3.8, 4.2],
    items: [...]
  }
}

// Verwandte Felder finden (gleiche Kategorie)
findRelatedFields(fields) → Map<category, fieldNames[]>

// Unterschiede berechnen
calculateDiff(values) → { min, max, avg, spread }
```

## render.js

```javascript
// Einzelnes Feld rendern
renderFieldMorph(fieldName, fieldData, colors) → HTMLElement

// Gruppierte Render-Funktionen
renderMetricsComposite(fields, colors)    // numeric
renderRangesComposite(fields, colors)     // ranges
renderProfileComposite(fields, colors)    // multidim
renderTimelineComposite(fields, colors)   // sequential
renderCategoriesComposite(fields, colors) // categorical
```

## diffCompare

```javascript
import { diffCompare } from './composites/index.js';

// Hebt Unterschiede zwischen Items hervor
const element = diffCompare(items, {
  highlightDiff: true,
  threshold: 0.1  // 10% Unterschied = highlight
});
```

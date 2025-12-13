# Compare Morphs

100% DATA-DRIVEN Vergleichssystem.

## Struktur

```
compare/
├── base.js         ← createColors(), detectType()
├── index.js        ← Export
├── composites.js   ← Re-export
├── primitives/     ← 16 Compare-Primitives
│   ├── bar.js
│   ├── radar.js
│   ├── pie.js
│   └── ...
└── composites/     ← Intelligente Vergleiche
    ├── analyze.js
    ├── render.js
    ├── smartCompare.js
    ├── diffCompare.js
    └── types.js
```

## smartCompare

```javascript
import { smartCompare } from './composites/index.js';

const el = smartCompare(items, {
  includeOnly: ['field1', 'field2']
});
```

## Datenfluss

```
items[0].data → analyzeItems() → detectType() → render()
```

## Typ-Kategorien

| Kategorie | Typen |
|-----------|-------|
| numeric | number, rating, progress, bar |
| ranges | range, stats |
| multidim | radar, pie |
| sequential | timeline |
| categorical | tag, badge, boolean, list |
| textual | text, string, object |
| media | image, link |

## Farb-System

```javascript
createColors(itemIds) → Map<id, {colorClass, fill, text, line}>
```

CSS macht Styling (`pilz-farben.css`).

# Compare Morphs

Datengetriebenes Vergleichssystem.

## Struktur

```
compare/
├── base.js         ← createColors(), detectType()
├── index.js        ← Export
├── primitives/     ← Compare-Varianten der Basis-Morphs
└── composites/     ← Intelligente Vergleiche
    ├── smartCompare.js
    ├── analyze.js
    └── render.js
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
items → analyzeItems() → detectType() → render()
```

## Typ-Kategorien

| Kategorie | Typen |
|-----------|-------|
| numeric | number, rating, progress |
| ranges | range, stats |
| multidim | radar, pie |
| sequential | timeline, sparkline |
| categorical | tag, badge, boolean |

## Farb-System

```javascript
createColors(itemIds) → Map<id, {colorClass, fill, text}>
```

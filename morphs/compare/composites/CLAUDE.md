# Compare Composites

Intelligentes Vergleichssystem.

## Struktur

```
composites/
├── analyze.js      ← analyzeItems(), findRelatedFields()
├── render.js       ← renderFieldMorph(), render*Composite()
├── smartCompare.js ← Haupt-Entry-Point
├── diffCompare.js  ← Unterschiede hervorheben
├── types.js        ← TYPE_CATEGORIES, TYPE_TO_CATEGORY
└── index.js        ← Exports
```

## smartCompare

```javascript
const element = smartCompare(items, {
  includeOnly: ['field1', 'field2']
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

## Typ-Kategorien

```javascript
TYPE_CATEGORIES = {
  numeric: ['number', 'rating', 'progress', 'bar'],
  ranges: ['range', 'stats'],
  multidim: ['radar', 'pie'],
  sequential: ['timeline'],
  categorical: ['tag', 'badge', 'boolean', 'list'],
  textual: ['text', 'string', 'object'],
  media: ['image', 'link']
};
```

# Compare Composites

Intelligente Vergleichs-Funktionen die den besten Morph für die Daten wählen.

## Dateien

```
morphs/compare/composites/
├── analyze.js      ← Typ-Erkennung für Items
├── diffCompare.js  ← Unterschiede hervorheben
├── smartCompare.js ← Auto-Morph basierend auf Datentyp
├── render.js       ← DOM-Generierung
├── types.js        ← Typ-Definitionen
└── index.js        ← Exports
```

## smartCompare

Analysiert die Datenstruktur und wählt automatisch den passenden Compare-Morph:

```javascript
import { smartCompare } from './composites/index.js';

// Analysiert Datentyp automatisch
const element = smartCompare(items, feldName, schema);

// Intern:
// 1. Extrahiert Werte für feldName aus allen items
// 2. Erkennt Datentyp (number, rating, array, etc.)
// 3. Wählt passenden Compare-Primitive
// 4. Rendert mit korrekten Farben
```

## diffCompare

Hebt Unterschiede zwischen Items hervor:

```javascript
import { diffCompare } from './composites/index.js';

// Zeigt nur Unterschiede an
const element = diffCompare(items, feldName, {
  showSame: false,      // Gleiche Werte ausblenden
  highlightDiff: true   // Unterschiede farblich markieren
});
```

## Typ-Erkennung (analyze.js)

```javascript
// Erkennt diese Typen:
const types = [
  'number',      // 3.14, 42
  'rating',      // 0-5, 0-10 (kleine Zahlen = Sterne)
  'percentage',  // 0-100 (%) 
  'boolean',     // true/false
  'array',       // [a, b, c]
  'object',      // {key: value}
  'range',       // {min, max}
  'text'         // Default fallback
];
```

# Compare Composites

100% DATA-DRIVEN intelligent comparison system.

## Structure

```
morphs/compare/composites/
├── analyze.js      ← analyzeItems(), findRelatedFields()
├── render.js       ← renderFieldMorph(), render*Composite()
├── smartCompare.js ← Main: auto-detects + renders
├── diffCompare.js  ← Highlights differences
├── types.js        ← TYPE_CATEGORIES, TYPE_TO_CATEGORY
└── index.js        ← Exports
```

## smartCompare (Main Entry Point)

Analyzes data structure and auto-selects the best visualization:

```javascript
import { smartCompare } from './composites/index.js';

// Automatic analysis + rendering
const element = smartCompare(items, {
  includeOnly: ['field1', 'field2']  // Optional: Filter fields
});

// Internally:
// 1. analyzeItems(items) → Extract fields from items[0].data
// 2. detectType(value) → Detect type per field
// 3. findRelatedFields(fields) → Group by category
// 4. render*Composite() → Render each group
```

## Data Flow

```
items[0].data → analyzeItems() → fields{} → findRelatedFields() → groups[]
     ↓
  detectType(value) → type (bar, radar, tag, etc.)
     ↓
  TYPE_TO_CATEGORY[type] → category (numeric, ranges, multidim, etc.)
     ↓
  renderGroup() → DOM
```

## Type Categories (types.js)

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

## analyzeItems (analyze.js)

```javascript
// Extracts fields from first item's data
const { fields, categories } = analyzeItems(items);

// fields = {
//   fieldName: { name, type, category, values: [{id, name, value, color}] }
// }
```

## Render Functions (render.js)

| Function | Category | Visualization |
|----------|----------|---------------|
| `renderFieldMorph` | Single field | Appropriate primitive |
| `renderMetricsComposite` | numeric | Grouped bars |
| `renderRangesComposite` | ranges | Overlapping ranges |
| `renderProfileComposite` | multidim | Radar + Pie |
| `renderTimelineComposite` | sequential | Overlaid timelines |
| `renderCategoriesComposite` | categorical | Tags, booleans |

## diffCompare

Highlights differences between items:

```javascript
import { diffCompare } from './composites/index.js';

const element = diffCompare(items, {
  showSame: false,      // Hide identical values
  highlightDiff: true   // Color-code differences
});
```
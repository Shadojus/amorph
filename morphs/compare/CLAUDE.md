# Compare Morphs

100% DATA-DRIVEN comparison system. No hardcoded perspectives!

## Structure

```
morphs/compare/
├── base.js           ← Utils: createColors(), detectType(), createLegend()
├── index.js          ← Export of all compare morphs
├── composites.js     ← Re-export from composites/
├── primitives/       ← 16 generic compare primitives
│   ├── bar.js        ← Horizontal bar comparison
│   ├── barGroup.js   ← Grouped bars
│   ├── boolean.js    ← Yes/No comparison
│   ├── image.js      ← Image gallery
│   ├── list.js       ← List comparison
│   ├── object.js     ← Object comparison
│   ├── pie.js        ← Pie chart overlay
│   ├── progress.js   ← Progress bars
│   ├── radar.js      ← Overlaid radar charts
│   ├── range.js      ← Range visualization
│   ├── rating.js     ← Star ratings
│   ├── stats.js      ← Statistics comparison
│   ├── tag.js        ← Tag comparison
│   ├── text.js       ← Text comparison
│   ├── timeline.js   ← Timeline comparison
│   └── index.js      ← Export all + compareByType()
└── composites/       ← Intelligent comparison
    ├── analyze.js    ← analyzeItems(), findRelatedFields()
    ├── render.js     ← renderFieldMorph(), render*Composite()
    ├── smartCompare.js ← Main data-driven compare function
    ├── diffCompare.js  ← Difference highlighting
    ├── types.js      ← TYPE_CATEGORIES, TYPE_TO_CATEGORY
    └── index.js      ← Export all composites
```

## Data-Driven Architecture

**NO themes/ folder!** Everything is automatic:

```javascript
import { smartCompare } from './composites/index.js';

// Automatic type detection + grouping
const el = smartCompare(items, {
  includeOnly: ['field1', 'field2']  // Optional filter
});
```

### How it works:

1. `analyzeItems(items)` → Extracts fields from `items[0].data`
2. `detectType(value)` → Determines type (bar, radar, tag, etc.)
3. `TYPE_TO_CATEGORY[type]` → Groups into categories (numeric, ranges, multidim, etc.)
4. `findRelatedFields(fields)` → Creates semantic groups
5. `render*Composite()` → Renders each group with appropriate morphs

### Type Categories:

| Category | Types | Visualization |
|----------|-------|---------------|
| `numeric` | number, rating, progress, bar | Horizontal bars |
| `ranges` | range, stats | Overlapping ranges |
| `multidim` | radar, pie | Spider charts, pie charts |
| `sequential` | timeline | Timeline overlay |
| `categorical` | tag, badge, boolean, list | Tags, chips |
| `textual` | text, string, object | Text comparison |
| `media` | image, link | Gallery |

## Color System (CSS Single Source of Truth!)

```javascript
// base.js - createColors()
export function createColors(itemIds) {
  // Returns Map: id → {colorIndex, colorClass, fill, text, line, bg, glow}
}

// Perspective color filtering
export function setActivePerspectiveColors(colors) {
  // Filters item colors that are too similar to perspective colors
}
```

**CSS does the styling** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```

## Compare Primitive Signature

```javascript
function compareXxx(items, config) → HTMLElement

// items = [{id, name, value, color}]
// config = {label, unit, ...}
```

## Usage in vergleich/index.js

```javascript
import { smartCompare } from '../../morphs/compare/composites/index.js';
import { createLegende } from '../../morphs/compare/base.js';

// For each perspective, filter fields and use smartCompare
for (const perspId of aktivePerspektiven) {
  const perspektive = getPerspektive(perspId);
  const perspectiveFields = perspektive.fields.map(f => f.id || f);
  
  const compareEl = smartCompare(compareItems, {
    includeOnly: perspectiveFields
  });
}
```
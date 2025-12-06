# Compare Morphs

Vergleichs-Visualisierungen für mehrere Items nebeneinander.

## Dateien

```
morphs/compare/
├── base.js       ← Utils: erstelleFarben(), detectType()
├── index.js      ← Export aller Compare-Morphs
└── primitives/   ← 16 Compare-Primitives
```

## Farb-System (CSS Single Source of Truth!)

```javascript
// base.js - erstelleFarben()
export function erstelleFarben(items) {
  return items.map((item, index) => ({
    name: item._meta?.name || item.name || `Item ${index + 1}`,
    farbIndex: index % 12,
    farbKlasse: `pilz-farbe-${index % 12}`
  }));
}
```

**CSS macht das Styling** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```

## FALLBACK_FARBEN (nur für farbDistanz)

RGB-Arrays für Distance-Calculation in `base.js`:

```javascript
const FALLBACK_FARBEN = [
  [0, 255, 255],    // Electric Cyan
  [255, 0, 255],    // Electric Magenta
  [0, 255, 0],      // Radioactive Green
  [255, 0, 150],    // Hot Pink
  [255, 255, 0],    // Laser Yellow
  [255, 100, 0],    // Blazing Orange
  [0, 150, 255],    // Electric Blue
  [180, 0, 255],    // Ultraviolet
  [255, 0, 50],     // Nuclear Red
  [190, 255, 0],    // Toxic Lime
  [0, 255, 180],    // Plasma Aqua
  [255, 50, 100]    // Lava Coral
];
```

⚠️ **Diese RGB-Werte MÜSSEN mit `pilz-farben.css` synchron sein!**

## Compare-Morphs

| Morph | Datentyp | Visualisierung |
|-------|----------|----------------|
| `compareBar` | `number` | Horizontale Balken |
| `compareRating` | `0-5, 0-10` | Sterne ★★★☆☆ |
| `compareRadar` | `[{axis,value}]` | Überlagerte Radars |
| `comparePie` | `{key:number}` | Kreisdiagramme |
| `compareTag` | `string` | Farbige Tags |
| `compareBoolean` | `true/false` | Ja/Nein Icons |
| `compareText` | `string` | Text-Vergleich |

## Signatur

```javascript
function compareMorph(items, config) → HTMLElement

// items = [{ name, wert, _meta }]
// config = { label, feldName, ... }
```

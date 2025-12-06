# Morphs

Reine Funktionen. Keine Klassen. Kein Zustand. **Keine Seiteneffekte!**

## Struktur

```
morphs/
├── index.js          ← Zentrale Registry + compareMorph()
├── compare/          ← Compare-Morphs für Vergleichs-Ansicht
│   ├── base.js       ← Utils: erstelleFarben(), detectType(), createSection()
│   ├── index.js      ← Export aller Compare-Morphs
│   └── primitives/   ← 16 Compare-Primitives (bar, pie, radar, etc.)
├── text.js           ← String-Darstellung
├── number.js         ← Zahlen mit Unit/Prefix
├── boolean.js        ← Ja/Nein Icons
├── tag.js            ← Farbige Chips
├── badge.js          ← Status-Labels
├── range.js          ← Min-Max Slider
├── list.js           ← String-Listen
├── object.js         ← Key-Value Tabellen
├── image.js          ← Bilder
├── link.js           ← URLs
├── pie.js            ← Kreisdiagramm
├── bar.js            ← Balkendiagramm
├── radar.js          ← Radar-Chart
├── rating.js         ← Sterne-Bewertung
├── progress.js       ← Fortschrittsbalken
├── stats.js          ← Statistik-Box
├── timeline.js       ← Zeitliche Abfolge
├── suche.js          ← Feature: Suchfeld
├── perspektiven.js   ← Feature: Perspektiven-Buttons
└── header.js         ← Feature: App-Header
```

## MORPH-PURITY REGEL

```javascript
// ✅ ERLAUBT in Morphs:
document.createElement()     // DOM erstellen
element.appendChild()        // DOM aufbauen
element.addEventListener()   // Lokale Events auf eigenem Element

// ❌ VERBOTEN in Morphs:
document.dispatchEvent()     // → Nur Features dürfen Events dispatchen!
document.addEventListener()  // → Nie global!
```

**Morphs sind REINE Transformationen:** `(wert, config) → HTMLElement`

## Compare-Morphs

Für die Vergleichs-Ansicht. Alle Items einer Perspektive nebeneinander.

### Farb-System (base.js)

```javascript
// erstelleFarben(items) - CSS Single Source of Truth
export function erstelleFarben(items) {
  return items.map((item, index) => ({
    name: item._meta?.name || item.name || `Item ${index + 1}`,
    farbIndex: index % 12,           // 0-11
    farbKlasse: `pilz-farbe-${index % 12}`  // CSS-Klasse
  }));
}
```

**Styling via CSS** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```

### FALLBACK_FARBEN (nur für farbDistanz)

In `base.js` für Distance-Calculation - RGB muss mit CSS synchron sein:

```javascript
const FALLBACK_FARBEN = [
  [0, 255, 255],    // Electric Cyan
  [255, 0, 255],    // Electric Magenta
  [0, 255, 0],      // Radioactive Green
  // ... 12 total
];
```

## Datengetriebene Typ-Erkennung

Pipeline erkennt Morphs anhand der **DATENSTRUKTUR**:

```javascript
// Automatisch erkannt:
{ min: 0, max: 10 }           // → range
{ avg: 5, min: 0, max: 10 }   // → stats  
[{ axis: "x", value: 5 }]     // → radar
"https://..."                 // → link
true / false                  // → boolean
```

Konfiguriert in `config/morphs.yaml`.

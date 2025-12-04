# Compare Morphs - Generische Compare-Wrapper

## Zweck

Wiederverwendbare Compare-Wrapper für Vergleichsansichten. Diese Morphs sind **domänenunabhängig** und nutzen die Primitives.

## Architektur

```
morphs/compare/
├── base.js         # Utilities: erstelleFarben, detectType, createSection
├── morphs.js       # 16 Compare-Morphs: compareBar, compareRadar, etc.
├── composites.js   # Re-Export aus composites/
├── composites/     # Intelligente Composite-Morphs
│   ├── types.js        # Typ-Kategorien
│   ├── analyze.js      # Analyse-Funktionen
│   ├── render.js       # Rendering-Helpers
│   ├── smartCompare.js # Smart Compare Composite
│   ├── diffCompare.js  # Diff Compare Composite
│   └── index.js        # Exports
└── index.js        # Haupt-Export
```

## Compare-Morphs (morphs.js)

| Morph | Datentyp | Visualisierung |
|-------|----------|----------------|
| `compareBar` | `number` | Horizontale Balken |
| `compareBarGroup` | `[{label,value}]` | Gruppierte Balken |
| `compareRating` | `0-5, 0-10` | Sterne ★★★☆☆ |
| `compareProgress` | `0-100` | Prozent-Balken |
| `compareRange` | `{min,max}` | Range-Visualisierung |
| `compareStats` | `{min,max,avg}` | Box-Plot Style |
| `compareTag` | `string (badge)` | Farbige Tags |
| `compareList` | `string[]` | Listen-Vergleich |
| `compareRadar` | `[{axis,value}]` | **Überlagerte** Radar-Charts |
| `comparePie` | `{key:number}` | Kreisdiagramme |
| `compareTimeline` | `[{date,event}]` | Zeitliche Events |
| `compareImage` | `url` | Bildergalerie |
| `compareBoolean` | `true/false` | Ja/Nein mit Icons |
| `compareObject` | `{key:value}` | Tabellen-Diff |
| `compareText` | `string` | Text-Vergleich |

## Composite-Morphs (composites/)

| Morph | Beschreibung |
|-------|--------------|
| `smartCompare` | Analysiert Daten, gruppiert Felder, baut optimalen Vergleich |
| `diffCompare` | Zeigt Unterschiede/Gemeinsamkeiten zwischen Items |

## Kernfunktionen

### base.js

```javascript
// Farben für Items generieren
erstelleFarben(ids: string[]) → Map<string, string>

// Datentyp aus Struktur erkennen (DATENGETRIEBEN!)
detectType(value: any) → 'rating' | 'progress' | 'number' | 'radar' | ...

// Section-Container erstellen
createSection(label, farbe?) → HTMLElement

// Header für Compare-View erstellen
createHeader(config) → HTMLElement
```

### morphs.js

```javascript
// Automatische Typ-Selektion
compareByType(typ, items, config) → HTMLElement

// Bei Array-Werten automatisch BarGroup
if (typ === 'bar' && Array.isArray(items[0].wert)) → compareBarGroup
```

## Item-Format

Alle Compare-Morphs erwarten Items im Format:

```javascript
{
  id: string,     // Eindeutige ID
  name: string,   // Anzeigename
  wert: any,      // Der zu vergleichende Wert
  farbe: string   // CSS-Farbe
}
```

## Typ-Erkennung (DATENGETRIEBEN)

```javascript
detectType(4.5)                           // → 'rating' (0-10 dezimal)
detectType(85)                            // → 'progress' (0-100 int)
detectType({ min: 10, max: 25 })          // → 'range'
detectType({ min: 80, max: 350, avg: 180 })// → 'stats'
detectType([{ axis: 'A', value: 80 }])    // → 'radar'
detectType([{ date: 'Mai', event: 'X' }]) // → 'timeline'
detectType([{ label: 'A', value: 4.2 }])  // → 'bar' (Array!)
detectType({ Protein: 26, Fett: 8 })      // → 'pie'
detectType(['tag1', 'tag2'])              // → 'list'
detectType(true)                          // → 'boolean'
detectType({ key: 'value' })              // → 'object'
```

## Nutzung

```javascript
import { erstelleFarben, detectType, compareByType } from '../../morphs/compare/index.js';

// Farben für Items
const farben = erstelleFarben(['pilz-1', 'pilz-2', 'pilz-3']);

// Items vorbereiten
const items = [
  { id: 'pilz-1', name: 'Steinpilz', wert: { min: 1, max: 5, wert: 4 }, farbe: farben.get('pilz-1') },
  { id: 'pilz-2', name: 'Pfifferling', wert: { min: 1, max: 5, wert: 3 }, farbe: farben.get('pilz-2') }
];

// Typ erkennen
const typ = detectType(items[0].wert); // → 'rating'

// Compare-Morph rendern
const el = compareByType(typ, items, { label: 'Bewertung' });
```

## Erweiterung

Neuen Compare-Typ hinzufügen:

1. In `morphs.js` die Funktion erstellen:
   ```javascript
   export function compareNeu(items, config) {
     // ...
   }
   ```

2. In `compareByType` registrieren:
   ```javascript
   case 'neu': return compareNeu(items, config);
   ```

3. Optional: In `detectType` erkennen:
   ```javascript
   if (isNeuFormat(value)) return 'neu';
   ```

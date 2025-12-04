# Compare Morphs - Generische Compare-Wrapper

## Zweck

Wiederverwendbare Compare-Wrapper für Vergleichsansichten. Diese Morphs sind **domänenunabhängig** und nutzen die Primitives.

## Architektur

```
morphs/compare/
├── base.js       # Utilities: erstelleFarben, detectType, createSection, createHeader
├── morphs.js     # Compare-Wrapper: compareBar, compareRadar, comparePie, etc.
└── index.js      # Re-Export aller Funktionen
```

## Kernfunktionen

### base.js

```javascript
// Farben für Items generieren
erstelleFarben(ids: string[]) → Map<string, string>

// Datentyp aus Struktur erkennen (DATENGETRIEBEN!)
detectType(value: any) → 'rating' | 'progress' | 'number' | 'radar' | 'pie' | 'list' | 'tag' | 'text'

// Section-Container erstellen
createSection(label, farbe?) → { el: HTMLElement, content: HTMLElement }

// Header für Compare-View erstellen
createHeader(items, label?) → HTMLElement
```

### morphs.js

```javascript
// Automatische Typ-Selektion
compareByType(typ, items, config) → HTMLElement

// Spezifische Compare-Morphs
compareBar(items, config)    → Balken-Vergleich
compareRadar(items, config)  → Radar-Chart Overlay
comparePie(items, config)    → Pie-Chart nebeneinander
compareTag(items, config)    → Tag-Vergleich mit Farben
compareList(items, config)   → Listen-Vergleich
compareText(items, config)   → Text-Fallback
compareRating(items, config) → Rating mit Sternen
compareImage(items, config)  → Bild-Galerie
```

## Item-Format

Alle Compare-Morphs erwarten Items im Format:

```javascript
{
  id: string,     // Eindeutige ID (pilz-id, item-id)
  name: string,   // Anzeigename
  wert: any,      // Der zu vergleichende Wert
  farbe: string   // CSS-Farbe für dieses Item
}
```

## Typ-Erkennung (DATENGETRIEBEN)

Der Typ wird aus der **Datenstruktur** erkannt, NICHT aus dem Feldnamen:

```javascript
detectType(5.0)                    // → 'number' (einfache Zahl)
detectType({ min: 1, max: 5 })     // → 'rating' (min/max Range)
detectType({ aktuell: 3, max: 5 }) // → 'progress' (aktuell/max)
detectType({ a: 1, b: 2, c: 3 })   // → 'radar' (3+ numerische Achsen)
detectType({ a: 1, b: 2 })         // → 'pie' (2 numerische Achsen)
detectType(['tag1', 'tag2'])       // → 'list' (Array von Strings)
detectType('essbar')               // → 'tag' (einzelner String)
detectType('...')                  // → 'text' (Fallback)
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

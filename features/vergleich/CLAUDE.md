# Feature: Vergleich

Datengetriebene Vergleichsansicht (Sammel-Diagramm).

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Vergleichs-Rendering |
| `vergleich.css` | Vergleich-Styles |

## Architektur

```javascript
import { smartCompare } from '../../morphs/compare/composites/index.js';

// Pro aktiver Perspektive
for (const perspId of aktivePerspektiven) {
  const perspektive = getPerspektive(perspId);
  const compareEl = smartCompare(compareItems, {
    includeOnly: perspektive.felder
  });
}
```

## Datenfluss

1. `getAuswahlNachPilz()` → Ausgewählte Items mit Feldern
2. `erstelleFarben(itemIds)` → Neonfarben zuweisen
3. `smartCompare(items, config)` → Automatisches Rendering
4. Perspektiven-Gruppierung

## Features

- **Sammel-Diagramm**: Gleiche Felder zusammengefasst
- **Automatische Typ-Erkennung**: Bar/Pie/Radar basierend auf Daten
- **Perspektiven-Gruppierung**: Felder nach Perspektive gruppiert
- **Lokale Suche**: Fuzzy-Suche in geladenen Daten
- **Highlights**: Suchtreffer hervorheben
- **Abwahl-Buttons**: Einzelne Felder entfernen

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | IN | Items ausgewählt |
| `perspektiven:geaendert` | IN | Perspektiven-Filter |
| `header:suche:ergebnisse` | IN | Suche für Highlights |
| `vergleich:render` | OUT | Neu gerendert |

## Legende

```javascript
import { createLegende } from '../../morphs/compare/base.js';

// Zeigt alle Items mit Farben
const legende = createLegende(items);
```

## Item-Namen

Namen kommen aus `schema.meta.nameField`:

```javascript
import { getItemName } from '../../util/semantic.js';
const name = getItemName(item); // → "Steinpilz"
```

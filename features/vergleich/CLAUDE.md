# Feature: Vergleich

Datengetriebene Vergleichsansicht.

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

1. `getAuswahlNachPilz()` → Ausgewählte Items
2. `createColors(itemIds)` → Farben zuweisen
3. `smartCompare(items, config)` → Automatisches Rendering

## Events

| Event | Beschreibung |
|-------|--------------|
| `perspektive:activated` | Perspektive aktiviert |
| `perspektive:deactivated` | Perspektive deaktiviert |
| `vergleich:render` | Neu gerendert |

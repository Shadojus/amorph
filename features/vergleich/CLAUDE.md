# Feature: Vergleich

100% DATA-DRIVEN comparison mit smartCompare.

## Architektur

Kein themes/ Ordner - alles automatisch:

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
3. `getPerspektive(perspId)` → Perspektiven-Definition
4. `smartCompare(items, config)` → Automatisches Rendering

## Glasmorphism

```css
.compare-perspektive {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
}
```

## Events

- `perspektive:activated`
- `perspektive:deactivated`
- `vergleich:render`

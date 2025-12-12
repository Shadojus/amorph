# Feature: Vergleich (Sammel-Diagramm)

100% DATA-DRIVEN comparison using smartCompare.

## Übersicht

Das Vergleich-Feature bietet:
- **Glasmorphism Design** (identisch zu Grid-View)
- Sammel-Diagramm mit Item-Legende (farbige Punkte)
- **17 Perspektiven-Filter**: Felder aus schema/perspektiven/ filtern
- Multi-Perspektiven Glow
- **smartCompare Integration**: Automatische Typ-Erkennung
- **Suche-Highlights**: Markiert Suchbegriffe im Vergleich-View

## Data-Driven Architektur

**KEIN themes/ Ordner mehr!** Alles automatisch:

```javascript
import { smartCompare } from '../../morphs/compare/composites/index.js';

// Pro aktiver Perspektive
for (const perspId of aktivePerspektiven) {
  const perspektive = getPerspektive(perspId);
  const perspectiveFields = perspektive.fields.map(f => f.id || f);
  
  // smartCompare mit Feld-Filter
  const compareEl = smartCompare(compareItems, {
    includeOnly: perspectiveFields
  });
}
```

## Datenfluss

1. `getAuswahlNachPilz()` → Liefert ausgewählte Items
2. `createColors(itemIds)` → Weist Farben zu (CSS-basiert)
3. `getPerspektive(perspId)` → Holt Perspektiven-Definition aus Schema
4. `smartCompare(items, {includeOnly})` → Rendert automatisch

## smartCompare Features

- **analyzeItems()**: Extrahiert Felder aus items[0].data
- **detectType()**: Bestimmt besten Morph (bar, radar, tag, etc.)
- **findRelatedFields()**: Gruppiert nach Kategorie
- **render*Composite()**: Rendert jede Gruppe

## Glasmorphism

```css
.compare-perspektive {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}
```

## Events

- `perspektive:activated` → Perspektive wurde aktiviert
- `perspektive:deactivated` → Perspektive wurde deaktiviert
- `vergleich:render` → Vergleich wird neu gerendert
- `suche:render` → Suche hat Ergebnisse, Highlights anwenden
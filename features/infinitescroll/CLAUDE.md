# Feature: Infinite Scroll

Automatisches Nachladen beim Scrollen.

## Architektur

- **IntersectionObserver**: Performante Scroll-Detektion
- **Sentinel-Element**: Unsichtbarer Trigger am Ende
- **Batch Loading**: 12 Items pro Batch

## API

```javascript
dataSource.loadMore(offset, limit) → Promise<{ items, hasMore }>
```

## Events

**Hört auf:**
- `header:suche:ergebnisse` (Reset bei Suche)
- `amorph:ansicht-wechsel` (Deaktiviert bei Vergleich)

**Emittiert:**
- `amorph:items-loaded` (Nach Laden)

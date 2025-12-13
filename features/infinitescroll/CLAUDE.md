# Feature: Infinite Scroll

Automatisches Nachladen beim Scrollen.

## Architektur

- **IntersectionObserver**: Performante Scroll-Detektion
- **Sentinel-Element**: Unsichtbarer Trigger am Ende
- **Batch Loading**: 12 Items pro Batch

## API

```javascript
// DataSource muss implementieren:
dataSource.loadMore(offset, limit) → Promise<{ items, hasMore }>
dataSource.getTotalCount() → number
```

## Events

**Hört auf:**
- `header:suche:ergebnisse` (Reset bei Suche)
- `amorph:ansicht-wechsel` (Deaktiviert bei Vergleich)

**Emittiert:**
- `amorph:items-loaded` (Nach Laden)

## Integration

1. Feature in `features.yaml` aktivieren
2. DataSource mit `loadMore()` bereitstellen
3. Container mit `[data-amorph-container]`

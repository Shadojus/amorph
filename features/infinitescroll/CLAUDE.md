# Infinite Scroll Feature

Lädt automatisch weitere Items wenn der User ans Ende scrollt.

## Architektur

- **IntersectionObserver**: Performante Scroll-Detektion
- **Sentinel-Element**: Unsichtbarer Trigger am Ende der Liste
- **Batch Loading**: Lädt jeweils 12 Items nach

## API

```javascript
// DataSource muss implementieren:
dataSource.loadMore(offset, limit) → Promise<{ items, hasMore }>
dataSource.getTotalCount() → number
```

## Events

- Lauscht: `header:suche:ergebnisse` (Reset bei neuer Suche)
- Lauscht: `amorph:ansicht-wechsel` (Deaktiviert bei Vergleich)
- Emittiert: `amorph:items-loaded` (Nach Laden neuer Items)

## Integration

1. Feature in `features.yaml` aktivieren
2. DataSource muss `loadMore()` unterstützen
3. Container braucht `[data-amorph-container]` Attribut

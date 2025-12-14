# Feature: Infinite Scroll

Automatisches Nachladen beim Scrollen.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Scroll-Handling |
| `infinitescroll.css` | Loading-Indicator |

## Architektur

- **IntersectionObserver**: Performante Scroll-Detektion
- **Sentinel-Element**: Unsichtbarer Trigger am Ende
- **Batch Loading**: 12 Items pro Batch (konfigurierbar)
- **Loading State**: Verhindert doppeltes Laden

## API

```javascript
dataSource.loadMore(offset, limit) → Promise<{ items, hasMore }>
```

## Events

**Hört auf:**
- `header:suche:ergebnisse` - Reset bei neuer Suche
- `amorph:ansicht-wechsel` - Deaktiviert bei Vergleich-View

**Emittiert:**
- `amorph:items-loaded` - Nach Laden neuer Items

## Sentinel

```html
<div class="infinite-scroll-sentinel"></div>
```

Wird beobachtet mit IntersectionObserver. Sobald sichtbar → loadMore().

## State

```javascript
{
  offset: 0,
  hasMore: true,
  isLoading: false
}
```

## Reset-Bedingungen

- Neue Suche startet → offset = 0
- Perspektiven ändern sich → offset = 0
- View wechselt zu Vergleich → pausiert

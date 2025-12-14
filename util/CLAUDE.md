# Util

Kleine Helfer. Keine Abhängigkeiten.

## Dateien

| Datei | Zweck |
|-------|-------|
| `dom.js` | Sichere DOM-Manipulation |
| `fetch.js` | Datenquellen + Pagination |
| `session.js` | URL-State Persistenz |
| `semantic.js` | Schema-Gateway |
| `router.js` | Client-side Routing |

## semantic.js

```javascript
getFeldMorphs()                // → { feldname: morphName }
getFeldConfig(feldname)        // → { label, einheit, ... }
sortBySchemaOrder(item)        // → Sortierte Entries
```

## session.js

```javascript
getUrlState()                  // → { suche, perspektiven, ansicht }
setUrlState({ suche })         // URL aktualisieren
```

## fetch.js

```javascript
createDataSource(config)

dataSource.loadMore(offset, limit)  // → { items, hasMore }
dataSource.search(query)            // → Gefilterte Items
```

## dom.js

```javascript
el(tag, attrs, children)    // Element erstellen
setText(element, text)      // Text sicher setzen
toggleClass(el, cls, force) // Klasse toggle
```

# Util

Kleine Helfer. Keine Abhängigkeiten.

## Dateien

| Datei | Zweck |
|-------|-------|
| `dom.js` | Sichere DOM-Manipulation |
| `fetch.js` | Datenquellen + Infinite Scroll |
| `session.js` | URL-State Persistenz |
| `semantic.js` | Schema-Gateway |
| `router.js` | Client-side Routing |

## session.js

```javascript
getUrlState()                  // → { suche, perspektiven, ansicht }
setUrlState({ suche, ... })    // In URL speichern (kein Reload)

// URL: ?perspektiven=chemistry,ecology
```

## fetch.js

```javascript
createDataSource(config)

dataSource.loadMore(offset, limit)  // → { items, hasMore }
dataSource.getTotalCount()
```

## dom.js

```javascript
el(tag, attrs, children)    // Element erstellen
setText(element, text)      // Text sicher setzen
toggleClass(el, cls, force) // Klasse toggle
```

## semantic.js

```javascript
getFeldLabel(feldname)        // → "Primäre Metabolite"
getFeldPerspektiven(feldname) // → ["chemistry"]
```

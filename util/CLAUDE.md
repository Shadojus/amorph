# Util

Kleine Helfer. Keine Abhängigkeiten.

## Übersicht

| Datei | Zweck |
|-------|-------|
| `dom.js` | Sichere DOM-Manipulation |
| `fetch.js` | Datenbank-Zugriff + Infinite Scroll |
| `session.js` | Session-Handling + URL-State |
| `semantic.js` | Config-Gateway (Schema + Morphs-Config) |
| `router.js` | Client-side Routing |

## session.js - URL State Persistenz

```javascript
// URL State lesen/schreiben
getUrlState()                  // → { suche, perspektiven, ansicht }
setUrlState({ suche, ... })    // Speichert in URL (ohne Reload)

// Perspektiven in URL
?perspektiven=chemistry,sensorik,ecology
```

## fetch.js - Datenquellen + Infinite Scroll

```javascript
// Datenquelle erstellen
createDataSource(config)

// JsonSource hat Infinite Scroll Support
dataSource.loadMore(offset, limit)  // → { items, hasMore }
dataSource.getTotalCount()          // Gesamtanzahl
```

## dom.js - Sichere DOM-Manipulation

```javascript
// Element erstellen mit Attributen und Kindern
export function el(tag, attrs = {}, children = []) { ... }

// Text sicher setzen (kein innerHTML!)
export function setText(element, text) { ... }

// CSS-Klassen toggle
export function toggleClass(element, className, force) { ... }
```

## semantic.js - Schema-Gateway

```javascript
// Feldname → Label aus felder.yaml
getFeldLabel(feldname)  // → "Primäre Metabolite"

// Feldname → Perspektiven aus 17 perspektiven/*.yaml
getFeldPerspektiven(feldname)  // → ["chemistry"]
```


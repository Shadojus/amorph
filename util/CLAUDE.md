# Util

Kleine Helfer. Keine zyklischen Abhängigkeiten untereinander (alle importieren nur `observer/debug.js`).

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `dom.js` | 57 | Sichere DOM-Manipulation |
| `fetch.js` | 895 | Datenquellen + Pagination + Suche + Highlighting |
| `semantic.js` | 592 | Schema-Gateway (zentral!) |
| `session.js` | 176 | Session + URL-State + LocalStorage |
| `router.js` | 118 | Client-side Routing |

---

## dom.js (57 Zeilen)

### Exports

```javascript
el(tag, attrs, children)   // Element erstellen
setText(element, text)     // Text sicher setzen
clear(element)             // Container leeren
$(selector, context)       // querySelector
$$(selector, context)      // querySelectorAll → Array
```

### el() - Element Factory

Unterstützte Attribute:
- `className` → `element.className`
- `style` (Object) → `Object.assign(element.style, value)`
- `data*` → `element.dataset[key]`
- `on*` (Function) → `addEventListener`
- Rest → `setAttribute`

```javascript
el('div', { className: 'card', dataId: '123', onClick: fn }, [
  el('span', {}, ['Text'])
]);
```

### Debug-Logging

Nur wichtige Tags werden geloggt: `form`, `nav`, `header`, `main`, `section`, `article`

---

## fetch.js (895 Zeilen)

### Exports

```javascript
createDataSource(config)                           // Factory → DataSource
extractAllTexts(obj)                               // Rekursive Text-Extraktion
localSearch(items, query)                          // Lokale Suche auf Arrays
highlightInContainer(container, query, matches)    // Such-Highlighting
clearHighlights(container)                         // Highlights entfernen
```

### Datenquellen-Typen (via `config.quelle.typ`)

| Typ | Klasse | Struktur |
|-----|--------|----------|
| `pocketbase` | PocketBaseSource | API Collections |
| `rest` | RestSource | REST-Endpoints |
| `json` | JsonSource | Einzelne JSON-Datei |
| `json-multi` | JsonMultiSource | index.json + einzelne Dateien |
| `json-perspektiven` | JsonPerspektivenSource | index.json + Ordner/Perspektiven |

### DataSource Interface

```javascript
query({ search, limit, offset })  → items[]
loadMore(offset, limit)           → { items, hasMore }
getBySlug(slug)                   → item
getById(id)                       → item
getTotalCount()                   → number
getMatchedTerms()                 → Set
```

### JsonSource (Zeilen 108-220)

- Lädt JSON lazy bei `ensureData()`
- Suche mit `scoreItemWithMatches(item, query)`
- Pagination über `lastFilteredData.slice(offset, offset + limit)`
- Speichert `lastMatchedTerms` für Highlighting

### JsonMultiSource (Zeilen 230-350)

Struktur:
```
data/fungi/index.json       → { dateien: ["steinpilz.json", ...] }
data/fungi/steinpilz.json   → { name: "Steinpilz", ... }
```

- Lädt alle Dateien parallel via `Promise.all`
- Suche identisch zu JsonSource

### JsonPerspektivenSource (Zeilen 360-520)

Struktur:
```
data/animalia/index.json              → { spezies: [{ ordner: "monarchfalter" }] }
data/animalia/monarchfalter/index.json → { name, perspektiven: ["ecology", ...] }
data/animalia/monarchfalter/ecology.json → { ... }
```

- Lädt Spezies-Index, dann Perspektiven lazy
- `loadAllPerspektiven(spezies)` merged alle Perspektiven ins Hauptobjekt
- Cache via `loadedPerspektiven` Map

### Scoring-Funktionen (Zeilen 600-720)

```javascript
scoreItemWithMatches(item, query) → { score, matches[] }
```

Scoring-Regeln:
| Match | Score |
|-------|-------|
| Exakter Name | 100 |
| Name beginnt mit Query | 80 |
| Name enthält Query | 60 |
| Wissenschaftlicher Name | 40 |
| Andere Felder | 20 |
| Pro Query-Wort | 10 |
| Semantisches Match | +score aus Schema |

Stopwords werden ignoriert: `was, ist, der, die, das, ein, eine, und, oder, ...`

### localSearch(items, query) (Zeilen 720-760)

Lokale Suche für bereits geladene Daten (z.B. Vergleich-View):
```javascript
localSearch(items, query) → { results[], matchedTerms: Set, scores: Map }
```

### highlightInContainer() (Zeilen 770-895)

Markiert Treffer in DOM-Elementen:
```javascript
highlightInContainer(container, query, matchedTerms, { selectors })
```

**Standard-Selektoren:**
```css
.amorph-text, .amorph-tag, .amorph-label, .amorph-value,
.compare-label, .bar-name, .bar-wert, .rating-name, .rating-wert,
.chip-wert, .list-wert, .compare-list-item, .radar-achse,
.pie-pilz, .timeline-event, .legende-item,
.compare-text-name, .compare-text-wert,
.range-name, .range-wert, .stats-name, .stats-wert,
.progress-name, .progress-wert, .boolean-name, .boolean-wert
```

**Verhalten:**
- Überspringt SVG-Elemente (würden durch innerHTML zerstört)
- Erzeugt `<mark class="amorph-highlight">`
- Nutzt `matchedTerms` aus DataSource-Suche
- Fallback: Query in Wörter splitten, Stopwords filtern

---

## semantic.js (592 Zeilen) - SCHEMA GATEWAY

**Zentrale Schnittstelle zum Schema!** Alle Schema-Zugriffe sollten hierüber laufen.

### Schema-Cache

```javascript
setSchema(schema)      // Nach Config-Load setzen
getSchema()            // Aktuelles Schema zurückgeben
```

### Meta-Funktionen

```javascript
getSchemaMeta()        → { nameField, idField, bildField }
getItemName(item)      // Name aus richtigem Feld (verhindert "undefined")
getItemId(item)        // ID aus richtigem Feld
```

### Feld-Reihenfolge

```javascript
getFeldReihenfolge()   → string[]           // Feldnamen in Schema-Reihenfolge
sortBySchemaOrder(obj) → [key, value][]     // Objekt nach Schema sortiert
```

### Semantische Suche (Zeilen 105-220)

```javascript
semanticScore(item, query) → { score: number, matches: string[] }
```

Matching-Strategien aus Schema:
1. **werte** - Exakte Werte (z.B. "essbar", "giftig")
2. **enthält** - String/Array enthält Muster
3. **existiert** - Feld existiert und hat Inhalt
4. **aktuell** - Saison/Datum enthält aktuellen Monat

### Perspektiven-Funktionen (Zeilen 230-350)

```javascript
getPerspektivenKeywords()                         → { [id]: string[] }
getPerspektivenListe()                            → [{ id, name, symbol, farbe, farben, felder, morphs }]
getPerspektive(perspId)                           → Perspektive | null
getPerspektivenMorphConfig(feldName, aktive[])    → { ...config, perspektive, farben } | null
getAllePerspektivenFarben(feldName, aktive[])     → { perspektiven[], isMulti }
```

### Suchfelder

```javascript
getSuchfelder() → { [feldname]: { gewicht, exakt } }
```

### Feld-Morphs

```javascript
getFeldMorphs()           → { [feldname]: morphTyp }
getVersteckteFelder()     → string[]
getFeldConfig(feldname)   → { label, einheit, max, ... }
getAlleFeldConfigs()      → { [feldname]: config }
```

### inferFeldMetadata() (Zeilen 470-530)

DATA-DRIVEN: Inferiert Metadaten aus Feldnamen-Pattern:

| Pattern | Einheit |
|---------|---------|
| `temp`, `temperatur` | °C |
| `_days`, `_tage` | days |
| `_hours`, `_stunden`, `_h` | h |
| `_kg`, `_g`, `_mm`, `_cm`, `_km` | kg, g, mm, cm, km |
| `_m2`, `_sqm` | m² |
| `percent`, `prozent`, `_pct` | % |
| `_ppm`, `_lux`, `_ph` | ppm, lux, pH |

Max-Werte:
- `rating`, `score`, `bewertung` → max: 10
- `percent`, `prozent`, `efficiency` → max: 100

### Morphs-Config (Zeilen 540-592)

```javascript
setMorphsConfig(config)    // Setzt morphs.yaml Cache
getFarben(palette)         → string[] | string | null
getBadgeConfig()           → { variants, colors } | null
```

Paletten: `fungi`, `diagramme`, `standard`

---

## session.js (176 Zeilen)

### Session Management

```javascript
getSession()      → { id, source } | null   // Cookie oder SessionStorage
createSession()   → { id, source }          // crypto.randomUUID(), Cookie max-age=86400
clearSession()                              // Cookie + SessionStorage löschen
```

### URL-State Management

```javascript
getUrlState()     → { suche, perspektiven[], ansicht }
setUrlState(state) // history.replaceState ohne Reload
```

Parameter:
- `suche` - Suchbegriff
- `perspektiven` - Komma-separiert
- `ansicht` - Nur wenn nicht "karten"

### LocalStorage Persistence

```javascript
saveLastSearch(query)      // Max 10 Einträge
getSearchHistory()         → string[]
getLastSearch()            → string | null

savePerspektiven(arr)
getSavedPerspektiven()     → string[]

saveAuswahl(map)           // SessionStorage
getSavedAuswahl()          → [{ key, pilzId, feldName }]
```

---

## router.js (118 Zeilen)

### Route-Definitionen

```javascript
const routes = {
  liste: /^\/$/,
  einzelansicht: /^\/([^/?]+)\/?$/
};
```

### Exports

```javascript
parseRoute()                                    → { route, params, query }
navigateTo(route, params, query)                // pushState + Event
updateQueryState(query)                         // replaceState ohne Navigation
goBack()                                        // history.back()
initRouter(onChange)                            // Initialisierung mit Callback
```

### Events

- `amorph:route-change` - Bei Navigation via `navigateTo()`
- `popstate` - Browser Back/Forward

### URL-Struktur

| URL | Route | Params | Query |
|-----|-------|--------|-------|
| `/` | liste | {} | { suche, perspektiven } |
| `/steinpilz` | einzelansicht | { slug: "steinpilz" } | { suche, perspektiven } |
| `/?suche=pilz&perspektiven=a,b` | liste | {} | { suche: "pilz", perspektiven: ["a","b"] } |

---

## Abhängigkeiten

```
dom.js        → observer/debug.js
fetch.js      → observer/debug.js, semantic.js
semantic.js   → observer/debug.js
session.js    → observer/debug.js
router.js     → observer/debug.js
```

## Wichtige Patterns

### Data Source Factory

```javascript
const ds = createDataSource(config);
const items = await ds.query({ search: "pilz", limit: 20 });
const more = await ds.loadMore(20, 20);
```

### Highlighting nach Suche

```javascript
const { results, matchedTerms } = localSearch(items, query);
// Nach Render:
highlightInContainer(container, query, matchedTerms);
```

### Schema-Zugriff

```javascript
import { getItemName, getFeldConfig, getPerspektive } from './semantic.js';

const name = getItemName(item);
const config = getFeldConfig('toxizitaet');
const persp = getPerspektive('chemistry');
```

# Features

Feature-System: Modulare UI-Komponenten die auf Data Events reagieren.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `index.js` | 57 | loadFeatures() - Feature-Loader |
| `context.js` | 69 | createFeatureContext() - Feature-Isolation |
| `index.css` | - | Feature-übergreifende Styles |

## Unterordner (8 Features)

| Feature | Zeilen | Zweck |
|---------|--------|-------|
| `header/` | 664 | Branding + Suche + Perspektiven + Ansicht-Switch |
| `ansichten/` | 555 | Auswahl-State + Detail/Vergleich-Rendering (Legacy) |
| `vergleich/` | 557 | Compare-View mit smartCompare |
| `grid/` | 68 | Layout-Toolbar (Liste/Grid/Kompakt) |
| `einzelansicht/` | 169 | Fullpage-Detailansicht (/:slug) |
| `infinitescroll/` | 152 | IntersectionObserver für Pagination |
| `suche/` | 23 | Standalone (DEPRECATED → header) |
| `perspektiven/` | 24 | Standalone (DEPRECATED → header) |

---

## index.js (57 Zeilen) - Feature Loader

### Exports

```javascript
export async function loadFeatures(container, config, dataSource, callbacks) → Feature[]
export function unloadFeatures(features)
```

### Eingebaute Features

```javascript
const eingebauteFeatures = {
  suche, perspektiven, grid, header,
  ansichten, vergleich, einzelansicht, infinitescroll
};
```

### Load-Ablauf

```javascript
for (name of config.features.aktiv) {
  // 1. Eingebaut oder extern laden
  let feature = eingebauteFeatures[name] || import(config.features.extern[name])
  
  // 2. Context erstellen
  const ctx = createFeatureContext(name, container, config, dataSource, callbacks)
  
  // 3. Feature initialisieren
  await feature(ctx)
}
```

---

## context.js (69 Zeilen) - Feature Context

### createFeatureContext(name, container, config, dataSource, callbacks)

Isoliert jedes Feature mit eigenem DOM-Bereich und Event-System.

```javascript
return {
  dom,          // div.amorph-feature.amorph-feature-{name}
  config,       // features.{name} aus Config (frozen)
  container,    // App-Container
  dataSource,   // DataSource für Queries (inkl. matchedTerms)

  on(event, handler),           // Lokaler Event-Listener
  emit(event, detail),          // Lokal + document.{name}:{event}
  fetch(query),                 // dataSource.query()
  search(query),                // callbacks.onSearch() oder query
  requestRender(detail),        // amorph:request-render Event
  mount(position),              // In Container einfügen
  destroy()                     // Cleanup
}
```

### Event-Dispatching

```javascript
ctx.emit('ergebnisse', { count: 5 })
// 1. Lokal: eventTarget.dispatchEvent('ergebnisse', ...)
// 2. Global: document.dispatchEvent('header:ergebnisse', ...)
```

### Header-Spezial-Config

```javascript
// Header bekommt alle Feature-Configs + Branding
const featureConfig = name === 'header' 
  ? { suche, perspektiven, ansicht, branding, appName }
  : config.features[name];
```

---

## header/ (664 Zeilen) - HAUPTFEATURE

### Funktion

- **Zeile 0:** Branding (Titel + Partner)
- **Zeile 1:** Suche + aktive Filter-Badges + Ansicht-Switch
- **Zeile 2:** Perspektiven-Grid
- **Zeile 3:** Ausgewählte Items (dynamisch)

### Key-Funktionen

```javascript
suchen()                    // Query → DB oder Highlights (je nach View)
togglePerspektive(id, btn)  // Max 4 aktiv
aktualisiereAktiveBadges()  // Badges in Suchleiste
anwendenPerspektiven()      // data-perspektive-sichtbar setzen
markiereTreffer(ergebnisse) // .hat-treffer auf Perspektiven-Buttons
autoPerspektiven(ergebnisse, query) // Auto-Aktivierung basierend auf Keywords
```

### Events (empfangen)

| Event | Reaktion |
|-------|----------|
| `amorph:auswahl-geaendert` | Ansicht-Switch Counter + Auswahl-Zeile |
| `amorph:auto-search` | Input befüllen + suchen() |
| `amorph:remove-from-selection` | Item aus Auswahl entfernen |

### Events (senden)

| Event | Detail |
|-------|--------|
| `amorph:ansicht-wechsel` | { ansicht } |
| `header:suche:ergebnisse` | { query, ergebnisse, matchedTerms, nurHighlights? } |
| `perspektiven:geaendert` | { aktiv: [] } |

### Scroll-Detection

IntersectionObserver mit Sentinel-Element statt window.scroll.

---

## ansichten/ (555 Zeilen) - Auswahl-State

### Globaler State

```javascript
const state = {
  auswahl: Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>,
  aktiveAnsicht: 'karten' | 'detail' | 'vergleich',
  detailPilzId: null
};
```

### Exports

```javascript
// State
export function getState()
export function setAktiveAnsicht(ansicht)

// Feld-Auswahl
export function toggleFeldAuswahl(pilzId, feldName, wert, pilzDaten) → count
export function toggleAuswahl(id, daten)  // Legacy: alle Felder eines Items
export function removeFeldAuswahl(feldName) → count  // Für Compare-Abwahl
export function clearAuswahl()

// Abfragen
export function getAuswahlPilzIds() → string[]
export function getAuswahl() → string[]
export function getAuswahlNachPilz() → Map<pilzId, {pilzDaten, felder[]}>
export function getAuswahlNachFeld() → Map<feldName, [{pilzId, pilzDaten, wert}]>
export function istFeldAusgewaehlt(pilzId, feldName) → boolean

// Navigation
export function detailNavigation(richtung) → pilzId
```

### Events

| Event | Detail |
|-------|--------|
| `amorph:auswahl-geaendert` | { auswahl[], anzahl, pilzIds[], entfernterPilz?, entferntesFeld? } |

---

## vergleich/ (557 Zeilen) - Compare View

### smartCompare Integration

Nutzt `morphs/compare/composites/smartCompare` für automatische Diagramm-Generierung.

### Render-Modi

**Perspektiven-Modus (wenn aktiv):**
```javascript
for (perspId of aktivePerspektiven) {
  const perspektive = getPerspektive(perspId);
  smartCompare(compareItems, { includeOnly: perspektive.felder });
}
```

**Fallback-Modus (keine Perspektiven):**
```javascript
for ([feldName, items] of nachFeld) {
  compareMorph(feldName, typ, items, config);
}
```

### Farb-System

```javascript
// Perspektiven-Farben → Pilz-Farben-Filterung
setAktivePerspektivenFarben(perspektivenFarben);
const pilzFarben = erstelleFarben(pilzIds);
// → Filtered Farb-Palette aus pilz-farben.css
```

### Events (empfangen)

| Event | Reaktion |
|-------|----------|
| `amorph:auswahl-geaendert` | render() |
| `amorph:ansicht-wechsel` | show/hide |
| `header:suche:ergebnisse` | Highlights |
| `perspektiven:geaendert` | Re-render mit neuen Perspektiven |

---

## grid/ (68 Zeilen) - Layout Toolbar

### Layouts

```javascript
const icons = { liste: '☰', grid: '⊞', kompakt: '▤' };
```

### Events

| Event | Detail |
|-------|--------|
| `grid:changed` (emit) | { layout } |
| `amorph:ansicht-wechsel` (receive) | Hide/Show grid items |

---

## einzelansicht/ (169 Zeilen) - Detail Page

### URL-Routing

```
/:slug → einzelansicht
```

### Events (empfangen)

| Event | Reaktion |
|-------|----------|
| `amorph:route-change` | show(pilz) bei route='einzelansicht' |
| `amorph:ansicht-wechsel` | hide() bei !='karten' |
| `amorph:navigate-pilz` | slug laden, show() |

### Rendering

- Header mit Zurück-Button
- Großes Bild
- Beschreibung
- Alle Felder via `transform()` Pipeline

---

## infinitescroll/ (152 Zeilen) - Infinite Scroll

### Config

```javascript
const DEFAULT_BATCH_SIZE = 12;
const TRIGGER_THRESHOLD = 200; // px vor Ende
```

### IntersectionObserver

```javascript
const observer = new IntersectionObserver(async (entries) => {
  if (entry.isIntersecting && hasMore && !isLoading) {
    await loadMore();
  }
}, { rootMargin: '200px' });
```

### Events

| Event | Reaktion |
|-------|----------|
| `header:suche:ergebnisse` | reset() |
| `amorph:ansicht-wechsel` | Deaktivieren im Vergleich-View |
| `amorph:items-loaded` (emit) | { items, offset, hasMore } |

---

## suche/ (23 Zeilen) - DEPRECATED

Standalone Suche-Feature. **Nutze stattdessen `header/`.**

---

## perspektiven/ (24 Zeilen) - DEPRECATED

Standalone Perspektiven-Feature. **Nutze stattdessen `header/`.**

---

## Feature-Kommunikation

```
header → amorph:ansicht-wechsel → ansichten, vergleich, grid, einzelansicht
header → perspektiven:geaendert → vergleich
header → header:suche:ergebnisse → infinitescroll, vergleich
ansichten → amorph:auswahl-geaendert → header, vergleich
```

---

## Neues Feature erstellen

1. **Ordner:** `features/meinfeature/index.js`
   ```javascript
   import { debug } from '../../observer/debug.js';

   export default function init(ctx) {
     debug.features('My feature init');
     
     // DOM erstellen
     const el = document.createElement('div');
     ctx.dom.appendChild(el);
     
     // Events
     ctx.on('custom-event', handler);
     document.addEventListener('amorph:auswahl-geaendert', handler);
     
     // Mounten
     ctx.mount('beforeend');
   }
   ```

2. **Config:** `features.yaml`
   ```yaml
   aktiv:
     - meinfeature
   
   meinfeature:
     option1: value
   ```

3. **Extern:** (optional)
   ```yaml
   extern:
     meinfeature: ./custom/meinfeature.js
   ```

---

## Abhängigkeiten

```
index.js      → context.js, alle feature/index.js, observer/debug.js
context.js    → observer/debug.js
header/       → config/header.js, config/suche.js, config/perspektiven.js,
                util/semantic.js, features/ansichten/index.js
ansichten/    → util/semantic.js, observer/debug.js
vergleich/    → ansichten/, util/semantic.js, morphs/compare/*
einzelansicht/→ core/pipeline.js, util/router.js, util/semantic.js
grid/         → observer/debug.js
infinitescroll/→ core/pipeline.js, observer/debug.js
```

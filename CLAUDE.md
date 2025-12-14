# AMORPH

Formlos. Zustandslos. Transformierend.

## Konzept

Datengetriebenes Transformations-Framework. Struktur der Daten bestimmt Darstellung.

```
DATEN (JSON) → detectType() → MORPH → DOM
```

**Kirk-Prinzipien**: Visualisierung wird von Datenstruktur abgeleitet, nicht manuell definiert.

---

## Architektur

| Ordner | Zweck | Hauptdateien |
|--------|-------|--------------|
| `core/` | Config, Pipeline, Container | config.js (543), pipeline.js (880), container.js (72) |
| `config/` | YAML-Konfiguration | manifest, daten, morphs, features, observer, schema/ |
| `config/schema/` | Modulares Schema | basis.yaml, semantik.yaml, perspektiven/ |
| `features/` | 8 Feature-Module | Context API, isolierte UI-Komponenten |
| `morphs/` | 30+ Transformationen | primitives/, compare/, composites/ |
| `observer/` | Debug & Analytics | debug.js, interaction.js, rendering.js, session.js |
| `util/` | Utilities | dom.js, fetch.js, router.js, semantic.js, session.js |
| `styles/` | CSS Design-System | Black Glasmorphism, 12 Pilz-Farben |
| `data/` | Testdaten | 4 Kingdoms × 15 Perspektiven |
| `themes/` | Style-Overrides | (Platzhalter) |
| `scripts/` | Build-Scripts | (Platzhalter) |

---

## Einstiegspunkte

| Datei | Zweck |
|-------|-------|
| `index.js` | Entry: `amorph({ container, config })` |
| `index.html` | Demo-Seite |
| `styles/index.css` | Alle CSS-Imports |

---

## 30+ Primitive Morphs

**Text/Display**: text, string, number, boolean, badge, tag, rating, progress
**Container**: list, object, hierarchy
**Charts**: bar, pie, radar, sparkline, heatmap, gauge, slopegraph, severity
**Range/Stats**: range, stats
**Temporal**: timeline, lifecycle, steps, calendar
**Specialized**: image, link, map, network, citation, dosage, currency
**Kirk**: kirk (dynamische Auswahl), interpreted (Beschreibungen)

---

## Compare-System

`morphs/compare/` - Morphs für Vergleichsansicht mehrerer Items:

| Morph | Zweck |
|-------|-------|
| `smartCompare` | Automatische Typ-Erkennung & Vergleich |
| `diffCompare` | Differenz-Highlight |
| `compareByType` | Explizite Typ-Angabe |

**Farben**: 12 `pilz-farbe-X` Klassen für Item-Identifikation (CSS-Variablen).

---

## 15 Perspektiven

| ID | Symbol | Fokus |
|----|--------|-------|
| chemistry | 🧪 | Metabolite, Enzyme, Zusammensetzung |
| conservation | 🛡️ | IUCN-Status, Schutzmaßnahmen |
| culinary | 🍳 | Essbarkeit, Zubereitung |
| cultivation | 🌱 | Anbau, Substrate |
| culture | 📜 | Mythologie, Geschichte |
| ecology | 🌿 | Habitat, Symbiosen |
| economy | 💰 | Markt, Preise |
| geography | 🗺️ | Verbreitung, Klima |
| identification | 🔍 | Bestimmungsmerkmale |
| interactions | 🔗 | Wirte, Mikrobiom |
| medicine | 💊 | Wirkstoffe, Therapie |
| research | 📚 | Publikationen |
| safety | ⚠️ | Toxine, Verwechslung |
| statistics | 📊 | Fundstatistiken |
| temporal | ⏰ | Saisonalität |

**Schema**: `config/schema/perspektiven/*.yaml` - Jede Perspektive definiert `fields[]`, `colors[]`, `keywords[]`.

---

## 8 Features

| Feature | Pfad | Beschreibung |
|---------|------|--------------|
| Header | `features/header/` | Logo, Suche, Navigation |
| Grid | `features/grid/` | Layout-Switcher (Grid/Liste/Kompakt) |
| Ansichten | `features/ansichten/` | View-Management |
| Einzelansicht | `features/einzelansicht/` | Detail-Modal |
| Vergleich | `features/vergleich/` | Compare-Modus |
| Perspektiven | `features/perspektiven/` | Perspektiven-Wechsel |
| Suche | `features/suche/` | Semantische Suche |
| InfiniteScroll | `features/infinitescroll/` | Lazy-Loading |

**Pattern**: `context.js` exportiert `createContext()` mit `signal()` / `effect()` für reaktive Features.

---

## Typ-Erkennung (detectType)

### Zahlen (detectNumberType)
```javascript
0-10 mit Dezimal  → 'rating'
0-100 Ganzzahl    → 'progress'
andere            → 'number'
```

### Strings (detectStringType)
```javascript
http(s)://        → 'link'
.jpg/.png/...     → 'image'
Status-Keyword    → 'badge'
≤20 Zeichen       → 'tag'
andere            → 'string'
```

### Arrays (detectArrayType)
```javascript
[num, num, ...]         → 'sparkline'
[[num], [num]]          → 'heatmap'
[{vorher, nachher}]     → 'slopegraph'
[{phase}]               → 'lifecycle'
[{date, event}]         → 'timeline'
[{axis, value}] ≥3      → 'radar'
[{label, value}] ≤6     → 'pie'
[{label, value}] >6     → 'bar'
```

### Objekte (detectObjectType)
```javascript
{lat, lng}              → 'map'
{author, year, title}   → 'citation'
{dose, unit}            → 'dosage'
{currency, amount}      → 'currency'
{value, zones/min/max}  → 'gauge'
{vorher, nachher}       → 'slopegraph'
{min, max, avg} ≥3      → 'stats'
{min, max}              → 'range'
{rating/score}          → 'rating'
{status}                → 'badge'
{A: num, B: num} 2-8    → 'pie'
```

---

## Event-System

```javascript
// Core Events
'amorph:rendered'           // Nach Render
'amorph:items-loaded'       // Daten geladen
'amorph:route-change'       // Navigation
'amorph:ansicht-wechsel'    // View-Wechsel

// Auswahl
'amorph:auswahl-geaendert'  // Feld-Auswahl geändert
'amorph:items-ausgewaehlt'  // Items für Vergleich

// Perspektiven
'amorph:perspektive-geaendert'  // Perspektive gewechselt
```

---

## Morph-Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement | null
```

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `wert` | any | Eingabedaten |
| `config` | object | Morph-Konfiguration |
| `morphField` | function | Rekursive Transformation |

**Regeln**: 
- ✅ DOM erstellen
- ✅ Lokale Events (click, etc.)
- ❌ Globale Events
- ❌ Seiteneffekte

---

## Observer-System

`observer/debug.js` - Zentrales Logging:

```javascript
debug.config(msg, data)    // Konfiguration
debug.render(msg, data)    // Rendering
debug.detection(msg, data) // Typ-Erkennung
debug.mount(msg, data)     // Component Mount
debug.warn(msg, data)      // Warnungen
debug.error(msg, data)     // Fehler
```

**Aktivierung**: `config/observer.yaml` → `debug: true`

---

## Design-System: Black Glasmorphism

### CSS-Variablen
```css
--glass-bg: rgba(0, 0, 0, 0.55);
--glass-blur: blur(24px);
--glass-border: rgba(100, 150, 255, 0.06);
--color-text: rgba(255, 255, 255, 0.94);
```

### 12 Pilz-Farben
```css
.pilz-farbe-0 { --pilz-rgb: 0, 255, 255; }   /* Electric Cyan */
.pilz-farbe-1 { --pilz-rgb: 255, 0, 255; }   /* Electric Magenta */
/* ... bis pilz-farbe-11 */
```

### Responsive Breakpoints
- XL: 1280px+ (4 Spalten)
- LG: 1024-1279px (3 Spalten)
- MD: 768-1023px (2 Spalten)
- SM/XS: <768px (1-2 Spalten)

---

## Initialisierung

```javascript
import { amorph } from './index.js';

const app = await amorph({
  container: '#app',           // CSS-Selektor oder Element
  config: './config/',         // Config-Ordner
  customMorphs: {}             // Optionale Custom-Morphs
});
```

### Rückgabe-API

```javascript
app.destroy()        // Aufräumen, Observer stoppen
app.reload()         // Daten neu laden
app.search(query)    // Suche ausführen → items[]
app.getData()        // Aktuelle Daten abrufen
```

### index.js (435 Zeilen) - Ablauf

1. **Config laden** → `loadConfig()` (YAML-Dateien)
2. **Schema setzen** → `setSchema()` für semantische Suche
3. **Erkennung setzen** → `setErkennungConfig()` für Pipeline + Compare
4. **DataSource erstellen** → `createDataSource()` (JSON/REST/PocketBase)
5. **Observer starten** → `setupObservers()`
6. **Features laden** → `loadFeatures()` mit Callbacks
7. **URL-State wiederherstellen** → `getUrlState()`, auto-search
8. **Event-Handler** → Suche, Perspektiven, Ansicht, Feld-Auswahl

### index.html

```html
<main id="app" data-amorph-container></main>
<script type="module">
  import { amorph } from './index.js';
  window.amorph = await amorph({ container: '#app', config: './config/' });
</script>
```

---

## Testdaten

4 Kingdoms mit je 15 Perspektiven-JSONs:
- `data/animalia/monarchfalter/`
- `data/bacteria/ecoli/`
- `data/fungi/fly-agaric/`, `porcini/`
- `data/plantae/ginkgo/`

**Format**: `{id, slug, name, scientific_name, image, perspectives[]}`

---

## Modulare Exports (index.js)

```javascript
// Hauptfunktion
export { amorph } from './index.js';

// Core
export { loadConfig } from './core/config.js';
export { transform, render } from './core/pipeline.js';

// Morphs
export { morphs } from './morphs/index.js';

// Data
export { createDataSource } from './util/fetch.js';

// Observer
export { setupObservers } from './observer/index.js';

// Features
export { loadFeatures } from './features/index.js';
```

---

## Dateistruktur pro Ordner

Jeder Ordner enthält `CLAUDE.md` mit vollständiger Dokumentation:
- `core/CLAUDE.md` - config.js, pipeline.js, container.js
- `config/CLAUDE.md` - YAML-Dateien, Schema
- `config/schema/CLAUDE.md` - Modulares Schema, 15 Perspektiven
- `features/CLAUDE.md` - 8 Features, Context API
- `morphs/CLAUDE.md` - 30+ Morphs, Compare-System
- `morphs/primitives/CLAUDE.md` - Primitive-Morphs Details
- `morphs/compare/CLAUDE.md` - Compare-System Details
- `observer/CLAUDE.md` - Debug, Observer
- `util/CLAUDE.md` - Utilities
- `styles/CLAUDE.md` - CSS Design-System
- `data/CLAUDE.md` - Testdaten-Struktur

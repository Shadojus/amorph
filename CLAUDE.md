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
| `core/` | Config, Pipeline, Container | config.js, pipeline.js, container.js |
| `config/` | YAML-Konfiguration | manifest, daten, morphs, features, observer |
| `config/schema/` | Modulares Schema | basis.yaml, semantik.yaml, perspektiven/ |
| `config/schema/perspektiven/blueprints/` | 15 Morph-Blueprints | *.blueprint.yaml |
| `features/` | 8 Feature-Module | Context API, isolierte UI-Komponenten |
| `morphs/` | 87 Transformationen | 43 primitives/, 44 compare/ |
| `observer/` | Debug & Analytics | debug.js, interaction.js, rendering.js |
| `util/` | Utilities | dom.js, fetch.js, router.js, semantic.js |
| `styles/` | CSS Design-System | Black Glasmorphism, 12 Pilz-Farben |
| `data/` | Testdaten | alpine-marmot (animalia), deadly-nightshade (plantae) |
| `docs/` | Entwicklungs-Dokumentation | Kirk-Prinzipien, Daten-Erstellung |
| `themes/` | Style-Overrides | (Platzhalter) |
| `scripts/` | Build-Scripts | validate.js, build-index.js |

---

## Einstiegspunkte

| Datei | Zweck |
|-------|-------|
| `index.js` | Entry: `amorph({ container, config })` |
| `index.html` | Demo-Seite |
| `styles/index.css` | Alle CSS-Imports |

---

## 43 Morph-Primitives (+ 44 Compare)

### Text/Display
`text`, `string`, `number`, `boolean`, `badge`, `tag`, `rating`, `progress`

### Container
`list`, `object`, `hierarchy`

### Charts
`bar`, `pie`, `radar`, `sparkline`, `heatmap`, `gauge`, `slopegraph`, `severity`
`groupedbar`, `stackedbar`, `boxplot`, `dotplot`, `lollipop`, `scatterplot`
`sunburst`, `treemap`, `bubble`, `pictogram`

### Range/Stats
`range`, `stats`

### Temporal
`timeline`, `lifecycle`, `steps`, `calendar`

### Specialized
`image`, `link`, `map`, `network`, `citation`, `dosage`, `currency`
`comparison`, `flow`

### Kirk
`kirk` (dynamische Auswahl)

---

## Morph-Erkennung (Priorität)

```
flow → scatterplot → groupedbar → stackedbar → boxplot → dotplot →
lollipop → sunburst → treemap → bubble → pictogram → slopegraph →
heatmap → sparkline → severity → lifecycle → timeline → steps →
calendar → radar → pie → bar → network → hierarchy → map →
citation → dosage → currency → gauge → stats → range → comparison →
rating → progress → badge → image → link → tag → text → number →
boolean → list → object
```

---

## 15 Perspektiven

| ID | Symbol | Fokus | Blueprint |
|----|--------|-------|-----------|
| chemistry | 🧪 | Metabolite, Enzyme | ~500 Felder |
| conservation | 🛡️ | IUCN-Status, Schutz | ~600 Felder |
| culinary | 🍳 | Essbarkeit, Zubereitung | ~400 Felder |
| cultivation | 🌱 | Anbau, Substrate | ~800 Felder |
| culture | 📜 | Mythologie, Geschichte | ~700 Felder |
| ecology | 🌿 | Habitat, Symbiosen | ~650 Felder |
| economy | 💰 | Markt, Preise | ~600 Felder |
| geography | 🗺️ | Verbreitung, Klima | ~900 Felder |
| identification | 🔍 | Bestimmungsmerkmale | ~2000 Felder |
| interactions | 🔗 | Wirte, Mikrobiom | ~550 Felder |
| medicine | 💊 | Wirkstoffe, Therapie | ~700 Felder |
| research | 📚 | Publikationen | ~600 Felder |
| safety | ⚠️ | Toxine, Verwechslung | ~1400 Felder |
| statistics | 📊 | Fundstatistiken | ~500 Felder |
| temporal | ⏰ | Saisonalität | ~1600 Felder |

**Blueprints**: `config/schema/perspektiven/blueprints/*.blueprint.yaml`
Jedes Blueprint definiert leere Datenstrukturen mit korrektem Morph-Typ.

---

## 8 Features

| Feature | Pfad | Beschreibung |
|---------|------|--------------|
| Header | `features/header/` | Logo, Suche, Navigation |
| Grid | `features/grid/` | Layout-Switcher |
| Ansichten | `features/ansichten/` | View-Management |
| Einzelansicht | `features/einzelansicht/` | Detail-Modal |
| Vergleich | `features/vergleich/` | Compare-Modus |
| Perspektiven | `features/perspektiven/` | Perspektiven-Wechsel |
| Suche | `features/suche/` | Semantische Suche |
| InfiniteScroll | `features/infinitescroll/` | Lazy-Loading |

---

## Event-System

```javascript
'amorph:rendered'              // Nach Render
'amorph:items-loaded'          // Daten geladen
'amorph:route-change'          // Navigation
'amorph:ansicht-wechsel'       // View-Wechsel
'amorph:auswahl-geaendert'     // Feld-Auswahl
'amorph:items-ausgewaehlt'     // Items für Vergleich
'amorph:perspektive-geaendert' // Perspektive gewechselt
```

---

## Morph-Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement | null
```

**Regeln**: 
- ✅ DOM erstellen
- ✅ Lokale Events
- ❌ Globale Events
- ❌ Seiteneffekte

---

## Daten-System

### Architektur

```
JSON Files (data/) → Zod Validierung → Frontend (Lazy Loading)
       ↓
   build:index
       ↓
universe-index.json (schnelle Übersicht)
```

### NPM Scripts

```bash
npm run dev              # Entwicklungsserver starten
npm run validate         # Alle Daten mit Zod validieren
npm run build:index      # Universe-Index neu generieren
```

### Datenquellen (daten.yaml)

| Typ | Beschreibung | Empfehlung |
|-----|--------------|------------|
| `json-universe-optimized` | Lädt Index, Perspektiven on-demand | **Produktion** |
| `json-universe` | Lädt alles bei Suche | Entwicklung |
| `json-perspektiven` | Einzelne Sammlung | Legacy |

### Validierung mit Zod

```bash
# Alle Daten validieren
npm run validate

# Einzelne Spezies
npm run validate -- --species steinpilz

# Watch-Modus
npm run validate:watch
```

---

## Daten-Workflow

### 1. JSON-Datei erstellen
```
data/{kingdom}/{species}/
├── index.json           # Name, Slug, Bild
├── identification.json  # Bestimmung
├── culinary.json        # Kulinarik
├── safety.json          # Sicherheit
└── ...                  # Weitere Perspektiven
```

### 2. Validieren
```bash
npm run validate
```

### 3. Index aktualisieren
```bash
npm run build:index
```

---

## Debug-Konsole

```javascript
window.amorphDebug.summary()   // Stats
window.amorphFilter('search')  // Filter
window.amorphVerbose(true)     // Alle logs
```

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

2 vollständige Spezies mit Perspektiven-JSONs:
- `data/animalia/alpine-marmot/` (11 JSON-Dateien)
- `data/plantae/deadly-nightshade/` (8 JSON-Dateien)

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
- `morphs/CLAUDE.md` - 87 Morphs (43 primitives, 44 compare)
- `morphs/primitives/CLAUDE.md` - Primitive-Morphs Details
- `morphs/compare/CLAUDE.md` - Compare-System Details
- `observer/CLAUDE.md` - Debug, Observer
- `util/CLAUDE.md` - Utilities
- `styles/CLAUDE.md` - CSS Design-System
- `data/CLAUDE.md` - Testdaten-Struktur

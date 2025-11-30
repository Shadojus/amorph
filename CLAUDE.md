# AMORPH v5

Formlos. Zustandslos. Transformierend.

## Was ist AMORPH?

AMORPH transformiert Daten aus einer Datenbank in DOM-Elemente. Nichts wird gespeichert. Bei jeder Anfrage werden die Daten frisch geladen und neu gerendert.

```
SCHEMA → DATENBANK → MORPHS → DOM
```

Das Schema (`config/schema.yaml`) ist die **Single Source of Truth**. Es definiert:
- Welche Felder existieren und wie sie dargestellt werden
- Semantische Suchregeln (Keywords → Feldwerte)
- Perspektiven (Filteransichten mit Farbmarkierung)
- Tag-Farben pro Feld

## Die vier Säulen

### 0. Schema (config/schema.yaml)
Definiert die Datenstruktur und steuert das gesamte System. Änderungen hier propagieren automatisch zu Morphs, Suche und Perspektiven.

### 1. Morphs (morphs/)
Reine Funktionen die Daten in DOM-Elemente transformieren. Kein Zustand, keine Seiteneffekte.

```javascript
function text(wert, config) {
  const span = document.createElement('span');
  span.textContent = String(wert);
  return span;
}
```

### 2. Observer (observer/)
Beobachten das System und melden nach außen. Tun nichts, sehen alles.

- InteractionObserver: Klicks, Hovers
- RenderingObserver: Was gerendert wird
- SessionObserver: User-Sessions (wenn aktiv)

### 3. Features (features/)
Eigenständige, isolierte Erweiterungen. Bekommen eingeschränkten Kontext, keinen globalen Zugriff.

- Suche: Durchsucht Datenbank, lädt neue Morphs
- Perspektiven: Verschiedene Blickwinkel auf Daten
- Grid: Layout-Optionen

## Architektur-Entscheidungen

### Morphs sind Listen, Container sind Web Components

Morphs selbst sind simple Funktionen die DOM-Elemente zurückgeben. Aber sie werden in Web Components gewrappt:

```html
<amorph-container data-morph="text" data-field="name">
  <!-- Hier rendert der Morph sein Ergebnis -->
</amorph-container>
```

Warum Web Components für Container?
- Shadow DOM isoliert CSS
- Lifecycle-Hooks für Cleanup
- Custom Events für Observer
- Standardkonform, keine Magie

### Immer frisch aus der Datenbank

Die Suche lädt IMMER neue Daten:

```javascript
async function suchen(query) {
  const daten = await fetchFromDatabase(query);  // Frisch!
  render(daten);  // Neu rendern!
}
```

Kein Cache. Keine lokale Kopie. Datenbank ist die Wahrheit.

### Schema als Single Source of Truth

Das Schema definiert alles an einem Ort:

```yaml
# Felder mit Typ, Label und Suchgewicht
felder:
  essbarkeit:
    typ: tag
    label: Essbarkeit
    suche:
      gewicht: 50
    farben:  # Tag-Farben direkt im Schema
      Essbar: "#22c55e"
      Giftig: "#ef4444"

# Semantische Suche
semantik:
  essbar:
    keywords: [essbar, essen, speisepilz]
    feld: essbarkeit
    werte: [essbar]
    score: 50

# Perspektiven mit Feldern und Farben
perspektiven:
  sicherheit:
    name: Sicherheit
    symbol: ⚠️
    farbe: "#ef4444"
    felder: [essbarkeit, verwechslung, symptome]
```

Das macht AMORPH universell: Schema anpassen = neues Datenmodell.

### Session-Observer

Wenn eine User-Session existiert, beobachtet der SessionObserver:

```javascript
if (session.exists()) {
  sessionObserver.start(session.id);
}
```

Ohne Session: Kein Tracking. Datenschutz by Design.

## Ordnerstruktur

```
amorph/
├── CLAUDE.md           ← Du bist hier
├── index.js            ← Einstiegspunkt
├── core/
│   ├── pipeline.js     ← Transformiert Daten → DOM
│   ├── container.js    ← Web Component Wrapper
│   └── config.js       ← Lädt YAML-Konfiguration
├── morphs/
│   └── *.js            ← Morph-Funktionen (text, tag, list, ...)
├── observer/
│   ├── debug.js        ← Debug-Logging-System
│   └── *.js            ← Observer (interaction, rendering, session)
├── features/
│   ├── header/         ← Suche + Perspektiven
│   ├── grid/           ← Layout-Optionen
│   └── context.js      ← Feature-Kontext-Factory
├── util/
│   ├── fetch.js        ← Datenquellen (JSON, API)
│   ├── semantic.js     ← Schema-Zugriff & semantische Suche
│   └── dom.js          ← DOM-Hilfsfunktionen
├── config/
│   ├── schema.yaml     ← ⭐ Single Source of Truth
│   ├── manifest.yaml   ← App-Metadaten
│   ├── daten.yaml      ← Datenquelle
│   ├── morphs.yaml     ← Globale Morph-Defaults
│   ├── features.yaml   ← Aktive Features
│   └── observer.yaml   ← Observer-Konfiguration
├── styles/
│   ├── base.css        ← CSS-Variablen & Reset
│   ├── morphs.css      ← Morph-Styles
│   └── perspektiven.css← Dynamische Perspektiven-Styles
└── template/           ← Starter für neue Projekte
```

## Schnellstart

```javascript
import { amorph } from './amorph/index.js';

amorph({
  container: '#app',
  config: './config/'
});
```

## Konfiguration

Eine Datei pro Aspekt in `config/`:

- `schema.yaml` - ⭐ **Datenstruktur, Semantik, Perspektiven** (wichtigste Datei!)
- `manifest.yaml` - App-Name, Version, Beschreibung
- `daten.yaml` - Datenquelle (JSON-Pfad oder API-URL)
- `morphs.yaml` - Globale Morph-Defaults (maxItems, truncate)
- `features.yaml` - Welche Features aktiv (header, grid)
- `observer.yaml` - Debug-Level, aktive Observer

**Für ein neues Projekt**: Nur `schema.yaml` und `daten.yaml` anpassen!

## Sicherheit

- Kein innerHTML, nur DOM-APIs
- Web Components mit Shadow DOM
- Feature-Isolation durch eingeschränkten Kontext
- CSP-konform (kein inline JS/CSS)
- Input-Validierung gegen Schema

## Philosophie

> "Die beste Architektur ist die, die du nicht brauchst."

AMORPH macht eine Sache: Daten in DOM transformieren. Nicht mehr, nicht weniger.

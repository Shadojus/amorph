# AMORPH v5

Formlos. Zustandslos. Transformierend.

## Systemübersicht

AMORPH ist ein datengetriebenes Transformations-Framework das Daten aus einer Datenbank in DOM-Elemente wandelt. Das System basiert auf:

- **Schema-basierte Transformation** (YAML → Morphs → DOM)
- **Black Glasmorphism Design** mit Multi-Color Glow
- **Semantische Suche** mit Keyword-Mapping
- **Perspektiven-System** mit 4-Farben-Grid
- **Datengetriebene Morphs** - Typ-Erkennung aus Datenstruktur, nicht Feldname!

### Features

- **Header 3-Zeilen-Layout**:
  - Zeile 0 (Branding): FUNGINOMI + Bifroest Links
  - Zeile 1 (Suche): Suchleiste mit aktiven Filter-Badges
  - Zeile 2 (Controls): Ansicht-Switch + Perspektiven-Buttons
- **2 Ansichten**:
  - **Grid (Karten)**: Karten-Layout (Standard)
  - **Vergleich (Vektorraum)**: Laterale Visualisierung mit Compare-Morphs
- **Feld-Auswahl-System**: Einzelne FELDER sind anklickbar
- **View-aware Suche**: DB-Suche nur in Grid-View, Highlights in Vergleich-View

### Architektur-Prinzipien

- **Morph-Purity**: Keine Side-Effects, nur DOM-Erzeugung
- **Feature-Isolation**: Saubere Trennung der Komponenten
- **Config-Zentralisierung**: Alle Werte aus YAML-Config
- **Event-System**: Custom Events für Kommunikation

### Feld-Auswahl
User kann einzelne Felder in Cards auswählen:
- Klick auf Feld → existierender Perspektiven-Balken wird **intensiver**
- Hintergrund leuchtet stärker in Perspektiven-Farbe
- Balken wird breiter (2px → 5px) mit verstärktem Multi-Color Glow
- Detail-View zeigt ausgewählte Felder gruppiert nach Pilz
- Vergleich-View stellt gleiche Feldtypen nebeneinander

### Feld-Reihenfolge
Definiert in `config/schema.yaml`:
```yaml
reihenfolge:
  - bild         # Immer zuerst
  - name
  - wissenschaftlich
  - essbarkeit
  # ... weitere Felder
```

```javascript
// State-Struktur
state.auswahl = Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
```

## Was ist AMORPH?

AMORPH transformiert Daten aus einer Datenbank in DOM-Elemente. Nichts wird gespeichert. Bei jeder Anfrage werden die Daten frisch geladen und neu gerendert.

```
DATEN (JSON) → detectType() → MORPH → DOM
```

### Das Datengetrieben-Prinzip

**Die DATENSTRUKTUR bestimmt den MORPH, nicht der Feldname!**

```javascript
// ✅ SO funktioniert AMORPH:
{ min: 10, max: 25 }           → detectObjectType() → 'range'
{ min: 80, max: 350, avg: 180 } → detectObjectType() → 'stats'
[{ axis: 'X', value: 95 }]     → detectArrayType()  → 'radar'
{ Protein: 30, Fett: 20 }      → detectObjectType() → 'pie'

// ❌ NICHT SO:
if (feldName === 'temperatur') return 'range';  // VERBOTEN!
```

Das Schema (`config/schema.yaml`) ist die **Single Source of Truth** für:
- Explizite Typ-Overrides: `felder.essbarkeit.typ: tag`
- Feld-spezifische Farben: `felder.essbarkeit.farben`
- Semantische Suchregeln
- Perspektiven-Definitionen

Die Typ-Erkennung (`core/pipeline.js`) kommt aus `config/morphs.yaml`:
- `erkennung.badge.keywords` - Welche Strings als Badge erkannt werden
- `erkennung.rating/progress` - Zahlen-Ranges für Rating vs Progress
- `erkennung.objekt.*` - Welche Keys welchen Objekt-Typ signalisieren
- `erkennung.array.*` - Array-Struktur-Erkennung

## Design: Black Glasmorphism

AMORPH nutzt ein elegantes **Black Glasmorphism** Design:
- Tiefschwarzer Hintergrund mit `backdrop-filter: blur()`
- Glass-Cards mit dezenten weißen Borders (5-15% Opacity)
- **Multi-Color Glow-Effekte** mit CSS `color-mix()`
- Woodfloor-Texturen als subtiler Hintergrund
- Pulsierende Animationen für aktive Elemente

### Header-Layout (3 Zeilen)

```
Zeile 0: FUNGINOMI ........................ Part of Bifroest
         (Link /)                          (Link bifroest.io)

Zeile 1: [🔍 Suchen... ] [×] [◆ Geo] [◆ Cycle]
         (Suchleiste)  (Clear) (aktive Filter-Badges)

Zeile 2: [⊞ Grid] [☰ Detail] [▥ Vergl] | [🍳 Kulinarisch] [⚠ Sicherheit] ...
         (Ansicht-Switch)                  (Perspektiven-Buttons)
```

- Branding-Zeile: FUNGINOMI links, Bifroest rechts (beide klickbare Links)
- Suche-Zeile: Input + Clear-Button + aktive Filter als farbige Badges
- Controls-Zeile: Ansicht-Switch links, Perspektiven-Buttons rechts
- Aktive Perspektiven verschwinden aus Button-Zeile und erscheinen als Badges

### 4-Farben-Grid pro Perspektive

Jede Perspektive hat 4 harmonische Farben:
```yaml
perspektiven:
  kulinarisch:
    farben:
      - "#e8b04a"  # Hauptfarbe (Gold)
      - "#d4943a"  # Sekundär
      - "#f0c866"  # Hell
      - "#cc7a2a"  # Dunkel
```

Diese Farben erzeugen den Multi-Color Glow:
- `--p-farbe` (Hauptfarbe)
- `--p-farbe-1`, `--p-farbe-2`, `--p-farbe-3`

## Die vier Säulen

### 0. Schema (config/schema.yaml)
Definiert die Datenstruktur und steuert das gesamte System. Änderungen hier propagieren automatisch zu Morphs, Suche und Perspektiven.

### 1. Morphs (morphs/)
Reine Funktionen die Daten in DOM-Elemente transformieren. **Kein Zustand, keine Seiteneffekte!**

```javascript
// ✅ RICHTIG - Reine Funktion
function text(wert, config) {
  const span = document.createElement('span');
  span.textContent = String(wert);
  return span;
}

// ❌ VERBOTEN in Morphs:
// - document.dispatchEvent() → Nutze Callbacks
// - document.addEventListener() → Nutze Methoden auf Element
// - window.* → Nie globalen State ändern
```

**Morph-Purity Regel**: Morphs erzeugen DOM, sie interagieren nicht mit der Außenwelt.

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

# Perspektiven mit Feldern und 4-Farben-Grid
perspektiven:
  sicherheit:
    name: Sicherheit
    symbol: ⚠️
    farben:  # 4 harmonische Farben statt einer
      - "#e86080"
      - "#d44a6a"
      - "#f07898"
      - "#c83a5a"
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

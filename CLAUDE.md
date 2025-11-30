# AMORPH v5

Formlos. Zustandslos. Transformierend.

## Was ist AMORPH?

AMORPH transformiert Daten aus einer Datenbank in DOM-Elemente. Nichts wird gespeichert. Bei jeder Anfrage werden die Daten frisch geladen und neu gerendert.

```
DATENBANK → MORPHS → DOM
```

Das ist alles.

## Die drei Säulen

### 1. Morphs (core/morphs/)
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

### Schema-basierte Suche (NEU)

Die semantische Suche ist jetzt konfigurierbar über `config/schema.yaml`:

```yaml
semantik:
  essbar:
    keywords: [essbar, essen, speisepilz]
    feld: essbarkeit
    werte: [essbar]
    score: 50
```

Das macht AMORPH universell für beliebige Datentypen.

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
│   ├── CLAUDE.md       ← Pipeline und Container
│   ├── pipeline.js     ← Transformiert Daten
│   ├── container.js    ← Web Component
│   └── config.js       ← Lädt Konfiguration
├── morphs/
│   ├── CLAUDE.md       ← Alle Morphs erklärt
│   └── *.js            ← Die Morph-Funktionen
├── observer/
│   ├── CLAUDE.md       ← Observer-System
│   └── *.js            ← Die Observer
├── features/
│   ├── CLAUDE.md       ← Feature-System
│   └── */              ← Einzelne Features
├── util/
│   ├── CLAUDE.md       ← Hilfsfunktionen
│   ├── fetch.js        ← Datenquellen
│   └── semantic.js     ← Schema-basierte Suche (NEU)
├── config/
│   ├── schema.yaml     ← Datenstruktur & Semantik (NEU)
├── template/           ← Starter-Template (NEU)
│   └── CLAUDE.md       ← Konfigurationsformat
└── util/
    └── CLAUDE.md       ← Hilfsfunktionen
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

- `manifest.yaml` - Was ist das?
- `daten.yaml` - Woher kommen die Daten?
- `morphs.yaml` - Wie darstellen?
- `observer.yaml` - Was beobachten?
- `features.yaml` - Was ist aktiv?

## Sicherheit

- Kein innerHTML, nur DOM-APIs
- Web Components mit Shadow DOM
- Feature-Isolation durch eingeschränkten Kontext
- CSP-konform (kein inline JS/CSS)
- Input-Validierung gegen Schema

## Philosophie

> "Die beste Architektur ist die, die du nicht brauchst."

AMORPH macht eine Sache: Daten in DOM transformieren. Nicht mehr, nicht weniger.

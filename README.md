# AMORPH v5

**Formlos. Zustandslos. Transformierend.**

AMORPH transformiert Daten aus einer Datenbank in DOM-Elemente. Nichts wird gespeichert. Bei jeder Anfrage werden die Daten frisch geladen und neu gerendert.

```
DATENBANK → MORPHS → DOM
```

## Schnellstart

```bash
# Repository klonen
git clone https://github.com/your-repo/amorph.git
cd amorph

# Dev-Server starten
npx serve . -p 3000

# Browser öffnen
open http://localhost:3000
```

## Die drei Säulen

### 1. Morphs
Reine Funktionen die Daten in DOM-Elemente transformieren.

```javascript
function text(wert, config) {
  const el = document.createElement('span');
  el.textContent = String(wert);
  return el;
}
```

**Eingebaute Morphs:** text, number, boolean, tag, range, list, object, image, link

### 2. Observer
Beobachten das System und melden nach außen. Tun nichts, sehen alles.

- **InteractionObserver**: Klicks, Hovers
- **RenderingObserver**: Was gerendert wird
- **SessionObserver**: User-Sessions (wenn aktiv)

### 3. Features
Eigenständige, isolierte Erweiterungen mit eingeschränktem Kontext.

- **Suche**: Durchsucht Datenbank, lädt neue Morphs
- **Perspektiven**: Verschiedene Blickwinkel auf Daten
- **Grid**: Layout-Optionen (Liste, Grid, Kompakt)

## Projektstruktur

```
amorph/
├── index.html          ← Einstiegspunkt
├── index.js            ← JavaScript Entry
├── package.json
│
├── config/             ← Konfiguration
│   ├── manifest.yaml
│   ├── daten.yaml
│   ├── morphs.yaml
│   ├── observer.yaml
│   └── features.yaml
│
├── data/               ← Beispieldaten
│   └── fungi.json
│
├── styles/             ← CSS
│   ├── base.css
│   ├── morphs.css
│   ├── features.css
│   ├── layouts.css
│   └── perspektiven.css
│
├── core/               ← Kern-System
│   ├── config.js
│   ├── pipeline.js
│   └── container.js
│
├── morphs/             ← Morph-Funktionen
│   ├── text.js
│   ├── number.js
│   └── ...
│
├── observer/           ← Observer-System
│   ├── interaction.js
│   ├── rendering.js
│   └── session.js
│
├── features/           ← Features
│   ├── suche/
│   ├── perspektiven/
│   └── grid/
│
└── scripts/            ← Build-Tools
    ├── check.js
    └── build.js
```

## Konfiguration

### manifest.yaml
```yaml
name: Meine App
version: 1.0.0
```

### daten.yaml
```yaml
quelle:
  typ: json
  url: ./data/daten.json
```

### morphs.yaml
```yaml
felder:
  name: text
  preis: number
  tags: list
```

### features.yaml
```yaml
aktiv:
  - suche
  - perspektiven
  - grid
```

## Befehle

```bash
# Entwicklung
npm run dev

# Konfiguration prüfen
npm run check

# Produktions-Build
npm run build
```

## API

```javascript
import { amorph } from './index.js';

const app = await amorph({
  container: '#app',
  config: './config/'
});

// Neu laden
await app.reload();

// Suchen
await app.search('suchbegriff');

// Aufräumen
app.destroy();
```

## Eigene Morphs

```javascript
// custom/mein-morph.js
export function meinMorph(wert, config) {
  const el = document.createElement('div');
  el.className = 'mein-morph';
  el.textContent = wert;
  return el;
}

// Registrieren
import { meinMorph } from './custom/mein-morph.js';

amorph({
  container: '#app',
  customMorphs: { meinMorph }
});
```

## Philosophie

- **Zustandslos**: Kein Zustand = keine Zustandsprobleme
- **Einfach**: Weniger Code = weniger Bugs
- **Sicher**: Features isoliert, kein globaler Zugriff
- **Vorhersagbar**: Gleiche Daten = gleiches Ergebnis, immer

> "Die beste Architektur ist die, die du nicht brauchst."

## Lizenz

MIT

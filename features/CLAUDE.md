# Features

Eigenständig. Isoliert. Optional.

## 🚧 AKTUELLER ENTWICKLUNGSSTAND (02.12.2025)

### Fertig
- ✅ **Header-Feature**: 3-Zeilen-Layout mit Dark Glasmorphism
  - Zeile 0: FUNGINOMI (Link /) + Part of Bifroest (Link bifroest.io)
  - Zeile 1: Suchleiste + aktive Filter-Badges
  - Zeile 2: Ansicht-Switch + Perspektiven-Buttons
  - **View-aware Suche**: Prüft `aktiveAnsicht` vor DB-Query
- ✅ **Grid-Feature**: Karten-Layout (Standard-Ansicht)
- ✅ **Detail-Feature (Pinboard)**: Ausgewählte Daten als Pinnwand
  - Gruppierung nach Pilz/Feld/Perspektive/Frei
  - Drag & Drop für Gruppen
  - Zoom & Pan
  - Verbindungslinien
- ✅ **Vergleich-Feature (Vektorraum)**: Laterale Visualisierung
  - 2D Streudiagramm
  - Radar/Spinnendiagramm
  - 3D isometrische Projektion
  - Dimensionen-Auswahl
  - **Suche-Highlights**: Hört auf `header:suche:ergebnisse` Event
- ✅ **Ansichten-Feature**: Auswahl-State + Ansicht-State Tracking
  - Hört auf `amorph:ansicht-wechsel` Event
  - Aktualisiert `state.aktiveAnsicht` automatisch
- ✅ **Perspektiven**: 4-Farben-Grid, Multi-Color Glow, Auto-Aktivierung
- ✅ **Semantische Suche**: Keywords → Feldwerte aus Schema

### ✅ Feld-Auswahl (IMPLEMENTIERT)

```
VORHER: Ganze Cards wurden ausgewählt
↓
JETZT: Einzelne FELDER werden ausgewählt
```

**Funktionen**:
- User klickt einzelne Datenfelder an (Name, Temperatur, Bild...)
- Ausgewählte Felder glühen grün mit Checkmark
- Detail-View zeigt nur ausgewählte Felder gruppiert nach Pilz
- Vergleich-View stellt gleiche Feldtypen nebeneinander

**State**:
```javascript
state.auswahl = Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
```

## Ansichten-System

Drei Modi für Datensätze:
- **Karten (Grid)**: Standard - einzelne FELDER sind anklickbar
- **Detail**: Zeigt ausgewählte Felder gruppiert nach Pilz
- **Vergleich**: Gleiche Feldtypen nebeneinander zum Vergleichen

Ein Feature ist eine abgeschlossene Erweiterung. Es bekommt einen eingeschränkten Kontext - keinen globalen Zugriff.

```javascript
export default function init(ctx) {
  // ctx.dom    - Nur eigener DOM-Bereich
  // ctx.config - Nur lesen (gefroren)
  // ctx.on     - Nur eigene Events
  // ctx.fetch  - Daten aus Datenbank laden
}
```

## Feature-Isolation

Features bekommen NICHT:
- `document` - Kein globaler DOM-Zugriff
- `window` - Keine globalen Objekte
- Andere Features - Keine direkte Kommunikation

Features bekommen:
- Eigenen DOM-Container
- Gefrorene Konfiguration
- Eingeschränkte Events
- Datenbank-Zugriff über ctx.fetch

### context.js

```javascript
// features/context.js
export function createFeatureContext(name, container, config, dataSource) {
  // Eigener DOM-Bereich
  const bereich = document.createElement('div');
  bereich.className = `amorph-feature amorph-feature-${name}`;
  bereich.setAttribute('data-feature', name);
  
  // Event-System (nur eigene Events)
  const eventTarget = new EventTarget();
  
  return {
    // DOM: Nur eigener Bereich
    dom: bereich,
    
    // Config: Nur lesen
    config: Object.freeze(config[name] || {}),
    
    // Events: Nur eigene
    on: (event, handler) => {
      eventTarget.addEventListener(event, handler);
    },
    emit: (event, detail) => {
      eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
    },
    
    // Daten: Aus Datenbank
    fetch: async (query) => {
      return dataSource.query(query);
    },
    
    // Render: Callback für Neu-Rendern
    requestRender: () => {
      container.dispatchEvent(new CustomEvent('amorph:request-render'));
    },
    
    // Mount: In Container einfügen
    mount: (position = 'beforeend') => {
      container.insertAdjacentElement(position, bereich);
    },
    
    // Cleanup
    destroy: () => {
      bereich.remove();
    }
  };
}
```

## Die Features

### suche/

Durchsucht die Datenbank, lädt neue Morphs.

```javascript
// features/suche/index.js
export default function init(ctx) {
  // UI erstellen
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  form.innerHTML = `
    <input type="search" placeholder="Suchen..." aria-label="Suche">
    <button type="button" aria-label="Suchen">🔍</button>
  `;
  
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  
  // Suche ausführen
  async function suchen() {
    const query = input.value.trim();
    if (!query) return;
    
    // Aus Datenbank laden (immer frisch!)
    const ergebnisse = await ctx.fetch({ 
      search: query,
      limit: ctx.config.limit || 50
    });
    
    // Neu rendern triggern
    ctx.emit('search-results', { query, ergebnisse });
    ctx.requestRender();
  }
  
  // Events
  button.addEventListener('click', suchen);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') suchen();
  });
  
  // Debounced Live-Suche (optional)
  if (ctx.config.live) {
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(suchen, 300);
    });
  }
  
  ctx.dom.appendChild(form);
  ctx.mount('afterbegin');
}
```

### perspektiven/

Verschiedene Blickwinkel auf die Daten.

```javascript
// features/perspektiven/index.js
export default function init(ctx) {
  const perspektiven = ctx.config.liste || [];
  const maxAktiv = ctx.config.maxAktiv || 4;
  let aktiv = new Set();
  
  // UI erstellen
  const nav = document.createElement('nav');
  nav.className = 'amorph-perspektiven';
  nav.setAttribute('role', 'toolbar');
  nav.setAttribute('aria-label', 'Perspektiven');
  
  for (const p of perspektiven) {
    const btn = document.createElement('button');
    btn.className = 'amorph-perspektive-btn';
    btn.setAttribute('data-perspektive', p.id);
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = `${p.symbol || ''} ${p.name}`.trim();
    
    // Farbe als CSS Variable
    if (p.farbe) {
      btn.style.setProperty('--perspektive-farbe', p.farbe);
    }
    
    btn.addEventListener('click', () => toggle(p.id, btn));
    nav.appendChild(btn);
  }
  
  function toggle(id, btn) {
    if (aktiv.has(id)) {
      aktiv.delete(id);
      btn.setAttribute('aria-pressed', 'false');
      btn.classList.remove('aktiv');
    } else {
      if (aktiv.size >= maxAktiv) {
        // Älteste entfernen
        const erste = aktiv.values().next().value;
        aktiv.delete(erste);
        nav.querySelector(`[data-perspektive="${erste}"]`)
          ?.classList.remove('aktiv');
      }
      aktiv.add(id);
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('aktiv');
    }
    
    // CSS-Klassen auf Container setzen
    updateContainer();
    ctx.emit('perspektive-changed', { aktiv: Array.from(aktiv) });
  }
  
  function updateContainer() {
    // Alle Perspektiv-Klassen entfernen
    for (const p of perspektiven) {
      document.body.classList.remove(`perspektive-${p.id}`);
    }
    // Aktive hinzufügen
    for (const id of aktiv) {
      document.body.classList.add(`perspektive-${id}`);
    }
  }
  
  ctx.dom.appendChild(nav);
  ctx.mount('afterbegin');
}
```

### grid/

Layout-Optionen für die Darstellung.

```javascript
// features/grid/index.js
export default function init(ctx) {
  const layouts = ctx.config.layouts || ['liste', 'grid', 'kompakt'];
  let current = ctx.config.default || 'liste';
  
  // UI erstellen
  const toolbar = document.createElement('div');
  toolbar.className = 'amorph-grid-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Layout');
  
  const icons = {
    liste: '☰',
    grid: '⊞',
    kompakt: '▤'
  };
  
  for (const layout of layouts) {
    const btn = document.createElement('button');
    btn.className = 'amorph-grid-btn';
    btn.setAttribute('data-layout', layout);
    btn.setAttribute('aria-pressed', layout === current ? 'true' : 'false');
    btn.textContent = icons[layout] || layout;
    btn.title = layout;
    
    btn.addEventListener('click', () => setLayout(layout));
    toolbar.appendChild(btn);
  }
  
  function setLayout(layout) {
    current = layout;
    
    // Buttons aktualisieren
    for (const btn of toolbar.querySelectorAll('button')) {
      btn.setAttribute('aria-pressed', 
        btn.dataset.layout === layout ? 'true' : 'false'
      );
    }
    
    // CSS-Klasse auf Container
    const container = document.querySelector('[data-amorph-container]');
    if (container) {
      container.dataset.layout = layout;
    }
    
    ctx.emit('layout-changed', { layout });
  }
  
  ctx.dom.appendChild(toolbar);
  ctx.mount('afterbegin');
  
  // Initial setzen
  setLayout(current);
}
```

## index.js - Feature-Loader

```javascript
// features/index.js
import { createFeatureContext } from './context.js';

// Eingebaute Features
import suche from './suche/index.js';
import perspektiven from './perspektiven/index.js';
import grid from './grid/index.js';

const eingebauteFeatures = {
  suche,
  perspektiven,
  grid
};

export async function loadFeatures(container, config, dataSource) {
  const geladene = [];
  
  if (!config?.features?.aktiv) return geladene;
  
  for (const name of config.features.aktiv) {
    try {
      // Eingebautes Feature?
      let feature = eingebauteFeatures[name];
      
      // Externes Feature laden?
      if (!feature && config.features.extern?.[name]) {
        const module = await import(config.features.extern[name]);
        feature = module.default;
      }
      
      if (!feature) {
        console.warn(`Feature nicht gefunden: ${name}`);
        continue;
      }
      
      // Context erstellen
      const ctx = createFeatureContext(name, container, config, dataSource);
      
      // Feature initialisieren
      await feature(ctx);
      
      geladene.push({ name, ctx });
      
    } catch (e) {
      console.error(`Fehler beim Laden von Feature ${name}:`, e);
    }
  }
  
  return geladene;
}

export function unloadFeatures(features) {
  for (const { ctx } of features) {
    ctx.destroy();
  }
}
```

## Konfiguration (features.yaml)

```yaml
aktiv:
  - suche
  - perspektiven
  - grid

suche:
  live: true
  limit: 50

perspektiven:
  maxAktiv: 4
  liste:
    - id: kulinarisch
      name: Kulinarisch
      symbol: 🍳
      farbe: "#22c55e"
    - id: sicherheit
      name: Sicherheit
      symbol: ⚠️
      farbe: "#ef4444"

grid:
  layouts:
    - liste
    - grid
    - kompakt
  default: liste

extern:
  meinFeature: ./custom/mein-feature.js
```

## Eigene Features erstellen

```javascript
// custom/mein-feature.js
export default function init(ctx) {
  // ctx.dom     - Eigener DOM-Bereich
  // ctx.config  - Deine Konfiguration (gefroren)
  // ctx.on      - Events empfangen
  // ctx.emit    - Events senden
  // ctx.fetch   - Daten laden
  // ctx.mount   - In Container einfügen
  // ctx.destroy - Aufräumen
  
  const ui = document.createElement('div');
  ui.textContent = 'Mein Feature!';
  
  ctx.dom.appendChild(ui);
  ctx.mount();
}
```

## Sicherheit

1. **Kein document-Zugriff**: Features können nicht beliebig im DOM herumfuhrwerken
2. **Gefrorene Config**: Kann nicht verändert werden
3. **Isolierte Events**: Features können sich nicht gegenseitig stören
4. **Kontrollierter Datenbank-Zugriff**: Nur über ctx.fetch

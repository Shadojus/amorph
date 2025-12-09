# Observer

Beobachten. Melden. Nicht eingreifen.

## Übersicht

Das Observer-System besteht aus:
- **debug.js** - Farbkodiertes Logging-System (AKTIV)
- `interaction.js` - Klicks, Hovers, Scrolls (vorbereitet)
- `rendering.js` - Mounts, Unmounts, Transformationen (vorbereitet)
- `session.js` - User-Sessions (vorbereitet)
- `target.js` - Ziel-Adapter für Observer-Output (vorbereitet)

## debug.js - Das Herzstück

```javascript
// Farbkodierte Kategorien
const STYLES = {
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #a78bfa; font-weight: bold',
  morphs: 'color: #60a5fa; font-weight: bold',
  suche: 'color: #34d399; font-weight: bold',
  features: 'color: #fbbf24; font-weight: bold',
  schema: 'color: #c084fc; font-weight: bold',
  perspektiven: 'color: #22d3ee; font-weight: bold',
};

// Nutzung
import { debug } from '../observer/debug.js';
debug.morphs('Badge erkannt', { wert, variant });
debug.suche('Ergebnisse', { anzahl: results.length });
debug.perspektiven('17 Perspektiven geladen', { perspektiven });
```

## Debug-Kategorien

| Kategorie | Farbe | Verwendung |
|-----------|-------|------------|
| `amorph` | Pink | System-Start, globale Meldungen |
| `config` | Lila | Config-Laden, YAML-Parsing |
| `schema` | Violett | Modulares Schema, Perspektiven-Laden |
| `morphs` | Blau | Morph-Erkennung, Transformation |
| `suche` | Grün | Suchanfragen, Ergebnisse |
| `features` | Gold | Feature-Init, Events |
| `perspektiven` | Cyan | 17 Perspektiven-Toggle |
| `header` | Orange | Header-Interaktionen |
| `ansichten` | Magenta | View-Wechsel |

## Was ist ein Observer?

Observer beobachten das System und senden Nachrichten nach außen. Sie verändern nichts, sie sehen nur.

```javascript
observer.on('click', (event) => {
  sendToTarget({ type: 'click', element: event.target });
});
```

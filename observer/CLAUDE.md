# Observer

Beobachten. Melden. Nicht eingreifen.

## Dateien

```
observer/
├── index.js        ← Export
├── debug.js        ← Farbkodiertes Logging (AKTIV)
├── interaction.js  ← Klicks, Hovers (vorbereitet)
├── rendering.js    ← Mounts, Transforms (vorbereitet)
├── session.js      ← User-Sessions (vorbereitet)
└── target.js       ← Output-Adapter (vorbereitet)
```

## debug.js

```javascript
import { debug } from '../observer/debug.js';

debug.morphs('Badge erkannt', { wert });
debug.suche('Ergebnisse', { anzahl });
debug.perspektiven('Geladen', { count: 15 });
```

## Kategorien

| Kategorie | Farbe | Verwendung |
|-----------|-------|------------|
| `amorph` | Pink | System-Start |
| `config` | Lila | Config-Laden |
| `schema` | Violett | Schema, Perspektiven |
| `morphs` | Blau | Morph-Erkennung |
| `suche` | Grün | Suchanfragen |
| `features` | Gold | Feature-Init |
| `perspektiven` | Cyan | Perspektiven-Toggle |
| `header` | Orange | Header-Events |
| `ansichten` | Magenta | View-Wechsel |

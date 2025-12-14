# Observer

Beobachten. Melden. Nicht eingreifen.

## Dateien

| Datei | Zweck |
|-------|-------|
| `debug.js` | Farbkodiertes Logging |
| `interaction.js` | Klicks, Hovers |
| `rendering.js` | DOM-Mutationen |
| `session.js` | User-Sessions |
| `target.js` | Output-Adapter |

## debug.js

```javascript
import { debug } from '../observer/debug.js';

debug.morphs('Badge erkannt', { wert });
debug.detection('Typ erkannt', { type, morph });
debug.render('Transform', { count });
```

## Kategorien

| Kategorie | Verwendung |
|-----------|------------|
| `amorph` | System-Start |
| `config` | Config-Laden |
| `schema` | Schema, Perspektiven |
| `morphs` | Morph-Aufrufe |
| `detection` | Typ-Erkennung |
| `render` | DOM-Rendering |
| `suche` | Suchanfragen |
| `features` | Feature-Init |

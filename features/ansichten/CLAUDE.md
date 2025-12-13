# Feature: Ansichten

Verwaltet Auswahl-State und Ansicht-State.

## State

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {...}>
  aktiveAnsicht: 'karten',  // 'karten' | 'vergleich' | 'detail'
  detailPilzId: null
};
```

## Exports

```javascript
import { 
  toggleFeldAuswahl,
  istFeldAusgewaehlt,
  getAuswahl,
  getAuswahlPilzIds,
  getAnsichtState,
  setAktiveAnsicht
} from './ansichten/index.js';
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Auswahl geändert (inkl. `entfernterPilz`) |
| `amorph:ansicht-wechsel` | IN | Ansicht wechseln |

## CSS

- `.header-auswahl` - Auswahl-Zeile (transparent)
- `.amorph-auswahl-badge` - Pilz-Badge mit Glass

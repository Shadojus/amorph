# Ansichten Feature

Verwaltet nur den Feld-Auswahl-State.

## 🚧 AKTUELLER ENTWICKLUNGSSTAND

**Status**: Refactored (01.12.2025)

### Architektur-Änderung

Die View-Logik wurde in separate Features ausgelagert:
- **`features/detail/`** - Pinboard-View
- **`features/vergleich/`** - Vektorraum-View

Dieses Feature verwaltet nur noch den **Auswahl-State**.

### Exports (unverändert)

```javascript
import { 
  toggleFeldAuswahl, 
  istFeldAusgewaehlt,
  getAuswahl, 
  getAuswahlPilzIds,
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  clearAuswahl,
  getState
} from './ansichten/index.js';
```

### State (unverändert)

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null
};
```

### Events

- `amorph:auswahl-geaendert` - Wenn sich Auswahl ändert
- `amorph:ansicht-wechsel` - Vom Header gesendet, von detail/vergleich Features gehört

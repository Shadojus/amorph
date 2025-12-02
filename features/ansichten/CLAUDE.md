# Ansichten Feature

Verwaltet Feld-Auswahl-State UND Ansicht-State.

## 🚧 AKTUELLER ENTWICKLUNGSSTAND

**Status**: Erweitert (02.12.2025)

### Architektur

Die View-Logik wurde in separate Features ausgelagert:
- **`features/detail/`** - Pinboard-View
- **`features/vergleich/`** - Vektorraum-View

Dieses Feature verwaltet:
- **Auswahl-State** (welche Felder ausgewählt sind)
- **Ansicht-State** (welche View aktiv ist) - NEU!

### State-Synchronisation (NEU 02.12.2025)

```javascript
// In init() - Hört auf View-Wechsel Events
document.addEventListener('amorph:ansicht-wechsel', (e) => {
  const neueAnsicht = e.detail?.ansicht;
  if (neueAnsicht && ['karten', 'detail', 'vergleich'].includes(neueAnsicht)) {
    setAktiveAnsicht(neueAnsicht);
  }
});
```

Andere Features (z.B. Header-Suche) können über `getAnsichtState()` die aktive Ansicht abfragen.

### Exports

```javascript
import { 
  toggleFeldAuswahl, 
  istFeldAusgewaehlt,
  getAuswahl, 
  getAuswahlPilzIds,
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  clearAuswahl,
  getState,
  getAnsichtState,     // NEU - Gibt {aktiveAnsicht, detailPilzId} zurück
  setAktiveAnsicht     // NEU - Setzt die aktive Ansicht
} from './ansichten/index.js';
```

### State

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich' - WIRD JETZT AKTUALISIERT!
  detailPilzId: null
};
```

### Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Wenn sich Feld-Auswahl ändert |
| `amorph:ansicht-wechsel` | IN | Vom Header, aktualisiert `state.aktiveAnsicht` |

### Wichtig für andere Features

```javascript
// In header/index.js - View-aware Suche
import { getAnsichtState } from '../ansichten/index.js';

function suchen(query) {
  const { aktiveAnsicht } = getAnsichtState();
  
  if (aktiveAnsicht === 'vergleich') {
    // Nur Highlights, keine DB-Suche!
    emittiere('header:suche:ergebnisse', { nurHighlights: true });
    return;
  }
  
  // Normal: DB-Suche ausführen
  // ...
}
```

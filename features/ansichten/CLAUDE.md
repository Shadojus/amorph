# Ansichten Feature

Verwaltet Feld-Auswahl-State UND Ansicht-State.

## 🚧 AKTUELLER STAND (02.12.2025 - FINAL)

### ✅ Fertig
- Feld-Auswahl State vollständig implementiert
- Ansicht-State (Grid/Detail/Vergleich) wird synchron gehalten
- Event-basierte Kommunikation mit anderen Features

### Architektur

Die View-Logik wurde in separate Features ausgelagert:
- **`features/detail/`** - Pinboard-View
- **`features/vergleich/`** - Vektorraum-View

Dieses Feature verwaltet:
- **Auswahl-State** (welche Felder ausgewählt sind)
- **Ansicht-State** (welche View aktiv ist)

### State-Synchronisation

```javascript
// Hört auf View-Wechsel Events (von Header)
document.addEventListener('amorph:ansicht-wechsel', (e) => {
  const neueAnsicht = e.detail?.ansicht;
  if (neueAnsicht && ['karten', 'detail', 'vergleich'].includes(neueAnsicht)) {
    setAktiveAnsicht(neueAnsicht);
  }
});
```

### Exports

```javascript
import { 
  toggleFeldAuswahl,      // Feld auswählen/abwählen
  istFeldAusgewaehlt,     // Boolean Check
  getAuswahl,             // Map<"pilzId:feldName", {...}>
  getAuswahlPilzIds,      // Set<pilzId>
  getAuswahlNachPilz,     // Array nach Pilz gruppiert
  getAuswahlNachFeld,     // Array nach Feldname gruppiert
  clearAuswahl,           // Alle abwählen
  getState,               // Kompletter State
  getAnsichtState,        // Nur {aktiveAnsicht, detailPilzId}
  setAktiveAnsicht        // Ansicht setzen
} from './ansichten/index.js';
```

### State

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null        // Aktuell im Detail gezeigter Pilz
};
```

### Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Wenn sich Feld-Auswahl ändert |
| `amorph:ansicht-wechsel` | IN | Vom Header, aktualisiert `state.aktiveAnsicht` |

### Nutzung in anderen Features

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
  // Normal: DB-Suche ausführen...
}
```

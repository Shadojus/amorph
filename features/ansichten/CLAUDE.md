# Ansichten Feature

Verwaltet Feld-Auswahl-State UND Ansicht-State.

## Übersicht

Dieses Feature verwaltet:
- **Auswahl-State** (welche Felder ausgewählt sind)
- **Ansicht-State** (welche View aktiv ist)
- Event-basierte Kommunikation mit anderen Features

Die View-Logik wurde in separate Features ausgelagert:
- **`features/grid/`** - Grid/Karten-View (mit Glasmorphism)
- **`features/vergleich/`** - Vektorraum-View (mit 17 Theme-Compare-Morphs)

Beide Views nutzen identisches **Black Glasmorphism Design**.

## State

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null        // Aktuell im Detail gezeigter Pilz
};
```

## Exports

```javascript
import { 
  toggleFeldAuswahl,      // Feld auswählen/abwählen
  istFeldAusgewaehlt,     // Boolean Check
  getAuswahl,             // Map<"pilzId:feldName", {...}>
  getAuswahlPilzIds,      // Set<pilzId>
  getAnsichtState,        // {aktiveAnsicht, detailPilzId}
  setAktiveAnsicht        // Ansicht setzen
} from './ansichten/index.js';
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Wenn sich Feld-Auswahl ändert |
| `amorph:ansicht-wechsel` | IN | Vom Header, aktualisiert `state.aktiveAnsicht` |

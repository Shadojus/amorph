# Feature: Ansichten

Verwaltet FELD-Auswahl und View-State.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, State-Management, UI |
| `ansichten.css` | View-Styles |

## State

```javascript
const state = {
  // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  auswahl: new Map(),
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null        // Welcher Pilz im Detail
};
```

## API

```javascript
// State
getState()                               → state
setAktiveAnsicht(ansicht)                // View wechseln

// Feld-Auswahl
toggleFeldAuswahl(pilzId, feldName, wert, pilzDaten)
istFeldAusgewaehlt(pilzId, feldName)     → boolean
removeFeldAuswahl(pilzId, feldName)

// Queries
getAuswahl()                             → Map
getAuswahlPilzIds()                      → string[]
getAuswahlNachPilz()                     → Map<pilzId, {...}>
getAuswahlNachFeld()                     → Map<feldName, [{pilzId, wert}]>

// Legacy (wählt ALLE Felder eines Items)
toggleAuswahl(id, daten)
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Auswahl geändert |
| `amorph:ansicht-wechsel` | IN/OUT | Ansicht wechseln |

## Auswahl-Logik

- **Grid-View**: Einzelne FELDER sind anklickbar
- **Auswahl-Key**: `"pilzId:feldName"` (eindeutig)
- **Gleiche Felder** verschiedener Items → im Vergleich zusammen

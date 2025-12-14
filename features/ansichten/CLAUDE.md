# Feature: Ansichten

Verwaltet Auswahl-State und View-State.

## State

```javascript
const state = {
  auswahl: new Map(),       // Map<"pilzId:feldName", {...}>
  aktiveAnsicht: 'karten',  // 'karten' | 'vergleich' | 'detail'
  detailPilzId: null
};
```

## API

```javascript
toggleFeldAuswahl(pilzId, feldName, daten)
istFeldAusgewaehlt(pilzId, feldName)
getAuswahl()
getAuswahlPilzIds()
setAktiveAnsicht(ansicht)
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:auswahl-geaendert` | OUT | Auswahl geändert |
| `amorph:ansicht-wechsel` | IN | Ansicht wechseln |

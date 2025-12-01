# Ansichten Feature

Verwaltet Feld-Auswahl, Detail-View und Vergleichs-View.

## 🚧 AKTUELLER ENTWICKLUNGSSTAND

**Status**: ✅ Feld-Auswahl-System implementiert (30.11.2025)

### ✅ Implementiert
- Einzelne FELDER können ausgewählt werden (nicht ganze Cards)
- Klick auf Feld → **Perspektiven-Balken wird intensiver** (nicht neuer Effekt!)
  - Balken: 2px → 5px breiter
  - Glow: Stärker mit brightness(1.5-2.0)
  - Hintergrund: Leuchtet in Perspektiven-Farbe (30% opacity)
  - Animation: Schnellere Pulsierung (1.2s statt 3s)
- Detail-View zeigt ausgewählte Felder gruppiert nach Pilz
- Vergleich-View stellt gleiche Feldtypen nebeneinander
- Overlay-System funktioniert mit inline-styles (z-index:9999)
- Bilder haben max-height Begrenzung

### User-Flow
1. User sucht "essbar" → Grid zeigt Pilz-Cards
2. User klickt auf "Steinpilz" (name-Feld) → Feld glüht grün ✓
3. User klickt auf "10-25°C" (temperatur-Feld) → Feld glüht grün ✓
4. User klickt auf Pfifferling-Bild → Feld glüht grün ✓
5. **Detail-View**: Zeigt ausgewählte Felder gruppiert nach Pilz
6. **Vergleich-View**: Stellt Felder nebeneinander (Steinpilz-Temp vs Pfifferling-Temp)

## Konzept

- **Karten (Grid)**: Standard-Ansicht, einzelne Felder sind klickbar
- **Detail**: Zeigt ausgewählte Felder gruppiert nach Pilz
- **Vergleich**: Zeigt gleiche Feld-Typen nebeneinander zum Vergleichen

## State

```javascript
const state = {
  // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  auswahl: new Map(),
  aktiveAnsicht: 'karten',  // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null        // Aktuell angezeigter Pilz im Detail
};
```

## API

```javascript
import { 
  toggleFeldAuswahl, 
  istFeldAusgewaehlt,
  getAuswahl, 
  getAuswahlPilzIds,
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  clearAuswahl 
} from './ansichten/index.js';

// Feld auswählen/abwählen
toggleFeldAuswahl(pilzId, feldName, wert, pilzDaten);

// Prüfen ob Feld ausgewählt
const isSelected = istFeldAusgewaehlt(pilzId, feldName);

// Alle ausgewählten Feld-Keys
const keys = getAuswahl(); // ["1:name", "1:temperatur", "2:bild"]

// Alle Pilz-IDs mit Auswahl
const pilzIds = getAuswahlPilzIds(); // ["1", "2"]

// Gruppiert nach Pilz (für Detail-View)
const nachPilz = getAuswahlNachPilz(); // Map<pilzId, {pilzDaten, felder[]}>

// Gruppiert nach Feld (für Vergleich-View)
const nachFeld = getAuswahlNachFeld(); // Map<feldName, [{pilzId, wert, pilzDaten}]>

// Auswahl leeren
clearAuswahl();
```

## Events

- `amorph:auswahl-geaendert` - Wenn sich Auswahl ändert
  - `detail.auswahl` - Array der ausgewählten Keys
  - `detail.anzahl` - Anzahl ausgewählter Felder
  - `detail.pilzIds` - Array der Pilz-IDs
- `amorph:ansicht-wechsel` - Wenn Ansicht wechselt (vom Header)

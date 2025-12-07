# Feature: Header

Das Header-Feature kombiniert Suche + Perspektiven + Auswahl in einem Container.

## Übersicht

| Komponente | Funktion |
|------------|----------|
| Zeile 0 | Branding (App-Name + Bifroest) |
| Zeile 1 | Suche + Badges + Ansicht-Switch |
| Zeile 2 | Perspektiven-Grid |
| Zeile 3 | Ausgewählte Pilze (Badges + Links) |

### Features

- **Live-Suche**: Mit konfigurierbarem Debounce
- **Auto-Perspektiven**: Basierend auf Query und Ergebnissen
- **Auswahl-Badges**: Zeigt ausgewählte Pilze mit Link zur Einzelansicht
- **Scroll-Detection**: Via IntersectionObserver

### Events

**Emittiert:**
- `header:suche:ergebnisse` → Query + Ergebnisse + matchedTerms
- `perspektiven:geaendert` → aktive Perspektiven
- `amorph:ansicht-wechsel` → Ansicht-ID

**Hört auf:**
- `amorph:auswahl-geaendert` → Aktualisiert Auswahl-Zeile + Counter
- `amorph:auto-search` → Triggert Suche aus URL-State

```javascript
// Perspektiven mit Multi-Farben-Support
function anwendenPerspektiven() {
  // Felder markieren mit allen zugehörigen Farben
  for (const [feldname, perspektivFarben] of feldZuFarben) {
    if (perspektivFarben.length === 1) {
      // Einzelne Perspektive - alle 4 Farben setzen
      feld.style.setProperty('--feld-perspektive-farbe', farben[0]);
    } else {
      // Mehrere Perspektiven - Multicolor-Gradient
      feld.setAttribute('data-perspektive-multi', 'true');
      feld.style.setProperty('--feld-gradient', `linear-gradient(180deg, ...)`);
    }
  }
}
```

### Vergleich-View Modus

```javascript
// Im Vergleich-View: NUR Highlights, KEINE DB-Suche
const imVergleichsView = aktiveAnsicht === 'vergleich';
if (imVergleichsView) {
  ctx.emit('suche:ergebnisse', { 
    query, 
    ergebnisse: [], 
    matchedTerms: new Set(), 
    nurHighlights: true  // ← Flag für Vergleich-View
  });
  return;
}
```

### CSS-Klassen

- `.amorph-suche` - Suchcontainer
- `.amorph-perspektiven` - Perspektiven-Navigation
- `.amorph-perspektive-btn` - Einzelner Perspektiven-Button
- `.amorph-perspektive-btn.aktiv` - Aktive Perspektive
- `.amorph-perspektive-btn.hat-treffer` - Hat relevante Suchergebnisse
- `.amorph-filter-badge` - Badge für aktive Perspektive
- `.amorph-ansicht-switch` - Ansicht-Toggle
- `.scrolled` - Header bei Scroll-Position > 0

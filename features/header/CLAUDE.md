# Feature: Header

Das Header-Feature kombiniert Suche + Perspektiven in einem Container und steuert die Interaktion zwischen beiden.

## 🚧 AKTUELLER STAND (02.12.2025 - FINAL)

### ✅ Fertig
- **Suche + Perspektiven kombiniert**: Ein Header für alles
- **Live-Suche**: Mit konfigurierbarerm Debounce
- **Auto-Perspektiven**: Basierend auf Query und Ergebnissen
- **Perspektiven-Badges**: Aktive Perspektiven als Chips in Suchleiste
- **Scroll-Detection**: Via IntersectionObserver (nicht window-Event)
- **Ansicht-Wechsel**: Integrierter Switch für Grid/Detail/Vergleich
- **Vergleich-View Modus**: Nur Highlights, keine DB-Suche

### Komponenten

| Komponente | Funktion |
|------------|----------|
| `suche` | Textsuche mit Live-Modus |
| `perspektiven` | Farbige Filter-Buttons |
| `aktive-filter` | Badges der aktiven Perspektiven |
| `ansicht-switch` | Grid/Detail/Vergleich Toggle |

### Config-Loading

```javascript
const headerConfig = {
  suche: ctx.config.suche || {},           // features.yaml → suche
  perspektiven: perspektivenConfig,         // features.yaml + schema.yaml
  ansicht: ctx.config.ansicht || {}         // features.yaml → ansicht
};

// Keywords aus Schema für Auto-Perspektiven
const schemaKeywords = getPerspektivenKeywords();  // schema.yaml → perspektiven[].keywords
const schemaListe = getPerspektivenListe();        // schema.yaml → perspektiven[]
```

### Event-System

**Emittiert:**
- `header:suche:ergebnisse` → Query + Ergebnisse + matchedTerms
- `header:perspektiven:geaendert` → aktive Perspektiven
- `amorph:ansicht-wechsel` → Ansicht-ID (grid/detail/vergleich)

**Hört auf:**
- `amorph:auswahl-geaendert` → Aktualisiert Ansicht-Switch Counter

### Perspektiven-Logik

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

# Feature: Suche

Durchsucht die Datenbank, lädt neue Morphs. Immer frisch.

## Übersicht

Das Suche-Feature bietet:
- Semantische Suche mit Keywords aus Schema
- **View-aware Suche**: 
  - In **Grid-View**: Normale DB-Suche + Render
  - In **Vergleich-View**: Nur Highlights, KEINE DB-Suche!
- `matchedTerms` werden via Event an andere Features übergeben
- Highlights nutzen `highlightInContainer()` aus `util/semantic.js`
- Live-Suche mit konfigurierbarem Debounce

**Hinweis**: Die Suche-Logik ist primär in `features/header/index.js` implementiert.

### View-aware Logik

```javascript
// In header/index.js suchen()
import { getAnsichtState } from '../ansichten/index.js';

function suchen(query) {
  const { aktiveAnsicht } = getAnsichtState();
  
  // Im Vergleich-View: Nur Highlights, keine DB-Suche!
  if (aktiveAnsicht === 'vergleich') {
    emittiere('header:suche:ergebnisse', { 
      query, 
      ergebnisse: [], 
      matchedTerms: new Set(),
      nurHighlights: true 
    });
    return;
  }
  
  // Normal: DB-Suche ausführen...
}
```

## Kernprinzip

```
Eingabe → Datenbank-Query → Neue Daten → Neu Rendern
```

Kein lokaler Cache. Kein Filtern im Browser. Die Datenbank ist die Wahrheit.

## Config-Loading

```javascript
// Config aus features.yaml → suche
const sucheConfig = {
  placeholder: ctx.config.placeholder || 'Suchen...',
  live: ctx.config.live || false,           // Live-Suche aktiviert?
  debounce: ctx.config.debounce || 300,     // ms
  limit: ctx.config.limit || 50,            // Max Ergebnisse
  suchfelder: ctx.config.suchfelder || []   // Spezifische Felder
};
```

## Events

| Event | Beschreibung |
|-------|--------------|
| `header:suche:ergebnisse` | Query + Ergebnisse + matchedTerms + nurHighlights |
| `header:suche:fehler` | Bei Suchfehlern |
      ctx.requestRender(); // Alles anzeigen
    }
  });
  
  // Live-Suche
  if (ctx.config.live) {
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(suchen, ctx.config.debounce || 300);
    });
  }
  
  ctx.dom.appendChild(form);
  ctx.mount('afterbegin');
}
```

## Konfiguration

```yaml
suche:
  live: true              # Suche während Tippen
  debounce: 300           # Verzögerung in ms
  limit: 50               # Max Ergebnisse
  placeholder: "Suchen..."
  erlaubeLeer: false      # Leere Suche = alle?
  suchfelder:             # Welche Felder durchsuchen
    - name
    - beschreibung
    - tags
```

## CSS

```css
.amorph-suche {
  display: flex;
  gap: 0.5rem;
}

.amorph-suche input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.amorph-suche.ladend input {
  opacity: 0.7;
}

.amorph-suche button {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

## Warum immer Datenbank?

1. **Konsistenz**: Daten können sich ändern
2. **Vollständigkeit**: Browser hat nie alle Daten
3. **Performance**: Datenbank kann besser filtern
4. **Einfachheit**: Kein Sync-Problem

Die Datenbank ist schnell. Das Netzwerk auch. Vertraue ihnen.

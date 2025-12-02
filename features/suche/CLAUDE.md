# Feature: Suche

Durchsucht die Datenbank, lädt neue Morphs. Immer frisch.

## 🚧 AKTUELLER STAND (02.12.2025)

### ✅ Fertig
- Semantische Suche aus Schema, Keywords → Feldwerte
- **View-aware Suche**: 
  - In **Grid-View**: Normale DB-Suche + Render
  - In **Vergleich-View**: Nur Highlights, KEINE DB-Suche!
- `matchedTerms` werden via Event an andere Features übergeben
- Highlights nutzen `highlightInContainer()` aus `util/semantic.js`

### View-aware Logik (NEU 02.12.2025)

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

## Implementierung

```javascript
// features/suche/index.js
export default function init(ctx) {
  // UI
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = ctx.config.placeholder || 'Suchen...';
  input.setAttribute('aria-label', 'Suche');
  
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Suchen');
  
  form.appendChild(input);
  form.appendChild(button);
  
  // Suche
  async function suchen() {
    const query = input.value.trim();
    if (!query && !ctx.config.erlaubeLeer) return;
    
    form.classList.add('ladend');
    
    try {
      // IMMER aus Datenbank laden
      const ergebnisse = await ctx.fetch({
        search: query,
        limit: ctx.config.limit || 50,
        felder: ctx.config.suchfelder
      });
      
      ctx.emit('ergebnisse', { query, anzahl: ergebnisse.length });
      ctx.requestRender();
      
    } catch (e) {
      console.error('Suchfehler:', e);
      ctx.emit('fehler', { query, error: e.message });
    } finally {
      form.classList.remove('ladend');
    }
  }
  
  // Events
  button.addEventListener('click', suchen);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') suchen();
    if (e.key === 'Escape') {
      input.value = '';
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

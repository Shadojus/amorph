# Feature: Grid

Layout-Optionen für die Darstellung.

## 🚧 AKTUELLER STAND

Grid-Feature funktioniert. Layouts: Liste, Grid, Kompakt.

### TODO für Feld-Auswahl
- Jedes Feld in einer Card muss klickbar sein
- Klick auf Feld → Event `amorph:feld-auswahl` mit `{pilzId, feldName, wert}`
- Ausgewählte Felder bekommen `.feld-ausgewaehlt` Klasse

## Layouts

- **Liste**: Vertikal, ein Element pro Zeile
- **Grid**: Karten-Layout, mehrere Spalten
- **Kompakt**: Minimale Höhe, dichte Darstellung

## Implementierung

```javascript
// features/grid/index.js
export default function init(ctx) {
  const layouts = ctx.config.layouts || ['liste', 'grid', 'kompakt'];
  let current = ctx.config.default || 'liste';
  
  const icons = {
    liste: '☰',
    grid: '⊞',
    kompakt: '▤'
  };
  
  const labels = {
    liste: 'Listenansicht',
    grid: 'Rasteransicht',
    kompakt: 'Kompakte Ansicht'
  };
  
  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'amorph-layout-toolbar';
  toolbar.setAttribute('role', 'radiogroup');
  toolbar.setAttribute('aria-label', 'Layout wählen');
  
  for (const layout of layouts) {
    const btn = document.createElement('button');
    btn.className = 'amorph-layout-btn';
    btn.dataset.layout = layout;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', layout === current ? 'true' : 'false');
    btn.setAttribute('aria-label', labels[layout] || layout);
    btn.textContent = icons[layout] || layout[0].toUpperCase();
    
    btn.addEventListener('click', () => setLayout(layout));
    toolbar.appendChild(btn);
  }
  
  function setLayout(layout) {
    current = layout;
    
    // Buttons aktualisieren
    for (const btn of toolbar.querySelectorAll('button')) {
      const isSelected = btn.dataset.layout === layout;
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.classList.toggle('aktiv', isSelected);
    }
    
    // Layout auf Container setzen
    const container = document.querySelector('[data-amorph-container]');
    if (container) {
      container.dataset.layout = layout;
    }
    
    ctx.emit('geaendert', { layout });
  }
  
  ctx.dom.appendChild(toolbar);
  ctx.mount('afterbegin');
  
  // Initial
  setLayout(current);
}
```

## Konfiguration

```yaml
grid:
  layouts:
    - liste
    - grid
    - kompakt
  default: grid
  
  # Optionale Layout-spezifische Einstellungen
  grid:
    spalten: 3
    luecke: 1rem
  kompakt:
    maxHoehe: 100px
```

## CSS

```css
/* Basis-Container */
[data-amorph-container] {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Liste (default) */
[data-amorph-container][data-layout="liste"] {
  flex-direction: column;
}

[data-amorph-container][data-layout="liste"] > amorph-container {
  width: 100%;
}

/* Grid */
[data-amorph-container][data-layout="grid"] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--grid-gap, 1rem);
}

[data-amorph-container][data-layout="grid"] > amorph-container {
  /* Karten-Stil */
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 1rem;
  background: var(--card-bg, white);
}

/* Kompakt */
[data-amorph-container][data-layout="kompakt"] {
  gap: 0.25rem;
}

[data-amorph-container][data-layout="kompakt"] > amorph-container {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  max-height: var(--kompakt-max-hoehe, 2rem);
  overflow: hidden;
}

/* Toolbar */
.amorph-layout-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--toolbar-bg, #f3f4f6);
  border-radius: 6px;
  width: fit-content;
}

.amorph-layout-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s;
}

.amorph-layout-btn:hover {
  background: var(--hover-bg, #e5e7eb);
}

.amorph-layout-btn.aktiv,
.amorph-layout-btn[aria-checked="true"] {
  opacity: 1;
  background: var(--active-bg, white);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

## Responsive

```css
/* Mobile: Immer Liste */
@media (max-width: 640px) {
  [data-amorph-container][data-layout="grid"] {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2 Spalten */
@media (min-width: 641px) and (max-width: 1024px) {
  [data-amorph-container][data-layout="grid"] {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Tastatur-Navigation

```javascript
// Im init()
toolbar.addEventListener('keydown', (e) => {
  const buttons = Array.from(toolbar.querySelectorAll('button'));
  const current = buttons.findIndex(b => b === document.activeElement);
  
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    const next = (current + 1) % buttons.length;
    buttons[next].focus();
  }
  
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = (current - 1 + buttons.length) % buttons.length;
    buttons[prev].focus();
  }
});
```

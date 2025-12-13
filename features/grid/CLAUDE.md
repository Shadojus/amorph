# Feature: Grid

Glasmorphism-Karten-Layout.

## Features

- Black Glasmorphism Design
- Perspektiven-Feld-Visibility
- Layouts: Liste, Grid, Kompakt
- Felder anklickbar für Auswahl

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Perspektiven-Integration

```html
<amorph-container 
  data-field="chemistry_primaer_metabolite"
  data-perspektive-chemistry="true">
```

Bei aktiver Perspektive: nur zugehörige Felder sichtbar.

## Feld-Auswahl

- Klick auf Feld → `amorph:feld-auswahl` Event
- Ausgewählt → `.feld-ausgewaehlt` Klasse
- Entfernt aus Header → Grid deselektiert

# Feature: Grid

Glasmorphism-Karten-Layout.

## Features

- Black Glasmorphism Design
- Perspektiven-Feld-Visibility
- Layouts: Liste, Grid, Kompakt
- Kompakte Feld-Darstellung

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Perspektiven-Integration

Bei aktiver Perspektive: nur zugehörige Felder sichtbar.

```html
<amorph-container 
  data-field="chemistry_metabolite"
  data-perspektive-chemistry="true">
```

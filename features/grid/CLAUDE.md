# Feature: Grid

Glasmorphism-Karten-Layout.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Card-Rendering |
| `grid.css` | Grid-Layout, Glass-Cards |

## Features

- Black Glasmorphism Design
- Perspektiven-Feld-Visibility
- Layouts: Grid (CSS Grid)
- Kompakte Feld-Darstellung
- Feld-Klick für Auswahl

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
```

## Perspektiven-Integration

Bei aktiver Perspektive: nur zugehörige Felder sichtbar.

```html
<amorph-container 
  data-field="chemistry_metabolite"
  data-perspektive-chemistry="true">
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:items-loaded` | IN | Neue Items rendern |
| `header:suche:ergebnisse` | IN | Suchergebnisse |
| `perspektiven:geaendert` | IN | Feld-Visibility |
| `amorph:auswahl-geaendert` | OUT | Feld ausgewählt |

## Card-Struktur

```html
<div class="glass-card" data-id="steinpilz">
  <div class="card-header">
    <img src="..." class="card-image">
    <h3 class="card-title">Steinpilz</h3>
  </div>
  <div class="card-body">
    <!-- Morphs für jedes Feld -->
    <amorph-container data-morph="tag" data-field="essbarkeit">
      ...
    </amorph-container>
  </div>
</div>
```

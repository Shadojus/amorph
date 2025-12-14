# Styles

Black Glasmorphism + Kompaktes Layout.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.css` | Import aller Styles |
| `base.css` | Design-Tokens, Typografie |
| `morphs.css` | Morph-Styles (Legacy) |
| `layouts.css` | Grid, Cards, Feld-Container |
| `pilz-farben.css` | 12 Neonfarben |
| `ansichten.css` | View-Styles |
| `vektorraum.css` | Vergleich-Ansicht |

## Layout-System

```css
/* Inline-Felder: Tags, Badges, Zahlen */
amorph-container[data-morph="tag"] { display: inline-block; }

/* Block-Felder: Charts, Objects */
amorph-container[data-morph="bar"] { display: block; }

/* Automatische Labels via CSS */
amorph-container::before { content: attr(data-label); }
```

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Kompakte Morphs

- Tags: 22px Höhe, 11px Font
- Badges: 20px Höhe, 10px Font
- Charts: Kleinere Padding, transparente Backgrounds

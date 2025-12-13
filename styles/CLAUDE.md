# Styles

Black Glasmorphism + Neon-Farben.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.css` | Import aller Styles |
| `base.css` | Design-Tokens, Typografie |
| `morphs.css` | Basis-Morph Styles |
| `compare.css` | Compare-Morph Styles |
| `pilz-farben.css` | 12 Neonfarben |
| `perspektiven.css` | 15 Perspektiven-Farben |
| `features.css` | Feature-Styles |
| `layouts.css` | Grid-Layout, Glass-Cards |
| `ansichten.css` | View-Styles |
| `vektorraum.css` | Vergleich-Ansicht |
| `einzelansicht.css` | Detail-Page |

## Pilz-Farben

12 Neonfarben für Item-Identifikation:

| Index | Name | RGB |
|-------|------|-----|
| 0 | Electric Cyan | 0, 255, 255 |
| 1 | Electric Magenta | 255, 0, 255 |
| 2 | Radioactive Green | 0, 255, 0 |
| ... | ... | ... |

## Perspektiven-Farben

Jede Perspektive hat eigene CSS-Datei in `perspektiven/`:
- `chemistry.css` - Violett
- `safety.css` - Rot
- etc.

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

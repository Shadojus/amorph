# Styles

Black Glasmorphism + Neon-Farben + Design-Tokens.

## Dateien

| Datei | Zweck |
|-------|-------|
| `base.css` | **Design-Tokens**: Typografie, Spacing, Animation, Breakpoints |
| `morphs.css` | Basis-Morph Styles |
| `compare.css` | Compare-Morph Styles |
| `pilz-farben.css` | **12 Neon-Farben** - Single Source of Truth |
| `features.css` | Header, Suche, States, Infinite Scroll |
| `layouts.css` | Grid-Layout, Glass-Cards, Responsive |
| `ansichten.css` | View-Transitions |
| `vektorraum.css` | Sammeldiagramm-Ansicht |
| `einzelansicht.css` | Detail-Page Styles |
| `perspektiven.css` | Multi-Color Glow, Feld-Auswahl |

## Design-Tokens (base.css)

**Animation:**
```css
--transition-fast: 0.15s ease-out;
--transition-base: 0.25s ease-out;
--transition-slow: 0.4s ease-out;
--transition-glass: background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Responsive Breakpoints:**
```css
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

## Pilz-Farben (pilz-farben.css)

CSS ist Single Source of Truth. 12 OVER THE TOP Neon-Farben:

| Index | Name | RGB |
|-------|------|-----|
| 0 | Electric Cyan | 0, 255, 255 |
| 1 | Electric Magenta | 255, 0, 255 |
| 2 | Radioactive Green | 0, 255, 0 |
| 3 | Hot Pink | 255, 0, 150 |
| 4 | Laser Yellow | 255, 255, 0 |
| 5 | Blazing Orange | 255, 100, 0 |
| 6 | Electric Blue | 0, 150, 255 |
| 7 | Ultraviolet | 180, 0, 255 |
| 8 | Nuclear Red | 255, 0, 50 |
| 9 | Toxic Lime | 190, 255, 0 |
| 10 | Plasma Aqua | 0, 255, 180 |
| 11 | Lava Coral | 255, 50, 100 |

## Black Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

Hintergrund: Woodfloor-Textur aus `images/woodfloor/`

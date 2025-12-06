# Styles

Black Glasmorphism + Neon-Farben + Einheitliche Typografie.

## Dateien

| Datei | Zweck |
|-------|-------|
| `base.css` | CSS-Variablen, Typografie-System, Reset |
| `morphs.css` | Basis-Morph Styles |
| `compare.css` | Compare-Morph Styles (nutzt CSS-Variablen) |
| `pilz-farben.css` | **12 Neon-Farben** - Single Source of Truth! |
| `features.css` | Header, Suche, Perspektiven-Buttons |
| `layouts.css` | Grid-Layout, Glass-Cards |
| `perspektiven.css` | Multi-Color Glow, Feld-Auswahl |

## Typografie-System (base.css)

```css
:root {
  /* Größen-Skala */
  --font-size-2xs: 9px;    /* Skalen */
  --font-size-xs: 10px;    /* Kleine Labels */
  --font-size-sm: 11px;    /* Pilz-Namen, Werte */
  --font-size-base: 12px;  /* Section-Labels */
  --font-size-md: 13px;    /* Text-Inhalte */
  --font-size-lg: 14px;    /* Feld-Überschriften */
  --font-size-xl: 16px;    /* Perspektiven-Titel */
  --font-size-2xl: 20px;   /* Icons */
  
  /* Semantische Aliases */
  --font-pilz-name: var(--font-size-sm);
  --font-section-label: var(--font-size-base);
  --font-wert: var(--font-size-sm);
  --font-label: var(--font-size-xs);
  --font-scale: var(--font-size-2xs);
}
```

**Regel**: Pilz-Namen sind IMMER `var(--font-pilz-name)` = 11px.

## Pilz-Farben (pilz-farben.css)

CSS ist Single Source of Truth. 12 Neon-Farben:

```css
.pilz-farbe-0 {
  --pilz-rgb: 0, 255, 255;
  --pilz-text: rgb(0, 255, 255);
  --pilz-fill: rgba(0, 255, 255, 0.24);
  --pilz-line: rgba(0, 255, 255, 0.70);
  --pilz-bg: rgba(0, 255, 255, 0.12);
  --pilz-glow: rgba(0, 255, 255, 0.50);
}
```

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

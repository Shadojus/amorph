# Styles

Black Glasmorphism + Neon-Farben + Responsive Typografie + Spacing-System.

## Dateien

| Datei | Zweck |
|-------|-------|
| `base.css` | CSS-Variablen, Typografie, Spacing, Reset |
| `morphs.css` | Basis-Morph Styles |
| `compare.css` | Compare-Morph Styles |
| `pilz-farben.css` | **12 Neon-Farben** - Single Source of Truth! |
| `features.css` | Header, Suche, Perspektiven-Buttons |
| `layouts.css` | Grid-Layout, Glass-Cards |
| `ansichten.css` | View-Overlays, Action-Bars |
| `vektorraum.css` | Sammeldiagramm-Ansicht |
| `pinboard.css` | Pinboard/Detail-Ansicht |
| `perspektiven.css` | Multi-Color Glow, Feld-Auswahl |

## Typografie-System (base.css) - RESPONSIVE

Alle Schriftgrößen nutzen `clamp()` für automatische Viewport-Anpassung:

```css
:root {
  /* Responsive Größen-Skala */
  --font-size-2xs: clamp(8px, 0.5rem + 0.1vw, 9px);
  --font-size-xs: clamp(9px, 0.55rem + 0.1vw, 10px);
  --font-size-sm: clamp(10px, 0.6rem + 0.15vw, 11px);
  --font-size-base: clamp(11px, 0.65rem + 0.15vw, 12px);
  --font-size-md: clamp(12px, 0.7rem + 0.15vw, 13px);
  --font-size-lg: clamp(13px, 0.75rem + 0.2vw, 14px);
  --font-size-xl: clamp(14px, 0.85rem + 0.25vw, 16px);
  --font-size-2xl: clamp(18px, 1rem + 0.4vw, 20px);
  
  /* Semantische Aliases */
  --font-pilz-name: var(--font-size-sm);
  --font-section-label: var(--font-size-base);
  --font-wert: var(--font-size-sm);
}
```

## Spacing-System (base.css)

4px Basis-Einheit für konsistente Abstände:

```css
:root {
  /* Spacing-Skala (4px Basis) */
  --space-2xs: 2px;
  --space-xs: 4px;
  --space-xs-plus: 6px;
  --space-sm: 8px;
  --space-sm-plus: 10px;
  --space-md: 12px;
  --space-md-plus: 14px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  
  /* Semantische Aliases */
  --gap-tight: var(--space-xs);      /* 4px */
  --gap-default: var(--space-sm);    /* 8px */
  --gap-loose: var(--space-md);      /* 12px */
  --gap-section: var(--space-lg);    /* 16px */
  --padding-card: var(--space-md);   /* 12px */
  --padding-section: var(--space-lg);/* 16px */
  --margin-element: var(--space-sm); /* 8px */
  --margin-section: var(--space-xl); /* 24px */
}
```

**Regel**: Für gap, padding, margin ≥4px → CSS-Variablen nutzen! Kleinere Werte (1px, 2px, 3px) dürfen hartkodiert bleiben für Feinheiten.

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

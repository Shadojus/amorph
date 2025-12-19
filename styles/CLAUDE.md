# Styles

Black Glasmorphism + Universe Theme + Kosmisches Grid.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `index.css` | 11 | Import aller Styles (Einstiegspunkt) |
| `base.css` | ~300 | Design-Tokens, CSS-Variablen, Reset, Typografie |
| `layouts.css` | 478 | Grid/Liste/Kompakt-Layouts, Feld-Container, Responsive |
| `pilz-farben.css` | 469 | 12 Neonfarben-System für Compare-Views |
| `ansichten.css` | 577 | View-Styles, Feld-Auswahl, Action-Bar |
| `vektorraum.css` | 697 | Compare-View Perspektiven-Styling |
| `universe.css` | ~120 | Kosmisches Theme, Glow-System, Deep Glass |
| `responsive.css` | ~100 | Mobile/Tablet Breakpoints |
| `seo-page.css` | ~150 | **NEU** Astro SSR Seiten-Styles |
| `woodfloor/` | - | Hintergrund-Textur (Moss_Woodsf_Laub.png) |

---

## seo-page.css (NEU)

Styles für Astro SSR-gerenderte SEO-Seiten:

```css
/* Species-Page Layout */
.species-page { ... }
.species-header { ... }
.breadcrumb { ... }

/* Perspektiven-Navigation */
.perspectives-nav { ... }
.perspective-section { ... }

/* Print-optimiert */
@media print { ... }
```

---

## index.css - Import-Reihenfolge

```css
@import './base.css';
@import './universe.css';
@import '../morphs/primitives/index.css';
@import '../features/index.css';
@import './layouts.css';
@import './ansichten.css';
@import './vektorraum.css';
@import '../morphs/compare/compare.css';
@import './pilz-farben.css';
```

---

## base.css - Design-System

### UI-Größen

```css
--ui-height-sm: 22px;
--ui-height-md: 26px;
--ui-height-lg: 34px;
--ui-radius-sm: 6px;
--ui-radius-md: 8px;
--ui-radius-lg: 12px;
--ui-font-sm: 0.68rem;
--ui-font-md: 0.75rem;
--ui-font-lg: 0.88rem;
```

### Farbschema

```css
/* Akzent: Weiß (Perspektiven liefern Farben) */
--color-accent: rgba(255, 255, 255, 0.92);
--color-highlight: rgba(240, 190, 80, 0.90);  /* Glas-Bernstein */
--color-bg: #000000;
--color-text: rgba(255, 255, 255, 0.94);
--color-text-muted: rgba(255, 255, 255, 0.6);

/* Semantische Farben */
--color-success: rgba(100, 220, 160, 0.90);
--color-warning: rgba(240, 190, 80, 0.90);
--color-error: rgba(240, 110, 110, 0.90);
```

### Black Glasmorphism

```css
--glass-bg: rgba(0, 0, 0, 0.55);
--glass-border: rgba(100, 150, 255, 0.06);
--glass-blur: blur(24px);
--glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
--glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.02);
```

### Spacing-System (4px Basis)

```css
--space-unit: 4px;
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;

/* Semantische Aliases */
--gap-tight: 4px;
--gap-default: 8px;
--gap-section: 16px;
--padding-card: 12px;
```

### Animation-System

```css
--anim-duration-fast: 150ms;
--anim-duration-normal: 250ms;
--anim-duration-slow: 400ms;
--anim-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--anim-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Responsive Typografie (clamp)

```css
--font-size-2xs: clamp(8px, 0.5rem + 0.1vw, 9px);   /* Skalen */
--font-size-xs: clamp(9px, 0.55rem + 0.1vw, 10px);  /* Labels */
--font-size-sm: clamp(10px, 0.6rem + 0.15vw, 11px); /* Standard */
--font-size-base: clamp(11px, 0.65rem + 0.15vw, 12px);
--font-size-xl: clamp(14px, 0.85rem + 0.25vw, 16px);
--font-size-2xl: clamp(18px, 1rem + 0.4vw, 20px);

/* Semantische Aliases */
--font-pilz-name: var(--font-size-sm);
--font-wert: var(--font-size-sm);
--font-label: var(--font-size-xs);
--font-scale: var(--font-size-2xs);
```

---

## layouts.css - Layout-System

### Item Cards

```css
amorph-container[data-morph="item"] {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(100, 150, 255, 0.08);
  border-radius: 8px;
  min-height: 420px;
  max-height: 600px;
  overflow-y: auto;
}
```

### Grid-Layout

```css
[data-layout="grid"] {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-section);
  align-items: stretch;
}

[data-layout="grid"] > amorph-container[data-morph="item"] {
  width: calc(33.333% - 11px);  /* 3 Spalten */
}
```

### Responsive Breakpoints

| Breakpoint | Spalten | Variable |
|------------|---------|----------|
| XL (1280px+) | 4 | `calc(25% - 12px)` |
| LG (1024-1279px) | 3 | `calc(33.333% - 11px)` |
| MD (768-1023px) | 2 | `calc(50% - 8px)` |
| SM (480-767px) | 2 | `calc(50% - 6px)` |
| XS (<480px) | 1 | `100%` |

### Feld-Container Kategorien

**INLINE** (fließen nebeneinander):
- `tag`, `badge` → `display: inline-block`
- `number`, `boolean`, `progress` → `display: inline-flex`

**BLOCK** (eigene Sektionen mit Background):
- `bar`, `pie`, `radar`, `stats`, `range`
- `timeline`, `lifecycle`, `heatmap`, `sparkline`
- `gauge`, `severity`, `object`, `map`, `network`, `hierarchy`

---

## pilz-farben.css - 12 Neonfarben

| Klasse | Name | RGB |
|--------|------|-----|
| `.pilz-farbe-0` | Electric Cyan | 0, 255, 255 |
| `.pilz-farbe-1` | Electric Magenta | 255, 0, 255 |
| `.pilz-farbe-2` | Radioactive Green | 0, 255, 0 |
| `.pilz-farbe-3` | Hot Pink | 255, 0, 150 |
| `.pilz-farbe-4` | Laser Yellow | 255, 255, 0 |
| `.pilz-farbe-5` | Blazing Orange | 255, 100, 0 |
| `.pilz-farbe-6` | Electric Blue | 0, 150, 255 |
| `.pilz-farbe-7` | Ultraviolet | 180, 0, 255 |
| `.pilz-farbe-8` | Nuclear Red | 255, 0, 50 |
| `.pilz-farbe-9` | Toxic Lime | 190, 255, 0 |
| `.pilz-farbe-10` | Plasma Aqua | 0, 255, 180 |
| `.pilz-farbe-11` | Lava Coral | 255, 50, 100 |

### CSS-Variablen pro Pilz

```css
.pilz-farbe-X {
  --pilz-rgb: R, G, B;           /* Reine RGB-Werte */
  --pilz-text: rgb(R, G, B);     /* Kräftig (85%) */
  --pilz-fill: rgba(..., 0.24);  /* Flächen */
  --pilz-line: rgba(..., 0.70);  /* Linien/Strokes */
  --pilz-bg: rgba(..., 0.12);    /* Hintergründe */
  --pilz-glow: rgba(..., 0.50);  /* Glow-Effekte */
}
```

### Utility-Klassen

```css
.pilz-text { color: var(--pilz-text); }
.pilz-fill { background-color: var(--pilz-fill); }
.pilz-border { border-color: var(--pilz-line); }
.pilz-glow { text-shadow: 0 0 8px var(--pilz-glow); }
```

---

## ansichten.css - View-Styles

### View Transitions

```css
@keyframes item-enter {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Staggered: nth-child(1) → 0ms, (2) → 30ms, ... (6) → 150ms */
```

### Feld-Auswahl

```css
amorph-container[data-field].feld-ausgewaehlt {
  /* Perspektiven-Farben via CSS-Variablen */
  --_accent: var(--feld-perspektive-farbe, #e8b04a);
  background: linear-gradient(90deg, 
    color-mix(in srgb, var(--_accent) 10%, transparent),
    transparent 12%
  );
  padding-left: 12px;
  backdrop-filter: blur(4px);
}

/* Vertikaler Glow-Balken links */
amorph-container[data-field].feld-ausgewaehlt::before {
  width: 3px;
  background: linear-gradient(180deg, var(--feld-perspektive-farbe), ...);
  animation: feld-auswahl-sanft 3s ease-in-out infinite;
}

/* Checkmark */
amorph-container[data-field].feld-ausgewaehlt::after {
  content: '✓';
  background: var(--feld-perspektive-farbe);
}
```

**Animation:**
```css
@keyframes feld-auswahl-sanft {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
```

**Multi-Perspektiven-Gradient:**
```css
.feld-ausgewaehlt.multi-perspektive {
  --feld-gradient: linear-gradient(90deg, var(--p-farbe-0), var(--p-farbe-1), ...);
}
```

### Floating Action Bar

```css
.amorph-action-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  border-radius: 50px;
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.amorph-action-bar.versteckt {
  transform: translateX(-50%) translateY(100px);
  pointer-events: none;
}
```

---

## vektorraum.css - Compare Perspektiven

### Perspektiven-CSS-Variablen

```css
/* Single-Perspektive */
--feld-perspektive-farbe
--feld-p-farbe-1, -2, -3

/* Multi-Perspektiven */
--p-farbe-0, --p-farbe-1, ...
--feld-gradient
--feld-bg-gradient
```

### Ausgewählt vs. Nicht-Ausgewählt

| State | Hintergrund | Glow-Streifen | Label |
|-------|-------------|---------------|-------|
| Nicht ausgewählt | transparent | keiner | dezent |
| Ausgewählt | Gradient | voller Glow + Animation | voller Glow |

```css
/* Glow-Animation für Single */
@keyframes compare-glow-single { ... }

/* Multi-Perspektiven: Flow-Animation */
@keyframes compare-multi-flow { ... }
```

---

## universe.css - Kosmisches Theme

### Glow-System

```css
--glow-core: rgba(255, 255, 255, 1);
--glow-inner: rgba(200, 220, 255, 0.8);
--glow-outer: rgba(100, 150, 255, 0.4);
--glow-ambient: rgba(80, 120, 200, 0.15);

/* Varianten */
--glow-warm, --glow-cool, --glow-life, --glow-alert
```

### Deep Glass

```css
--glass-bg-deep: rgba(0, 0, 0, 0.65);
--glass-bg-deeper: rgba(0, 0, 0, 0.75);
--glass-bg-abyss: rgba(0, 0, 0, 0.85);
```

### Node Glow

```css
.glow-node {
  background: radial-gradient(circle at 30% 30%, 
    var(--glow-core), var(--glow-inner) 40%, 
    var(--glow-outer) 70%, transparent
  );
  box-shadow: var(--node-glow-md);
  animation: pulse-glow 3s ease-in-out infinite;
}
```

---

## morphs.css - Legacy

Importiert `../morphs/primitives/index.css` und definiert Basis-Styles für:
- `.amorph-text`
- `.amorph-number` (tabular-nums)
- `.amorph-boolean` (success/error Farben)
- `.amorph-range` (Bar mit CSS-Variablen)
- `.amorph-list`

---

## Mobile-Optimierungen

### Responsive Breakpoints

| Breakpoint | Breite | Grid-Spalten | Blur-Stärke |
|------------|--------|--------------|-------------|
| XL | 1280px+ | 3 | blur(24px) |
| LG | 1024-1279px | 3 | blur(24px) |
| MD | 768-1023px | 2 | blur(12px) |
| SM | 480-767px | 2 | blur(8px) |
| XS | <480px | 1 | deaktiviert |

### Backdrop-Filter Performance

```css
/* Fallback für schwache GPUs */
@supports not (backdrop-filter: blur(1px)) {
  .amorph-header { background: rgba(8, 12, 20, 0.98); }
}

/* Mobile (480px): Kein Blur für beste Performance */
@media (max-width: 480px) {
  amorph-container[data-morph="item"] {
    backdrop-filter: none;
    background: rgba(20, 25, 35, 0.98);  /* Solider Hintergrund */
  }
}
```

### Touch-Geräte (`@media (hover: none) and (pointer: coarse)`)

```css
/* Größere Touch-Targets (44px Minimum) */
.amorph-action-btn { min-height: 44px; }
.amorph-perspektive-btn { min-height: 44px; min-width: 44px; }

/* Kein Hover-Transform - spart GPU */
amorph-container[data-morph="item"]:hover { transform: none; }

/* Active State statt Hover */
amorph-container[data-morph="item"]:active { transform: scale(0.98); }

/* Touch-freundliches Scrolling */
-webkit-overflow-scrolling: touch;
scroll-snap-type: x mandatory;
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .amorph-item { animation: none; }
  amorph-container[data-field].feld-ausgewaehlt::before { animation: none; }
}
```

### CSS-Dateien mit Mobile-Styles

| Datei | Mobile-Features |
|-------|-----------------|
| `layouts.css` | Grid-Spalten, Touch-Events, Blur-Deaktivierung |
| `ansichten.css` | Action-Bar, Detail-View, Touch-Targets, Reduced Motion |
| `features/header/header.css` | Kompakter Header, Blur-Reduzierung |
| `features/perspektiven/perspektiven.css` | Scroll-Snap, größere Buttons |

---

## Kosmisches Grid (body::before)

```css
body::before {
  background: 
    linear-gradient(rgba(60, 100, 160, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(60, 100, 160, 0.03) 1px, transparent 1px),
    radial-gradient(ellipse at 20% 30%, rgba(40, 60, 120, 0.08), transparent),
    radial-gradient(ellipse at 80% 70%, rgba(60, 40, 100, 0.06), transparent);
  background-size: 30px 30px, ...;
  pointer-events: none;
  z-index: -1;
}
```

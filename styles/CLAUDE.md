# Styles

Black Glasmorphism Design. Elegant, dezent, leuchtend.

## Übersicht

Das Style-System bietet:
- **Unified Design System** mit CSS-Variablen für Höhen, Radii, Fonts
- **Black Glasmorphism** mit Woodfloor-Hintergrund und `backdrop-filter: blur(16px)`
- **Multi-Color Glow** für Perspektiven (4-Farben-Grid)
- **Header 3-Zeilen-Layout**: Branding, Suche, Controls
- **Feld-Auswahl-System**: Glow-Effekte für ausgewählte Felder
- **Compare-Morph Styles**: Glasmorphism für Vergleichs-Visualisierungen
- **Diagramm-Legenden**: Styles für alle Legenden und Achsenbeschriftungen
- **Einheitliches Design**: Grid- und Compare-View haben identisches Glasmorphism

## Dateien

```
styles/
├── index.css        ← Importiert alles
├── base.css         ← CSS-Variablen, Reset, Dark Theme
├── morphs.css       ← Styles für alle Basis-Morphs + Legenden
├── features.css     ← Header, Suche, Perspektiven-Buttons
├── layouts.css      ← Glass-Cards, Liste/Grid Layouts
├── perspektiven.css ← Feld-Glow, Multi-Perspektiven
├── ansichten.css    ← Overlay, Detail-View, Auswahl-Glow
├── pinboard.css     ← Pinboard/Detail-View Layout
├── compare.css      ← Compare-Morphs mit Glasmorphism (wie Grid)
└── vektorraum.css   ← Vergleich-View Layouts
```

## CSS-Variablen (Wichtigste)

```css
:root {
  /* Dark Theme */
  --color-bg: #0a0a0a;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-text: #f0f0f0;
  --color-border: rgba(255, 255, 255, 0.08);
  
  /* Perspektiven-Farben (dynamisch von JS gesetzt) */
  --p-farbe: #3b82f6;
  --p-farbe-1: var(--p-farbe);
  --p-farbe-2: var(--p-farbe);
  --p-farbe-3: var(--p-farbe);
  
  /* Glasmorphism */
  --glass-blur: 16px;
  --glass-bg: rgba(0, 0, 0, 0.88);
  --glass-bg-strong: rgba(0, 0, 0, 0.92);
}
```

## Black Glasmorphism

Einheitliches Design für Grid- und Compare-View:

```css
/* Basis-Glasmorphism für Cards */
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.88) 0%,
    rgba(0, 0, 0, 0.92) 100%
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    0 4px 24px rgba(0, 0, 0, 0.4);
}

/* Woodfloor-Hintergrund */
.amorph-container {
  background-image: url('./images/woodfloor/...');
}
```

## Multi-Color Glow System

4 Farben pro Perspektive aus `schema/perspektiven/*.yaml`:

```css
.amorph-perspektive-btn.aktiv {
  box-shadow: 
    0 0 10px color-mix(in srgb, var(--p-farbe) 40%, transparent),
    0 0 20px color-mix(in srgb, var(--p-farbe-1) 25%, transparent),
    0 0 30px color-mix(in srgb, var(--p-farbe-2) 15%, transparent);
  animation: glow-pulse-multi 2.5s ease-in-out infinite;
}
```

## Diagramm-Legenden

```css
/* Legende für Pie, Bar, Radar, Stats, Timeline */
.morph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Achsenbeschriftungen */
.axis-label {
  font-size: 0.7rem;
  fill: rgba(255, 255, 255, 0.6);
}
```

## Morph-Klassen

Jeder Morph hat seine CSS-Klasse:
- `.amorph-number`, `.amorph-boolean`, `.amorph-tag`, `.amorph-badge`
- `.amorph-range`, `.amorph-list`, `.amorph-object`, `.amorph-image`, `.amorph-link`
- `.amorph-pie`, `.amorph-bar`, `.amorph-radar` (mit Legenden)
- `.amorph-stats`, `.amorph-timeline` (mit Legenden)

## Layout-Klassen

Werden automatisch über `data-layout` Attribut gesetzt:

```css
[data-layout="liste"] { ... }
[data-layout="grid"] { ... }
[data-layout="kompakt"] { ... }
```

Automatisch via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #111827;
    --color-text: #f9fafb;
  }
}
```

## Anpassen

1. Variablen in `base.css` ändern
2. Oder eigene CSS-Datei einbinden die Variablen überschreibt

```css
/* custom.css */
:root {
  --color-primary: #8b5cf6; /* Lila statt Blau */
}
```

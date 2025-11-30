# Styles

Black Glasmorphism Design. Elegant, dezent, leuchtend.

## Design-System

AMORPH nutzt ein **Black Glasmorphism** Design:
- Schwarze Glass-Cards mit `backdrop-filter: blur()`
- Dezente weiße Borders (5-15% Opacity)
- **Multi-Color Glow-Effekte** mit CSS `color-mix()`
- Pulsierende Animationen für aktive Elemente
- Woodfloor-Texturen als Hintergrund

## Dateien

```
styles/
├── index.css        ← Importiert alles
├── base.css         ← CSS-Variablen, Reset, Dark Theme
├── morphs.css       ← Styles für alle Morphs
├── features.css     ← Header, Suche, Perspektiven-Buttons
├── layouts.css      ← Glass-Cards, Liste/Grid Layouts
└── perspektiven.css ← Feld-Glow, Multi-Perspektiven
```

## CSS Variablen

```css
:root {
  /* Dark Theme (Standard) */
  --color-bg: #0a0a0a;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-text: #f0f0f0;
  --color-text-muted: rgba(255, 255, 255, 0.5);
  --color-border: rgba(255, 255, 255, 0.08);
  
  /* Perspektiven-Farben (dynamisch gesetzt) */
  --p-farbe: #3b82f6;       /* Hauptfarbe */
  --p-farbe-1: var(--p-farbe);
  --p-farbe-2: var(--p-farbe);
  --p-farbe-3: var(--p-farbe);
  
  /* Glasmorphism */
  --glass-blur: 20px;
  --glass-bg: rgba(0, 0, 0, 0.7);
}
```

## Multi-Color Glow

Aktive Perspektiven nutzen alle 4 Farben für den Glow:

```css
.amorph-perspektive-btn.aktiv {
  box-shadow: 
    0 0 10px color-mix(in srgb, var(--p-farbe) 40%, transparent),
    0 0 20px color-mix(in srgb, var(--p-farbe-1) 25%, transparent),
    0 0 30px color-mix(in srgb, var(--p-farbe-2) 15%, transparent);
  animation: glow-pulse-multi 2.5s ease-in-out infinite;
}
```
- `.amorph-number`
- `.amorph-boolean`
- `.amorph-tag`
- `.amorph-range`
- `.amorph-list`
- `.amorph-object`
- `.amorph-image`
- `.amorph-link`

## Layout-Klassen

Werden automatisch über `data-layout` Attribut gesetzt:

```css
[data-layout="liste"] { ... }
[data-layout="grid"] { ... }
[data-layout="kompakt"] { ... }
```

## Perspektiven

Werden über Body-Klassen gesteuert:

```css
.perspektive-kulinarisch { ... }
.perspektive-sicherheit { ... }
```

## Dark Mode

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

# Styles

CSS für AMORPH. Modular, anpassbar, Dark-Mode-fähig.

## Dateien

```
styles/
├── base.css         ← Variablen, Reset, Container
├── morphs.css       ← Styles für alle Morphs
├── features.css     ← Suche, Perspektiven, Grid-Toolbar
├── layouts.css      ← Liste, Grid, Kompakt Layouts
├── perspektiven.css ← Farbliche Hervorhebungen
└── index.css        ← Importiert alles
```

## CSS Variablen

```css
:root {
  /* Farben */
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
  
  /* Abstände */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Schrift */
  --font-family: system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  
  /* Rundungen */
  --radius-sm: 4px;
  --radius-md: 8px;
}
```

## Morph-Klassen

Jeder Morph hat eine CSS-Klasse:

- `.amorph-text`
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

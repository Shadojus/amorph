# Styles

Black Glasmorphism Design. Elegant, dezent, leuchtend.

## 🚧 AKTUELLER STAND (03.12.2025)

### ✅ Neu (03.12.2025)
- **Unified Design System**:
  - `--ui-height-sm/md/lg`: 20px / 24px / 32px
  - `--ui-radius-sm/md/lg`: 4px / 6px / 8px  
  - `--ui-font-sm/md/lg`: 0.65rem / 0.72rem / 0.85rem
- **Neutrale Accent-Farbe**: Weiß statt Cyan (Perspektiven liefern Farben)
- **Kompaktere Morphs**: Tags, Badges, Progress, Pie, Radar alle harmonisiert
- **Leuchtende Counter**: Kein Background, nur text-shadow Glow
- **Perspektiven-Buttons**: Inaktive kleiner (20px), dezentere Farben

### Implementiert
- Basis Dark Theme mit Glass-Effekten
- Multi-Color Glow für Perspektiven (4-Farben-Grid)
- Auswahl-Glow mit pulsierender Animation
- **Header 3-Zeilen-Layout**:
  - Branding-Zeile: FUNGINOMI + Bifroest (beide Links)
  - Suche-Zeile: Input + Clear-Button + aktive Filter-Badges  
  - Controls-Zeile: Ansicht-Switch + Perspektiven-Buttons
- **Aktive Filter-Badges**: Farbige Perspektiven-Badges in Suchleiste
- **Dark Glasmorphism Header**: Alle Header-Elemente im Glass-Stil
- **Feld-Auswahl-Intensiv**: Ausgewählte Felder verstärken den Perspektiven-Effekt
- **Compare-Morph Styles**: Layouts für Vergleichs-Visualisierungen
- **Vektorraum-Layout**: CSS für laterale Vergleiche

### ⚠️ Bekannter Hardcode

| Datei | Was | Status |
|-------|-----|--------|
| `ansichten/index.js` | `250px`, `180px` Bildhöhen | 🟡 Sollte CSS-Variable sein |
| `morphs/image.js` | `'Bild nicht verfügbar'` Alt-Text | 🟡 Sollte i18n sein |

## Dateien

```
styles/
├── index.css        ← Importiert alles
├── base.css         ← CSS-Variablen, Reset, Dark Theme
├── morphs.css       ← Styles für alle Basis-Morphs
├── features.css     ← Header, Suche, Perspektiven-Buttons
├── layouts.css      ← Glass-Cards, Liste/Grid Layouts
├── perspektiven.css ← Feld-Glow, Multi-Perspektiven
├── ansichten.css    ← Overlay, Detail-View, Auswahl-Glow
├── pinboard.css     ← Pinboard/Detail-View Layout
└── vektorraum.css   ← Vergleich-View Layouts, Compare-Morphs
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
  --p-farbe: #3b82f6;       /* Hauptfarbe */
  --p-farbe-1: var(--p-farbe);
  --p-farbe-2: var(--p-farbe);
  --p-farbe-3: var(--p-farbe);
  
  /* Glasmorphism */
  --glass-blur: 20px;
  --glass-bg: rgba(0, 0, 0, 0.7);
}
```

## Multi-Color Glow System

4 Farben pro Perspektive aus `schema.yaml`:

```css
.amorph-perspektive-btn.aktiv {
  box-shadow: 
    0 0 10px color-mix(in srgb, var(--p-farbe) 40%, transparent),
    0 0 20px color-mix(in srgb, var(--p-farbe-1) 25%, transparent),
    0 0 30px color-mix(in srgb, var(--p-farbe-2) 15%, transparent);
  animation: glow-pulse-multi 2.5s ease-in-out infinite;
}
```

## Morph-Klassen

Jeder Morph hat seine CSS-Klasse:
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

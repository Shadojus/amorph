# Themes

Optionale Style-Overrides.

## Hinweis

Das System ist **datengetrieben** und benötigt keine Theme-Dateien. Morphs erkennen Typen automatisch.

Dieser Ordner enthält nur optionale domänen-spezifische Style-Overrides.

## Verwendung

Themes können CSS-Variablen überschreiben:

```css
/* themes/mein-theme.css */
:root {
  --bg-primary: rgba(20, 0, 40, 0.9);
  --text-primary: #e0e0ff;
}
```

## Einbinden

```html
<link rel="stylesheet" href="./styles/index.css">
<link rel="stylesheet" href="./themes/mein-theme.css">
```

## Mögliche Overrides

- CSS-Variablen aus `base.css`
- Pilz-Farben aus `pilz-farben.css`
- Glasmorphism-Parameter
- Typografie

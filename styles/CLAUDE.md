# Styles

Black Glasmorphism + Neon-Farben + 17 Perspektiven-Styles.

## Dateien

| Datei | Zweck |
|-------|-------|
| `base.css` | **Design-Tokens**: Typografie, Spacing, Animation |
| `morphs.css` | Basis-Morph Styles |
| `compare.css` | Compare-Morph Styles |
| `pilz-farben.css` | **12 Neon-Farben** - Single Source of Truth |
| `features.css` | Header, Suche, States |
| `layouts.css` | Grid-Layout, Glass-Cards |
| `ansichten.css` | View-Transitions |
| `vektorraum.css` | Sammeldiagramm-Ansicht |
| `einzelansicht.css` | Detail-Page Styles |
| `perspektiven.css` | **17 Perspektiven-Farben** + Multi-Color Glow |

## perspektiven.css - 17 Perspektiven

Jede Perspektive hat:
- Eigene Farbe (4-Farbverlauf)
- `[data-perspektive-<name>]` Selektor
- Sichtbarkeits-Steuerung für Felder

```css
/* chemistry - Violett */
[data-perspektive-chemistry] {
  --perspektive-farbe-1: #9f7aea;
  --perspektive-farbe-2: #805ad5;
  --perspektive-farbe-3: #6b46c1;
  --perspektive-farbe-4: #553c9a;
}

/* Sensorik - Orange */
[data-perspektive-sensorik] {
  --perspektive-farbe-1: #f6ad55;
  /* ... */
}
```

## Pilz-Farben (pilz-farben.css)

12 OVER THE TOP Neon-Farben:

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

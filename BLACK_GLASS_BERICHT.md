# AMORPH v5 - Black Glasmorphism Design-System

**Datum**: 02.12.2025
**Status**: ✅ VOLLSTÄNDIG IMPLEMENTIERT

---

## Zusammenfassung

Das gesamte Framework verwendet nun **Black Glasmorphism** - ein einheitliches Design-System
mit schwarzen transparenten Hintergründen, die "die schwarze Seele des Glases durchscheinen lassen".

---

## Farbharmonie

### Akzentfarben (82% Opazität - 12% weniger gedämpft)

| Name | Farbe | Verwendung |
|------|-------|------------|
| Sandgelb | `rgba(198, 166, 112, 0.82)` | Kulinarik, Warnings |
| Salbeigrün | `rgba(134, 179, 148, 0.82)` | Wissenschaft, Success |
| Taubenblau | `rgba(130, 158, 186, 0.82)` | Kultur, Primary |
| Lavendel | `rgba(156, 140, 178, 0.82)` | Geschichte |
| Rosé | `rgba(186, 140, 152, 0.82)` | Mythologie |
| Türkis | `rgba(130, 178, 186, 0.82)` | Ökologie |

### Glass-Variablen (Black Glasmorphism)

```css
/* Hintergründe: Reines Schwarz mit Transparenz */
--glass-bg: rgba(0, 0, 0, 0.45);
--glass-bg-hover: rgba(0, 0, 0, 0.55);
--glass-bg-active: rgba(0, 0, 0, 0.65);

/* Borders: Sehr dezentes Weiß für Glaskanten */
--glass-border: rgba(255, 255, 255, 0.06);
--glass-border-hover: rgba(255, 255, 255, 0.1);
--glass-border-active: rgba(255, 255, 255, 0.14);

/* Blur-Effekte */
--glass-blur: blur(20px);
--glass-blur-strong: blur(32px);

/* Schatten: Tiefe schwarze Schatten */
--glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
--glass-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.7);

/* Inset: Subtiler Lichtschimmer oben */
--glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.03);
```

---

## Design-Prinzipien

### 1. Schwarzes Glas 🖤

- **Alle Backgrounds** verwenden `rgba(0, 0, 0, x)` statt `rgba(255, 255, 255, x)`
- Tiefe entsteht durch verschiedene Opazitätsstufen
- Container: 0.35-0.45, Hover: 0.55, Active: 0.65+

### 2. Weiße Akzente ⬜

- **Text** bleibt weiß für Lesbarkeit: `rgba(255, 255, 255, 0.6-0.94)`
- **Borders** sind dezent weiß: `rgba(255, 255, 255, 0.06-0.14)`
- **Scrollbars** sind weiß für Sichtbarkeit: `rgba(255, 255, 255, 0.15-0.25)`

### 3. Einheitliche Größen 📐

```css
--ui-height-sm: 22px;
--ui-height-md: 26px;
--ui-height-lg: 34px;
--ui-radius-sm: 6px;
--ui-radius-md: 8px;
--ui-radius-lg: 12px;
```

---

## Aktualisierte Dateien

### CSS ✅

| Datei | Änderungen |
|-------|------------|
| `base.css` | Zentrale Variablen, Black Glass Definition |
| `morphs.css` | Alle Primitiv-Morphs (tag, list, progress, rating, etc.) |
| `features.css` | Header, Suche, Filter |
| `layouts.css` | Card-Layouts |
| `compare.css` | Vergleichs-Morphs (bar, rating, list, boolean, etc.) |
| `vektorraum.css` | Sammel-Diagramme |
| `pinboard.css` | Detail-Ansicht |
| `ansichten.css` | View-Steuerung, Buttons |

### Konfiguration ✅

| Datei | Änderungen |
|-------|------------|
| `config/morphs.yaml` | Badge & Diagramm-Farben |
| `config/schema/perspektiven/*.yaml` | Alle 6 Perspektiven |

### JavaScript ✅

| Datei | Änderungen |
|-------|------------|
| `morphs/primitives/badge.js` | Fallback-Farben harmonisiert |
| `morphs/primitives/pie.js` | Fallback-Farben harmonisiert |
| `morphs/compare/base.js` | Fallback-Farben harmonisiert |

---

## Visuelle Effekte

1. **Blur**: `blur(20-32px)` erzeugt weiche Glasoptik
2. **Inset Light**: `inset 0 1px 0 rgba(255, 255, 255, 0.03)` für subtilen Glanz
3. **Deep Shadow**: `0 4px 24px rgba(0, 0, 0, 0.6)` für Tiefe
4. **Perspective Glow**: Animierter Leucht-Effekt am linken Rand

---

## Konvertierungs-Muster

### ❌ ALT (Weiße Overlays)
```css
background: rgba(255, 255, 255, 0.05);
background: rgba(255, 255, 255, 0.1);
background: rgba(255, 255, 255, 0.15);
```

### ✅ NEU (Schwarzes Glas)
```css
background: rgba(0, 0, 0, 0.35);
background: rgba(0, 0, 0, 0.4);
background: rgba(0, 0, 0, 0.5);
```

### Ausnahmen (bleiben weiß)

- **Scrollbar-Thumbs**: Müssen auf schwarzem Hintergrund sichtbar sein
- **Text-Farben**: Lesbarkeit auf dunklem Hintergrund
- **Border-Akzente**: Dezente Glaskanten

---

## Status

✅ **VOLLSTÄNDIG** - Alle UI-Elemente nutzen Black Glasmorphism

Die schwarze Seele des Glases durchscheint nun überall im Interface.

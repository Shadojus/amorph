# AMORPH v5

Formlos. Zustandslos. Transformierend.

## Systemübersicht

AMORPH ist ein datengetriebenes Transformations-Framework für Pilzdaten-Visualisierung.

```
DATEN (JSON) → detectType() → MORPH → DOM
```

### Architektur

| Ordner | Zweck |
|--------|-------|
| `config/` | YAML-Konfiguration, Schema, Perspektiven |
| `core/` | Config-Loader, Pipeline, Web Component |
| `features/` | Isolierte Feature-Module (Header, Grid, Vergleich) |
| `morphs/` | Reine Transformations-Funktionen |
| `styles/` | CSS mit Typografie-System + Glasmorphism |
| `observer/` | Debug, Rendering, Session Tracking |
| `util/` | DOM-Helpers, Fetch, Semantic-Utils |

### Design: Black Glasmorphism + Neon

- **Hintergrund**: Woodfloor-Textur + 88-92% schwarzes Overlay
- **Glass-Cards**: `backdrop-filter: blur(16px)`, dezente weiße Borders
- **Pilz-Farben**: 12 OVER-THE-TOP Neonfarben in `pilz-farben.css`
- **Perspektiven**: Jede Perspektive hat eigene Farbe mit Multi-Color Glow

### Typografie-System (base.css)

| Variable | Größe | Verwendung |
|----------|-------|------------|
| `--font-size-2xs` | 9px | Skalen-Beschriftungen |
| `--font-size-xs` | 10px | Kleine Labels |
| `--font-size-sm` | 11px | **Pilz-Namen, Werte** |
| `--font-size-base` | 12px | Section-Überschriften |
| `--font-size-md` | 13px | Text-Inhalte |
| `--font-size-lg` | 14px | Feld-Überschriften |
| `--font-size-xl` | 16px | Perspektiven-Titel |
| `--font-size-2xl` | 20px | Große Zahlen/Icons |

**Semantische Aliases:** `--font-pilz-name` (11px), `--font-section-label` (12px), `--font-wert` (11px)

### Pilz-Farben (pilz-farben.css)

12 Neon-Farben, CSS ist Single Source of Truth:

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

### Ansichten

| Ansicht | Feature | Beschreibung |
|---------|---------|--------------|
| **Grid** | `features/grid/` | Karten-Layout, Felder anklickbar |
| **Vergleich** | `features/vergleich/` | Perspektiven-Vergleich mit Compare-Morphs |

### Datengetriebene Typ-Erkennung

Die DATENSTRUKTUR bestimmt den Morph:

```javascript
{ min: 10, max: 25 }           → 'range'
{ min: 80, max: 350, avg: 180 } → 'stats'
[{ axis: 'X', value: 95 }]     → 'radar'
{ Protein: 30, Fett: 20 }      → 'pie'
4.5                            → 'rating'
85                             → 'progress'
```

### Morph-Purity Regel

```javascript
// ✅ ERLAUBT: DOM erstellen, Callbacks aufrufen
// ❌ VERBOTEN: Globale Events, document.dispatchEvent()
```

**Morphs sind REINE Transformationen: `(wert, config) → HTMLElement`**

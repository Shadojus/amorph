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
| `features/` | Isolierte Feature-Module (Header, Grid, Vergleich, Einzelansicht, Infinite Scroll) |
| `morphs/` | Reine Transformations-Funktionen |
| `styles/` | CSS mit Design-Tokens + Black Glasmorphism |
| `observer/` | Debug, Rendering, Session Tracking |
| `util/` | DOM-Helpers, Fetch, Semantic-Utils, Router, Session |

### Design: Black Glasmorphism + Neon

- **Hintergrund**: Woodfloor-Textur + 88-92% schwarzes Overlay
- **Glass-Cards**: `backdrop-filter: blur(16px)`, dezente weiße Borders
- **Pilz-Farben**: 12 OVER-THE-TOP Neonfarben
- **Perspektiven**: Jede Perspektive hat eigene Farbe mit Multi-Color Glow

### Design-Tokens (base.css)

**Animation-Tokens:**
| Variable | Wert |
|----------|------|
| `--transition-fast` | 0.15s |
| `--transition-base` | 0.25s |
| `--transition-slow` | 0.4s |

**Responsive Breakpoints:**
| Variable | Wert |
|----------|------|
| `--bp-sm` | 480px |
| `--bp-md` | 768px |
| `--bp-lg` | 1024px |
| `--bp-xl` | 1280px |

### Features

| Feature | Beschreibung |
|---------|--------------|
| `header` | Suche, Perspektiven, Ansicht-Switch, Auswahl-Badges |
| `grid` | Karten-Layout, Felder anklickbar |
| `ansichten` | View-Controller (Karten/Vergleich) |
| `vergleich` | Perspektiven-Vergleich mit Compare-Morphs |
| `einzelansicht` | Pilz-Detail-Page `/:slug` |
| `infinitescroll` | Automatisches Nachladen beim Scrollen |

### URL State Persistenz

State wird automatisch in URL gespeichert:
- `?suche=steinpilz` - Suchbegriff
- `?perspektiven=naehrwert,saison` - Aktive Perspektiven
- `?ansicht=vergleich` - Aktive Ansicht

### Datengetriebene Typ-Erkennung

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

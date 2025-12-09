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
| `config/` | YAML-Konfiguration, Schema, 17 Perspektiven |
| `core/` | Config-Loader, Pipeline, Web Component |
| `features/` | Isolierte Feature-Module (Header, Grid, Vergleich, Einzelansicht, Infinite Scroll) |
| `morphs/` | Reine Transformations-Funktionen |
| `themes/` | Theme-spezifische Compare-Morphs (pilze/) |
| `styles/` | CSS mit Design-Tokens + Black Glasmorphism |
| `observer/` | Debug, Rendering, Session Tracking |
| `util/` | DOM-Helpers, Fetch, Semantic-Utils, Router, Session |

### Design: Black Glasmorphism + Neon

- **Hintergrund**: Woodfloor-Textur + 88-92% schwarzes Overlay
- **Glass-Cards**: `backdrop-filter: blur(16px)`, dezente weiße Borders
- **Pilz-Farben**: 12 OVER-THE-TOP Neonfarben
- **Perspektiven**: 17 Perspektiven mit eigenen Farben + Multi-Color Glow

### 17 Perspektiven-System

| Perspektive | Symbol | Fokus |
|-------------|--------|-------|
| Kulinarisch | 🍳 | Geschmack, Zubereitung, Essbarkeit |
| Medizin | 💊 | Wirkstoffe, Therapie, Dosierung |
| Anbau | 🌱 | Kultivierung, Substrate, Ertrag |
| Sicherheit | ⚠️ | Toxine, Verwechslung, Erste Hilfe |
| Wissenschaft | 🔬 | Taxonomie, Genetik, Mikroskopie |
| Statistik | 📊 | Fundstatistik, Trends, Verbreitung |
| Chemie | 🧪 | Metabolite, Enzyme, Volatilome |
| Sensorik | 👃 | Aroma, Geschmack, Textur |
| Ökologie | 🌿 | Habitat, Symbiosen, Interaktionen |
| Temporal | ⏰ | Lebenszyklus, Saisonalität |
| Geografie | 🗺️ | Verbreitung, Fundorte, Klima |
| Wirtschaft | 💰 | Markt, Preise, Handel |
| Naturschutz | 🛡️ | IUCN-Status, Bedrohungen |
| Kultur | 📜 | Mythologie, Geschichte, Kunst |
| Forschung | 📚 | Publikationen, Patente |
| Interaktionen | 🔗 | Wirte, Mikrobiom, Symbiosen |
| Visual | 🎨 | Bilder, Farben, 360° |

### Features

| Feature | Beschreibung |
|---------|--------------|
| `header` | Suche, Perspektiven, Ansicht-Switch, Auswahl-Badges |
| `grid` | Karten-Layout, Felder anklickbar |
| `ansichten` | View-Controller (Karten/Vergleich) |
| `vergleich` | Perspektiven-Vergleich mit Theme-Compare-Morphs |
| `einzelansicht` | Pilz-Detail-Page `/:slug` |
| `infinitescroll` | Automatisches Nachladen beim Scrollen |

### URL State Persistenz

State wird automatisch in URL gespeichert:
- `?suche=steinpilz` - Suchbegriff
- `?perspektiven=chemie,sensorik` - Aktive Perspektiven
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

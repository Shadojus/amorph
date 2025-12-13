# AMORPH

Formlos. Zustandslos. Transformierend.

## Systemübersicht

Datengetriebenes Transformations-Framework für Pilzdaten-Visualisierung.

```
DATEN (JSON) → detectType() → MORPH → DOM
```

## Architektur

| Ordner | Zweck |
|--------|-------|
| `config/` | YAML-Konfiguration, Schema, 15 Perspektiven |
| `core/` | Config-Loader, Pipeline, Web Component |
| `features/` | Isolierte Feature-Module |
| `morphs/` | Reine Transformations-Funktionen + Compare-Morphs |
| `styles/` | CSS + Black Glasmorphism |
| `observer/` | Debug, Rendering, Session Tracking |
| `util/` | DOM-Helpers, Fetch, Router, Session |

## Design: Black Glasmorphism + Neon

- **Hintergrund**: Woodfloor-Textur + schwarzes Overlay
- **Glass-Elemente**: `backdrop-filter: blur()`, dezente Borders
- **Pilz-Farben**: 12 Neonfarben für Item-Identifikation
- **Perspektiven-Farben**: 15 Perspektiven mit eigenen Farbschemata

## 15 Perspektiven

| ID | Symbol | Fokus |
|----|--------|-------|
| chemistry | 🧪 | Metabolite, Enzyme |
| conservation | 🛡️ | IUCN-Status, Schutz |
| culinary | 🍳 | Essbarkeit, Zubereitung |
| cultivation | 🌱 | Anbau, Substrate |
| culture | 📜 | Mythologie, Geschichte |
| ecology | 🌿 | Habitat, Symbiosen |
| economy | 💰 | Markt, Preise |
| geography | 🗺️ | Verbreitung, Klima |
| identification | 🔍 | Bestimmungsmerkmale |
| interactions | 🔗 | Wirte, Mikrobiom |
| medicine | 💊 | Wirkstoffe, Therapie |
| research | 📚 | Publikationen |
| safety | ⚠️ | Toxine, Verwechslung |
| statistics | 📊 | Fundstatistiken |
| temporal | ⏰ | Saisonalität |

## Features

| Feature | Beschreibung |
|---------|--------------|
| `header` | Branding, Suche, Perspektiven, Auswahl |
| `grid` | Karten-Layout |
| `ansichten` | View-Controller + Auswahl-State |
| `vergleich` | smartCompare (datengetrieben) |
| `einzelansicht` | Detail-Page `/:slug` |
| `infinitescroll` | Auto-Nachladen |
| `suche` | Semantische Suche |
| `perspektiven` | Perspektiven-Toggle |

## URL State

```
?suche=steinpilz
?perspektiven=chemistry,ecology
?ansicht=vergleich
```

## Typ-Erkennung

```javascript
{ min, max }           → 'range'
{ min, max, avg }      → 'stats'
[{ axis, value }]      → 'radar'
{ A: 30, B: 20 }       → 'pie'
4.5                    → 'rating'
85                     → 'progress'
```

## Morph-Purity

```javascript
// ✅ DOM erstellen, Callbacks
// ❌ Globale Events, Side-Effects
```

**Morphs: `(wert, config) → HTMLElement`**

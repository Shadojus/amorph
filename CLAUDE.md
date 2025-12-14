# AMORPH

Formlos. Zustandslos. Transformierend.

## Konzept

Datengetriebenes Transformations-Framework. Struktur der Daten bestimmt Darstellung.

```
DATEN (JSON) → detectType() → MORPH → DOM
```

## Architektur

| Ordner | Zweck |
|--------|-------|
| `config/` | YAML-Konfiguration, Schema, 15 Perspektiven |
| `core/` | Config-Loader, Pipeline, Container |
| `features/` | Isolierte Feature-Module |
| `morphs/` | Transformations-Funktionen (30+ Primitives) |
| `styles/` | CSS + Black Glasmorphism |
| `observer/` | Debug, Rendering, Session |
| `util/` | DOM, Fetch, Router, Semantic |
| `data/` | Beispieldaten (Pilze, Tiere, Pflanzen) |

## Design: Black Glasmorphism

- **Hintergrund**: Woodfloor-Textur + schwarzes Overlay
- **Glass-Elemente**: `backdrop-filter: blur()`, dezente Borders
- **Pilz-Farben**: 12 Neonfarben für Item-Identifikation
- **Kompaktes Layout**: Inline-Felder, automatische Labels

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

## Typ-Erkennung (Kirk-Prinzipien)

```javascript
{ min, max }           → 'range'
{ min, max, avg }      → 'stats'  
[{ axis, value }]      → 'radar'
{ A: 30, B: 20 }       → 'pie'
[num, num, ...]        → 'sparkline'
4.5                    → 'rating'
85                     → 'progress'
```

## Morph-Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement
```

**Regeln**: DOM erstellen ✅ | Globale Events ❌

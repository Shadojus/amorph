# Data

Modulare Testdaten für AMORPH - 4 Kingdoms × 15 Perspektiven.

## Verzeichnisstruktur

```
data/
├── animalia/
│   ├── index.json              ← Collection-Index
│   └── monarchfalter/          ← 1 Index + 15 Perspektiven
│       ├── index.json
│       ├── chemistry.json
│       ├── ecology.json
│       └── ... (15 Perspektiven)
├── bacteria/
│   ├── index.json
│   └── ecoli/
├── fungi/
│   ├── index.json
│   └── fly-agaric/
│       └── porcini/
└── plantae/
    ├── index.json
    └── ginkgo/
```

## Dateien

| Pfad | Typ | Inhalt |
|------|-----|--------|
| `*/index.json` | Collection | `{collection, species: [{slug, folder}]}` |
| `*/*/index.json` | Spezies | `{id, slug, name, scientific_name, image, perspectives[]}` |
| `*/*/*.json` | Perspektive | Felder für diese Perspektive |

---

## Kingdoms & Spezies

| Kingdom | Spezies | Wissenschaftlich | Slug |
|---------|---------|------------------|------|
| Animalia | Monarchfalter | Danaus plexippus | `monarchfalter` |
| Bacteria | E. coli | Escherichia coli | `ecoli` |
| Fungi | Fliegenpilz | Amanita muscaria | `fly-agaric` |
| Fungi | Steinpilz | Boletus edulis | `porcini` |
| Plantae | Ginkgo | Ginkgo biloba | `ginkgo` |

---

## 15 Perspektiven-Dateien

| Perspektive | Datei | Haupt-Morphs |
|-------------|-------|--------------|
| Identification | `identification.json` | object, list, text, boolean |
| Ecology | `ecology.json` | range, number, list, object |
| Geography | `geography.json` | list, object, text |
| Conservation | `conservation.json` | badge, progress, list, boolean |
| Chemistry | `chemistry.json` | pie, bar, number, list |
| Temporal | `temporal.json` | timeline, range, object |
| Statistics | `statistics.json` | stats, range, number |
| Interactions | `interactions.json` | radar, list, object |
| Safety | `safety.json` | progress, badge, list, boolean |
| Research | `research.json` | progress, list, number |
| Culture | `culture.json` | text, list, object |
| Economy | `economy.json` | range, bar, rating, number |
| Medicine | `medicine.json` | progress, list, text |
| Culinary | `culinary.json` | boolean, rating, number, list |
| Cultivation | `cultivation.json` | progress, range, list |

---

## Collection Index Format

```json
// fungi/index.json
{
  "collection": "fungi",
  "description": "Fungi Kingdom - Mycological Data",
  "type": "json-perspectives",
  "species": [
    { "slug": "porcini", "folder": "porcini" },
    { "slug": "fly-agaric", "folder": "fly-agaric" }
  ]
}
```

---

## Spezies Index Format

```json
// fungi/fly-agaric/index.json
{
  "id": "fungi-002",
  "slug": "fly-agaric",
  "name": "Fly Agaric",
  "scientific_name": "Amanita muscaria",
  "image": "data/fungi/fly-agaric/species_mockup_image.jpg",
  "description": "The iconic red and white spotted mushroom...",
  "perspectives": [
    "identification", "ecology", "geography", "conservation",
    "chemistry", "temporal", "statistics", "interactions",
    "safety", "research", "culture", "economy", 
    "medicine", "culinary", "cultivation"
  ]
}
```

---

## Perspektiven-Daten Beispiel

```json
// fungi/fly-agaric/chemistry.json
{
  // Pie-Chart (nur numerische Values)
  "chemical_composition": {
    "water_percent": 90,
    "protein_percent": 3,
    "carbohydrate_percent": 4
  },
  
  // Bar-Chart (Array mit label/value)
  "composition_chart": [
    { "label": "Water", "value": 90 },
    { "label": "Protein", "value": 3 }
  ],
  
  // Radar-Chart (Array mit axis/value)
  "toxin_profile": [
    { "axis": "Ibotenic acid", "value": 85 },
    { "axis": "Muscimol", "value": 70 }
  ],
  
  // Range (min/max)
  "ph_value": { "min": 5.0, "max": 6.5 },
  
  // Citation (author/year/title)
  "reference_citation": {
    "authors": "Michelot, D.",
    "year": 2003,
    "title": "Amanita muscaria...",
    "journal": "Mycological Research"
  }
}
```

---

## Typ-Erkennung (Data → Morph)

| Datenstruktur | Erkannter Typ | Morph |
|---------------|---------------|-------|
| `{min, max}` | range | range |
| `{min, max, avg/durchschnitt}` | stats | stats |
| `{A: 30, B: 50, ...}` (nur Zahlen) | pie | pie |
| `[num, num, ...]` (≥3 Zahlen) | sparkline | sparkline |
| `[{axis/achse, value/wert}]` (≥3) | radar | radar |
| `[{phase/stage}]` | lifecycle | lifecycle |
| `[{date/datum, event}]` | timeline | timeline |
| `[{label, value}]` (≤6) | pie | pie |
| `[{label, value}]` (>6) | bar | bar |
| `{author, year, title}` | citation | citation |
| `{lat, lng}` | map | map |
| `{dose, unit}` | dosage | dosage |
| `{status}` | badge | badge |
| `{rating/score}` | rating | rating |

---

## Schema-Meta-Felder

In `config/schema/basis.yaml` definiert:

```yaml
meta:
  nameField: name              # Haupt-Anzeigename
  idField: id                  # Eindeutige ID
  bildField: bild              # Bild-URL
  bildFallbackFields:          # Fallbacks
    - image
    - img
    - picture
```

---

## Konfiguration (daten.yaml)

```yaml
quelle:
  typ: json-perspektiven
  indexUrl: ./data/fungi/index.json
  baseUrl: ./data/fungi/
```

**Kingdom wechseln:**
- `./data/animalia/` → Monarchfalter
- `./data/bacteria/` → E. coli
- `./data/fungi/` → Fliegenpilz, Steinpilz
- `./data/plantae/` → Ginkgo

---

## Lade-Verhalten (JsonPerspektivenSource)

### Initiales Laden
1. `index.json` der Collection laden
2. Für jede Spezies: `*/index.json` laden (Basis-Daten)

### Lazy-Loading (bei Perspektiven-Aktivierung)
```javascript
// Wenn Perspektive "chemistry" aktiviert wird:
await loadPerspective(spezies, 'chemistry')
// Lädt: fungi/fly-agaric/chemistry.json
// Merged Felder in spezies-Objekt
```

### Cache
- Geladene Perspektiven werden gecacht
- `loadedPerspektiven: Map<speziesId, Set<perspId>>`
- Kein erneutes Laden bei wiederholter Aktivierung

---

## Statistik

| Metrik | Wert |
|--------|------|
| Kingdoms | 4 |
| Spezies | 5 |
| Perspektiven | 15 |
| Dateien pro Spezies | 16 (1 Index + 15 Perspektiven) |
| Gesamt JSON-Dateien | ~84 |

---

## README.md

Enthält zusätzliche Dokumentation:
- Detaillierte Morph-Zuordnung pro Perspektive
- Dateien-Statistik
- Konfigurationsbeispiele

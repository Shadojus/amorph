# Data

Modulare Daten für AMORPH - 4 Kingdoms × 15 Perspektiven.

## Verzeichnisstruktur

```
data/
├── animalia/
│   ├── index.json              ← Collection-Index
│   └── monarchfalter/          ← 1 Index + 15 Perspektiven
├── bacteria/
│   ├── index.json
│   ├── ecoli/
│   └── test-*/                 ← Morph-Test-Daten (44 Ordner)
├── fungi/
│   ├── index.json
│   ├── fly-agaric/
│   └── porcini/
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

## Daten erstellen

### Schritt 1: Blueprint lesen

Öffne das Blueprint für die gewünschte Perspektive:
`config/schema/perspektiven/blueprints/{perspektive}.blueprint.yaml`

### Schritt 2: JSON erstellen

Kopiere die Struktur und fülle mit echten Daten:

```yaml
# Blueprint sagt:
# morph: badge
conservation_status:
  status: ""
  variant: ""
```

```json
// Dein JSON:
{
  "conservation_status": {
    "status": "Vulnerable",
    "variant": "warning"
  }
}
```

### Schritt 3: Morph-Typen beachten

| Morph | Leere Struktur | Befülltes Beispiel |
|-------|----------------|---------------------|
| `text` | `""` | `"Detailed description..."` |
| `number` | `0` | `42` |
| `boolean` | `false` | `true` |
| `tag` | `""` | `"mycorrhizal"` |
| `badge` | `{status:"",variant:""}` | `{status:"Active",variant:"success"}` |
| `list` | `[""]` | `["oak","beech","pine"]` |
| `range` | `{min:0,max:0,unit:""}` | `{min:5,max:15,unit:"cm"}` |
| `progress` | `{value:0,max:100}` | `{value:75,max:100}` |
| `gauge` | Siehe Blueprint | `{value:65,min:0,max:100,zones:[...]}` |
| `bar` | `[{label:"",value:0}]` | `[{label:"Protein",value:26}]` |
| `timeline` | `[{date:"",event:""}]` | `[{date:"1753",event:"First described"}]` |
| `calendar` | 12× `{month:N,active:false}` | Aktiviere relevante Monate |

---

## Spezies Index Format

```json
{
  "id": "fungi-001",
  "slug": "steinpilz",
  "name": "Steinpilz",
  "scientific_name": "Boletus edulis",
  "image": "data/fungi/steinpilz/image.jpg",
  "description": "Der König unter den Speisepilzen...",
  "perspectives": [
    "identification",
    "ecology",
    "culinary",
    "safety"
  ]
}
```

---

## Perspektiven-Datei Format

```json
// steinpilz/identification.json
{
  "cap_diameter": { "min": 8, "max": 25, "unit": "cm" },
  "cap_color": ["brown", "chestnut", "tan"],
  "cap_shape": "convex to flat",
  "edibility_status": { "status": "choice_edible", "variant": "success" },
  "spore_print_color": "olive-brown",
  "has_ring": false,
  "has_volva": false
}
```
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

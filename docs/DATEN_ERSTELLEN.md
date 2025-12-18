# Daten-Erstellungs-Anleitung

Schritt-für-Schritt Guide zum Befüllen des AMORPH-Systems mit echten Daten.

---

## Übersicht

Das System ist jetzt vollständig definiert:
- ✅ 43 Morph-Primitives (Visualisierungen)
- ✅ 15 Perspektiven (Themengebiete)  
- ✅ 15 Blueprints (~12.000 Zeilen Schema-Definitionen)
- ✅ Erkennungs-Pipeline (automatische Typ-Erkennung)

**Nächster Schritt**: Echte Daten erstellen!

---

## Workflow: Neue Spezies hinzufügen

### 1. Ordnerstruktur erstellen

```
data/fungi/steinpilz/
├── index.json          # Pflicht: Kern-Daten
├── identification.json # Optional: Perspektive 1
├── ecology.json        # Optional: Perspektive 2
├── culinary.json       # Optional: Perspektive 3
└── ...                 # Weitere Perspektiven nach Bedarf
```

### 2. index.json erstellen (Pflicht)

```json
{
  "id": "fungi-003",
  "slug": "steinpilz",
  "name": "Steinpilz",
  "scientific_name": "Boletus edulis",
  "image": "data/fungi/steinpilz/hauptbild.jpg",
  "description": "Der König unter den Speisepilzen...",
  "perspectives": [
    "identification",
    "ecology", 
    "culinary",
    "safety"
  ]
}
```

### 3. Collection-Index aktualisieren

In `data/fungi/index.json`:
```json
{
  "collection": "fungi",
  "species": [
    { "slug": "steinpilz", "folder": "steinpilz" }
  ]
}
```

### 4. Perspektiven-Dateien erstellen

Für jede Perspektive in `perspectives[]`:

---

## Perspektiven befüllen

### Schritt A: Blueprint öffnen

Öffne das relevante Blueprint:
`config/schema/perspektiven/blueprints/{perspektive}.blueprint.yaml`

### Schritt B: Relevante Felder auswählen

Du musst **nicht alle Felder** befüllen! Wähle nur die relevanten.

**Beispiel**: Für `culinary.json` bei einem Steinpilz:

```yaml
# Aus culinary.blueprint.yaml:
# morph: badge
culinary_edibility:
  status: ""
  variant: ""

# morph: rating
culinary_taste_rating:
  rating: 0
  max: 10

# morph: list
culinary_cooking_methods:
  - ""
```

### Schritt C: JSON mit echten Daten

```json
{
  "culinary_edibility": {
    "status": "choice_edible",
    "variant": "success"
  },
  "culinary_taste_rating": {
    "rating": 9,
    "max": 10
  },
  "culinary_cooking_methods": [
    "sautéed",
    "grilled",
    "dried",
    "in soups",
    "risotto"
  ],
  "culinary_flavor_profile": {
    "primary": "nutty",
    "secondary": "earthy",
    "intensity": "strong"
  }
}
```

---

## Morph-Typ Cheat Sheet

### Einfache Typen

```json
// text
"description": "Beschreibungstext..."

// number  
"height_cm": 15

// boolean
"is_edible": true

// tag (kurz, ≤20 Zeichen)
"category": "ectomycorrhizal"
```

### Status-Typen

```json
// badge
"status": {
  "status": "Endangered",
  "variant": "error"
}

// progress
"completion": {
  "value": 75,
  "max": 100,
  "unit": "%"
}

// rating
"quality": {
  "rating": 8.5,
  "max": 10
}
```

### Bereichs-Typen

```json
// range
"cap_diameter": {
  "min": 8,
  "max": 25,
  "unit": "cm"
}

// stats
"observations": {
  "total": 1234,
  "count": 56,
  "min": 5,
  "max": 200,
  "avg": 45.2
}

// gauge
"toxicity_level": {
  "value": 15,
  "min": 0,
  "max": 100,
  "zones": [
    { "min": 0, "max": 30, "color": "green" },
    { "min": 30, "max": 70, "color": "yellow" },
    { "min": 70, "max": 100, "color": "red" }
  ]
}
```

### Listen-Typen

```json
// list
"habitats": ["deciduous forest", "coniferous forest", "mixed woodland"]

// bar
"nutritional_content": [
  { "label": "Protein", "value": 26 },
  { "label": "Carbs", "value": 58 },
  { "label": "Fat", "value": 8 }
]

// pie (≤6 Items)
"composition": [
  { "label": "Water", "value": 92 },
  { "label": "Fiber", "value": 5 },
  { "label": "Other", "value": 3 }
]

// radar
"flavor_profile": [
  { "axis": "Umami", "value": 90 },
  { "axis": "Sweet", "value": 20 },
  { "axis": "Bitter", "value": 5 },
  { "axis": "Sour", "value": 10 },
  { "axis": "Salty", "value": 15 }
]

// sparkline
"monthly_sightings": [5, 8, 15, 45, 120, 89, 34, 12, 8, 3, 2, 1]
```

### Temporal-Typen

```json
// timeline
"history": [
  { "date": "1753", "event": "First described", "description": "By Linnaeus" },
  { "date": "1821", "event": "Name established", "description": "By Fries" }
]

// lifecycle
"growth_stages": [
  { "phase": "Spore", "duration": "1-3 days" },
  { "phase": "Mycelium", "duration": "2-4 weeks" },
  { "phase": "Primordia", "duration": "3-5 days" },
  { "phase": "Mature", "duration": "5-7 days" }
]

// calendar
"fruiting_season": [
  { "month": 1, "active": false },
  { "month": 2, "active": false },
  { "month": 3, "active": false },
  { "month": 4, "active": false },
  { "month": 5, "active": true },
  { "month": 6, "active": true },
  { "month": 7, "active": true },
  { "month": 8, "active": true },
  { "month": 9, "active": true },
  { "month": 10, "active": true },
  { "month": 11, "active": false },
  { "month": 12, "active": false }
]
```

### Spezial-Typen

```json
// citation
"primary_reference": {
  "authors": "Smith, J. & Johnson, M.",
  "year": 2020,
  "title": "Fungal Diversity in European Forests",
  "journal": "Mycologia",
  "doi": "10.1234/myco.2020.001"
}

// map
"type_locality": {
  "lat": 48.8566,
  "lng": 2.3522,
  "region": "France"
}

// network
"symbiotic_partners": [
  { "name": "Quercus robur", "type": "ectomycorrhiza", "intensity": 95 },
  { "name": "Fagus sylvatica", "type": "ectomycorrhiza", "intensity": 80 },
  { "name": "Picea abies", "type": "ectomycorrhiza", "intensity": 60 }
]

// severity
"toxicity_warnings": [
  { "level": "none", "typ": "Raw consumption", "beschreibung": "Safe when cooked" }
]

// currency
"market_price": {
  "amount": 45.00,
  "currency": "EUR"
}
```

---

## Validierung

### Automatische Erkennung

Die Pipeline erkennt Morph-Typen automatisch anhand der Struktur:
- `{status, variant}` → badge
- `{min, max, unit}` → range
- `[{label, value}]` → bar/pie
- etc.

### Manuelle Prüfung

1. **Starte den Server**: `npx serve .`
2. **Öffne Browser**: `http://localhost:3000`
3. **Suche deine Spezies**: Prüfe Darstellung
4. **Wechsle Perspektiven**: Prüfe alle Felder

---

## Empfohlene Reihenfolge

1. **identification** - Grundlegende Bestimmungsmerkmale
2. **ecology** - Habitat, Symbiosen, Verbreitung
3. **safety** - Essbarkeit, Verwechslungen (kritisch!)
4. **culinary** - Kulinarische Verwendung
5. Weitere je nach Relevanz

---

## Tipps

### Daten-Quellen
- Wikipedia (Basisinformationen)
- GBIF (Verbreitungsdaten)
- Index Fungorum (Taxonomie)
- MycoBank (Wissenschaftliche Namen)
- Fachliteratur (Zitate!)

### Qualitätssicherung
- Immer `citation` für Quellen angeben
- Unsichere Daten mit `confidence` kennzeichnen
- Enumerations aus Blueprint verwenden

### Effizienz
- Beginne mit wenigen, gut dokumentierten Spezies
- Nutze Copy-Paste von ähnlichen Arten
- Automatisiere wiederkehrende Strukturen

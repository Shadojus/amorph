# Data

Beispieldaten für AMORPH. **Datenstruktur bestimmt den Morph!**

## pilze.json - Datenstruktur

Das Daten-Format unterstützt alle Morph-Typen durch automatische Erkennung:

```javascript
{
  // Basis-Felder (typ aus schema.yaml)
  "id": "string",
  "slug": "string",
  "name": "string",
  "wissenschaftlich": "string",
  "essbarkeit": "string",        // → badge (via keywords)
  "beschreibung": "string",      // → text
  "saison": "string",            // → tag
  "bild": "string",              // → image

  // AUTO-ERKANNT aus Struktur
  "temperatur": { "min": 10, "max": 25 },  // → range
  "standort": ["Nadelwald", "Mischwald"],  // → list
  "verwechslung": ["Gallenröhrling"],      // → list
  
  // Zahlen-Erkennung
  "bewertung": 4.8,              // 0-10 Dezimal → rating
  "beliebtheit": 92,             // 0-100 Integer → progress

  // Objekt-Erkennung
  "naehrwerte": {                // Nur Zahlen → pie
    "Protein": 26,
    "Kohlenhydrate": 52,
    "Fett": 8
  },
  
  // Array-Erkennung  
  "profil": [                    // [{axis, value}] 3+ → radar
    { "axis": "Geschmack", "value": 95 },
    { "axis": "Textur", "value": 85 },
    { "axis": "Aroma", "value": 90 }
  ],
  
  "wirkstoffe": [                // [{label, value}] → bar
    { "label": "Ergothionein", "value": 4.2, "unit": "mg" }
  ],
  
  "ernte_stats": {               // {min, max, avg} → stats
    "min": 80,
    "max": 350,
    "avg": 180,
    "count": 156
  },
  
  "lebenszyklus": [              // [{date, event}] → timeline
    { "date": "Frühjahr", "event": "Myzel-Aktivierung" },
    { "date": "Herbst", "event": "Haupternte", "active": true }
  ],
  
  "verfuegbarkeit": "verfügbar"  // String mit Keyword → badge
}
```

## Datengetrieben-Prinzip

**Keine expliziten Typ-Angaben nötig!** Die Pipeline erkennt:

| Datenstruktur | Erkannter Morph |
|---------------|-----------------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `{A: 30, B: 50}` (nur Zahlen) | pie |
| `[{axis, value}]` (3+) | radar |
| `[{date, event}]` | timeline |
| `[{label, value}]` | bar (6+) oder pie (≤6) |
| `4.8` (0-10 Dezimal) | rating |
| `92` (0-100 Integer) | progress |
| `"essbar"` (Badge-Keyword) | badge |

## Eigene Daten

1. JSON-Datei in `data/` erstellen
2. `config/daten.yaml` anpassen:

```yaml
quelle:
  typ: json
  url: ./data/meine-daten.json
```

## Externe Datenquellen

### PocketBase

```yaml
quelle:
  typ: pocketbase
  url: https://api.example.com
  sammlung: items
```

### REST API

```yaml
quelle:
  typ: rest
  url: https://api.example.com/items
  headers:
    Authorization: Bearer ${API_TOKEN}
```

## Schema

Das Schema in `daten.yaml` ist optional, hilft aber bei der Validierung:

```yaml
schema:
  id: string
  name: string
  preis: number
  aktiv: boolean
  temperatur:
    typ: range
    einheit: °C
  tags: array
```

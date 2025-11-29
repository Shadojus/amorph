# Data

Beispieldaten für AMORPH.

## pilze.json

10 Pilze mit verschiedenen Datentypen:

```javascript
{
  "id": "string",           // Eindeutige ID
  "slug": "string",         // URL-freundlicher Name
  "name": "string",         // Deutscher Name
  "wissenschaftlich": "string", // Lateinischer Name
  "essbarkeit": "string",   // essbar, giftig, tödlich, etc.
  "beschreibung": "string", // Ausführlicher Text
  "temperatur": {           // Range-Typ
    "min": 10,
    "max": 25
  },
  "standort": ["array"],    // Liste von Strings
  "verwechslung": ["array"],// Liste von Strings
  "bild": "string",         // URL zum Bild
  "geschmack": "string",    // Optional
  "zubereitung": "string",  // Optional
  "symptome": "string"      // Optional (bei giftigen)
}
```

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

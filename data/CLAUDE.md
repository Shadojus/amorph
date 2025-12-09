# Data

Beispieldaten für AMORPH. **Datenstruktur bestimmt den Morph!**

## pilze.json - Datenstruktur

11 Pilze mit Daten für 17 Perspektiven:

| Pilz | Besondere Perspektiven-Daten |
|------|------------------------------|
| Steinpilz | Ökologie, Geografie, Temporal |
| Shiitake | Chemie, Sensorik, Wirtschaft |
| Knollenblätterpilz | Kultur, Naturschutz, Forschung |
| Birkenporling | Forschung, Interaktionen, Visual |
| Fliegenpilz | Kultur, Temporal, Visual, Ökologie |
| Cordyceps | Wirtschaft, Interaktionen, Chemie |
| Champignon | Chemie, Sensorik, Wirtschaft, Anbau |

## Datenformat

```javascript
{
  // Basis-Felder
  "id": "string",
  "slug": "string",
  "name": "string",
  "wissenschaftlich": "string",

  // AUTO-ERKANNT aus Struktur
  "temperatur": { "min": 10, "max": 25 },  // → range
  "naehrwerte": { "Protein": 26, ... },    // → pie
  "profil": [{ "axis": "X", "value": 95 }], // → radar
  "bewertung": 4.8,                         // → rating
  "beliebtheit": 92,                        // → progress

  // Perspektiven-Felder (Beispiele)
  "chemie_primaer_metabolite": [...],
  "chemie_sekundaer_metabolite": [...],
  "sensorik_aroma": { "profile": [...] },
  "oekologie_symbiose_partner": [...],
  "wirtschaft_preise": { ... },
  "kultur_mythologie": [...],
  "forschung_publikationen": [...]
}
```

## Datengetrieben-Prinzip

**Keine expliziten Typ-Angaben nötig!** Die Pipeline erkennt automatisch:

| Datenstruktur | Erkannter Morph |
|---------------|-----------------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `{A: 30, B: 50}` (nur Zahlen) | pie |
| `[{axis, value}]` (3+) | radar |
| `[{date, event}]` | timeline |
| `[{label, value}]` | bar |
| `4.8` (0-10 Dezimal) | rating |
| `92` (0-100 Integer) | progress |

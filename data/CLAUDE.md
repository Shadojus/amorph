# Data

Pilzdaten für AMORPH.

## Struktur

```
data/
└── pilze/
    ├── index.json      ← Alle Pilze
    └── steinpilz.json  ← Einzelner Pilz
```

## Datenformat

```javascript
{
  "id": "string",
  "slug": "string",
  "name": "string",
  
  // Auto-erkannt aus Struktur:
  "temperatur": { "min": 10, "max": 25 },  // → range
  "naehrwerte": { "Protein": 26 },         // → pie
  "bewertung": 4.8,                        // → rating
  
  // Perspektiven-Felder:
  "chemistry_primaer_metabolite": [...],
  "ecology_symbiose_partner": [...],
  "economy_preise": { ... }
}
```

## Typ-Erkennung

| Struktur | Morph |
|----------|-------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `{A: 30, B: 50}` | pie |
| `[{axis, value}]` | radar |
| `4.8` (0-10) | rating |
| `92` (0-100) | progress |

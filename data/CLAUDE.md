# Data

Beispieldaten für AMORPH.

## Struktur

```
data/
├── fungi/          ← Pilze
│   ├── index.json
│   ├── fly-agaric/
│   └── porcini/
├── animalia/       ← Tiere
│   ├── index.json
│   └── monarchfalter/
├── plantae/        ← Pflanzen
│   ├── index.json
│   └── ginkgo/
└── bacteria/       ← Bakterien
    ├── index.json
    └── ecoli/
```

## Datenformat

```javascript
{
  "id": "string",
  "slug": "string",
  "name": "string",
  
  // Auto-erkannt:
  "temperatur": { "min": 10, "max": 25 },  // → range
  "naehrwerte": { "Protein": 26 },         // → pie
  "messwerte": [10, 15, 12, 18],           // → sparkline
  "bewertung": 4.8,                        // → rating
}
```

## Typ-Erkennung

| Struktur | Morph |
|----------|-------|
| `{min, max}` | range |
| `{min, max, avg}` | stats |
| `{A: 30, B: 50}` | pie |
| `[num, num, ...]` | sparkline |
| `[{axis, value}]` | radar |

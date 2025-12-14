# Morphs

Reine Funktionen. Kein Zustand. Keine Side-Effects.

## Struktur

```
morphs/
├── index.js          ← Registry aller Morphs
├── primitives/       ← 30+ Basis-Morphs
│   ├── text, number, boolean
│   ├── tag, badge, list
│   ├── bar, pie, radar, gauge
│   ├── stats, range, progress, rating
│   ├── sparkline, slopegraph, heatmap
│   ├── timeline, lifecycle, steps
│   └── image, link, map, citation
└── compare/          ← Vergleichs-Morphs
    ├── base.js       ← createColors(), detectType()
    ├── primitives/   ← Compare-Varianten
    └── composites/   ← smartCompare, diffCompare
```

## Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement
```

- `wert`: Rohdaten (beliebiger Typ)
- `config`: Morph-Konfiguration
- `morphField`: Callback für rekursives Morphen

## Regeln

```javascript
// ✅ DOM erstellen
// ✅ Callbacks aufrufen
// ❌ Globale Events
// ❌ Side-Effects
```

## Typ-Erkennung

| Datenstruktur | Morph |
|---------------|-------|
| `{ min, max }` | range |
| `{ min, max, avg }` | stats |
| `[num, num, ...]` | sparkline |
| `[{ axis, value }]` | radar |
| `{ A: 30, B: 50 }` | pie |
| `4.5` (0-10) | rating |
| `85` (0-100) | progress |

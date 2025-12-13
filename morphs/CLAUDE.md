# Morphs

Reine Funktionen. Kein Zustand. Keine Side-Effects.

## Struktur

```
morphs/
├── index.js          ← Registry + compareMorph()
├── header.js         ← Header-Builder
├── suche.js          ← Suchfeld
├── perspektiven.js   ← Perspektiven-Buttons
├── primitives/       ← 28+ Basis-Morphs
└── compare/          ← Compare-Morphs (Data-Driven)
    ├── base.js       ← createColors(), detectType()
    ├── index.js      ← Export
    ├── primitives/   ← 16 Compare-Primitives
    └── composites/   ← smartCompare, diffCompare
```

## Signatur

```javascript
function morph(wert, config) → HTMLElement
```

## Regeln

```javascript
// ✅ DOM erstellen, Callbacks aufrufen
// ❌ Globale Events, Side-Effects
```

## Typ-Erkennung

| Datenstruktur | Morph |
|---------------|-------|
| `{ min, max }` | range |
| `{ min, max, avg }` | stats |
| `[{ axis, value }]` (3+) | radar |
| `"essbar"` (keyword) | badge |
| `4.5` (0-10) | rating |
| `85` (0-100) | progress |

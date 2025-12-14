# Primitives

30+ Basis-Morphs für Datenvisualisierung.

## Struktur

```
primitives/
├── index.js       ← Export aller Morphs + Aliase
├── index.css      ← Gemeinsame Styles
├── index.yaml     ← Config
└── [morph]/       ← Ein Ordner pro Morph
    ├── [morph].js
    └── [morph].css
```

## Übersicht (33 Morphs)

| Kategorie | Morphs |
|-----------|--------|
| **Text** | text, number, boolean |
| **Kategorien** | tag, badge, list |
| **Charts** | bar, pie, radar, gauge |
| **Statistik** | stats, range, progress, rating |
| **Trends** | sparkline, slopegraph, heatmap |
| **Zeit** | timeline, lifecycle, steps, calendar |
| **Struktur** | object, hierarchy, network |
| **Medien** | image, link, map, citation |
| **Spezial** | dosage, currency, severity, comparison, interpreted, kirk |

## Morph-Ordner

```
badge/, bar/, boolean/, calendar/, citation/, comparison/,
currency/, dosage/, gauge/, heatmap/, hierarchy/, image/,
interpreted/, kirk/, lifecycle/, link/, list/, map/,
network/, number/, object/, pie/, progress/, radar/,
range/, rating/, severity/, slopegraph/, sparkline/,
stats/, steps/, tag/, text/, timeline/
```

## Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement
```

- `wert`: Rohdaten (beliebiger Typ)
- `config`: Morph-Konfiguration aus Schema
- `morphField`: Callback für rekursives Morphen (z.B. für list, object)

## Aliase

```javascript
primitives = {
  text,
  string: text,        // Alias
  sparkline,
  trend: sparkline,    // Alias
  hierarchy,
  tree: hierarchy,     // Alias
  slopegraph,
  slope: slopegraph,   // Alias
  heatmap,
  matrix: heatmap,     // Alias
  comparison,
  diff: comparison,    // Alias
  steps,
  process: steps,      // Alias
  lifecycle,
  phase: lifecycle,    // Alias
  network,
  graph: network,      // Alias
  severity,
  warning: severity,   // Alias
  calendar,
  season: calendar,    // Alias
  gauge,
  score: gauge,        // Alias
  citation,
  reference: citation, // Alias
  currency,
  money: currency,     // Alias
  dosage,
  dose: dosage         // Alias
}
```

## Prinzipien

1. **Keine Domain-Logik** - "Pilz", "Pflanze" verboten
2. **Reine Funktionen** - Kein State, keine Side-Effects
3. **Datengetrieben** - Struktur bestimmt Darstellung
4. **Kompakt** - Platzsparende Styles

> **Compare-Varianten**: Für jeden Primitive-Morph existiert ein Compare-Wrapper in `morphs/compare/primitives/`. Siehe `morphs/compare/CLAUDE.md`.

## Neuen Morph erstellen

1. Ordner: `primitives/meinmorph/`
2. JS: `primitives/meinmorph/meinmorph.js`
3. CSS: `primitives/meinmorph/meinmorph.css`
4. Export: In `primitives/index.js` hinzufügen

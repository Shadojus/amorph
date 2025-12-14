# Primitives

30+ Basis-Morphs für Datenvisualisierung.

## Übersicht

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
| **Spezial** | dosage, currency, severity |

## Dateien

Jeder Morph hat eigenen Ordner:
```
primitives/
├── bar/
│   ├── bar.js
│   └── bar.css
├── sparkline/
│   ├── sparkline.js
│   └── sparkline.css
└── ...
```

## Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement
```

## Prinzipien

1. **Keine Domain-Logik** - "Pilz" verboten
2. **Reine Funktionen** - Kein State
3. **Datengetrieben** - Struktur bestimmt Darstellung
4. **Kompakt** - Platzsparende Styles

# 🍭 LOLLIPOP - Lollipop Chart

## Zweck
Elegante Alternative zum Balkendiagramm mit weniger visueller Tinte. Punkt am Ende einer Linie.

## Erkennungsregeln

### ✅ LOLLIPOP verwenden wenn:
```javascript
// Regel 1: Rankings mit Werten
[
  { kategorie: "Norway", wert: 85.6 },
  { kategorie: "Sweden", wert: 82.3 }
]

// Regel 2: Divergierende Daten um Baseline
// (positiv/negativ um Null)
[
  { land: "Germany", abweichung: +12 },
  { land: "Spain", abweichung: -8 }
]

// Regel 3: Vergleich sortierter Werte
{
  sortiert: true,
  wert: [...]
}
```

### ❌ NICHT LOLLIPOP verwenden wenn:
- **Viele Kategorien (>20)** → `bar` (kompakter)
- **Teil-Ganzes-Beziehung** → `pie`, `stackedbar`
- **Mehrere Serien pro Kategorie** → `groupedbar`
- **Zeitlicher Verlauf** → `sparkline`

## Datenformat

### Minimal
```javascript
{
  wert: [
    { label: "A", wert: 85 },
    { label: "B", wert: 72 }
  ]
}
```

### Mit Konfiguration
```javascript
{
  titel: "Gender Pay Gap by Country",
  horizontal: true,
  sortiert: true,
  baseline: 0,  // Für divergierende Daten
  showValues: true,
  highlightMax: true,
  farbModus: "vorzeichen",  // oder "einheitlich", "gradient"
  wert: [...]
}
```

## Features
- **Baseline**: Divergierende Daten um einen Referenzwert
- **Sortierung**: Automatisch nach Wert sortieren
- **Highlighting**: Max-Wert wird hervorgehoben (gelb)
- **Farbmodi**: Vorzeichen, einheitlich, oder Gradient

## Erkennung vs. andere Morphs

| Situation | Morph |
|-----------|-------|
| Einzelne Werte, elegant präsentieren | **lollipop** |
| Viele Kategorien, kompakt | bar |
| Teil-Ganzes-Verhältnis | pie |
| Mehrere Werte pro Kategorie | groupedbar |
| Werte mit Position (x/y) | scatterplot |

## Typische Anwendungsfälle
- **Rankings**: Top 10 Länder nach Index
- **Gender Pay Gap**: Divergierend um 0
- **Abweichungsanalysen**: Ist vs. Soll
- **Scores**: Bewertungen sortiert

## CSS Klassen
- `.amorph-lollipop` - Container
- `.amorph-lollipop-row` - Zeile (horizontal)
- `.amorph-lollipop-line` - Stiel
- `.amorph-lollipop-dot` - Punkt
- `.amorph-lollipop-baseline` - Baseline-Linie
- `.highlight` - Hervorgehobener Wert

## Farben
```javascript
LOLLIPOP_FARBEN = {
  positiv: '#4ecdc4',   // Türkis
  negativ: '#ff6b6b',   // Koralle
  neutral: '#95e1d3',   // Mint
  highlight: '#ffe66d'  // Gelb
}
```

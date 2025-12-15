# 📈 SCATTERPLOT - Streudiagramm

## Zweck
Zeigt Zusammenhänge zwischen zwei Variablen - X und Y Position zeigen Korrelationen.

## Erkennungsregeln

### ✅ SCATTERPLOT verwenden wenn:
```javascript
// Regel 1: Explizite x/y Koordinaten
{
  x: 45,
  y: 72,
  label: "Deutschland"
}

// Regel 2: Zwei numerische Eigenschaften die korreliert werden sollen
{
  einkommen: 45000,
  bildungsjahre: 16,
  land: "Frankreich"
}

// Regel 3: Datenpunkte mit Gruppierung
[
  { x: 30, y: 60, gruppe: "Europa" },
  { x: 25, y: 55, gruppe: "Asien" }
]
```

### ❌ NICHT SCATTERPLOT verwenden wenn:
- **Nur Y-Werte pro Kategorie** → `bar`, `dotplot`
- **Zeitlicher Verlauf** → `sparkline`, `timeline`
- **Teil-Ganzes-Beziehung** → `pie`, `treemap`
- **Verbindungen zwischen Punkten** → `network`, `flow`

## Datenformat

### Minimal
```javascript
{
  wert: [
    { x: 10, y: 20 },
    { x: 15, y: 35 },
    { x: 20, y: 45 }
  ]
}
```

### Mit Konfiguration
```javascript
{
  titel: "Bildung vs. Einkommen",
  xLabel: "Bildungsjahre",
  yLabel: "Einkommen (€)",
  showTrendline: true,
  showLabels: true,
  wert: [
    { x: 12, y: 35000, label: "DE" },
    { x: 16, y: 55000, label: "CH" }
  ]
}
```

## Features
- **Trendlinie**: Lineare Regression automatisch berechnet
- **Korrelationskoeffizient**: r-Wert wird angezeigt
- **Gruppierung**: Farbcodierung nach Kategorien
- **Labels**: Datenpunktbeschriftungen

## Erkennung vs. andere Morphs

| Situation | Morph |
|-----------|-------|
| Zwei numerische Variablen, Korrelation suchen | **scatterplot** |
| Eine numerische Variable pro Kategorie | bar, dotplot |
| Zeitreihe, kontinuierlicher Verlauf | sparkline |
| Vergleich mehrerer Werte pro Kategorie | groupedbar |
| Punkte mit Verbindungen | network |

## Typische Anwendungsfälle
- **Korrelationsanalyse**: Bildung vs. Einkommen
- **Verteilungsanalysen**: Alter vs. BMI
- **Wissenschaftliche Daten**: Dosis vs. Wirkung
- **Sozioökonomische Daten**: GDP vs. Lebenserwartung

## CSS Klassen
- `.amorph-scatterplot` - Container
- `.amorph-scatterplot-svg` - SVG-Element
- `.amorph-scatterplot-punkt` - Datenpunkt
- `.amorph-scatterplot-trend` - Trendlinie
- `.amorph-scatterplot-korrelation` - r-Wert Anzeige

## Statistik
```javascript
// Korrelationskoeffizient wird automatisch berechnet
// r > 0: Positive Korrelation (türkis gefärbt)
// r < 0: Negative Korrelation (rot gefärbt)
```

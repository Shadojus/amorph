# 📊 GROUPEDBAR - Gruppierte Balken

## Zweck
Zeigt mehrere Werte pro Kategorie nebeneinander - perfekt für Vergleiche über Zeit oder zwischen Gruppen.

## Erkennungsregeln

### ✅ GROUPEDBAR verwenden wenn:
```javascript
// Regel 1: Kategorie mit Array von Werten
{
  kategorie: "2023",
  werte: [45, 32, 28]  // oder
}

// Regel 2: Kategorie mit Objekt von benannten Werten  
{
  kategorie: "Messi",
  tore: 91,
  spiele: 69
}

// Regel 3: Items mit mehreren numerischen Eigenschaften zum Vergleich
[
  { jahr: "2010", goals: 47, games: 53 },
  { jahr: "2011", goals: 59, games: 55 },
  { jahr: "2012", goals: 91, games: 69 }
]
```

### ❌ NICHT GROUPEDBAR verwenden wenn:
- **Nur ein Wert pro Kategorie** → `bar`
- **Werte summieren sich zu 100%** → `stackedbar`
- **Anteil am Ganzen zeigen** → `pie`
- **Trend über Zeit** → `sparkline`

## Datenformat

### Minimal
```javascript
{
  wert: [
    { kategorie: "2010", tore: 47, spiele: 53 },
    { kategorie: "2011", tore: 59, spiele: 55 }
  ]
}
```

### Mit Konfiguration
```javascript
{
  titel: "Messi: Tore vs. Spiele",
  wert: [
    { kategorie: "2010", tore: 47, spiele: 53 },
    { kategorie: "2011", tore: 59, spiele: 55 }
  ],
  serien: ["tore", "spiele"],
  farben: {
    tore: "#ff6b6b",
    spiele: "#4ecdc4"
  }
}
```

## Erkennung vs. andere Morphs

| Situation | Morph |
|-----------|-------|
| Mehrere Werte pro Kategorie, nebeneinander | **groupedbar** |
| Ein Wert pro Kategorie | bar |
| Werte gestapelt, summieren zu 100% | stackedbar |
| Nur Gesamtwert pro Kategorie wichtig | bar |
| Zwei Werte als X/Y-Position | scatterplot |

## Typische Anwendungsfälle
- **Sportstatistiken**: Tore vs. Spiele pro Saison
- **Auszeichnungen**: Nominierungen vs. Gewonnen
- **Performance**: Geplant vs. Erreicht
- **Demographien**: Altersgruppen nach Geschlecht

## CSS Klassen
- `.amorph-groupedbar` - Container
- `.amorph-groupedbar-legend` - Legende
- `.amorph-groupedbar-group` - Kategoriegruppe
- `.amorph-groupedbar-bar` - Einzelner Balken
- `.amorph-groupedbar-value` - Wertbeschriftung
- `.amorph-groupedbar-label` - Kategoriebeschriftung

## Farbschema (Universe)
```javascript
GROUPEDBAR_COLORS = [
  '#ff6b6b',  // Koralle
  '#4ecdc4',  // Türkis
  '#ffe66d',  // Gelb
  '#95e1d3',  // Mint
  '#dfe6e9',  // Hellgrau
  '#fd79a8'   // Pink
]
```

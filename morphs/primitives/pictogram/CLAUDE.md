# 👥 PICTOGRAM - Icon Repeat Chart

## Zweck
Wiederholt Icons/Symbole zur intuitiven Mengendarstellung. Isotype-inspiriert.

## Erkennungsregeln

### ✅ PICTOGRAM verwenden wenn:
```javascript
// Regel 1: Zählbare Mengen mit Icon-Kontext
{
  kategorie: "Menschen mit Bart",
  anzahl: 42,
  icon: "👤"  // Optional
}

// Regel 2: Kategorien die als Einheiten vorstellbar sind
[
  { label: "Männer", wert: 120 },
  { label: "Frauen", wert: 85 }
]

// Regel 3: Kleine ganzzahlige Mengen
{
  pilze: 5,
  pflanzen: 3,
  tiere: 2
}
```

### ❌ NICHT PICTOGRAM verwenden wenn:
- **Sehr große Zahlen ohne Skalierung** → `bar`, `stats`
- **Dezimalwerte wichtig** → `gauge`, `progress`
- **Verhältnisse/Prozente** → `pie`, `stackedbar`
- **Zeitlicher Verlauf** → `sparkline`
- **Viele Kategorien (>5)** → `bar`

## Datenformat

### Minimal
```javascript
{
  wert: [
    { label: "A", wert: 10 },
    { label: "B", wert: 15 }
  ]
}
```

### Mit Konfiguration
```javascript
{
  titel: "Beard Survey Results",
  icon: "👤",           // Global oder per Item
  einheitWert: 10,      // 1 Icon = 10 Einheiten
  maxIcons: 30,         // Max Icons pro Reihe
  layout: "vergleich",  // 'grid', 'zeile', 'vergleich'
  showLegend: true,
  showWerte: true,
  wert: [
    { label: "Clean Shaven", wert: 42 },
    { label: "Beard", wert: 28, icon: "🧔" }
  ]
}
```

## Features
- **Auto-Skalierung**: Bei großen Zahlen automatisch Icons gruppieren
- **Standard-Icons**: Automatische Icon-Auswahl basierend auf Label
- **Partielle Icons**: Opacity für Reste (z.B. 0.5 = halbtransparent)
- **Animation**: Icons erscheinen nacheinander

## Standard-Icons
```javascript
STANDARD_ICONS = {
  person/menschen/people: '👤',
  männer: '👨',
  frauen: '👩',
  pilze: '🍄',
  pflanzen: '🌱',
  tiere: '🐾',
  geld/euro: '💰',
  default: '■'
}
```

## Erkennung vs. andere Morphs

| Situation | Morph |
|-----------|-------|
| Zählbare Mengen, intuitiv darstellbar | **pictogram** |
| Präzise Zahlen wichtiger als Intuition | bar |
| Anteil am Ganzen | pie |
| Viele Kategorien | bar, dotplot |
| Kontinuierliche Werte | gauge |

## Typische Anwendungsfälle
- **Umfragen**: Personen mit bestimmten Eigenschaften
- **Statistiken**: Anzahl pro Kategorie (Menschen, Tiere, Objekte)
- **Populationen**: Vergleich von Gruppen
- **Einfache Mengen**: Inventar, Zählungen

## CSS Klassen
- `.amorph-pictogram` - Container
- `.amorph-pictogram-item` - Kategorie-Reihe
- `.amorph-pictogram-icons` - Icon-Container
- `.amorph-pictogram-icon` - Einzelnes Icon
- `.amorph-pictogram-legende` - Skalierungs-Legende
- `.layout-vergleich/grid/zeile` - Layout-Modifier

## Layout-Modi
- **vergleich**: Label links, Icons mitte, Wert rechts (Default)
- **grid**: Icons in Grid-Anordnung
- **zeile**: Eine Zeile pro Kategorie, scrollbar

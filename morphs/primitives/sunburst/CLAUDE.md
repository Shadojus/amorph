# Sunburst Morph

Radiale Hierarchie als konzentrische Ringe nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Konzentrische Ringe**: Ebenen von innen nach außen
2. **Winkel = Wert**: Segmentgröße proportional
3. **Farbkonsistenz**: Kind-Segmente in Eltern-Farbtönen
4. **Center Focus**: Wurzel prominent in der Mitte
5. **Drill-Down**: Hover zeigt Details

## Datenstruktur

```typescript
// Hierarchisches Format
type SunburstInput = {
  name: string;
  children?: SunburstInput[];
  value?: number;
};

// Flaches Array mit Levels
type SunburstInput = Array<{
  level1: string;
  level2?: string;
  level3?: string;
  value: number;
}>;

// Beispiele (Beer Brands)
{
  name: "SAB InBev",
  children: [
    {
      name: "Anheuser-Busch",
      children: [
        {name: "Budweiser", value: 100},
        {name: "Bud Light", value: 80}
      ]
    },
    {
      name: "InBev",
      children: [
        {name: "Stella Artois", value: 60},
        {name: "Beck's", value: 40}
      ]
    }
  ]
}

// Flaches Array
[
  {level1: "Oil", level2: "ExxonMobil", value: 15},
  {level1: "Oil", level2: "Shell", value: 12},
  {level1: "Coal", level2: "China Coal", value: 8}
]
```

## Erkennungsregeln

- **Typ:** `object` mit `children` oder `array` mit Levels
- **Required:** Hierarchische Struktur
- **Optional:** `value` an Blättern
- **Hint:** `sunburst`, `radial`, `hierarchy`
- **Priorität:** Nach hierarchy (sunburst für tiefe Hierarchien)

## Wann SUNBURST verwenden (Kirk)

✅ **Geeignet für:**
- **Tiefe Hierarchien** (3+ Ebenen)
- Organisationsstrukturen
- Marken-Portfolios
- Taxonomien
- Teil-Ganzes mit Verschachtelung

❌ **Nicht verwenden für:**
- Flache Daten → `pie` oder `bar`
- Zeitverläufe → `sparkline`
- <3 Ebenen → `treemap`
- Exakte Vergleiche → `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `size` | number | 300 | SVG-Größe in Pixeln |
| `innerRadius` | number | 30 | Radius des Centers |
| `centerLabel` | string | "Total" | Label in der Mitte |
| `showLegend` | boolean | true | Legende für Level 1 |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Ring Layers** | Ebenen als konzentrische Ringe |
| **Color Inheritance** | Kinder erben Eltern-Farbfamilie |
| **Hover Highlight** | Segment mit Glow hervorheben |
| **Center Circle** | Wurzel-Label in der Mitte |
| **Auto-Labels** | Labels für große Segmente |
| **Tooltips** | Name + Wert + Prozent |

## Signatur

```javascript
sunburst(wert: SunburstInput, config?: SunburstConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.28, 6.29)

> **Sunburst - Radiale Hierarchie:**
> - Zeigt Teil-Ganzes über mehrere Ebenen
> - Innere Ringe = höhere Hierarchie-Ebenen
> - Winkel zeigt relative Größe
> - Ideal für Organisationen, Taxonomien
> - "200+ Beer Brands of SAB InBev"

# Treemap Morph

Flächenproportionale Rechtecke für hierarchische Daten nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Fläche = Wert**: Rechteckgröße proportional
2. **Farbkodierung**: Change (grün/rot) oder Kategorien
3. **Labels direkt**: Beschriftung in den Tiles
4. **Nested Layout**: Gruppen zusammen
5. **Stock-Style**: Positive/negative Änderungen farblich

## Datenstruktur

```typescript
// Array mit Gruppen
type TreemapInput = Array<{
  label: string;
  value: number;
  group?: string;    // Kategorie/Sektor
  change?: number;   // Prozentuale Änderung
}>;

// Hierarchisches Objekt
type TreemapInput = {
  [group: string]: {
    [label: string]: number | { value: number; change?: number }
  }
};

// Beispiele (FinViz S&P 500)
[
  {label: "AAPL", value: 2800, change: -2.77, group: "Technology"},
  {label: "MSFT", value: 2500, change: 3.54, group: "Technology"},
  {label: "GOOGL", value: 1800, change: -3.60, group: "Technology"},
  {label: "JPM", value: 500, change: 1.11, group: "Finance"}
]

// Hierarchisch
{
  Technology: {AAPL: 2800, MSFT: 2500, GOOGL: 1800},
  Finance: {JPM: 500, BAC: 300}
}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array Keys:** `label` + `value` + optional `group`
- **Object:** Hierarchisch mit Gruppen
- **Hint:** `treemap`, `tiles`, `heatmap`
- **Priorität:** Nach bubble (treemap für hierarchische Daten)

## Wann TREEMAP verwenden (Kirk)

✅ **Geeignet für:**
- **Teil-Ganzes mit vielen Items**
- Marktkapitalisierung (S&P 500)
- Speicherplatz-Verteilung
- Budgets nach Kategorien
- Hierarchische Proportionen

❌ **Nicht verwenden für:**
- <10 Items → `pie` oder `bar`
- Keine Hierarchie → `bubble`
- Zeitverläufe → `sparkline`
- Exakte Vergleiche → `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `width` | number | 400 | Container-Breite |
| `height` | number | 300 | Container-Höhe |
| `showLegend` | boolean | true | Gruppen-Legende |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Squarified Layout** | Optimierte Rechteck-Proportionen |
| **Change Colors** | Grün=positiv, Rot=negativ |
| **Group Colors** | Automatische Kategorie-Farben |
| **Size Labels** | Label + Change im Tile |
| **Hover Effect** | Hervorhebung mit Glow |

## Signatur

```javascript
treemap(wert: TreemapInput, config?: TreemapConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.26)

> **Treemap - Teil-Ganzes für viele Items:**
> - Fläche zeigt relative Größe
> - Farbe zeigt Änderung oder Kategorie
> - Nested für Hierarchien
> - Ideal für Finanzdaten (FinViz)
> - Bis zu 500+ Items darstellbar

# Bubble Morph

Proportionale Kreise für Mengenvergleiche nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Fläche = Wert**: Kreisgröße proportional zur Menge
2. **Packed Layout**: Optimale Platznutzung
3. **Labels direkt**: Beschriftung im Kreis
4. **Hierarchie**: Größte Bubbles prominent
5. **Legende**: Kleine Bubbles separat erklärt

## Datenstruktur

```typescript
// Array von Objekten
type BubbleInput = Array<{
  label: string;
  value: number;
}>;

// Objekt mit Label-Value Paaren
type BubbleInput = Record<string, number>;

// Beispiele
[
  {label: "7.1 Medical services", value: 128900000000},
  {label: "10.2 Old age", value: 118200000000},
  {label: "3.1 Public order", value: 31000000000}
]

{
  "Pharma/Research": 1500000000,
  "Producer": 645000000,
  "Consumer": 300000000
}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array Keys:** `label` + `value` (oder `name` + `size/count`)
- **Object:** Numerische Werte
- **Hint:** `bubble`, `packed`, `circles`
- **Priorität:** Nach pie (bubble für >6 Items oder große Wertunterschiede)

## Wann BUBBLE verwenden (Kirk)

✅ **Geeignet für:**
- **Größenvergleiche** mit vielen Kategorien
- Marktkapitalisierung
- Budgetverteilungen
- Populations-/Mengenvergleiche

❌ **Nicht verwenden für:**
- Exakte Prozent-Anteile → `pie`
- Zeitverläufe → `sparkline`
- Rankings → `bar`
- <5 Kategorien → `pie` oder `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `size` | number | 300 | SVG-Größe in Pixeln |
| `unit` | string | - | Prefix für Werte (z.B. "£", "$") |
| `totalLabel` | string | "Total" | Label für Summe |
| `farben` | object | - | Farben pro Label |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Circle Packing** | Spiral-Algorithmus für optimale Platzierung |
| **Proportional Area** | √(value) für korrekte Flächenproportionen |
| **Glow Effect** | Äußerer Schein pro Bubble |
| **Auto-Legend** | Kleine Bubbles in Legende |
| **Value Formatting** | K/M/B für große Zahlen |

## Signatur

```javascript
bubble(wert: BubbleInput, config?: BubbleConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.13, 6.14)

> **Bubble Chart - Proportionale Kreise:**
> - Fläche (nicht Radius!) proportional zum Wert
> - Größte Bubbles dominant in der Mitte
> - Labels direkt im Kreis wenn möglich
> - Ideal für viele Kategorien mit großen Wertunterschieden

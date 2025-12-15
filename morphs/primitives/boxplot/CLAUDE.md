# Boxplot Morph

Box-and-Whisker Diagramm für statistische Verteilungen nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **5-Number Summary**: Min, Q1, Median, Q3, Max
2. **IQR-Box**: Interquartil-Bereich (25%-75%)
3. **Median prominent**: Grüne Linie in der Mitte
4. **Whiskers**: Linien zu Min/Max
5. **Vergleichbar**: Gemeinsame Skala für mehrere Boxplots

## Datenstruktur

```typescript
// Einzelner Boxplot
type BoxplotInput = {
  min: number;
  q1: number;      // 25. Perzentil
  median: number;  // 50. Perzentil
  q3: number;      // 75. Perzentil
  max: number;
  mean?: number;   // Optional: Mittelwert
};

// Array für Vergleiche
type BoxplotInput = Array<{
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}>;

// Beispiele (Ranking the Ivies)
[
  {label: "Harvard", min: 40, q1: 55, median: 70, q3: 85, max: 95},
  {label: "Yale", min: 35, q1: 50, median: 65, q3: 80, max: 90},
  {label: "Princeton", min: 30, q1: 45, median: 60, q3: 75, max: 88}
]
```

## Erkennungsregeln

- **Typ:** `object` oder `array`
- **Required:** `min` + `max`, oder `q1` + `q3` + `median`
- **Optional:** `mean`, `label`
- **Hint:** `boxplot`, `distribution`, `quartiles`
- **Priorität:** Nach stats (boxplot für komplexere Verteilungen)

## Wann BOXPLOT verwenden (Kirk)

✅ **Geeignet für:**
- **Verteilungsvergleiche** zwischen Kategorien
- Streuung und Ausreißer zeigen
- Quartil-Analyse
- Ranking-Vergleiche (Ivy League)

❌ **Nicht verwenden für:**
- Nur Min/Max → `range`
- Nur Durchschnitt → `number`
- Zeitverläufe → `sparkline`
- Einzelne Statistik → `stats`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `showScale` | boolean | true | Skala-Header anzeigen |
| `showValues` | boolean | true | Median-Werte anzeigen |
| `unit` | string | "Value" | Einheits-Label |
| `format` | string | - | "percent" oder "currency" |
| `decimals` | number | 0 | Dezimalstellen |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **IQR-Box** | Cyan-Gradient für Interquartil |
| **Median-Line** | Grün mit Glow |
| **Whiskers** | Dünne Linien zu Extremen |
| **Endpoints** | Rot=Min, Grün=Max |
| **Mean-Dot** | Gelber Punkt (optional) |
| **Scale Legend** | "How to read" Header |

## Signatur

```javascript
boxplot(wert: BoxplotInput, config?: BoxplotConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.17, 6.18)

> **Box Plot - Die 5-Zahlen-Zusammenfassung:**
> - Zeigt Verteilung, nicht nur Durchschnitt
> - IQR = Interquartil-Bereich (mittlere 50%)
> - Whiskers zeigen Streuung
> - Ideal für Vergleiche mehrerer Kategorien
> - "Ranking the Ivies" - perfektes Beispiel

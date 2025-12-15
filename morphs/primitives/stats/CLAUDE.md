# Stats Morph

Statistische Zusammenfassung mit Min/Max/Durchschnitt.

## Datenstruktur

```typescript
type StatsInput = {
  min: number;
  max: number;
  avg: number;
  count?: number;
  median?: number;
  sum?: number;
  mean?: number;
  total?: number;
};

// Beispiele
{ min: 10, max: 90, avg: 45 }
{ min: 0, max: 100, avg: 67, count: 150, median: 65 }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `min`, `max`, `avg`
- **Optional:** `count`, `total`, `sum`, `median`, `mean`
- **Priorität:** Nach range (range hat nur min/max)

## Wann STATS verwenden

✅ **Geeignet für:**
- Statistische Übersichten
- Box-Plot-Daten (Kirk)
- Zusammenfassungen von Messreihen
- Aggregierte Daten

❌ **Nicht verwenden für:**
- Nur Min/Max → `range`
- Einzelwerte → `number`
- Zeitreihen → `sparkline`
- Verteilungen → `bar` oder `pie`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showChart` | boolean | true | Mini-Visualisierung |
| `decimals` | number | 2 | Dezimalstellen |

## Signatur

```javascript
stats(wert: StatsObject, config?: StatsConfig) → HTMLElement
```

## Kirk-Prinzip (Box Plot)

> **Verteilungs-Zusammenfassung:** Min, Max und Durchschnitt zeigen die Streuung der Daten. Die Visualisierung entspricht dem Box-Plot-Konzept aus Kirks Buch - eine kompakte Darstellung statistischer Kennzahlen.

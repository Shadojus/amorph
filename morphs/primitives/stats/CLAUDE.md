# Stats Morph

Hierarchische statistische Zusammenfassung nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Hierarchie**: Primäre Stats (total, count) groß oben, sekundäre unten
2. **Sentiment-Farben**: Grün=positiv, Rot=negativ
3. **Typ-Kategorisierung**: Visuelle Unterscheidung nach Statistik-Typ
4. **Mini-Visualisierung**: Bar für Range-Daten
5. **Sortierung nach Priorität**: Wichtigste Stats zuerst

## Datenstruktur

```typescript
type StatsInput = {
  // Primär (priority 1)
  total?: number;
  count?: number;
  
  // Sekundär (priority 2)
  min: number;
  max: number;
  avg: number;
  
  // Range (priority 3)
  range?: number;
  spread?: number;
  
  // Trend (priority 4)
  median?: number;
  mean?: number;
  mode?: number;
  
  // Variance (priority 5)
  sum?: number;
  variance?: number;
  std?: number;
};

// Beispiele
{ total: 1500, count: 150, min: 10, max: 90, avg: 45 }
{ min: 0, max: 100, avg: 67, count: 150, median: 65 }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `min`, `max`, `avg`
- **Optional:** `count`, `total`, `sum`, `median`, `mean`, `range`, `variance`
- **Priorität:** Nach range (range hat nur min/max)

## Wann STATS verwenden

✅ **Geeignet für:**
- Statistische Übersichten mit mehreren Kennzahlen
- Box-Plot-Daten (Kirk)
- Aggregierte Messreihen
- Wissenschaftliche Zusammenfassungen

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
| `showHierarchy` | boolean | true | Primär/Sekundär Trennung |

### Stat-Typen und Sentiment

| Stat | Typ | Sentiment |
|------|-----|-----------|
| `total`, `count`, `sum` | primary | positiv |
| `min`, `max`, `avg` | secondary | neutral |
| `range`, `spread` | range | positiv (hoch) |
| `median`, `mean`, `mode` | trend | neutral |
| `variance`, `std` | variance | negativ (hoch) |

## Signatur

```javascript
stats(wert: StatsObject, config?: StatsConfig) → HTMLElement
```

## Kirk-Prinzip (Box Plot)

> **Verteilungs-Zusammenfassung:** Min, Max und Durchschnitt zeigen die Streuung der Daten. Die hierarchische Darstellung priorisiert die wichtigsten Kennzahlen (Total, Count) während sekundäre Statistiken unterstützend wirken.

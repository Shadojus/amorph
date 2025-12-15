# Dotplot Morph

Streudiagramm für kategorisierte Werte nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Jitter**: Überlappende Punkte leicht versetzt
2. **Gemeinsame Skala**: X-Achse für alle Kategorien
3. **Median-Linie**: Zentrale Tendenz sichtbar
4. **Grid-Lines**: Leichtere Wertablesung
5. **Count**: Anzahl der Punkte pro Kategorie

## Datenstruktur

```typescript
// Array Format
type DotplotInput = Array<{
  category: string;
  values: number[];
}>;

// Object Format
type DotplotInput = {
  [category: string]: number[];
};

// Beispiele (Movie Franchise Scores)
[
  {category: "Marvel", values: [85, 78, 92, 65, 88, 72, 95]},
  {category: "DC", values: [65, 70, 55, 78, 60, 45]},
  {category: "Star Wars", values: [94, 80, 65, 93, 75, 50]}
]

// Object Format
{
  "Pixar": [95, 98, 88, 92, 85],
  "Harry Potter": [80, 85, 78, 82, 75, 88, 72, 90],
  "Bond": [65, 70, 85, 60, 75, 80]
}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array:** Objekte mit `values` Array
- **Object:** Category → number[] Mapping
- **Hint:** `dotplot`, `scatter`, `distribution`
- **Priorität:** Nach boxplot (dotplot für Rohdaten)

## Wann DOTPLOT verwenden (Kirk)

✅ **Geeignet für:**
- **Verteilungen vergleichen**
- Kritiker-Bewertungen
- Test-Scores
- Messwiederholungen
- Rohdaten-Visualisierung

❌ **Nicht verwenden für:**
- Aggregierte Stats → `boxplot`
- Zeitverläufe → `sparkline`
- Proportionen → `pie`
- Wenige Datenpunkte → `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `min` | number | auto | X-Achsen Minimum |
| `max` | number | auto | X-Achsen Maximum |
| `showMedian` | boolean | true | Median-Linie zeigen |
| `showStats` | boolean | false | Stats-Summary |
| `colorByValue` | boolean | false | Farbgradient nach Wert |
| `format` | string | - | "percent" für % |
| `decimals` | number | 0 | Dezimalstellen |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Jitter** | Zufällige Y-Verschiebung für Überlappung |
| **Median Line** | Gelbe Linie für Median |
| **Grid Lines** | Vertikale Rasterlinien |
| **Point Count** | n=X pro Kategorie |
| **Hover Zoom** | Punkt vergrößert sich |
| **X-Axis Ticks** | Gleichmäßige Skalierung |

## Signatur

```javascript
dotplot(wert: DotplotInput, config?: DotplotConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.19)

> **Dot Plot - Jeder Punkt zählt:**
> - Zeigt individuelle Datenpunkte, nicht Aggregate
> - Jitter verhindert Überlappung
> - Ideal für Verteilungsvergleiche
> - "Movie Franchise Scores" - perfektes Beispiel
> - Zeigt Streuung und Ausreißer

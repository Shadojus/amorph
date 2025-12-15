# Rating Morph

Sternebewertung für Ratings und Scores.

## Datenstruktur

```typescript
// Zahl 0-10 (Ganzzahlen UND Dezimalen)
type RatingInput = number;

// Objekt
type RatingInput = {
  rating: number;
  max?: number;
};

// Beispiele
4.5
8
{ rating: 8.5, max: 10 }
{ score: 4 }
```

## Erkennungsregeln (Kirk)

- **Typ:** `number` (0-10) oder `object`
- **Zahlen:** Min 0, Max 10 (Ganzzahlen UND Dezimalen)
- **Object Keys:** `rating`, `score`, `stars`, `bewertung`
- **Priorität:** Vor progress (Rating 0-10, Progress 11-100)

```javascript
// Automatische Erkennung
8      // → rating (0-10)
8.5    // → rating (0-10)
75     // → progress (11-100)
```

## Wann RATING verwenden

✅ **Geeignet für:**
- Produktbewertungen
- Nutzerbewertungen
- Qualitätsscores
- Ranglisten-Punkte

❌ **Nicht verwenden für:**
- Ganzzahlige Prozente → `progress`
- Bereiche → `range`
- Schweregrade → `severity`
- Mehrdimensionale Profile → `radar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `maxStars` | number | 5 | Maximale Sternanzahl |
| `showValue` | boolean | true | Numerischen Wert anzeigen |
| `halfStars` | boolean | true | Halbe Sterne erlauben |

## Signatur

```javascript
rating(wert: number | RatingObject, config?: RatingConfig) → HTMLElement
```

## Kirk-Prinzip

> **Vertraute Metapher:** Sterne sind universell verständlich. 5 Sterne = Exzellent. Die visuelle Darstellung ist sofort intuitiv erfassbar.

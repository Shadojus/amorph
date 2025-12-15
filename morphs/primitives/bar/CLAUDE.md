# Bar Morph

Horizontales Balkendiagramm für Kategorienvergleiche.

## Datenstruktur

```typescript
// Array von Objekten
type BarInput = Array<{
  label: string;
  value: number;
  unit?: string;
}>;

// Array von Zahlen (mit config.labels)
type BarInput = number[];

// Objekt mit Label-Value Paaren
type BarInput = Record<string, number>;

// Beispiele
[{label: "A", value: 12}, {label: "B", value: 45}, {label: "C", value: 23}]
[12, 45, 23, 67]
{Protein: 15, Fett: 8, Kohlenhydrate: 22}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array Keys:** `label` + `value` (oder `name` + `amount/score`)
- **Object:** Numerische Werte
- **Priorität:** Nach pie (bar für >6 Items, pie für ≤6)

## Wann BAR verwenden (Kirk)

✅ **Geeignet für:**
- **Kategorienvergleiche** (>6 Kategorien)
- Rankings
- Mengenvergleiche
- Horizontale Darstellung (Labels links)

❌ **Nicht verwenden für:**
- Proportionen/Anteile → `pie` (≤6 Items)
- Zeitreihen mit vielen Punkten → `sparkline`
- Mehrdimensionale Profile → `radar`
- Vorher-Nachher → `slopegraph`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `orientation` | string | "horizontal" | horizontal / vertical |
| `showValues` | boolean | true | Werte anzeigen |
| `animated` | boolean | true | Animation |
| `maxBars` | number | 10 | Max. Balken |
| `showScale` | boolean | true | Skala anzeigen |

## Signatur

```javascript
bar(wert: BarInput, config?: BarConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 20, 24-27)

> **Balkendiagramm für Kategorienvergleiche:**
> - Y-Achse: Kategorien (Labels)
> - X-Achse: Quantitative Werte
> - **WICHTIG:** Balken beginnen IMMER bei 0!
> - Kategorien logisch sortieren (nach Größe oder Relevanz)
> - Labels direkt am Balken für schnelle Lesbarkeit

### Messi-Beispiel (Seite 24-27)

Kirk zeigt gruppierte Balken für Games/Goals pro Saison:
- Horizontale Balken für einfachen Kategorie-Vergleich
- Zwei Farben pro Gruppe (blau/lila)
- Konsistente Skala 0-80

### Bar vs Pie Regel

| Kriterium | Bar | Pie |
|-----------|-----|-----|
| **Items** | >6 | ≤6 |
| **Vergleich** | Absolut | Proportional |
| **Präzision** | Hoch | Niedrig |
| **Ranking** | Ideal | Ungeeignet |

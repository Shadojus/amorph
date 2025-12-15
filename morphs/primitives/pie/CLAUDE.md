# Pie Morph

Kreisdiagramm (Donut) für Proportionen und Anteile.

## Datenstruktur

```typescript
// Array von Objekten
type PieInput = Array<{
  label: string;
  value: number;
}>;

// Objekt mit Label-Value Paaren
type PieInput = Record<string, number>;

// Beispiele
[{label: "A", value: 10}, {label: "B", value: 20}, {label: "C", value: 30}]
{Pilze: 45, Pflanzen: 30, Tiere: 25}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array Keys:** `label` + `value` (oder `name` + `count/amount`)
- **Object:** Numerische Werte, 2-8 Keys
- **Priorität:** Vor bar (pie für ≤6 Items)

## Wann PIE verwenden (Kirk)

✅ **Geeignet für:**
- **Proportionen** (Teil-Ganzes-Beziehung)
- Anteile (Prozente)
- Verteilungen mit **max. 6 Segmenten**

❌ **Nicht verwenden für:**
- **>6 Kategorien** → `bar`
- Exakte Wertevergleiche → `bar`
- Rankings → `bar`
- Zeitverläufe → `sparkline`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `donut` | boolean | false | Donut-Style mit Loch |
| `showLabels` | boolean | true | Labels anzeigen |
| `showPercentage` | boolean | true | Prozente anzeigen |
| `animated` | boolean | true | Animation |
| `totalLabel` | string | "Total" | Label in der Mitte |

## Signatur

```javascript
pie(wert: PieInput, config?: PieConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 89)

> **Kreisdiagramm nur für Proportionen:**
> - **MAX. 6 SEGMENTE!** (Mehr ist unlesbar)
> - Größtes Segment beginnt bei 12 Uhr
> - Im Uhrzeigersinn absteigend sortieren
> - Legende für kleine Segmente
> - Donut-Variante für modernen Look

### Die 6-Segment-Regel

| Segmente | Empfehlung |
|----------|------------|
| 2-4 | ✅ Ideal für Pie |
| 5-6 | ⚠️ Noch akzeptabel |
| >6 | ❌ Bar-Chart verwenden! |

### Warum Donut?

Kirk bevorzugt Donut-Charts:
- Weniger "Chart Junk"
- Platz für Total/Label in der Mitte
- Modernere Ästhetik
- Bessere Vergleichbarkeit der Segmente

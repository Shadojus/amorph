# Pie Morph

Donut-Chart für Proportionen und Anteile nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Max 6 Segmente**: Mehr ist unlesbar
2. **Donut-Style**: Total in der Mitte, weniger Chart-Junk
3. **Prozent-Anzeige**: Werte direkt an Segmenten
4. **Legende**: Klar zugeordnete Farben
5. **Conic Gradient**: Saubere CSS-basierte Darstellung

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
| `titel` | string | - | Titel über Chart |
| `totalLabel` | string | "Total" | Label in der Mitte |
| `farben` | object | - | Farben pro Label |

### Implementierte Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Donut-Center** | Total-Wert prominent in der Mitte |
| **Prozent-Labels** | Automatische % Berechnung |
| **Neon-Farben** | Pilz-Theme mit 24% Transparenz |
| **Legende** | Farbpunkte + Label + Prozent |
| **Conic Gradient** | CSS-native Darstellung |

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

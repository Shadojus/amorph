# Sparkline Morph

Kompakte Inline-Trendlinie für Zeitreihen nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Kompaktheit**: Wortgröße (32px hoch), inline verwendbar
2. **Min/Max-Markierung**: Extremwerte hervorgehoben (Punkte)
3. **Trend-Indikator**: Änderung mit ↑↓→ und Prozent
4. **Aktueller Wert**: Letzter Datenpunkt prominent
5. **Flächen-Visualisierung**: Area under curve für Volumen-Gefühl

## Datenstruktur

```typescript
// Array von Zahlen
type SparklineInput = number[];

// Array von Objekten
type SparklineInput = Array<{
  date?: string;
  value: number;
}>;

// Objekt mit trend-Array
type SparklineInput = {
  trend: number[];
  label?: string;
};

// Beispiele (min. 2 Werte)
[12, 45, 23, 67, 89, 45, 32]
[{date: "2023-01", value: 12}, {date: "2023-02", value: 45}]
{trend: [1.2, 1.5, 1.3, 1.8], label: "Wachstum"}
```

## Erkennungsregeln

- **Typ:** `array`
- **Min. Länge:** 2 Werte
- **Nur Zahlen:** Array muss rein numerisch sein
- **Hint:** `series` (für explizite Zeitreihen)
- **Priorität:** Vor bar/pie (rein numerische Arrays)

## Wann SPARKLINE verwenden (Kirk)

✅ **Geeignet für:**
- **Inline-Trends** (kompakte Darstellung)
- Zeitreihen im Fließtext
- Schnelle Trendübersicht
- Viele kleine Charts nebeneinander

❌ **Nicht verwenden für:**
- Kategorien mit Labels → `bar`
- Einzelwerte → `number`
- Proportionen → `pie`
- Detaillierte Zeitreihen → vollständiges Liniendiagramm

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `width` | number | 120 | Breite in Pixeln |
| `height` | number | 32 | Höhe in Pixeln |
| `label` | string | - | Label für Sparkline |

### Implementierte Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Min-Punkt** | Roter Punkt am Minimum |
| **Max-Punkt** | Grüner Punkt am Maximum |
| **Aktuell-Punkt** | Größerer Punkt am Ende |
| **Trend-Badge** | ↑↓→ mit Prozentänderung |
| **Fläche** | Transparente Area unter Linie |
| **Tooltip** | Min/Max/Avg im Mouseover |

## Signatur

```javascript
sparkline(wert: number[], config?: SparklineConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 20, 54)

> **Sparklines - Kleine aber mächtige Trends:**
> - Erfunden von Edward Tufte
> - "Data-intense, design-simple, word-sized graphics"
> - Zeigen Trend, nicht exakte Werte
> - Perfekt für Dashboards und Tabellen

### Wann Sparkline vs Liniendiagramm

| Kriterium | Sparkline | Liniendiagramm |
|-----------|-----------|----------------|
| **Platz** | Minimal | Vollständig |
| **Details** | Nur Trend | Exakte Werte |
| **Achsen** | Keine | Ja |
| **Interaktion** | Keine | Hover/Zoom |

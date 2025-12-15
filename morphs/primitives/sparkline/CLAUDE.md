# Sparkline Morph

Kompakte Inline-Trendlinie für Zeitreihen.

## Datenstruktur

```typescript
// Array von Zahlen
type SparklineInput = number[];

// Beispiele (min. 3 Werte)
[12, 45, 23, 67, 89, 45, 32]
[1.2, 1.5, 1.3, 1.8, 2.1]
```

## Erkennungsregeln

- **Typ:** `array`
- **Min. Länge:** 3 Werte
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
| `height` | number | 20 | Höhe in Pixeln |
| `showEndpoint` | boolean | true | Endpunkt markieren |
| `showMinMax` | boolean | false | Min/Max markieren |
| `strokeWidth` | number | 1.5 | Linienstärke |
| `animated` | boolean | true | Animation |

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

### Sparkline-Eigenschaften

| Aspekt | Wert |
|--------|------|
| **Größe** | Wortgröße (20-30px hoch) |
| **Fokus** | Trend, nicht Präzision |
| **Kontext** | Inline, neben Text/Zahlen |
| **Details** | Keine Achsen, keine Labels |

### Wann Sparkline vs Liniendiagramm

| Kriterium | Sparkline | Liniendiagramm |
|-----------|-----------|----------------|
| **Platz** | Minimal | Vollständig |
| **Details** | Nur Trend | Exakte Werte |
| **Achsen** | Keine | Ja |
| **Interaktion** | Keine | Hover/Zoom |

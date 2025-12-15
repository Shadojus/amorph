# Comparison Morph

Vorher-Nachher-Vergleich mit Trend-Indikator.

## Datenstruktur

```typescript
type ComparisonInput = {
  before: number;
  after: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
};

// Alternative Keys
type ComparisonInput = {
  old: number;
  new: number;
};

// Beispiele
{ before: 100, after: 150 }
{ before: 50, after: 35, unit: "€" }
{ old: 3.5, new: 4.2, trend: "up" }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `before` + `after` (oder `old` + `new`)
- **Optional:** `trend`, `unit`
- **Priorität:** Nach slopegraph (comparison ist kompakter)

## Wann COMPARISON verwenden

✅ **Geeignet für:**
- **Numerische Vorher-Nachher** (kompakt)
- Änderungsraten
- Preisvergleiche
- Performance-Änderungen

❌ **Nicht verwenden für:**
- Visuelle Steigungsdarstellung → `slopegraph`
- Mehrere Vergleiche parallel → `slopegraph`
- Prozentuale Fortschritte → `progress`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showTrend` | boolean | true | Trend-Icon |
| `showPercentage` | boolean | true | Prozentuale Änderung |
| `trendColors` | object | {...} | Farben für Trends |
| `trendIcons` | object | {...} | Icons für Trends |

### Trend-Darstellung

| Trend | Icon | Farbe |
|-------|------|-------|
| `up` | ▲ | Grün |
| `down` | ▼ | Rot |
| `neutral` | ● | Grau |

## Signatur

```javascript
comparison(wert: ComparisonObject, config?: ComparisonConfig) → HTMLElement
```

## Kirk-Prinzip

> **Veränderung quantifizieren:**
> - Absolute Differenz zeigen
> - Prozentuale Änderung berechnen
> - Trend-Richtung visuell klar
> - Kompakte Darstellung

### Comparison vs Slopegraph

| Aspekt | Comparison | Slopegraph |
|--------|------------|------------|
| **Darstellung** | Zahlen + Icon | Linie mit Steigung |
| **Platz** | Kompakt (inline) | Mehr Höhe |
| **Fokus** | Numerische Differenz | Visuelle Änderung |
| **Mehrere** | Einzeln | Parallel vergleichbar |

### Ausgabe-Format

```
100 → 150  ▲ +50%
 50 →  35  ▼ -30%
 75 →  75  ● ±0%
```

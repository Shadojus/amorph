# Heatmap Morph

2D-Matrix mit Farbintensitäts-Visualisierung.

## Datenstruktur

```typescript
// 2D-Array (Matrix)
type HeatmapInput = number[][];

// Beispiele
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]
[[0.1, 0.5], [0.8, 0.3], [0.2, 0.9]]
```

## Erkennungsregeln

- **Typ:** `array`
- **Nested:** True (Array von Arrays)
- **Hint:** `matrix`
- **Priorität:** Vor sparkline (2D vs 1D)

## Wann HEATMAP verwenden (Kirk)

✅ **Geeignet für:**
- **Matrix-Daten** (2D-Tabellen mit Werten)
- Korrelationsmatrizen
- Zeitliche Muster (Stunden × Tage)
- Räumliche Verteilungen

❌ **Nicht verwenden für:**
- 1D-Arrays → `sparkline` oder `bar`
- Kategorien → `bar`
- Geografische Daten → `map`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `colorScheme` | string | "thermal" | thermal / semantic / gradient |
| `showValues` | boolean | true | Werte in Zellen |
| `cellSize` | string | "auto" | Zellengröße |
| `animated` | boolean | true | Animation |

## Signatur

```javascript
heatmap(wert: number[][], config?: HeatmapConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 89)

> **Heatmap - Muster in Matrizen erkennen:**
> - Farbe kodiert Intensität
> - Zeilen/Spalten für 2 Dimensionen
> - Muster springen sofort ins Auge
> - Perfekt für Korrelationen

### Farbschemata

| Schema | Verwendung |
|--------|------------|
| **Thermal** | Niedrig→Hoch (blau→rot) |
| **Semantic** | Gut→Schlecht (grün→rot) |
| **Gradient** | Neutral (hell→dunkel) |

### Matrix-Beispiele

```
Korrelationsmatrix:     Aktivitäts-Heatmap:
     A    B    C        Mo Di Mi Do Fr
A   1.0  0.8  0.2       08: ██ ░░ ██ ░░ ██
B   0.8  1.0  0.5       12: ░░ ██ ░░ ██ ░░
C   0.2  0.5  1.0       18: ██ ██ ██ ██ ░░
```

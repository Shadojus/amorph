# Slopegraph Morph

Vorher-Nachher-Vergleich mit Steigungslinien.

## Datenstruktur

```typescript
// Objekt mit Vorher/Nachher
type SlopegraphInput = {
  before: number;
  after: number;
  label?: string;
  unit?: string;
};

// Alternative Keys
type SlopegraphInput = {
  start: number;
  end: number;
} | {
  from: number;
  to: number;
} | {
  vorher: number;
  nachher: number;
};

// Beispiele
{ before: 100, after: 150 }
{ start: 45, end: 78, label: "Umsatz" }
{ from: 3.5, to: 4.2, unit: "Rating" }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `before`/`after` ODER `start`/`end` ODER `from`/`to` ODER `vorher`/`nachher`
- **Priorität:** Vor comparison (Slopegraph ist visueller)

## Wann SLOPEGRAPH verwenden (Kirk)

✅ **Geeignet für:**
- **Vorher-Nachher-Vergleiche** (2 Zeitpunkte)
- Ranking-Veränderungen
- Performance-Vergleiche
- A/B-Test-Ergebnisse

❌ **Nicht verwenden für:**
- >3 Zeitpunkte → `sparkline` oder Liniendiagramm
- Kategorienvergleiche → `bar`
- Proportionen → `pie`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showValues` | boolean | true | Werte anzeigen |
| `showChange` | boolean | true | Änderung anzeigen |
| `animated` | boolean | true | Animation |
| `height` | number | 60 | Höhe in Pixeln |

## Signatur

```javascript
slopegraph(wert: SlopegraphObject, config?: SlopegraphConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 81)

> **Slopegraph - Die Kraft der Steigung:**
> - Erfunden von Edward Tufte
> - **Genau 2 Zeitpunkte** (links/rechts)
> - Steigung zeigt Richtung UND Magnitude
> - Steile Linie = große Veränderung
> - Crossing Points zeigen Überholungen

### Visuelle Interpretation

| Steigung | Bedeutung |
|----------|-----------|
| ↗ Steil aufwärts | Großer Anstieg |
| → Flach | Wenig Veränderung |
| ↘ Steil abwärts | Großer Rückgang |

### Slopegraph vs Comparison

| Aspekt | Slopegraph | Comparison |
|--------|------------|------------|
| **Fokus** | Visuelle Steigung | Numerische Differenz |
| **Darstellung** | Linie mit Punkten | Zahlen mit Trend-Icon |
| **Platz** | Mehr (höher) | Weniger (kompakt) |
| **Vergleiche** | Mehrere parallel | Einzeln |

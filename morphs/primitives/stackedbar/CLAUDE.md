# Stacked Bar Morph

Gestapelte Balken für Teil-Ganzes-Beziehungen nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **100% Stacking**: Alle Segmente ergeben 100%
2. **Konsistente Farben**: Gleiche Segmente gleiche Farbe
3. **Legende oben**: Farbzuordnung vor Chart
4. **Labels direkt**: Prozente im Segment wenn Platz
5. **Horizontale Bars**: Bessere Label-Lesbarkeit

## Datenstruktur

```typescript
// Array Format
type StackedBarInput = Array<{
  label: string;
  segments: Array<{
    name: string;
    value: number;
  }>;
}>;

// Object Format
type StackedBarInput = {
  [label: string]: {
    [segmentName: string]: number;
  };
};

// Beispiele (Browser Market Share)
[
  {
    label: "March 2003",
    segments: [
      {name: "Internet Explorer", value: 88.9},
      {name: "Other", value: 11.1}
    ]
  },
  {
    label: "September 2008",
    segments: [
      {name: "Internet Explorer", value: 69.9},
      {name: "Chrome", value: 3.3},
      {name: "Other", value: 26.8}
    ]
  }
]

// Object Format
{
  "2020": {"Chrome": 64, "Safari": 18, "Firefox": 4, "Other": 14},
  "2021": {"Chrome": 65, "Safari": 19, "Firefox": 3, "Other": 13}
}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array:** Objekte mit `segments` Array
- **Object:** Label → Segment → Value Hierarchie
- **Hint:** `stacked`, `100%`, `proportional`
- **Priorität:** Nach bar (stacked für mehrere Segmente pro Bar)

## Wann STACKED BAR verwenden (Kirk)

✅ **Geeignet für:**
- **Teil-Ganzes über Kategorien**
- Marktanteile über Zeit
- Umfrage-Ergebnisse
- Bevölkerungsverteilungen
- Literacy Levels by Country

❌ **Nicht verwenden für:**
- Einzelne Proportionen → `pie`
- Absolute Vergleiche → `bar`
- Viele Segmente (>6) pro Bar
- Exakte Werte wichtig → `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |
| `percent` | boolean | true | Prozent-Modus (100%) |
| `showLegend` | boolean | true | Legende anzeigen |
| `showTotal` | boolean | false | Total pro Bar |
| `farben` | object | - | Farben pro Segment |

### Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Auto Legend** | Segment-Namen mit Farben |
| **Percent Labels** | % direkt im Segment |
| **Hover Highlight** | Segment hervorheben |
| **Consistent Colors** | Segment-Farben über alle Bars |
| **Tooltip** | Name + Wert/Prozent |

## Signatur

```javascript
stackedbar(wert: StackedBarInput, config?: StackedBarConfig) → HTMLElement
```

## Kirk-Prinzip (Fig 6.23, 6.24, 6.25)

> **Stacked Bar - Proportionen über Kategorien:**
> - 100% Stacking für Anteile
> - Max 5-6 Segmente pro Bar
> - Konsistente Farben über alle Bars
> - Legende VOR dem Chart
> - Horizontal für bessere Labels

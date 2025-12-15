# Radar Morph

Spider/Radar-Chart für mehrdimensionale Profile.

## Datenstruktur

```typescript
// Array von Achsen
type RadarInput = Array<{
  axis: string;
  value: number;
}>;

// Objekt mit Dimensionen
type RadarInput = Record<string, number>;

// Beispiele (min. 3 Achsen!)
[{axis: "Flavor", value: 80}, {axis: "Potency", value: 60}, {axis: "Aroma", value: 70}]
{Flavor: 80, Potency: 60, Aroma: 70, Texture: 50, Color: 90}
```

## Erkennungsregeln

- **Typ:** `array` oder `object`
- **Array Keys:** `axis` + `value` (oder `dimension` + `score`)
- **Min. Items:** 3 (Mindestens 3 Achsen!)
- **Max. Items:** 12 (Mehr wird unübersichtlich)
- **Priorität:** Nach pie (radar braucht min. 3 Achsen)

## Wann RADAR verwenden (Kirk)

✅ **Geeignet für:**
- **Mehrdimensionale Profile** (3-12 Dimensionen)
- Skill-Profile
- Eigenschaften-Vergleiche
- Stärken/Schwächen-Analysen

❌ **Nicht verwenden für:**
- <3 Dimensionen → `bar` oder `comparison`
- Zeitreihen → `sparkline`
- Kategorien ohne Profil-Charakter → `bar`
- Exakte Wertevergleiche → `bar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showLabels` | boolean | true | Achsen-Labels |
| `showValues` | boolean | true | Werte an Achsen |
| `fillArea` | boolean | true | Fläche füllen |
| `animated` | boolean | true | Animation |

## Signatur

```javascript
radar(wert: RadarInput, config?: RadarConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 89)

> **Radar-Chart für multidimensionale Profile:**
> - **MIN. 3 ACHSEN** (Sonst ist es kein Radar)
> - **MAX. 10-12 ACHSEN** (Mehr wird unleserlich)
> - Alle Achsen gleich skalieren (0-100)
> - Fläche gefüllt für bessere Formwahrnehmung
> - Labels außerhalb für Lesbarkeit

### Wann Radar sinnvoll ist

| Anwendung | Geeignet? |
|-----------|-----------|
| Nährwert-Profile | ✅ Ja |
| Skill-Bewertungen | ✅ Ja |
| Produkteigenschaften | ✅ Ja |
| Rankings | ❌ Nein → bar |
| Zeitverläufe | ❌ Nein → sparkline |

### Skalierung

Alle Werte werden auf 0-100 normalisiert:
- Werte ≤10 werden ×10 skaliert
- Werte >100 werden auf 100 gekappt

# Gauge Morph

Tachometer-artige Score-Anzeige mit Zonen.

## Datenstruktur

```typescript
type GaugeInput = {
  value: number;
  min?: number;   // Default: 0
  max?: number;   // Default: 100
  zones?: Array<{
    start: number;
    end: number;
    color?: string;
  }>;
  label?: string;
};

// Einfach: Nur Wert
75

// Mit min/max
{ value: 7.2, min: 0, max: 14, label: "pH" }

// Mit benutzerdefinierten Zonen
{
  value: 7.2,
  min: 0,
  max: 14,
  zones: [
    { start: 0, end: 6, color: "rgba(240, 80, 80, 0.2)" },
    { start: 6, end: 8, color: "rgba(100, 220, 140, 0.2)" },
    { start: 8, end: 14, color: "rgba(90, 160, 240, 0.2)" }
  ]
}

// Mehrere Gauges (max 4)
{ fuer_menschen: 95, fuer_tiere: 70 }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `value` (oder `wert`, `score`)
- **Optional:** `min`, `max`, `zones`, `zonen`, `bereiche`, `label`
- **Priorität:** Nach stats (gauge hat zones)

```javascript
// Detection Keys
const hasGaugeValue = ('value' in obj || 'wert' in obj || 'score' in obj);
const hasGaugeZones = ('zones' in obj || 'zonen' in obj || 'bereiche' in obj);
const hasGaugeMinMax = ('min' in obj && 'max' in obj);
if (hasGaugeValue && (hasGaugeZones || hasGaugeMinMax)) return 'gauge';
```

## Wann GAUGE verwenden (Kirk)

✅ **Geeignet für:**
- **Scores/Bewertungen** mit Zonen
- Füllstände mit Schwellenwerten
- Tachometer-Darstellungen
- Werte in definierten Bereichen

❌ **Nicht verwenden für:**
- Einfache Prozente → `progress`
- Stern-Ratings → `rating`
- Statistiken → `stats`
- Bereiche ohne Zonen → `range`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showValue` | boolean | true | Wert anzeigen |
| `showLabel` | boolean | true | Label anzeigen |
| `showUnit` | boolean | true | Einheit anzeigen |
| `animated` | boolean | true | Animation |
| `defaultZones` | array | [...] | Standard-Zonen |

### Standard-Zonen

| Zone | Bereich | Farbe |
|------|---------|-------|
| Low | 0-33% | Rot |
| Medium | 33-66% | Gelb |
| High | 66-100% | Grün |

## Signatur

```javascript
gauge(wert: GaugeObject, config?: GaugeConfig) → HTMLElement
```

## Kirk-Prinzip

> **Score-Visualisierung:**
> - Halbkreis-Form (180°)
> - Zeiger zeigt aktuellen Wert
> - Farbzonen für Interpretation
> - Sofort erkennbar: Gut/Mittel/Schlecht

### Gauge vs Progress

| Aspekt | Gauge | Progress |
|--------|-------|----------|
| **Form** | Halbkreis | Balken |
| **Zonen** | Ja (semantisch) | Nein |
| **Fokus** | Position in Skala | Anteil von Ganzem |
| **Komplexität** | Höher | Niedriger |

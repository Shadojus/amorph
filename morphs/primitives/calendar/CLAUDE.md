# Calendar Morph

Jahreskalender mit saisonalen Highlights.

## Datenstruktur

```typescript
// Array von Monats-Aktivitäten
type CalendarInput = Array<{
  month: number;  // 1-12
  active: boolean;
  intensity?: number;  // 0-1
}>;

// Alternative Keys
type CalendarInput = Array<{
  season: string;
  intensity: number;
}>;

// Beispiele
[
  { month: 3, active: true },
  { month: 4, active: true },
  { month: 5, active: true },
  { month: 9, active: true },
  { month: 10, active: true }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Required:** `month` + `active` (oder `season` + `intensity`)
- **Priorität:** Nach timeline (spezifisches Muster)

## Wann CALENDAR verwenden

✅ **Geeignet für:**
- **Saisonale Verfügbarkeit**
- Erntezeiträume
- Aktivitätsmuster
- Jahreszyklen

❌ **Nicht verwenden für:**
- Einzelne Daten/Events → `timeline`
- Lebenszyklen → `lifecycle`
- Tages-/Stundenmuster → `heatmap`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `mode` | string | "wheel" | wheel / grid |
| `showLabels` | boolean | true | Monatsnamen |
| `showMonthNames` | boolean | true | Vollständige Namen |
| `seasonColors` | object | {...} | Farben pro Saison |

### Jahreszeitenfarben

| Saison | Monate | Farbe |
|--------|--------|-------|
| Winter | Dez-Feb | Blau |
| Frühling | Mär-Mai | Grün |
| Sommer | Jun-Aug | Gelb |
| Herbst | Sep-Nov | Orange |

## Signatur

```javascript
calendar(wert: CalendarMonth[], config?: CalendarConfig) → HTMLElement
```

## Kirk-Prinzip

> **Zyklische Zeit-Visualisierung:**
> - Rad-Form zeigt Jahreskreis
> - Aktive Monate hervorgehoben
> - Saisonale Gruppierung durch Farben
> - Intensität durch Opacity

### Darstellungsmodi

| Modus | Beschreibung |
|-------|--------------|
| **Wheel** | Kreisförmig (12 Uhr = Januar) |
| **Grid** | Rasterförmig (3×4 oder 12×1) |

### Calendar vs Heatmap

| Aspekt | Calendar | Heatmap |
|--------|----------|---------|
| **Zeitraum** | Immer 12 Monate | Beliebige Matrix |
| **Struktur** | Fest (Monate) | Flexibel |
| **Fokus** | Aktiv/Inaktiv | Intensitätswerte |

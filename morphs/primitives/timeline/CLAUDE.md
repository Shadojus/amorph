# Timeline Morph

Chronologische Ereignis-Timeline.

## Datenstruktur

```typescript
// Array von Events
type TimelineInput = Array<{
  date: string;
  event: string;
  description?: string;
}>;

// Alternative Keys
type TimelineInput = Array<{
  time: string;
  label: string;
}>;

// Beispiele
[
  { date: "1900", event: "Entdeckung" },
  { date: "1950", event: "Erste Studie" },
  { date: "2020", event: "Genom sequenziert" }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Required:** `date` + `event` (oder `time` + `label`)
- **Priorität:** Nach steps (timeline ist zeitbasiert)

## Wann TIMELINE verwenden (Kirk)

✅ **Geeignet für:**
- **Zeitbasierte Ereignisse**
- Historische Abläufe
- Projekt-Meilensteine
- Lebenszyklen mit Daten

❌ **Nicht verwenden für:**
- Numerische Zeitreihen → `sparkline`
- Prozess-Schritte ohne Datum → `steps`
- Phasen ohne genaue Daten → `lifecycle`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `orientation` | string | "vertical" | vertical / horizontal |
| `showDates` | boolean | true | Daten anzeigen |
| `animated` | boolean | true | Animation |

## Signatur

```javascript
timeline(wert: TimelineEvent[], config?: TimelineConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 54)

> **Timeline - Zeit als Struktur:**
> - X-Achse (oder Y bei vertikal) = Zeit
> - Ereignisse als Punkte/Marker
> - Wichtige Ereignisse hervorheben
> - Annotationen für Kontext

### Timeline vs Sparkline

| Aspekt | Timeline | Sparkline |
|--------|----------|-----------|
| **Daten** | Events (Text) | Werte (Zahlen) |
| **Fokus** | Was passierte | Wie veränderte sich |
| **Details** | Beschreibungen | Nur Trend |

### Timeline vs Gantt

| Aspekt | Timeline | Gantt |
|--------|----------|-------|
| **Punkte** | Einzelne Events | Zeitspannen |
| **Fokus** | Wann | Wie lange |
| **Struktur** | Linear | Parallel |

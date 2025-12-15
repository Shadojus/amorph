# Progress Morph

Fortschrittsbalken für Prozentangaben.

## Datenstruktur

```typescript
// Ganzzahl 11-100 (≤10 wird als Rating erkannt)
type ProgressInput = number;

// Objekt mit value/max
type ProgressInput = {
  value: number;
  max: number;
};

// Beispiele
75
{ value: 30, max: 100 }
{ current: 45, total: 60 }
```

## Erkennungsregeln (Kirk)

- **Typ:** `number` (11-100 Ganzzahlen) oder `object`
- **Zahlen:** Min 11, Max 100, nur Ganzzahlen
- **Object Keys:** `value` + `max`, oder `current` + `total`
- **Priorität:** Nach rating (Rating 0-10, Progress 11-100)

```javascript
// Automatische Erkennung
8      // → rating (0-10)
75     // → progress (11-100)
150    // → number (>100)
```

## Wann PROGRESS verwenden

✅ **Geeignet für:**
- Prozentuale Fortschritte
- Ladezustände
- Abschlussgrade
- Füllstände

❌ **Nicht verwenden für:**
- Bewertungen mit Dezimalen → `rating`
- Bereiche → `range`
- Mehrstufige Prozesse → `steps`
- Zeitbasierte Phasen → `lifecycle`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showPercentage` | boolean | true | Prozentwert anzeigen |
| `animated` | boolean | true | Animation beim Laden |
| `color` | string | cyan | Balkenfarbe |

## Signatur

```javascript
progress(wert: number | ProgressObject, config?: ProgressConfig) → HTMLElement
```

## Kirk-Prinzip

> **Teil-Ganzes-Beziehung:** Ein Fortschrittsbalken zeigt sofort den Anteil des Erreichten. Die visuelle Länge entspricht dem Prozentsatz.

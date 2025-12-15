# Lifecycle Morph

Kreisförmige oder lineare Phasen-Darstellung.

## Datenstruktur

```typescript
// Array von Phasen
type LifecycleInput = Array<{
  phase: string;
  duration: number | string;
  description?: string;
}>;

// Alternative Keys
type LifecycleInput = Array<{
  name: string;
  days: number;
  label?: string;
}>;

// Beispiele
[
  { phase: "Spore", duration: "1-2 days" },
  { phase: "Germination", duration: "3-7 days" },
  { phase: "Mycelium", duration: "14-30 days" },
  { phase: "Fruiting", duration: "7-14 days" }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Required:** `phase` + `duration` (oder `name` + `days`)
- **Optional:** `description`, `label`
- **Priorität:** Nach steps (lifecycle ist zyklisch)

## Wann LIFECYCLE verwenden

✅ **Geeignet für:**
- **Biologische Lebenszyklen**
- Produktlebenszyklen
- Saisonale Zyklen
- Wiederkehrende Prozesse

❌ **Nicht verwenden für:**
- Lineare Prozesse ohne Wiederholung → `steps`
- Zeitbasierte Events → `timeline`
- Kalender-Muster → `calendar`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `mode` | string | "circle" | circle / linear |
| `showDuration` | boolean | true | Dauer anzeigen |
| `showLabels` | boolean | true | Labels anzeigen |
| `animated` | boolean | true | Animation |
| `colors` | array | [...] | Phasen-Farben |

## Signatur

```javascript
lifecycle(wert: LifecyclePhase[], config?: LifecycleConfig) → HTMLElement
```

## Kirk-Prinzip

> **Zyklische Prozesse:**
> - Kreis suggeriert Wiederholung
> - Phasen als Segmente
> - Dauer kann proportional sein
> - Farben für visuelle Unterscheidung

### Lifecycle vs Steps

| Aspekt | Lifecycle | Steps |
|--------|-----------|-------|
| **Struktur** | Zyklisch (Kreis) | Linear |
| **Ende** | Kehrt zum Anfang | Hat Endpunkt |
| **Fokus** | Phasen + Dauer | Aktionen + Status |

### Lifecycle vs Timeline

| Aspekt | Lifecycle | Timeline |
|--------|-----------|----------|
| **Zeit** | Relativ (Dauer) | Absolut (Datum) |
| **Wiederholung** | Ja (Zyklus) | Nein (einmalig) |
| **Darstellung** | Kreis/Segmente | Linear/Punkte |

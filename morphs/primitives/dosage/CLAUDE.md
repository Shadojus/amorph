# Dosage Morph

Medizinische Dosierungsangaben mit Warnungen.

## Datenstruktur

```typescript
type DosageInput = {
  dose: number;
  unit: string;  // mg, g, ml, μg, IU
  min?: number;
  max?: number;
  warning?: string;
  frequency?: string;
};

// Beispiele
{ dose: 500, unit: "mg" }
{ dose: 10, unit: "ml", frequency: "3x täglich" }
{
  dose: 50,
  unit: "mg",
  min: 25,
  max: 100,
  warning: "Nicht überschreiten!"
}
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `dose` + `unit`
- **Optional:** `min`, `max`, `warning`, `frequency`
- **Priorität:** Höchste (spezifisches Muster)

## Wann DOSAGE verwenden

✅ **Geeignet für:**
- **Medizinische Dosierungen**
- Wirkstoffmengen
- Einnahmeempfehlungen
- Pharmakologische Daten

❌ **Nicht verwenden für:**
- Allgemeine Bereiche → `range`
- Statistiken → `stats`
- Einfache Mengen → `number`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showWarnings` | boolean | true | Warnungen anzeigen |
| `showFrequency` | boolean | true | Häufigkeit anzeigen |
| `showRange` | boolean | true | Min/Max anzeigen |
| `warningColor` | string | rot | Warnungsfarbe |
| `warningIcon` | string | "⚠" | Warnungs-Icon |
| `safeColor` | string | grün | Sichere Zone |

### Unterstützte Einheiten

| Einheit | Beschreibung |
|---------|--------------|
| `mg` | Milligramm |
| `g` | Gramm |
| `ml` | Milliliter |
| `μg` | Mikrogramm |
| `IU` | Internationale Einheiten |

## Signatur

```javascript
dosage(wert: DosageObject, config?: DosageConfig) → HTMLElement
```

## Ausgabe-Format

```
Standard:       500 mg
Mit Frequenz:   10 ml  •  3x täglich
Mit Bereich:    50 mg (25-100)
Mit Warnung:    100 mg ⚠ Nicht überschreiten!
```

## Kirk-Prinzip

> **Kritische Daten hervorheben:**
> - Warnungen auffällig darstellen
> - Bereiche klar kennzeichnen
> - Einheiten niemals weglassen
> - Medizinische Daten = hohe Verantwortung

# Severity Morph

Farbcodierte Schweregrad-/Warnstufen-Anzeige.

## Datenstruktur

```typescript
// String-Level (semantisch)
type SeverityInput = {
  level: string;  // trivial | minor | moderate | severe | critical
  label: string;
  description?: string;
};

// Numerisch (0-100)
type SeverityInput = {
  schwere: number;  // 0-100
  typ: string;
  beschreibung?: string;
};

// Alternative Keys
type SeverityInput = {
  severity: string | number;
  grade: string;
  tier?: string;
};

// Beispiele
{ level: "moderate", label: "Mittel" }
{ schwere: 75, typ: "Toxizität", label: "Hoch" }
{ severity: "critical", label: "Gefährlich", description: "Sofort behandeln!" }
```

## Erkennungsregeln

- **Typ:** `array` von Objekten
- **Required:** Severity-Key + Type-Key
  - Severity-Keys: `level`, `severity`, `schwere`, `risiko`, `gefahr`, `bedrohung`, `grade`
  - Type-Keys: `typ`, `type`, `art`, `kategorie`, `label`
- **Werte:** Numerisch (0-100) ODER String-Level (`trivial`, `minor`, `moderate`, `severe`, `critical`)
- **Priorität:** Nach badge (severity ist mehrstufig)

```javascript
// String-Level werden erkannt
[{ level: "critical", typ: "Warnung" }]

// Numerische Werte werden erkannt  
[{ schwere: 85, typ: "Risiko" }]
```

## Wann SEVERITY verwenden

✅ **Geeignet für:**
- **Mehrstufige Warnungen**
- Risikostufen
- Toxizitätsgrade
- Prioritäten

❌ **Nicht verwenden für:**
- Binäre Zustände → `badge`
- Scores → `gauge`
- Ratings → `rating`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showIcon` | boolean | true | Icon anzeigen |
| `showBar` | boolean | true | Fortschrittsbalken |
| `showLabel` | boolean | true | Label anzeigen |
| `levels` | array | [...] | Level-Definitionen |

### Schweregrad-Stufen

| Level | Farbe | Icon | Order |
|-------|-------|------|-------|
| `trivial` | Grün | ✓ | 1 |
| `minor` | Lime | ● | 2 |
| `moderate` | Gelb | ⚠ | 3 |
| `severe` | Orange | ⚡ | 4 |
| `critical` | Rot | ☠ | 5 |

## Signatur

```javascript
severity(wert: SeverityObject, config?: SeverityConfig) → HTMLElement
```

## Kirk-Prinzip

> **Kritische Werte hervorheben:**
> - Farbe = Dringlichkeit
> - Icon = Schnelle Erkennung
> - 5-Stufen-Skala für Differenzierung
> - Konsistent mit Ampel-Logik

### Severity vs Badge

| Aspekt | Severity | Badge |
|--------|----------|-------|
| **Stufen** | 5 (trivial→critical) | 4-5 (success→danger) |
| **Fokus** | Warnung/Risiko | Status allgemein |
| **Visualisierung** | Mit Balken | Nur Farbe |
| **Icons** | Spezifisch pro Level | Optional |

### Verwendungsbeispiele

```
Toxizität:      trivial → minor → moderate → severe → critical
Allergierisiko: trivial → minor → moderate → severe → critical
Dringlichkeit:  trivial → minor → moderate → severe → critical
```

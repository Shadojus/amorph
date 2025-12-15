# Tag Morph

Kurze Label-Tags für Kategorisierung.

## Datenstruktur

```typescript
// Kurzer String
type TagInput = string; // max 20 Zeichen

// Beispiele
"Pilz"
"Essbar"
"Europa"
"Wald"
```

## Erkennungsregeln

- **Typ:** `string`
- **Max. Länge:** 20 Zeichen
- **Ausschluss:** Badge-Keywords werden nicht erkannt
- **Priorität:** Nach Badge, vor Text

## Wann TAG verwenden

✅ **Geeignet für:**
- Kategorien
- Labels
- Kurze Klassifikationen
- Schlagwörter

❌ **Nicht verwenden für:**
- Status-Begriffe (aktiv, giftig) → `badge`
- URLs → `link`
- Lange Beschreibungen → `text`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `clickable` | boolean | false | Klickbar als Filter |
| `removable` | boolean | false | Mit X zum Entfernen |

## Signatur

```javascript
tag(wert: string, config?: TagConfig) → HTMLElement
```

## Unterschied zu Badge

| Aspekt | Tag | Badge |
|--------|-----|-------|
| **Semantik** | Neutral, kategorisierend | Semantisch, wertend |
| **Farbe** | Einheitlich | Statusabhängig (grün/rot/gelb) |
| **Keywords** | Keine spezifischen | "aktiv", "giftig", "edible" |
| **Zweck** | Klassifikation | Zustandsanzeige |

## Kirk-Prinzip

> **Kategorisierung:** Tags sind neutrale Klassifikationselemente. Sie werten nicht, sie ordnen ein.

# Object Morph

Key-Value-Darstellung für Objekte.

## Datenstruktur

```typescript
// Beliebiges Objekt
type ObjectInput = Record<string, any>;

// Beispiele
{ name: "Test", value: 42 }
{ author: "Kirk", year: 2016 }
```

## Erkennungsregeln

- **Typ:** `object`
- **Fallback:** Ja (Standard für nicht zugeordnete Objekte)
- **Priorität:** Niedrigste (nach spezialisierten Objekt-Morphs)

## Wann OBJECT verwenden

✅ **Geeignet für:**
- Unstrukturierte Key-Value-Paare
- Debug-Darstellungen
- Fallback für unbekannte Objekte

❌ **Nicht verwenden für:**
- Koordinaten (lat/lng) → `map`
- Zitationen (author/year/title) → `citation`
- Dosierungen (dose/unit) → `dosage`
- Währungen (amount/currency) → `currency`
- Statistiken (min/max/avg) → `stats`
- Bereiche (min/max) → `range`
- Vergleiche (before/after) → `slopegraph` oder `comparison`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `maxKeys` | number | 20 | Max. angezeigte Keys |
| `showMore` | boolean | true | "Mehr anzeigen" Button |
| `nested` | boolean | true | Verschachtelte Objekte anzeigen |

## Signatur

```javascript
object(wert: object, config?: ObjectConfig) → HTMLElement
```

## Kirk-Prinzip

> **Struktur sichtbar machen:** Key-Value-Paare werden tabellarisch dargestellt. Die Hierarchie wird durch Einrückung visualisiert.

# Boolean Morph

Wahrheitswert-Darstellung mit visuellen Indikatoren.

## Datenstruktur

```typescript
// Boolean-Wert
type BooleanInput = boolean;

// Beispiele
true
false
```

## Erkennungsregeln

- **Typ:** `boolean`
- **Exakt:** `true` oder `false`
- **Priorität:** Hoch (vor String-Morphs)

## Wann BOOLEAN verwenden

✅ **Geeignet für:**
- Ja/Nein-Werte
- An/Aus-Zustände
- Binäre Eigenschaften

❌ **Nicht verwenden für:**
- Status-Strings ("aktiv", "inaktiv") → `badge`
- Mehrstufige Zustände → `severity`
- Verfügbarkeiten → `badge`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `trueIcon` | string | "✓" | Icon für true |
| `falseIcon` | string | "✕" | Icon für false |
| `trueColor` | string | rgba(100,220,160,0.85) | Farbe für true |
| `falseColor` | string | rgba(240,110,110,0.85) | Farbe für false |

## Signatur

```javascript
boolean(wert: boolean, config?: BooleanConfig) → HTMLElement
```

## Kirk-Prinzip

> **Binäre Klarheit:** True/False wird sofort visuell unterscheidbar. Grün = Ja, Rot = Nein. Keine Ambiguität.

# Number Morph

Numerische Wertdarstellung mit optionaler Formatierung.

## Datenstruktur

```typescript
// Einfache Zahl
type NumberInput = number;

// Beispiele
42
3.14159
-273.15
1000000
```

## Erkennungsregeln

- **Typ:** `number`
- **Fallback:** Ja (Standard für nicht zugeordnete Zahlen)
- **Priorität:** Niedrigste (nach rating, progress)

## Wann NUMBER verwenden

✅ **Geeignet für:**
- Einzelne numerische Werte
- IDs, Mengen, Messwerte
- Unformatierte Zahlen

❌ **Nicht verwenden für:**
- Bewertungen (0-10 mit Dezimalen) → `rating`
- Prozente (0-100 Ganzzahlen) → `progress`
- Währungsbeträge → `currency`
- Bereiche → `range`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `locale` | string | "en-US" | Zahlenformat-Locale |
| `decimals` | number/auto | auto | Dezimalstellen |
| `compact` | boolean | false | Kompakte Darstellung (1K, 1M) |

## Signatur

```javascript
number(wert: number, config?: NumberConfig) → HTMLElement
```

## Kirk-Prinzip

> **Präzision:** Zahlen werden exakt und klar dargestellt. Die Formatierung dient der Lesbarkeit, nicht der Verschönerung.

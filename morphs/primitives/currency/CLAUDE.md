# Currency Morph

Währungsbeträge mit Locale-Formatierung.

## Datenstruktur

```typescript
type CurrencyInput = {
  amount: number;
  currency: string;  // EUR, USD, GBP, etc.
};

// Alternative Keys
type CurrencyInput = {
  value: number;
  symbol: string;
};

// Oder mit price
type CurrencyInput = {
  price: number;
  currency: string;
};

// Beispiele
{ amount: 29.99, currency: "EUR" }
{ value: 1250, currency: "USD" }
{ price: 15.50, currency: "GBP" }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `amount` + `currency` (oder `value`/`price` + `symbol`)
- **Priorität:** Höchste (spezifisches Muster)

## Wann CURRENCY verwenden

✅ **Geeignet für:**
- **Preisangaben**
- Währungsbeträge
- Finanzielle Werte
- Kosten

❌ **Nicht verwenden für:**
- Einfache Zahlen → `number`
- Bereiche → `range`
- Statistiken → `stats`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `defaultCurrency` | string | "EUR" | Fallback-Währung |
| `showSymbol` | boolean | true | Währungssymbol |
| `compactLargeNumbers` | boolean | true | 1K, 1M Format |
| `locale` | string | "en-US" | Formatierungs-Locale |

### Währungssymbole

| Code | Symbol |
|------|--------|
| EUR | € |
| USD | $ |
| GBP | £ |
| JPY | ¥ |
| CHF | CHF |

## Signatur

```javascript
currency(wert: CurrencyObject, config?: CurrencyConfig) → HTMLElement
```

## Formatierung

```javascript
// Beispiele
{ amount: 1234.56, currency: "EUR" }  → €1,234.56
{ amount: 1000000, currency: "USD" }  → $1M
{ amount: 99, currency: "GBP" }       → £99.00
```

## Kirk-Prinzip

> **Finanzdaten klar präsentieren:**
> - Währungssymbol immer sichtbar
> - Locale-korrekte Formatierung
> - Große Zahlen kompaktieren
> - Einheitliche Dezimalstellen

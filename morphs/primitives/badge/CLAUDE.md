# Badge Morph

Status-Badge mit semantischer Farbcodierung.

## Datenstruktur

```typescript
// String mit Status-Keyword
type BadgeInput = string;

// Objekt mit expliziter Variante
type BadgeInput = {
  status: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
};

// Beispiele
"aktiv"
"giftig"
{ status: "pending", variant: "warning" }
```

## Erkennungsregeln

- **Typ:** `string` oder `object`
- **Keywords:** active, inactive, edible, toxic, deadly, etc.
- **Max. Länge:** 25 Zeichen
- **Priorität:** Hoch (vor Tag)

### Automatische Varianten-Erkennung

| Variante | Keywords |
|----------|----------|
| `success` | aktiv, active, ja, yes, edible, ok, gut |
| `danger` | inaktiv, nein, toxic, deadly, fehler |
| `warning` | warnung, warning, vorsicht, pending |
| `info` | info, hinweis, tipp, neu, beta |
| `neutral` | unbekannt, n/a, keine, none |

## Wann BADGE verwenden

✅ **Geeignet für:**
- Statusanzeigen
- Verfügbarkeit (online/offline)
- Sicherheitsstufen (edible/toxic)
- Zustandsindikatoren

❌ **Nicht verwenden für:**
- Neutrale Kategorien → `tag`
- Schweregrade mit Stufen → `severity`
- Mehrstufige Fortschritte → `progress`

## Konfiguration

Siehe `badge.yaml` für Farben und Icon-Definitionen.

## Signatur

```javascript
badge(wert: string | BadgeObject, config?: BadgeConfig) → HTMLElement
```

## Kirk-Prinzip

> **Semantische Farbcodierung:** Farben transportieren Bedeutung. Grün = Positiv, Rot = Gefahr, Gelb = Vorsicht. Konsistent und kulturell verständlich.

# List Morph

Einfache Array-Listen-Darstellung.

## Datenstruktur

```typescript
// Array von beliebigen Elementen
type ListInput = any[];

// Beispiele
["Apfel", "Birne", "Kirsche"]
[1, 2, 3, 4, 5]
[{name: "A"}, {name: "B"}]
```

## Erkennungsregeln

- **Typ:** `array`
- **Fallback:** Ja (Standard für nicht zugeordnete Arrays)
- **Priorität:** Niedrigste (nach spezialisierten Array-Morphs)

## Wann LIST verwenden

✅ **Geeignet für:**
- Einfache Aufzählungen
- Unstrukturierte Listen
- Fallback für unbekannte Arrays

❌ **Nicht verwenden für:**
- Numerische Arrays → `sparkline` oder `bar`
- Zeitbasierte Daten → `timeline`
- Kategorien mit Werten → `pie` oder `bar`
- Matrix-Daten → `heatmap`
- Prozess-Schritte → `steps`
- Phasen → `lifecycle`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `maxItems` | number | 10 | Max. angezeigte Items |
| `showMore` | boolean | true | "Mehr anzeigen" Button |
| `style` | string | "bullet" | bullet / numbered / plain |

## Signatur

```javascript
list(wert: any[], config?: ListConfig) → HTMLElement
```

## Kirk-Prinzip

> **Übersichtlichkeit:** Listen werden klar strukturiert dargestellt. Zu viele Items werden gekürzt, um Übersichtlichkeit zu wahren.

# Range Morph

Min-Max Wertebereich-Darstellung.

## Datenstruktur

```typescript
type RangeInput = {
  min: number;
  max: number;
  unit?: string;
};

// Beispiele
{ min: 10, max: 25 }
{ min: 0, max: 100, unit: "°C" }
{ min: 5.5, max: 7.5 }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `min`, `max`
- **Max. Keys:** 3 (nur min, max, optional unit)
- **Priorität:** Vor stats (stats braucht auch avg)

## Wann RANGE verwenden

✅ **Geeignet für:**
- Temperaturspannen
- Preisbereiche
- pH-Wertbereiche
- Größenbereiche

❌ **Nicht verwenden für:**
- Statistiken mit Mittelwert → `stats`
- Tachometer mit Zonen → `gauge`
- Fortschritt → `progress`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `visualization` | boolean | true | Visuelle Darstellung |
| `showBar` | boolean | true | Bereichsbalken anzeigen |
| `unit` | string | null | Einheit |

## Signatur

```javascript
range(wert: RangeObject, config?: RangeConfig) → HTMLElement
```

## Kirk-Prinzip

> **Spanne visualisieren:** Ein Wertebereich wird als visueller Balken dargestellt. Die Grenzen sind klar erkennbar.

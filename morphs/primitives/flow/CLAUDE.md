# Flow Morph

Organische Strömungs-Visualisierung für Verbindungen und Flüsse.

## Design-Philosophie

Der Flow-Morph ist die **ästhetische Grundlage** des Universe Biosphere Themes:
- Inspiriert von biologischen Netzwerken (Myzel, Nervensysteme)
- Organische Bezier-Kurven statt gerader Linien
- Leuchtende Partikel als Datenpunkte
- Sanfte, fließende Animationen

## Erkennungsregeln

### Primäre Erkennung
```javascript
// FLOW wenn:
// 1. Array mit from/to oder source/target Paaren
// 2. Objekt mit connections/links/edges Array
// 3. Hint: "flow", "stream", "connections"

const isFlow = (wert) => {
  if (Array.isArray(wert)) {
    return wert.some(item => 
      (item.from && item.to) || 
      (item.source && item.target)
    );
  }
  if (typeof wert === 'object') {
    return wert.connections || wert.links || wert.edges;
  }
  return false;
};
```

### Abgrenzung zu anderen Morphs
| Datenstruktur | Morph | Begründung |
|---------------|-------|------------|
| `[{from, to, value}]` | **flow** | Verbindungen mit Gewichtung |
| `[{name, type, intensity}]` | network | Zentraler Node mit Beziehungen |
| `{parent: {child: value}}` | hierarchy | Baum ohne Querverbindungen |
| `{name, children: [...]}` | sunburst | Explizite Hierarchie |

## Datenstruktur

```typescript
// Array von Verbindungen
type FlowInput = Array<{
  from: string;    // oder source, start
  to: string;      // oder target, end
  value?: number;  // Gewichtung (default: 1)
  type?: string;   // Kategorie für Färbung
}>;

// Objekt mit connections
type FlowInput = {
  connections: Array<{from, to, value}>;
  nodes?: Array<{name, value}>;  // Optional
};

// Beispiele
[
  {from: "Myzel", to: "Baum A", value: 8},
  {from: "Myzel", to: "Baum B", value: 5},
  {from: "Baum A", to: "Baum C", value: 3}
]

// Biologisches Netzwerk
{
  connections: [
    {source: "Pilz", target: "Birke", strength: 10},
    {source: "Pilz", target: "Eiche", strength: 7},
    {source: "Birke", target: "Eiche", strength: 3}
  ]
}
```

## Wann FLOW verwenden

✅ **Geeignet für:**
- **Netzwerk-Flüsse** (Myzel, Nervensystem)
- Stoffwechselwege
- Ökologische Verbindungen
- Migrations-/Transportrouten
- Informationsflüsse
- Künstlerische Datenvisualisierung

❌ **Nicht verwenden für:**
- Hierarchische Daten → `hierarchy`, `sunburst`
- Zentrale Beziehungen → `network`
- Exakte Vergleiche → `bar`, `treemap`
- Zeitverläufe → `sparkline`, `timeline`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `width` | number | 400 | SVG-Breite |
| `height` | number | 300 | SVG-Höhe |
| `layout` | string | "organic" | "organic" oder "circular" |
| `showNodes` | boolean | true | Knoten anzeigen |
| `animate` | boolean | true | Partikel-Animation |

## Visuelle Features

### Organische Kurven
- Multiple Bezier-Pfade pro Verbindung
- Perpendicular Offset für natürliche Variation
- Welligkeit basierend auf Index

### Partikel-System
- Leuchtende Punkte entlang der Kurven
- Größenvariation (2-6px)
- Optionale Ring-Umrandung
- CSS-basierte Float-Animation

### Knoten
- Haupt-Kreis mit Glow-Effekt
- Label unterhalb
- Hover-Vergrößerung

## Signatur

```javascript
flow(wert: FlowInput, config?: FlowConfig) → HTMLElement
```

## Farbpalette (Biologisch)

### Hell-Modus
- Warm Beige: `rgba(200, 180, 160, 0.6)`
- Cool Cyan: `rgba(180, 200, 200, 0.6)`
- Soft Rose: `rgba(200, 160, 160, 0.6)`
- Sage Green: `rgba(160, 180, 160, 0.6)`

### Dark/Universe-Modus
- Cyan Glow: `rgba(0, 255, 255, 0.5)`
- Mint: `rgba(0, 255, 200, 0.6)`
- Aqua: `rgba(0, 200, 200, 0.4)`

## Integration mit Universe Theme

Der Flow-Morph passt sich automatisch an das Theme an:
- Light: Pastellfarben, subtile Linien
- Dark/Universe: Neon-Glow, leuchtende Partikel

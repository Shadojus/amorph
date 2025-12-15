# Network Morph

Organisches Beziehungsnetzwerk nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Organische Kurven**: Bezier-Kurven statt gerade Linien
2. **Proportionale Größe**: Node-Größe nach Intensität/Wichtigkeit
3. **Farbkodierung**: Beziehungstypen farblich unterschieden
4. **Annotationen**: Interaktionstypen direkt an Kanten
5. **Zentraler Fokus**: Hauptelement prominent in der Mitte

## Datenstruktur

```typescript
// Array von Beziehungen
type NetworkInput = Array<{
  name: string;
  type: string;
  intensity?: number;  // 0-100, beeinflusst Node-Größe
  strength?: number;
  details?: string;
}>;

// Alternative Keys
type NetworkInput = Array<{
  partner: string;
  relationship: string;
  organism?: string;
}>;

// Beispiele
[
  { name: "Birke", type: "symbiosis", intensity: 90 },
  { name: "Eiche", type: "symbiosis", intensity: 70 },
  { name: "Schnecke", type: "predation", intensity: 30 }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Pattern 1:** `name` + `type` (oder `partner` + `relationship`)
- **Pattern 2:** `connections` Array (explizite Verbindungsliste)
- **Optional:** `intensity`, `strength`, `details`, `organism`
- **Priorität:** Nach hierarchy (allgemeinere Struktur)

```javascript
// Pattern 1: Implizite Beziehungen
[{ name: "Birke", type: "symbiosis", intensity: 90 }]

// Pattern 2: Explizite Verbindungen
[{ name: "A", connections: ["B", "C"] }]
```

## Wann NETWORK verwenden (Kirk)

✅ **Geeignet für:**
- **Beziehungsnetzwerke**
- Ökologische Interaktionen
- Soziale Netzwerke
- Abhängigkeiten

❌ **Nicht verwenden für:**
- Hierarchien ohne Querverbindungen → `hierarchy`
- Flüsse zwischen Knoten → Sankey (extern)
- Einfache Listen → `list`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `center` | string | Auto | Name des zentralen Knotens |
| `size` | number | 280 | SVG-Größe in Pixeln |
| `showLegend` | boolean | true | Legende anzeigen |

### Beziehungstypen (biologisch)

| Typ | Farbe | Symbol |
|-----|-------|--------|
| `symbiosis` | Grün | ⚭ |
| `mykorrhiza` | Grün | 🌿 |
| `parasitism` | Rot | ⊘ |
| `predation` | Orange | → |
| `competition` | Amber | ⇆ |
| `commensalism` | Blau | ⤵ |
| `pollination` | Pink | ✿ |
| `food` | Braun | ◈ |
| `habitat` | Grün | ⌂ |
| `decomposer` | Braun | ↻ |

## Signatur

```javascript
network(wert: NetworkItem[], config?: NetworkConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 86)

> **Netzwerk-Visualisierungen:**
> - **Connection Plot:** Knoten + Kanten
> - **Chord Diagram:** Zirkuläre Beziehungen (Seite 86)
> - Liniendicke = Beziehungsstärke
> - Farben für Kategorien
> - Layout minimiert Überschneidungen

### Network vs Hierarchy

| Aspekt | Network | Hierarchy |
|--------|---------|-----------|
| **Struktur** | Graph (Querverbindungen) | Baum (strikt) |
| **Beziehungen** | N:M | 1:N |
| **Typen** | Verschiedene | Eine Richtung |

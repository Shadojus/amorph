# Network Morph

Beziehungsnetzwerk mit typisierten Verbindungen.

## Datenstruktur

```typescript
// Array von Beziehungen
type NetworkInput = Array<{
  name: string;
  type: string;
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
  { name: "Birke", type: "symbiosis", strength: 0.9 },
  { name: "Eiche", type: "symbiosis", strength: 0.7 },
  { name: "Schnecke", type: "predation", strength: 0.3 }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Pattern 1:** `name` + `type` (oder `partner` + `relationship`)
- **Pattern 2:** `connections` Array (explizite Verbindungsliste)
- **Optional:** `strength`, `details`, `organism`
- **Priorität:** Nach hierarchy (allgemeinere Struktur)

```javascript
// Pattern 1: Implizite Beziehungen
[{ name: "Birke", type: "symbiosis", strength: 0.9 }]

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
| `showStrength` | boolean | true | Verbindungsstärke anzeigen |
| `centerNode` | boolean | true | Zentraler Knoten |
| `animated` | boolean | true | Animation |
| `typeColors` | object | {...} | Farben pro Typ |
| `typeIcons` | object | {...} | Icons pro Typ |

### Beziehungstypen

| Typ | Farbe | Icon |
|-----|-------|------|
| `symbiosis` | Grün | 🤝 |
| `parasitism` | Rot | 🦠 |
| `predation` | Orange | 🍽️ |
| `commensalism` | Blau | 🏠 |
| `competition` | Magenta | ⚔️ |

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

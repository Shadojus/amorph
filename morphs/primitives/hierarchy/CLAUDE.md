# Hierarchy Morph

Baumstruktur für hierarchische/taxonomische Daten.

## Datenstruktur

```typescript
// Array von Hierarchie-Ebenen
type HierarchyInput = Array<{
  level: string;
  name: string;
}>;

// Alternative Keys
type HierarchyInput = Array<{
  rank: string;
  taxonomy: string;
}>;

// Beispiele
[
  { level: "Kingdom", name: "Fungi" },
  { level: "Division", name: "Basidiomycota" },
  { level: "Class", name: "Agaricomycetes" },
  { level: "Order", name: "Agaricales" },
  { level: "Family", name: "Amanitaceae" },
  { level: "Genus", name: "Amanita" },
  { level: "Species", name: "muscaria" }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Required:** Mindestens einer dieser Keys:
  - `level`, `ebene`, `rank`, `taxonomy`
  - `parent`, `children`, `kinder`
- **Priorität:** Nach network (spezifischere Struktur)

```javascript
// Erkannt durch level/rank/taxonomy
[{ level: "Kingdom", name: "Fungi" }]
[{ rank: "Family", taxonomy: "Amanitaceae" }]

// Erkannt durch parent/children
[{ name: "Root", children: ["A", "B"] }]
```

## Wann HIERARCHY verwenden (Kirk)

✅ **Geeignet für:**
- **Taxonomien** (biologische Klassifikation)
- Organisationsstrukturen
- Dateisysteme
- Kategorien-Bäume

❌ **Nicht verwenden für:**
- Netzwerke mit Querverbindungen → `network`
- Zeitliche Phasen → `lifecycle`
- Prozess-Schritte → `steps`
- Proportionen → `treemap`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `defaultMode` | string | "tree" | tree / breadcrumb |
| `maxDepth` | number | 10 | Maximale Tiefe |
| `showLevels` | boolean | true | Level-Namen anzeigen |
| `collapsible` | boolean | true | Auf-/Zuklappbar |
| `indentSize` | number | 20 | Einrückung in Pixeln |

## Signatur

```javascript
hierarchy(wert: HierarchyItem[], config?: HierarchyConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 89)

> **Hierarchische Visualisierungen:**
> - **Treemap:** Fläche = Wert (Seite 89)
> - **Sunburst:** Radiale Hierarchie (Seite 89)
> - **Dendrogram:** Klassischer Baum
> - **Circle Packing:** Verschachtelte Kreise

### Darstellungsmodi

| Modus | Verwendung |
|-------|------------|
| **Tree** | Klassische Baumansicht, eingerückt |
| **Breadcrumb** | Kompakte Pfad-Darstellung |

### Hierarchy vs Treemap

| Aspekt | Hierarchy | Treemap |
|--------|-----------|---------|
| **Fokus** | Struktur/Beziehungen | Größen/Proportionen |
| **Werte** | Optional | Erforderlich |
| **Darstellung** | Baum/Pfad | Verschachtelte Rechtecke |

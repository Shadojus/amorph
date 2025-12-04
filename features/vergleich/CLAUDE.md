# Feature: Vergleich (Vektorraum)

Laterale Lösung: Informationen durch Raumeinteilung und Vektoren verknüpfen.

## Übersicht

Das Vergleich-Feature bietet:
- Sammel-Diagramm mit Pilz-Legende (farbige Punkte)
- Perspektiven-aware Morphs (Label + Farben aus aktivierter Perspektive)
- Multi-Perspektiven Glow (wenn Feld zu mehreren Perspektiven gehört)
- **Compare-Morphs Integration**: Nutzt typ-basierte Compare-Morphs aus `morphs/compare/`
- **Suche-Highlights**: Markiert Suchbegriffe im Vergleich-View
- **Datengetriebene Morph-Auswahl**: `compareMorph()` wählt basierend auf TYP, nicht Feldname
- **Feld-Deduplizierung**: Jedes Feld nur einmal über alle Perspektiven

### Verwendete Compare-Morphs

| Typ | Compare-Morph | Beschreibung |
|-----|---------------|--------------|
| `rating` | `compareRating` | Sterne-Vergleich |
| `progress` | `compareBar` | Horizontale Balken |
| `range` | `compareRange` | Range-Visualisierung |
| `tag`/`badge` | `compareTag` | Gruppierte Chips |
| `list` | `compareList` | Listen mit Überlappung |
| `image` | `compareImage` | Bildergalerie |
| `radar` | `compareRadar` | Überlappende Radar-Charts |
| `pie` | `comparePie` | Mini-Pie-Charts nebeneinander |
| `*` | `compareText` | Fallback Text-Vergleich |

### Event-Handling

```javascript
// Hört auf Suche-Events für Highlighting
document.addEventListener('header:suche:ergebnisse', (e) => {
  const { query, matchedTerms, nurHighlights } = e.detail;
  
  if (nurHighlights) {
    // Im Vergleich-View: Nur Highlights, keine DB-Suche
    highlightInContainer(compareContainer, [query]);
  }
});
```

## Konzept

Der Vektorraum visualisiert **Ähnlichkeiten und Unterschiede** zwischen Pilzen:
- Jeder Pilz ist ein **Punkt** im Raum
- Position basiert auf **Eigenschaften als Vektoren**
- **Nähe = Ähnlichkeit**, Distanz = Unterschied
- Achsen repräsentieren **Dimensionen** (Temperatur, Essbarkeit, etc.)

## Modi

| Modus | Icon | Beschreibung |
|-------|------|--------------|
| 2D | 2D | Streudiagramm mit 2 Achsen |
| Radar | ◇ | Spinnendiagramm für Multi-Dimensionen |
| 3D | 3D | Isometrische 3D-Projektion |

## Layout

```
┌─────────────────────────────────────────────────┐
│ [2D][◇][3D]  [Temp][Größe][Essb]...   3 Pilze  │  ← Toolbar
├─────────────────────────────────────────────────┤
│                     Essbarkeit                  │
│                         ↑                       │
│              Steinpilz •                        │
│                    ╱    ╲                       │
│     Pfifferling • ←──────→ • Champignon        │
│                    ╲    ╱                       │
│                      ↓                          │
│                  Temperatur                     │
├─────────────────────────────────────────────────┤
│ ● Steinpilz  ● Pfifferling  ● Champignon       │  ← Legende
└─────────────────────────────────────────────────┘
```

## Vektoren & Normalisierung

Jedes Feld wird auf 0-1 normalisiert:

```javascript
// Range-Felder: Mittelwert normalisieren
temperatur: { min: 10, max: 25 } → 0.35 (bei Bereich 0-50)

// Kategorien: Ordinale Skala
essbarkeit: "essbar" → 1.0
essbarkeit: "giftig" → 0.1

// Zahlen: Direkt normalisieren
rating: 4.5 → 0.9 (bei max 5)
```

## Interaktionen

- **Dimensionen-Buttons** → Achsen ein/ausschalten
- **Hover auf Punkt** → Tooltip mit allen Werten
- **Modus wechseln** → Andere Visualisierung

## CSS Klassen

```css
.amorph-vektorraum              /* Haupt-Container */
.amorph-vektorraum-toolbar      /* Toolbar oben */
.amorph-vektorraum-modus        /* Modus-Buttons */
.amorph-vektorraum-dimensionen  /* Dimensionen-Auswahl */
.amorph-vektorraum-canvas       /* SVG-Container */
.amorph-vektorraum-svg          /* SVG Element */
.amorph-vektorraum-legende      /* Legende unten */
.amorph-vektorraum-tooltip      /* Hover-Tooltip */
```

## Mathematik

### Distanz zwischen Pilzen

```javascript
// Euklidische Distanz im n-dimensionalen Raum
function distanz(a, b) {
  let sum = 0;
  for (let i = 0; i < a.vektor.length; i++) {
    sum += Math.pow(a.vektor[i] - b.vektor[i], 2);
  }
  return Math.sqrt(sum);
}
```

### Radar-Koordinaten

```javascript
// Punkt auf Radar-Achse
const angle = (index / numDimensionen) * Math.PI * 2 - Math.PI / 2;
const r = wert * radius;  // wert normalisiert 0-1
const x = centerX + Math.cos(angle) * r;
const y = centerY + Math.sin(angle) * r;
```

## Events

- Hört auf `amorph:auswahl-geaendert` → Re-render
- Hört auf `amorph:ansicht-wechsel` → Show/Hide

## Erweiterungsideen

- **Clustering**: Automatisches Gruppieren ähnlicher Pilze
- **Pfade**: Verbindungen zeigen Entwicklung/Verwandtschaft
- **Filter**: Nur Pilze über/unter Schwellwert zeigen
- **Animation**: Punkte bewegen sich bei Dimensionswechsel
- **PCA**: Principal Component Analysis für optimale Achsen

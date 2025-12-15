# Primitives

44+ Basis-Morphs für Datenvisualisierung nach Kirk-Prinzipien.

## Design-Prinzipien (Andy Kirk - Visualizing Data)

Die Morphs folgen bewährten Datenvisualisierungsprinzipien:

### 1. Klare visuelle Hierarchie
- Wichtigste Werte prominent
- Sekundäre Information kleiner
- Tertiäre Information dezent

### 2. Sortierung & Baseline
- Bar Charts: Sortiert nach Wert
- Referenzlinien: Durchschnitt/Schwellenwerte
- Baseline bei 0 für ehrliche Vergleiche

### 3. Annotation & Kontext
- Werte direkt annotiert
- Trend-Indikatoren (↑↓→)
- Prozentuale Veränderungen sichtbar

### 4. Farbkodierung mit Bedeutung
- Grün: Positiv/Hoch/Wachstum
- Rot: Negativ/Niedrig/Rückgang
- Amber: Warnung/Mittel
- Blau: Neutral/Information

### 5. Proportionale Darstellung
- Kreisflächen proportional zu Werten
- Node-Größen nach Wichtigkeit
- Keine verzerrten Achsen

### 6. Organische Verbindungen (DESIGN-BASIS!)
- Bezier-Kurven statt gerade Linien
- Fließende Übergänge
- Biologisch inspirierte Ästhetik
- **Flow-Morph als visuelle Grundlage des Systems**

## Struktur

```
primitives/
├── index.js       ← Export aller Morphs + Aliase
├── index.css      ← Gemeinsame Styles
├── index.yaml     ← Config mit Detection-Priority
└── [morph]/       ← Ein Ordner pro Morph
    ├── [morph].js
    ├── [morph].css
    └── CLAUDE.md  ← Erkennungsregeln!
```

## Übersicht (44 Morphs)

| Kategorie | Morphs |
|-----------|--------|
| **Text** | text, number, boolean |
| **Kategorien** | tag, badge, list |
| **Bar Charts** | bar, stackedbar, groupedbar, lollipop |
| **Pie/Area** | pie, bubble, treemap, sunburst |
| **Statistik** | stats, range, progress, rating, boxplot |
| **Trends** | sparkline, slopegraph, heatmap, dotplot |
| **Korrelation** | scatterplot |
| **Flow/Connection** | flow, network |
| **Zeit** | timeline, lifecycle, steps, calendar |
| **Struktur** | object, hierarchy, radar, gauge |
| **Mengen** | pictogram |
| **Medien** | image, link, map, citation |
| **Spezial** | dosage, currency, severity, comparison |

## Kirk-Features pro Morph

### Flow Chart (DESIGN-BASIS - Fig 6.x)
- ✅ Organische Bezier-Kurven
- ✅ Partikel-System mit Glow
- ✅ Organic Node-Layout
- ✅ Verbindungsstärke über Liniendicke
- ✅ Universe Theme mit Neon-Effekten

### Bar Chart (Fig 6.20)
- ✅ Automatische Sortierung
- ✅ Max-Wert hervorgehoben
- ✅ Referenzlinie (Durchschnitt)
- ✅ Trend-Indikatoren
- ✅ Change-Annotation

### Grouped Bar (Messi Chart, Oscar Chart)
- ✅ Mehrere Serien nebeneinander
- ✅ Automatische Serie-Erkennung
- ✅ Y-Achse mit Ticks
- ✅ Legende für Serien
- ✅ Werte auf Balken

### Lollipop Chart (Gender Pay Gap)
- ✅ Punkt am Ende der Linie
- ✅ Divergierende Daten um Baseline
- ✅ Automatische Sortierung
- ✅ Max-Highlighting (gelb)
- ✅ Positiv/Negativ Farbkodierung

### Scatterplot (Black Students, US Inequality)
- ✅ X/Y Koordinaten
- ✅ Lineare Regression (Trendlinie)
- ✅ Korrelationskoeffizient (r)
- ✅ Gruppierung nach Farbe
- ✅ Punkt-Labels

### Pictogram (Beards Chart)
- ✅ Icon-Wiederholung für Mengen
- ✅ Auto-Skalierung
- ✅ Standard-Icons pro Kategorie
- ✅ Partielle Icons für Reste
- ✅ Animation beim Erscheinen

### Bubble Chart (Fig 6.13, 6.14)
- ✅ Fläche proportional zum Wert
- ✅ Circle Packing Layout
- ✅ Labels in großen Bubbles
- ✅ Auto-Legende für kleine

### Boxplot (Fig 6.17, 6.18)
- ✅ 5-Number Summary
- ✅ IQR Box mit Gradient
- ✅ Median prominent
- ✅ Whiskers zu Min/Max

### Treemap (Fig 6.26)
- ✅ Flächenproportionale Tiles
- ✅ Change Colors (grün/rot)
- ✅ Hierarchische Gruppierung
- ✅ Labels in Tiles

### Stacked Bar (Fig 6.23-6.25)
- ✅ 100% Stacking
- ✅ Konsistente Segment-Farben
- ✅ Prozent-Labels
- ✅ Legende oben

### Dotplot (Fig 6.19)
- ✅ Jitter für Überlappung
- ✅ Median-Linie
- ✅ Grid-Lines
- ✅ Point Count

### Sunburst (Fig 6.28, 6.29)
- ✅ Konzentrische Ringe
- ✅ Winkel proportional
- ✅ Farbvererbung
- ✅ Center Label

### Sparkline
- ✅ Min/Max Punkte markiert
- ✅ Letzter Wert prominent
- ✅ Trend-Pfeil mit Prozent
- ✅ Fläche unter Kurve

### Network
- ✅ Organische Bezier-Kurven
- ✅ Node-Größe nach Intensität
- ✅ Farbkodierte Beziehungstypen
- ✅ Annotationen auf Kanten

### Stats
- ✅ Primäre Werte groß
- ✅ Sekundäre Werte gruppiert
- ✅ Sentiment-Farben
- ✅ Typ-basierte Gruppierung

### Radar (Fig 6.15)
- ✅ Spider-Web Grid
- ✅ Achsen-Labels
- ✅ Filled Area
- ✅ Multi-Dimensionen

### Gauge
- ✅ Farbzonen (Rot/Amber/Grün)
- ✅ Min/Max Labels
- ✅ Nadel-Animation
- ✅ Wert prominent

## Signatur

```javascript
function morph(wert, config, morphField) → HTMLElement
```

- `wert`: Rohdaten (beliebiger Typ)
- `config`: Morph-Konfiguration aus Schema
- `morphField`: Callback für rekursives Morphen (z.B. für list, object)

## Morph-Ordner

```
badge/, bar/, boolean/, boxplot/, bubble/, calendar/, 
citation/, comparison/, currency/, dosage/, dotplot/,
flow/, gauge/, groupedbar/, heatmap/, hierarchy/, image/,
interpreted/, kirk/, lifecycle/, link/, list/, lollipop/,
map/, network/, number/, object/, pictogram/, pie/, 
progress/, radar/, range/, rating/, scatterplot/, severity/, 
slopegraph/, sparkline/, stackedbar/, stats/, steps/, 
sunburst/, tag/, text/, timeline/, treemap/
```

## Erkennungsregeln (Pipeline)

Die Pipeline erkennt Morphs datengetrieben. Reihenfolge wichtig!

### Höchste Priorität (Session 2 - Flow als Design-Basis)
1. **flow** - `from/to` Paare oder `connections` Array
2. **scatterplot** - `x/y` Koordinaten oder 2+ numerische + Label
3. **groupedbar** - Kategorie + 2+ numerische Serien
4. **lollipop** - Ranking-Hinweis oder divergierende Werte
5. **pictogram** - `icon` + `count` oder kleine Mengen

### Session 1 Morphs
6. **bubble** - `size/value` für proportionale Kreise
7. **boxplot** - `min/q1/median/q3/max`
8. **treemap** - Hierarchische Werte mit `size`
9. **stackedbar** - Kategorien mit Teilen die sich summieren
10. **dotplot** - Kategorie mit einzelnen Punkten
11. **sunburst** - `parent/children` Hierarchie

### Objekt-Muster
12. **map** - `lat/lng` Koordinaten
13. **citation** - `author/year/title`
14. **dosage** - `dose/unit`
15. **gauge** - `value/min/max` mit Zonen
16. **stats** - `min/max/avg/median`

### Array-Muster
17. **sparkline** - Rein numerisches Array
18. **heatmap** - 2D-Matrix
19. **radar** - `axis/value` (min 3 Achsen)
20. **pie** - `label/value` (≤6 Items)
21. **bar** - `label/value` (>6 Items)

## Aliase

```javascript
primitives = {
  text,
  string: text,        // Alias
  sparkline,
  trend: sparkline,    // Alias
  hierarchy,
  tree: hierarchy,     // Alias
  slopegraph,
  slope: slopegraph,   // Alias
  heatmap,
  matrix: heatmap,     // Alias
  comparison,
  diff: comparison,    // Alias
  steps,
  process: steps,      // Alias
  lifecycle,
  phase: lifecycle,    // Alias
  network,
  graph: network,      // Alias
  severity,
  warning: severity,   // Alias
  calendar,
  season: calendar,    // Alias
  gauge,
  score: gauge,        // Alias
  citation,
  reference: citation, // Alias
  currency,
  money: currency,     // Alias
  dosage,
  dose: dosage         // Alias
}
```

## Prinzipien

1. **Keine Domain-Logik** - "Pilz", "Pflanze" verboten
2. **Reine Funktionen** - Kein State, keine Side-Effects
3. **Datengetrieben** - Struktur bestimmt Darstellung
4. **Kompakt** - Platzsparende Styles
5. **Kirk-konform** - Bewährte Visualisierungsprinzipien

> **Compare-Varianten**: Für jeden Primitive-Morph existiert ein Compare-Wrapper in `morphs/compare/primitives/`. Siehe `morphs/compare/CLAUDE.md`.

## Neuen Morph erstellen

1. Ordner: `primitives/meinmorph/`
2. JS: `primitives/meinmorph/meinmorph.js`
3. CSS: `primitives/meinmorph/meinmorph.css`
4. Export: In `primitives/index.js` hinzufügen

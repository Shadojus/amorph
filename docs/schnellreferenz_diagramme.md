# SCHNELLREFERENZ: LATERALE DIAGRAMME
## Übersichtstabelle aller Diagrammtypen

---

| # | DIAGRAMMTYP | VERWENDET FÜR | ACHSEN | SEITE | BEISPIEL |
|---|-------------|---------------|--------|-------|----------|
| 1 | **Balkendiagramm** | Kategorienvergleich | Y: Kategorien, X: Werte | 20, 24-27 | Messi Games & Goals |
| 2 | **Säulendiagramm** | Kategorien über Zeit | X: Zeit/Kategorien, Y: Werte | 33-35 | Housing Ownership UK |
| 3 | **Liniendiagramm** | Trends über Zeit | X: Zeit, Y: Werte | 20, 34, 54 | Per Capita Cheese |
| 4 | **Flächendiagramm** | Trends mit Volumen | X: Zeit, Y: Werte | 33, 54 | Housing stacked |
| 5 | **Punktdiagramm** | Präzise Werte | X/Y: Kategorien/Werte | 76-77, 80-81 | Racial Gap Colleges |
| 6 | **Scatterplot** | Korrelationen | X: Variable 1, Y: Variable 2 | 79, 89 | Wood dimensions |
| 7 | **Bubble Chart** | 3 Variablen | X: Var 1, Y: Var 2, Größe: Var 3 | 89 | OECD Life Index |
| 8 | **Slopegraph** | Vorher-Nachher | Links/Rechts: Zeitpunkte | 81 | Profitability change |
| 9 | **Small Multiples** | Mehrfach-Vergleich | Individuell pro Chart | 80-81, 84 | Y'all dialect map |
| 10 | **Choropleth Map** | Geografische Werte | Karte + Farbe | 83 | Land Neighbours |
| 11 | **Flow Map** | Geografische Flüsse | Karte + Linien | 86 | Migration/Trade |
| 12 | **Sankey Diagram** | Prozessflüsse | Knoten + Flüsse | 84, 86 | Election Funding |
| 13 | **Treemap** | Hierarchische Anteile | Verschachtelte Rechtecke | 89 | Market shares |
| 14 | **Sunburst** | Radiale Hierarchie | Konzentrische Kreise | 89 | Nested categories |
| 15 | **Heatmap** | Matrix-Werte | X: Kategorie 1, Y: Kategorie 2 | 89 | Correlation matrix |
| 16 | **Chord Diagram** | Beziehungen | Kreisförmig | 86 | Network flows |
| 17 | **Parallel Coordinates** | Multidimensional | Mehrere vertikale Achsen | 89 | Multi-variable |
| 18 | **Radar Chart** | Profile | Radiale Achsen | 89 | Skill profiles |
| 19 | **Box Plot** | Verteilungen | X: Kategorien, Y: Werte | - | Statistical dist. |
| 20 | **Violin Plot** | Dichte-Verteilungen | X: Kategorien, Y: Verteilung | - | Distribution comp. |

---

## KATEGORISIERUNG NACH ZWECK

### VERGLEICHE:
```
Balkendiagramm ████████████ (einfach)
Gruppiertes Balkendiagramm ████████ (mehrere Kategorien)
Divergierendes Balkendiagramm ██████ (Gegensätze)
Punktdiagramm ████████ (präzise Werte)
```

### ZEITREIHEN:
```
Liniendiagramm ████████████ (Trends)
Flächendiagramm ██████████ (Volumen über Zeit)
Gestapeltes Flächendiagramm ████████ (Mehrere Serien)
Streamgraph ██████ (Organische Flüsse)
```

### BEZIEHUNGEN:
```
Scatterplot ████████████ (Korrelation)
Bubble Chart ██████████ (3 Variablen)
Connection Plot ████████ (Netzwerke)
Sankey Diagram ██████ (Flüsse)
Chord Diagram ██████ (Zirkuläre Beziehungen)
```

### VERTEILUNGEN:
```
Histogramm ████████████ (Häufigkeit)
Box Plot ██████████ (Quartile)
Violin Plot ████████ (Dichte)
Ridgeline Plot ██████ (Mehrere Verteilungen)
```

### GEOGRAPHIE:
```
Choropleth Map ████████████ (Regionen einfärben)
Symbol Map ██████████ (Punkte auf Karte)
Flow Map ████████ (Geografische Flüsse)
Dot Density Map ██████ (Punktdichte)
```

### HIERARCHIEN:
```
Treemap ████████████ (Kompakt)
Sunburst ██████████ (Kreisförmig)
Circle Packing ████████ (Verschachtelte Kreise)
Dendrogram ██████ (Baumstruktur)
```

---

## KOMPLEXITÄTS-MATRIX

| Diagrammtyp | Einfachheit | Präzision | Ästhetik | Skalierbarkeit |
|-------------|-------------|-----------|----------|----------------|
| Balkendiagramm | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★★ |
| Liniendiagramm | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| Scatterplot | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Treemap | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| Sankey | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★☆☆☆ |
| Chord Diagram | ★★☆☆☆ | ★★☆☆☆ | ★★★★★ | ★★☆☆☆ |
| Parallel Coord. | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★☆ |
| Radar Chart | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |
| Small Multiples | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| Slopegraph | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |

---

## DIAGRAMM-AUSWAHL NACH VARIABLENANZAHL

### 1 VARIABLE:
- **Kategorisch:** Balkendiagramm
- **Kontinuierlich:** Histogramm, Box Plot

### 2 VARIABLEN:
- **Zeit + Wert:** Liniendiagramm
- **2 Kategorien:** Gruppiertes Balkendiagramm
- **2 Kontinuierliche:** Scatterplot
- **Kategorie + Wert:** Balkendiagramm

### 3 VARIABLEN:
- **Zeit + 2 Kategorien:** Small Multiples
- **3 Kontinuierliche:** Bubble Chart
- **Geografisch:** Choropleth + Symbol Size

### 4+ VARIABLEN:
- **Viele Dimensionen:** Parallel Coordinates
- **Profile:** Radar Chart
- **Hierarchisch:** Treemap, Sunburst
- **Netzwerk:** Chord Diagram

---

## TOOL-VERFÜGBARKEIT

| Diagrammtyp | Excel | Tableau | Python | R | D3.js |
|-------------|-------|---------|--------|---|-------|
| Balkendiagramm | ✅ | ✅ | ✅ | ✅ | ✅ |
| Liniendiagramm | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scatterplot | ✅ | ✅ | ✅ | ✅ | ✅ |
| Flächendiagramm | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bubble Chart | ✅ | ✅ | ✅ | ✅ | ✅ |
| Box Plot | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Heatmap | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Treemap | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Sankey | ❌ | ✅ | ✅ | ✅ | ✅ |
| Chord | ❌ | ⚠️ | ✅ | ✅ | ✅ |
| Sunburst | ❌ | ⚠️ | ✅ | ✅ | ✅ |
| Parallel Coord. | ❌ | ✅ | ✅ | ✅ | ✅ |
| Small Multiples | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Slopegraph | ❌ | ⚠️ | ✅ | ✅ | ✅ |

✅ = Native Support
⚠️ = Workaround möglich
❌ = Nicht verfügbar

---

## DATENGRÖSSE-EMPFEHLUNGEN

| Diagrammtyp | Optimal | Maximum | Performance |
|-------------|---------|---------|-------------|
| Balkendiagramm | 5-20 | 50 | ★★★★★ |
| Liniendiagramm | 10-100 | 1000+ | ★★★★★ |
| Scatterplot | 50-500 | 10000+ | ★★★★☆ |
| Bubble Chart | 20-100 | 500 | ★★★☆☆ |
| Heatmap | 10x10 | 50x50 | ★★★☆☆ |
| Treemap | 20-100 | 500 | ★★★★☆ |
| Sankey | 5-20 Knoten | 50 Knoten | ★★★☆☆ |
| Chord | 5-15 | 30 | ★★☆☆☆ |
| Small Multiples | 4-16 | 25 | ★★★★☆ |
| Parallel Coord. | 3-10 Achsen | 20 Achsen | ★★★☆☆ |

---

## KONTEXT-BASIERTE AUSWAHL

### PRÄSENTATIONEN (PowerPoint):
✅ **Empfohlen:**
- Balkendiagramm
- Liniendiagramm
- Einfache Säulen
- Klare Farben
- Große Schriften

❌ **Vermeiden:**
- Komplexe Netzwerke
- Zu viele Datenpunkte
- Kleine Labels
- Subtile Farben

### WEB-DASHBOARDS:
✅ **Empfohlen:**
- Interaktive Charts
- Tooltips
- Drill-downs
- Animations
- Small Multiples

✅ **Technologien:**
- D3.js
- Plotly
- Highcharts
- Chart.js

### PRINT (Reports):
✅ **Empfohlen:**
- Hochauflösende Grafiken
- Klare Kontraste
- Schwarz-Weiß-Optionen
- Direkte Labels
- Quellenangaben

❌ **Vermeiden:**
- Farbabhängige Infos
- Interaktive Elemente
- Animation-Konzepte

### WISSENSCHAFTLICHE PAPER:
✅ **Empfohlen:**
- Box Plots
- Scatterplots mit Stats
- Error Bars
- Präzise Achsen
- Quellenangaben

📊 **Standards:**
- IEEE
- APA
- Nature Guidelines

---

## FARBCODIERUNG-GUIDE

### KATEGORISCH (Unterschiedliche Dinge):
```
Farbe 1: #E41A1C (Rot)
Farbe 2: #377EB8 (Blau)
Farbe 3: #4DAF4A (Grün)
Farbe 4: #984EA3 (Lila)
Farbe 5: #FF7F00 (Orange)
Farbe 6: #FFFF33 (Gelb)
```

### SEQUENZIELL (Niedrig → Hoch):
```
Blues:
#F7FBFF → #DEEBF7 → #C6DBEF → #9ECAE1 → #6BAED6 → #4292C6 → #2171B5 → #08519C → #08306B

Greens:
#F7FCF5 → #E5F5E0 → #C7E9C0 → #A1D99B → #74C476 → #41AB5D → #238B45 → #006D2C → #00441B
```

### DIVERGIEREND (Negativ ← Neutral → Positiv):
```
RdBu (Rot-Blau):
#67001F → #B2182B → #D6604D → #F4A582 → #FDDBC7 → #F7F7F7 → #D1E5F0 → #92C5DE → #4393C3 → #2166AC → #053061
```

---

## TYPOGRAFIE-STANDARDS

### SCHRIFTGROSSEN:
```
Titel: 18-24pt (Bold)
Untertitel: 14-16pt (Regular)
Achsenbeschriftungen: 10-12pt (Regular)
Datenlabels: 9-11pt (Regular)
Fußnoten: 8-9pt (Italic)
```

### SCHRIFTARTEN:
**Web/Digital:**
- Sans-serif bevorzugt
- Roboto, Open Sans, Lato, Arial

**Print:**
- Serif für Titel optional
- Georgia, Times, Garamond
- Sans-serif für Datenlabels

### KONTRAST:
```
Schwarz auf Weiß: 21:1 (Optimal)
Dunkelgrau (#333) auf Weiß: 12:1 (Gut)
Mindestens: 4.5:1 (WCAG AA)
```

---

## INTERAKTIVITÄTS-FEATURES

### GRUNDLEGEND:
- ✅ Tooltips (Hover für Details)
- ✅ Zoom & Pan
- ✅ Click für Details
- ✅ Legende-Toggle

### ERWEITERT:
- ✅ Brushing & Linking
- ✅ Drill-down Hierarchien
- ✅ Zeitliche Animation
- ✅ Filter & Parameter
- ✅ Export-Funktionen

### WEB-SPEZIFISCH:
```javascript
// D3.js Tooltip Beispiel
.on("mouseover", function(d) {
    tooltip.style("visibility", "visible")
           .text(d.value);
})
.on("mouseout", function() {
    tooltip.style("visibility", "hidden");
});
```

---

## ACCESSIBILITY (BARRIEREFREIHEIT)

### FARBEN:
- ✅ Colorblind-safe Paletten verwenden
- ✅ Nicht nur auf Farbe verlassen
- ✅ Patterns zusätzlich zu Farben
- ✅ Kontrast-Ratio > 4.5:1

### TEXT:
- ✅ Alt-Text für Bilder
- ✅ ARIA-Labels für SVG
- ✅ Mindestgröße 10pt
- ✅ Klare Beschriftungen

### INTERAKTION:
- ✅ Keyboard-Navigation
- ✅ Screen-Reader kompatibel
- ✅ Fokus-Indikatoren
- ✅ Keine Farbabhängigkeit

### TOOLS ZUM TESTEN:
- Chrome DevTools (Accessibility)
- WAVE Browser Extension
- Color Oracle (Colorblindness Simulator)
- Contrast Checker

---

## HÄUFIGE FEHLER & FIXES

| FEHLER | FIX | BEISPIEL |
|--------|-----|----------|
| Säulen nicht bei 0 | Y-Achse bei 0 starten | Seite 34 vs. 35 |
| 3D-Effekte | 2D verwenden | - |
| Zu viele Farben | Max. 5-7 Farben | - |
| Kreisdiagramm >5 Slices | Balkendiagramm nutzen | - |
| Unleserliche Labels | Größere Schrift, Rotation | - |
| Fehlende Legende | Immer hinzufügen | - |
| Keine Quelle | Immer angeben | - |
| Chart Junk | Minimalistisch bleiben | Seite 30 |
| Falsche Skalierung | Proportional & konsistent | - |
| Zu komplex | Vereinfachen oder aufteilen | - |

---

## DESIGN-PROZESS CHECKLISTE

### 1. VERSTEHEN
- [ ] Daten analysiert?
- [ ] Zielgruppe definiert?
- [ ] Kernbotschaft klar?
- [ ] Kontext verstanden?

### 2. WÄHLEN
- [ ] Passender Diagrammtyp?
- [ ] Anzahl Variablen beachtet?
- [ ] Tool gewählt?
- [ ] Alternativen geprüft?

### 3. GESTALTEN
- [ ] Achsen sinnvoll?
- [ ] Farben gewählt?
- [ ] Schriften festgelegt?
- [ ] Layout optimiert?

### 4. VERFEINERN
- [ ] Titel hinzugefügt?
- [ ] Legende platziert?
- [ ] Quelle angegeben?
- [ ] Labels lesbar?

### 5. TESTEN
- [ ] Mit Zielgruppe getestet?
- [ ] Auf verschiedenen Devices?
- [ ] Feedback eingeholt?
- [ ] Iteriert?

### 6. VERÖFFENTLICHEN
- [ ] Qualitätskontrolle?
- [ ] Daten korrekt?
- [ ] Accessible?
- [ ] Dokumentiert?

---

## RESSOURCEN & WEITERFÜHRENDES

### BÜCHER:
1. **Data Visualisation** - Andy Kirk (2016) ⭐ Diese Analyse
2. **The Visual Display of Quantitative Information** - Edward Tufte
3. **Storytelling with Data** - Cole Nussbaumer Knaflic
4. **Information is Beautiful** - David McCandless

### ONLINE:
- **visualisingdata.com** - Andy Kirk's Blog
- **flowingdata.com** - Nathan Yau
- **informationisbeautiful.net** - David McCandless
- **eagereyes.org** - Robert Kosara

### TOOLS:
- **Tableau Public** - Kostenlos für öffentliche Viz
- **RAWGraphs** - Open Source, Web-basiert
- **DataWrapper** - Einfach, für Journalismus
- **Observable** - D3.js Notebooks

### DATASETS:
- **kaggle.com** - Machine Learning & Datasets
- **data.gov** - US Government Data
- **ourworldindata.org** - Global Statistics
- **gapminder.org** - World Development

### COMMUNITYS:
- **r/dataisbeautiful** - Reddit Community
- **Data Visualization Society** - Professional Network
- **#dataviz** - Twitter Community

---

## GLOSSAR

**Chart Junk:** Unnötige dekorative Elemente
**Data-Ink Ratio:** Verhältnis von Daten zu Tinte
**Gestalt Principles:** Visuelle Wahrnehmungsgesetze
**Preattentive Attributes:** Sofort erkennbare Merkmale
**Small Multiples:** Mehrere kleine Charts im Grid
**Faceting:** Aufteilen nach Kategorien
**Brushing:** Auswählen in einem Chart
**Linking:** Verbinden mehrerer Charts
**Drill-down:** In Details hineinzoomen
**Roll-up:** Zu Übersicht zurück

---

**Letzte Aktualisierung:** Dezember 2024
**Version:** 1.0
**Quelle:** Kirk, A. (2016). Data Visualisation. SAGE Publications.

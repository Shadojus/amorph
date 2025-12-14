# LATERALE DIAGRAMME - SEITE FÜR SEITE AUFBAUANLEITUNGEN
## Basierend auf: Data Visualisation - Andy Kirk (2016)

---

## SEITE 20: PER CAPITA CHEESE CONSUMPTION

### Diagrammtyp: ZEITREIHEN-LINIENDIAGRAMM

#### Was zeigt es:
Käsekonsum pro Kopf in den USA von ca. 1970-2010

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Achsen definieren**
- X-Achse: Zeitachse (Jahre 1970-2010)
- Y-Achse: Pfund Käse pro Person (0-35 lbs)
- Beide Achsen linear skaliert

**Schritt 2: Datenpunkte**
- Jedes Jahr = ein Datenpunkt
- Werte steigen kontinuierlich von ~12 lbs auf ~33 lbs

**Schritt 3: Linie zeichnen**
- Verbinde alle Punkte mit durchgehender Linie
- Liniendicke: 2-3px
- Farbe: Einfarbig (schwarz oder dunkelblau)

**Schritt 4: Styling**
- Titel: "Per Capita Cheese Consumption in the U.S."
- Gridlines: Horizontal, dezent
- Hintergrund: Weiß oder hellgrau
- Quelle angeben (Fortune magazine)

**Laterale Erkenntnisse:**
- Kontinuierlicher Aufwärtstrend erkennbar
- Keine großen Sprünge oder Einbrüche
- Fast verdreifachung in 40 Jahren

---

## SEITE 24-27: LIONEL MESSI - GAMES AND GOALS

### Diagrammtyp: GRUPPIERTES HORIZONTALES BALKENDIAGRAMM

#### Was zeigt es:
Spiele und Tore von Lionel Messi pro Saison (2004-2015) für FC Barcelona

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Y-Achse (Kategorien)**
- Saisonen von oben nach unten
- 2004/05 bis 2014/15
- Gleichmäßiger Abstand zwischen Jahren

**Schritt 2: X-Achse (Werte)**
- Skala: 0 bis 80
- Intervalle: 10er Schritte (0, 10, 20, 30, 40, 50, 60, 70, 80)
- Gridlines bei jedem Intervall

**Schritt 3: Balken gruppieren**
Pro Saison zwei Balken:
- **Oberer Balken (Blau):** Games/Spiele
- **Unterer Balken (Lila/Violett):** Goals/Tore
- Kleine Lücke zwischen den beiden Balken (~2-3px)
- Größere Lücke zwischen Saisongruppen (~8-10px)

**Schritt 4: Datenwerte (Beispiele)**
- 2004/05: ~10 Games, ~2 Goals
- 2008/09: ~45 Games, ~38 Goals
- 2011/12: ~55 Games, ~73 Goals (Peak!)
- 2014/15: ~55 Games, ~58 Goals

**Schritt 5: Farben**
- Games: Hellblau/Mittelblau (#5DA5DA oder ähnlich)
- Goals: Lila/Violett (#B276B2 oder ähnlich)
- Kontrast für gute Unterscheidbarkeit

**Schritt 6: Legende**
- Oben rechts oder über dem Diagramm
- Zwei farbige Rechtecke mit Labels "Games" und "Goals"

**Schritt 7: Titel & Annotations**
- Titel: "Lionel Messi: Games and Goals for FC Barcelona"
- Optional: Peak-Saison hervorheben

**Laterale Analyse:**
- 2011/12 ist die außergewöhnliche Peak-Saison
- Verhältnis Goals/Games zeigt Effizienz
- Karriereentwicklung sichtbar
- Drei Phasen: Aufbau (2004-08), Prime (2009-13), Reife (2014+)

---

## SEITE 33: HOUSING AND HOME OWNERSHIP

### Diagrammtyp: GESTAPELTES FLÄCHENDIAGRAMM (STACKED AREA CHART)

#### Was zeigt es:
Wohneigentumsverteilung in UK über Zeit

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Zeitachse (X-Achse)**
- Jahrzehnte oder Jahre
- Von links nach rechts
- Gleichmäßige Intervalle

**Schritt 2: Prozentachse (Y-Achse)**
- 0% bis 100%
- Oder absolute Zahlen
- Grid bei 25%, 50%, 75%

**Schritt 3: Kategorien definieren**
Verschiedene Wohnformen:
1. Owner Occupied (Eigentum)
2. Private Rented (Privat gemietet)
3. Social Rented (Sozialwohnung)
4. Andere

**Schritt 4: Flächen stapeln**
- Von unten nach oben
- Jede Kategorie als Fläche
- Unterste = größte oder wichtigste Kategorie
- Oberste = kleinste oder letzte Kategorie

**Schritt 5: Farben**
- Kontrastierende Farben
- Unterschiedliche Helligkeiten
- Beispiel:
  * Owner: Dunkelblau
  * Private Rent: Mittelblau
  * Social: Hellblau
  * Other: Grau

**Schritt 6: Linien zwischen Flächen**
- Dünne weiße oder schwarze Linien
- Trennung der Bereiche
- 1-2px dick

**Schritt 7: Labels**
- Direkt in Flächen wenn Platz
- Oder Legende separat
- Werte an wichtigen Punkten

**Laterale Erkenntnisse:**
- Verschiebung zwischen Eigentumsformen sichtbar
- Trends über Jahrzehnte
- Soziale Veränderungen erkennbar

---

## SEITE 34: GUN DEATHS IN FLORIDA

### Diagrammtyp: INVERTIERTES FLÄCHENDIAGRAMM (Kontrovers!)

#### Was zeigt es:
Todesfälle durch Schusswaffen in Florida nach "Stand Your Ground" Gesetz

#### Schritt-für-Schritt Aufbau (Original):

**Schritt 1: Achsen - UNKONVENTIONELL!**
- X-Achse: Jahre (2000-2010)
- Y-Achse: INVERTIERT! (Höhere Werte nach UNTEN)
- Dies ist intentional irreführend!

**Schritt 2: Fläche**
- Rot gefüllte Fläche
- Zeigt Anzahl der Todesfälle
- Fläche wächst nach unten = mehr Tote

**Schritt 3: Markierung**
- Vertikale Linie beim Gesetz (2005)
- "Stand Your Ground law takes effect"
- Auffällige Farbe

**Schritt 4: Daten**
- Vor 2005: ~500-600 Todesfälle
- Nach 2005: Anstieg auf ~800-900

**KRITIK AN DIESEM DESIGN:**
- Y-Achse invertiert = irreführend
- Wirkt wie Rückgang, ist aber Anstieg
- Schlechtes Beispiel für ethische Visualisierung

---

## SEITE 35: GUN DEATHS REDESIGN

### Diagrammtyp: KORREKTES LINIENDIAGRAMM

#### Was zeigt es:
Gleiche Daten, aber ethisch korrekt dargestellt

#### Schritt-für-Schritt Aufbau (Redesign):

**Schritt 1: Normale Y-Achse**
- Unten = 0 Todesfälle
- Oben = höhere Werte
- Korrekte Wahrnehmung

**Schritt 2: Linie statt Fläche**
- Einfache Linie
- Schwarz oder dunkelblau
- 2-3px dick

**Schritt 3: Markierung beibehalten**
- Vertikale Linie bei 2005
- Label für Gesetz
- Kontext wichtig

**Schritt 4: Klarheit**
- Trend nun korrekt sichtbar
- Anstieg nach oben = mehr Tote
- Intuitive Interpretation

**Laterale Lektion:**
- Gleiche Daten, unterschiedliche Wirkung
- Verantwortung des Visualisierers
- Ethik in Datenvisualisierung

---

## SEITE 54: VISUALISATION WORKFLOW

### Diagrammtyp: PROZESSDIAGRAMM

#### Was zeigt es:
Vier Stufen des Visualisierungsprozesses

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Vier Hauptbereiche**
1. **Formulating Your Brief** (Briefing formulieren)
2. **Working With Data** (Mit Daten arbeiten)
3. **Establishing Your Editorial Thinking** (Redaktionelles Denken)
4. **Developing Your Design Solution** (Design-Lösung entwickeln)

**Schritt 2: Layout**
- Vier Spalten oder Quadranten
- Von links nach rechts (zeitlich)
- Oder im Kreis (iterativ)

**Schritt 3: Verbindungen**
- Pfeile zwischen Stufen
- Rückwärts-Pfeile für Iterationen
- Feedback-Loops zeigen

**Schritt 4: Unter-Schritte**
Jede Hauptstufe enthält:
- Spezifische Aufgaben
- Fragen zu beantworten
- Outputs/Deliverables

**Schritt 5: Farben**
- Eine Farbe pro Hauptstufe
- Oder Graustufen für Professionalität
- Konsistente Farbcodierung

**Lateraler Workflow:**
1. **Brief:** Was? Warum? Für wen?
2. **Data:** Sammeln, säubern, transformieren
3. **Editorial:** Was zeigen? Wie erzählen?
4. **Design:** Welches Chart? Welche Farben?

---

## SEITE 77: RACIAL GAP (FIVETHIRTYEIGHT)

### Diagrammtyp: DOT PLOT MIT VERBINDUNGSLINIEN

#### Was zeigt es:
"Mizzou's Racial Gap Is Typical On College Campuses"

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Zwei vertikale Achsen**
- Links: Prozentsatz einer Gruppe
- Rechts: Prozentsatz anderer Gruppe
- Oder: Links = Institution, Rechts = Werte

**Schritt 2: Punkte platzieren**
- Jede Institution = Punktpaar
- Linker Punkt = Wert A
- Rechter Punkt = Wert B

**Schritt 3: Verbindungslinien**
- Linie zwischen den Punkten
- Steigung zeigt Differenz
- Steilheit = Größe des Gap

**Schritt 4: Farben**
- Punkte: Zwei unterschiedliche Farben
- Linien: Grau oder farbig nach Gap-Größe
- Hervorhebung: Mizzou in anderer Farbe

**Schritt 5: Sortierung**
- Nach Gap-Größe
- Oder alphabetisch
- Oder nach einer Achse

**Schritt 6: Annotations**
- Durchschnitt markieren
- Extreme Fälle labeln
- Titel und Quelle

**Laterale Insights:**
- Vergleich zwischen zwei Gruppen
- Distribution sichtbar
- Muster und Ausreißer erkennbar
- Mizzou im Kontext

---

## SEITE 79: DIMENSIONAL CHANGES IN WOOD

### Diagrammtyp: SCATTERPLOT MIT TRENDLINIE

#### Was zeigt es:
Beziehung zwischen zwei Variablen (Luis Carli, luiscarli.com)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Achsen definieren**
- X-Achse: Variable 1 (z.B. Feuchtigkeit)
- Y-Achse: Variable 2 (z.B. Holzausdehnung)
- Beide kontinuierlich

**Schritt 2: Datenpunkte platzieren**
- Jede Messung = ein Punkt
- Position nach X und Y Wert
- Punktgröße: 3-5px

**Schritt 3: Punktstil**
- Halbtransparent (Alpha 0.6-0.8)
- Einheitliche Farbe
- Oder farbcodiert nach Kategorie

**Schritt 4: Trendlinie hinzufügen**
- Lineare Regression
- Durchgehende Linie
- Andere Farbe als Punkte
- 2-3px dick

**Schritt 5: Optional: Konfidenzintervall**
- Schattierter Bereich um Trendlinie
- Zeigt Unsicherheit
- Sehr transparente Füllung

**Schritt 6: Grid und Labels**
- Dezentes Grid für Orientation
- Achsenbeschriftungen mit Einheiten
- R² Wert optional angeben

**Laterale Analyse:**
- Korrelation sichtbar
- Stärke der Beziehung
- Streuung der Daten
- Vorhersagekraft

---

## SEITE 80: Y'ALL, YOUSE AND YOU GUYS TALK

### Diagrammtyp: SMALL MULTIPLES - GEOGRAFISCHE KARTEN

#### Was zeigt es:
Dialektunterschiede in USA (Josh Katz, NY Times)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Grid-Layout**
- 3x3 oder 4x4 Raster
- Jede Zelle = eine Karte der USA
- Gleichgroße Karten

**Schritt 2: Basis-Karte**
- Umrisse der US-Bundesstaaten
- Oder Counties für mehr Detail
- Gleiche Projektion für alle

**Schritt 3: Farbcodierung**
- Pro Karte: eine Frage/Variable
- Farben zeigen häufigste Antwort
- Konsistente Farbskala über alle Karten

**Schritt 4: Karten-Titel**
- Frage über jeder Karte
- Z.B. "What do you call a sweetened carbonated beverage?"
- Kurz und klar

**Schritt 5: Legende**
- Eine gemeinsame Legende
- Oder individuelle pro Karte
- Antwortoptionen mit Farben

**Schritt 6: Layout-Details**
- Weißer Abstand zwischen Karten
- Konsistente Größe
- Reihenfolge nach Thema

**Laterale Erkenntnisse:**
- Geografische Muster erkennbar
- Regionale Unterschiede
- Nord-Süd / Ost-West Splits
- Kulturelle Regionen visualisiert

---

## SEITE 81: SPOTLIGHT ON PROFITABILITY

### Diagrammtyp: SLOPEGRAPH

#### Was zeigt es:
Veränderung von Profitabilität zwischen zwei Zeitpunkten (Krisztina Szűcs)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Zwei vertikale Achsen**
- Links: Zeitpunkt 1 (z.B. 2014)
- Rechts: Zeitpunkt 2 (z.B. 2015)
- Beide mit gleicher Skala

**Schritt 2: Y-Achse (Werte)**
- Profitabilität in %
- Oder Rankings
- Von oben (höchste) nach unten (niedrigste)

**Schritt 3: Punkte platzieren**
- Jedes Unternehmen = Punktpaar
- Links: Wert 2014
- Rechts: Wert 2015

**Schritt 4: Verbindungslinien**
- Linie zwischen den Punktpaaren
- Farbe nach Richtung:
  * Grün/Blau = Aufwärtstrend
  * Rot = Abwärtstrend
  * Grau = Stabil

**Schritt 5: Steigung interpretieren**
- Steile Linie nach oben = großer Gewinn
- Steile Linie nach unten = großer Verlust
- Flach = wenig Veränderung

**Schritt 6: Labels**
- Firmennamen an Endpunkten
- Werte optional
- Nur wichtigste labeln bei vielen Linien

**Laterale Insights:**
- Gewinner und Verlierer sofort sichtbar
- Magnitude der Veränderung
- Crossing Points zeigen Überholmanöver

---

## SEITE 83: COUNTRIES WITH MOST LAND NEIGHBOURS

### Diagrammtyp: CHOROPLETH MAP (THEMATISCHE KARTE)

#### Was zeigt es:
Anzahl der Nachbarländer pro Land

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Basiskarte**
- Weltkarte mit Ländergrenzen
- Projektion wählen (Mercator, Robinson, etc.)
- Alle Länder als Polygone

**Schritt 2: Daten vorbereiten**
- Anzahl Nachbarn pro Land zählen
- Kategorien bilden:
  * 0-1 Nachbarn
  * 2-3 Nachbarn
  * 4-6 Nachbarn
  * 7-9 Nachbarn
  * 10+ Nachbarn

**Schritt 3: Farbskala definieren**
- Sequenzielle Farbskala
- Hell (wenig Nachbarn) → Dunkel (viele Nachbarn)
- Beispiel: Hellblau → Dunkelblau
- Oder: Gelb → Orange → Rot

**Schritt 4: Länder einfärben**
- Jedes Land gemäß Anzahl Nachbarn
- Inseln/isolierte Länder hell
- China, Russland, Brasilien dunkel

**Schritt 5: Legende**
- Farbskala mit Zahlen
- Position: unten rechts oder links
- Klar beschriftet

**Schritt 6: Hervorhebungen**
- Top 5 Länder optional labeln
- Grenzen in Grau/Weiß
- Ozean in neutraler Farbe

**Laterale Erkenntnisse:**
- Kontinentale Länder = mehr Nachbarn
- Inselstaaten = wenig/keine Nachbarn
- Eurasien am komplexesten
- Afrika viele Binnengrenzen

---

## SEITE 84: PRESIDENTIAL ELECTION FUNDING

### Diagrammtyp: SANKEY DIAGRAM

#### Was zeigt es:
"Buying Power: The Families Funding the 2016 Presidential Election" (NY Times)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Ebenen definieren**
- Links: Geberfamilien
- Mitte: Parteien (Optional)
- Rechts: Kandidaten

**Schritt 2: Knoten erstellen**
- Jede Familie = Rechteck
- Jeder Kandidat = Rechteck
- Höhe proportional zu Gesamtsumme

**Schritt 3: Flüsse zeichnen**
- Von Familie zu Kandidat
- Breite = Geldmenge
- Bézierkurven für smooth flow
- Farbe = Quelle oder Ziel

**Schritt 4: Farbcodierung**
- Rot = Republikanisch
- Blau = Demokratisch
- Oder Regenbogen für Familien
- Transparenz für Überlappungen (Alpha 0.6)

**Schritt 5: Labels**
- Familiennamen an Knoten
- Kandidatennamen an Knoten
- Beträge optional bei großen Flüssen

**Schritt 6: Proportionen**
- Flussbreite exakt proportional
- Keine Lücken oder Überlappungen an Knoten
- Summe ein = Summe aus

**Laterale Insights:**
- Geldkonzentration sichtbar
- Wenige Familien, großer Einfluss
- Verzweigungen und Aufteilungen
- Komplexe Beziehungen vereinfacht

---

## SEITE 86: TEXAS CRIMINAL JUSTICE

### Diagrammtyp: FLOW MAP / CONNECTION DIAGRAM

#### Was zeigt es:
Flüsse durch das Justizsystem (Texas Department of Criminal Justice)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Prozessstufen definieren**
- Arrest (Verhaftung)
- Trial (Prozess)
- Conviction (Verurteilung)
- Sentencing (Strafmaß)
- Prison/Probation (Gefängnis/Bewährung)

**Schritt 2: Knoten platzieren**
- Von links nach rechts
- Oder von oben nach unten
- Chronologische Abfolge

**Schritt 3: Flüsse zeichnen**
- Breite = Anzahl Personen
- Verzweigungen zeigen Aufteilung
- Beispiel:
  * 100% Arrested
  * 70% to Trial
  * 30% Dismissed
  * 50% Convicted
  * etc.

**Schritt 4: Farben**
- Eine Farbe pro Outcome
- Grün = Freispruch
- Gelb = Bewährung
- Rot = Gefängnis
- Grau = Andere

**Schritt 5: Annotations**
- Prozentsätze bei Verzweigungen
- Absolute Zahlen optional
- Wichtige Splits hervorheben

**Schritt 6: Hintergrund**
- Optional: Zeitachse
- Oder Phasen-Bereiche
- Hilft bei Orientation

**Laterale Erkenntnisse:**
- Dropout-Raten sichtbar
- Bottlenecks erkennbar
- Systemdurchlauf verstehen
- Statistische Realität

---

## SEITE 89: OECD BETTER LIFE INDEX

### Diagrammtyp: MULTIPLE VISUALISIERUNGEN

#### Was zeigt es:
Lebensqualität-Metriken über Länder (Moritz Stefaner, Dominikus Baur, Raureif)

#### Mögliche Diagrammtypen auf dieser Seite:

### A) RADAR CHART
**Schritt-für-Schritt:**

1. **Achsen vom Zentrum**
   - 11 Dimensionen des Better Life Index
   - Jede = eine Achse
   - Gleichmäßig im Kreis verteilt (360°/11 ≈ 33°)

2. **Achsen beschriften**
   - Housing
   - Income
   - Jobs
   - Community
   - Education
   - Environment
   - Civic Engagement
   - Health
   - Life Satisfaction
   - Safety
   - Work-Life Balance

3. **Skalierung**
   - Jede Achse: 0 (Zentrum) bis 10 (außen)
   - Konzentrische Kreise für Grid

4. **Datenpunkte verbinden**
   - Wert pro Achse markieren
   - Punkte verbinden → Polygon
   - Fläche ausfüllen (transparent)

5. **Mehrere Länder vergleichen**
   - Verschiedene Farben
   - Überlappung mit Transparenz
   - Max. 3 Länder gleichzeitig

**Laterale Insights:**
- Form zeigt Profil
- Symmetrie = ausgewogene Entwicklung
- Spitzen = Stärken
- Einbuchtungen = Schwächen

---

### B) TREEMAP
**Schritt-für-Schritt:**

1. **Große Rechtecke = Länder**
   - Größe proportional zu Gesamt-Score
   - Oder Bevölkerung

2. **Verschachtelung**
   - Innerhalb: 11 Dimensionen
   - Jede Dimension = kleineres Rechteck
   - Größe = Score in dieser Dimension

3. **Farben**
   - Heatmap für Scores
   - Grün = hoher Score
   - Gelb = mittel
   - Rot = niedrig

4. **Layout-Algorithmus**
   - Squarified Treemap
   - Größte Rechtecke zuerst
   - Optimiert für Lesbarkeit

**Laterale Insights:**
- Auf einen Blick: Größenverhältnisse
- Innerhalb: Stärken und Schwächen
- Muster über Länder

---

### C) PARALLEL COORDINATES
**Schritt-für-Schritt:**

1. **Vertikale Achsen**
   - 11 Achsen nebeneinander
   - Eine pro Dimension
   - Gleicher Abstand

2. **Jede Achse skalieren**
   - 0-10 (oder normalisiert)
   - Gleiche Skalierung für alle

3. **Linien für Länder**
   - Jedes Land = eine Linie
   - Verbindet Werte über alle Achsen
   - Farbe = Land oder Region

4. **Interaktivität**
   - Hovern = Linie hervorheben
   - Brushing = Filter nach Werten
   - Klick = Details

**Laterale Insights:**
- Korrelationen zwischen Dimensionen
- Cluster von ähnlichen Ländern
- Ausreißer in einzelnen Dimensionen

---

## SEITE 89: LOSING GROUND (PROPUBLICA)

### Diagrammtyp: SCATTERPLOT MIT ANNOTATIONEN

#### Was zeigt es:
"Losing Ground" by Bob Marshall, The Lens, Brian Jacobs, Al Shaw (ProPublica)

#### Schritt-für-Schritt Aufbau:

**Schritt 1: Achsen**
- X-Achse: Eine Metrik (z.B. Landverlust in Acres)
- Y-Achse: Andere Metrik (z.B. Jahre oder Kosten)
- Beide kontinuierlich

**Schritt 2: Punkte**
- Jeder Punkt = ein Gebiet/Parish
- Position nach beiden Werten
- Größe ggf. für 3. Variable

**Schritt 3: Quadranten-Analyse**
- Vertikale Linie bei Median X
- Horizontale Linie bei Median Y
- Vier Quadranten:
  * Oben-Rechts: Hohes X, Hohes Y
  * Oben-Links: Niedriges X, Hohes Y
  * Unten-Rechts: Hohes X, Niedriges Y
  * Unten-Links: Niedriges X, Niedriges Y

**Schritt 4: Farben**
- Nach Quadrant oder Kategorie
- Kritische Bereiche hervorheben
- Rot = Problem-Zone
- Grün = Sicherer Bereich

**Schritt 5: Labels**
- Extreme Fälle labeln
- Namen wichtiger Punkte
- Callouts mit Linien

**Schritt 6: Kontext**
- Titel erklärt Kontext
- Trendlinie optional
- Referenzlinien für Durchschnitte

**Laterale Insights:**
- Risiko-Bereiche identifizieren
- Ausreißer erkennen
- Korrelation oder Kausalität?
- Storytelling mit Daten

---

## ZUSÄTZLICHE WICHTIGE SEITEN

### SEITE 22: THE THREE STAGES OF UNDERSTANDING

#### Diagrammtyp: KONZEPTUELLES FLUSSDIAGRAMM

**Drei Stufen:**
1. **PERCEIVING** (Wahrnehmen)
   - Visuelle Aufnahme
   - Was sehe ich?

2. **INTERPRETING** (Interpretieren)
   - Bedeutung ableiten
   - Was bedeutet es?

3. **COMPREHENDING** (Verstehen)
   - Vollständiges Verständnis
   - Warum ist es wichtig?

**Aufbau:**
- Drei Boxen oder Kreise
- Von links nach rechts
- Pfeile zwischen Stufen
- In jeder Box: Beschreibung der Aktivitäten

---

### SEITE 30: THREE PRINCIPLES OF GOOD DESIGN

#### Prinzipien:
1. **TRUSTWORTHY** (Vertrauenswürdig)
   - Genauigkeit
   - Transparenz
   - Keine Manipulation

2. **ACCESSIBLE** (Zugänglich)
   - Klar lesbar
   - Für Zielgruppe geeignet
   - Barrierefrei

3. **ELEGANT** (Elegant)
   - Ästhetisch ansprechend
   - Minimalistisch
   - Professionell

---

## ALLGEMEINE AUFBAU-PRINZIPIEN

### REIHENFOLGE DER SCHRITTE (UNIVERSAL):

1. **Daten verstehen**
   - Was habe ich?
   - Welcher Typ? (Kategorisch, kontinuierlich, zeitlich)
   - Wie viele Variablen?

2. **Ziel definieren**
   - Was will ich zeigen?
   - Vergleich? Trend? Beziehung? Verteilung?
   - Für wen?

3. **Diagrammtyp wählen**
   - Basierend auf Daten + Ziel
   - Siehe Entscheidungsbaum

4. **Achsen definieren**
   - Was auf X?
   - Was auf Y?
   - Skalierung?

5. **Daten visualisieren**
   - Balken, Linien, Punkte, etc.
   - Proportionen beachten

6. **Styling**
   - Farben
   - Schriften
   - Grid

7. **Kontext hinzufügen**
   - Titel
   - Achsenbeschriftungen
   - Legende
   - Quelle

8. **Verfeinern**
   - Testen mit Zielgruppe
   - Iterieren
   - Optimieren

---

## ENTSCHEIDUNGSBAUM: WELCHES DIAGRAMM?

```
START
|
├─ Zeige ich ZEIT?
│  ├─ Ja → 1 Variable?
│  │  ├─ Ja → LINIENDIAGRAMM
│  │  └─ Nein (2-3) → MEHRERE LINIEN oder FLÄCHENDIAGRAMM
│  │      └─ Mehr als 3 → SMALL MULTIPLES
│  │
│  └─ Nein ↓
│
├─ Zeige ich VERGLEICH?
│  ├─ Kategorien → BALKENDIAGRAMM
│  ├─ Gruppen → GRUPPIERTES BALKENDIAGRAMM
│  ├─ Anteile → GESTAPELTES BALKENDIAGRAMM oder TREEMAP
│  └─ Vorher/Nachher → SLOPEGRAPH
│
├─ Zeige ich BEZIEHUNG?
│  ├─ 2 Variablen → SCATTERPLOT
│  ├─ 3 Variablen → BUBBLE CHART
│  ├─ Netzwerk → CONNECTION DIAGRAM
│  └─ Flüsse → SANKEY
│
├─ Zeige ich VERTEILUNG?
│  ├─ Eine Variable → HISTOGRAMM
│  ├─ Mehrere Gruppen → BOX PLOT oder VIOLIN PLOT
│  └─ Über Zeit → RIDGELINE
│
├─ Zeige ich GEOGRAPHIE?
│  ├─ Regionen einfärben → CHOROPLETH MAP
│  ├─ Punkte an Orten → SYMBOL MAP
│  ├─ Dichte → DOT DENSITY MAP
│  └─ Flüsse zwischen Orten → FLOW MAP
│
└─ Zeige ich HIERARCHIE?
   ├─ Kompakt → TREEMAP
   ├─ Rund → SUNBURST
   └─ Netzwerk → DENDROGRAM
```

---

## TOOL-SPEZIFISCHE UMSETZUNGEN

### EXCEL/GOOGLE SHEETS:
1. Daten in Spalten
2. Insert → Chart
3. Typ wählen
4. Customize → Farben, Titel, Achsen
5. Export

### PYTHON (matplotlib/seaborn):
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Balkendiagramm
plt.figure(figsize=(10, 6))
plt.bar(categories, values)
plt.title("Titel")
plt.xlabel("X-Achse")
plt.ylabel("Y-Achse")
plt.show()
```

### D3.js:
```javascript
d3.select("svg")
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * 50)
  .attr("y", d => height - d)
  .attr("width", 40)
  .attr("height", d => d)
```

### TABLEAU:
1. Connect to Data
2. Drag Dimensions to Rows/Columns
3. Drag Measures to Marks
4. Choose Chart Type
5. Customize Colors, Labels
6. Add Filters, Parameters
7. Create Dashboard

---

## FARBPALETTEN-EMPFEHLUNGEN

### KATEGORISCH (6-8 Farben):
- **ColorBrewer Qualitative:**
  * Set1: #E41A1C, #377EB8, #4DAF4A, #984EA3, #FF7F00, #FFFF33
  * Set2: #66C2A5, #FC8D62, #8DA0CB, #E78AC3, #A6D854, #FFD92F

### SEQUENZIELL (Hell → Dunkel):
- **Blues:** #EFF3FF → #08519C
- **Greens:** #E5F5E0 → #00441B
- **Reds:** #FEE5D9 → #A50F15

### DIVERGIEREND (Zwei Enden):
- **RdBu:** #CA0020 (Rot) → #F7F7F7 (Weiß) → #0571B0 (Blau)
- **BrBG:** #8C510A (Braun) → #F5F5F5 (Grau) → #01665E (Grün)

---

## CHECKLISTE VOR VERÖFFENTLICHUNG

- [ ] Achsen bei 0? (bei Balken/Säulen)
- [ ] Alle Elemente beschriftet?
- [ ] Titel aussagekräftig?
- [ ] Quelle angegeben?
- [ ] Farben barrierefrei?
- [ ] Lesbare Schriftgrößen (min. 10pt)?
- [ ] Mobile/Print optimiert?
- [ ] Daten korrekt?
- [ ] Mit Zielgruppe getestet?
- [ ] Keine irreführenden Elemente?

---

**Ende der Seite-für-Seite Anleitungen**

Quelle: Kirk, A. (2016). Data Visualisation: A Handbook for Data Driven Design. SAGE Publications.

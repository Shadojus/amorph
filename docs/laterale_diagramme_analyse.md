# Laterale Diagramme - Vollständige Analyse
## Data Visualisation: A Handbook for Data Driven Design (Andy Kirk, 2016)

---

## INHALTSVERZEICHNIS

1. [Grundlegende Diagrammtypen](#grundlegende-diagrammtypen)
2. [Zeitbasierte Diagramme](#zeitbasierte-diagramme)
3. [Vergleichsdiagramme](#vergleichsdiagramme)
4. [Beziehungsdiagramme](#beziehungsdiagramme)
5. [Hierarchische Diagramme](#hierarchische-diagramme)
6. [Geografische Visualisierungen](#geografische-visualisierungen)
7. [Komplexe Visualisierungen](#komplexe-visualisierungen)

---

## GRUNDLEGENDE DIAGRAMMTYPEN

### 1. BALKENDIAGRAMM (Bar Chart)
**Seite:** 20, 24-27

#### Aufbau:
1. **Y-Achse:** Kategorien (z.B. Jahre, Namen, Gruppen)
2. **X-Achse:** Quantitative Werte
3. **Balken:** Horizontale Rechtecke von links (0) nach rechts
4. **Länge:** Proportional zum Wert

#### Gestaltungsprinzipien:
- Balken bei 0 beginnen lassen (niemals abschneiden!)
- Kategorien logisch sortieren (alphabetisch, nach Größe, chronologisch)
- Konsistente Farben verwenden
- Gitterlinien sparsam einsetzen
- Labels direkt an Balken anbringen wenn möglich

#### Anwendungsfälle:
- Vergleich von Kategorien
- Ranking-Darstellungen
- Zeitreihen mit wenigen Datenpunkten

#### Beispiel aus Buch:
**Lionel Messi: Games and Goals for FC Barcelona**
- Y-Achse: Spielsaisons (2004/05 bis 2014/15)
- X-Achse: Anzahl (0-80)
- Zwei Balken pro Saison: Games (blau) und Goals (lila)
- Zeigt Karriereentwicklung und Vergleich zwischen Spielen und Toren

---

### 2. SÄULENDIAGRAMM (Column Chart)
**Seite:** 33-35

#### Aufbau:
1. **X-Achse:** Kategorien oder Zeitperioden
2. **Y-Achse:** Quantitative Werte
3. **Säulen:** Vertikale Rechtecke von unten (0) nach oben
4. **Höhe:** Proportional zum Wert

#### Gestaltungsprinzipien:
- Y-Achse immer bei 0 starten
- Säulenbreite angemessen wählen (nicht zu schmal, nicht zu breit)
- Abstand zwischen Säulen: ca. 50% der Säulenbreite
- Bei gestapelten Säulen: konsistente Reihenfolge der Segmente

#### Varianten:
1. **Einfaches Säulendiagramm:** Eine Säule pro Kategorie
2. **Gruppiertes Säulendiagramm:** Mehrere Säulen pro Kategorie nebeneinander
3. **Gestapeltes Säulendiagramm:** Segmente übereinander
4. **100% Gestapelt:** Prozentuale Anteile

#### Beispiel aus Buch:
**Housing and Home Ownership in the UK**
- Vergleich verschiedener Wohntypen
- Zeitliche Entwicklung über mehrere Jahre
- Zeigt Trends in Wohneigentum

---

### 3. LINIENDIAGRAMM (Line Chart)
**Seite:** 34, 54

#### Aufbau:
1. **X-Achse:** Kontinuierliche Variable (meist Zeit)
2. **Y-Achse:** Quantitative Werte
3. **Linien:** Verbinden von Datenpunkten
4. **Datenpunkte:** Optional als Markierungen

#### Gestaltungsprinzipien:
- Für kontinuierliche Daten (Zeit, Temperatur, etc.)
- Liniendicke: 2-3px für Hauptlinien
- Mehrere Linien: unterschiedliche Farben oder Strichtypen
- Y-Achse nicht zwingend bei 0 (abhängig vom Kontext)
- Grid-Lines helfen bei Werteablesung

#### Wann verwenden:
- Zeitreihen
- Trends zeigen
- Kontinuierliche Veränderungen
- Mehrere Datenreihen vergleichen

#### Beispiel aus Buch:
**Falling Number of Young Homeowners (Daily Mail)**
- Zeigt Rückgang von Hauseigentümern über Zeit
- Trend deutlich erkennbar
- Emotionale Wirkung durch Abwärtstrend

---

### 4. FLÄCHENDIAGRAMM (Area Chart)
**Seite:** 54

#### Aufbau:
1. **Basis:** Wie Liniendiagramm
2. **Fläche:** Raum unter der Linie ist ausgefüllt
3. **Stapelung:** Optional mehrere Flächen übereinander

#### Gestaltungsprinzipien:
- Transparenz bei überlappenden Flächen (30-70% Opacity)
- Dunklere Farben für wichtigere Datenreihen
- Gestapelte Flächen: von groß nach klein ordnen
- Baseline immer sichtbar

#### Varianten:
1. **Einfaches Flächendiagramm**
2. **Gestapeltes Flächendiagramm** (Stacked Area)
3. **100% Gestapeltes Flächendiagramm** (Stream Graph)
4. **Überlappende Flächen** (mit Transparenz)

---

### 5. PUNKTDIAGRAMM (Dot Plot)
**Seite:** 76-77, 80-81

#### Aufbau:
1. **Achsen:** X und/oder Y für Kategorien oder Werte
2. **Punkte:** Einzelne Datenpunkte als Kreise/Punkte
3. **Position:** Entspricht den Werten
4. **Größe:** Optional proportional zu einem Wert

#### Gestaltungsprinzipien:
- Punktgröße: 4-8px für einzelne Punkte
- Bei Überlappung: Transparenz verwenden
- Konsistente Punktform
- Grid-Lines für präzise Werteablesung

#### Anwendungsfälle:
- Präzise Werte ablesen
- Viele Datenpunkte
- Kategorienvergleich ohne visuelle Masse

#### Beispiel aus Buch:
**Mizou's Racial Gap Is Typical On College Campuses (FiveThirtyEight)**
- Vergleich zwischen verschiedenen Gruppen
- Jeder Punkt = eine Institution
- Zeigt Verteilungen und Ausreißer

---

## ZEITBASIERTE DIAGRAMME

### 6. TIMELINE / GANTT CHART
**Seite:** 54

#### Aufbau:
1. **X-Achse:** Zeitachse (horizontal)
2. **Y-Achse:** Aktivitäten/Projekte/Ereignisse
3. **Balken:** Dauer von Start bis Ende
4. **Farben:** Kategorien oder Status

#### Gestaltungsprinzipien:
- Heute/Jetzt-Linie prominent markieren
- Meilensteine als Symbole
- Abhängigkeiten mit Pfeilen zeigen
- Zeitskalierung konsistent

#### Anwendungsfälle:
- Projektplanung
- Historische Ereignisse
- Prozessdarstellung
- Lebensläufe visuell

---

### 7. ZEITREIHEN MIT ANNOTATIONEN
**Seite:** 33-35

#### Aufbau:
1. **Basis:** Linien- oder Flächendiagramm
2. **Ereignis-Marker:** Vertikale Linien an wichtigen Punkten
3. **Labels:** Erklärungen zu Ereignissen
4. **Referenzlinien:** Durchschnitte, Ziele, etc.

#### Gestaltungsprinzipien:
- Annotationen sparsam verwenden
- Wichtige Ereignisse hervorheben
- Lesbare Schriftgröße (min. 10pt)
- Farbe für Kontext (rot = negativ, grün = positiv)

---

## VERGLEICHSDIAGRAMME

### 8. GRUPPIERTES BALKENDIAGRAMM
**Seite:** 24-27

#### Aufbau:
1. **Hauptkategorien:** Auf Y-Achse
2. **Unterkategorien:** Mehrere Balken pro Hauptkategorie
3. **Gruppierung:** Balken direkt nebeneinander
4. **Farben:** Eine Farbe pro Unterkategorie

#### Gestaltungsprinzipien:
- Max. 3-4 Unterkategorien
- Konsistente Reihenfolge der Balken
- Legende deutlich platzieren
- Abstand zwischen Gruppen > Abstand innerhalb

#### Beispiel:
Messi-Diagramm mit Games und Goals pro Saison

---

### 9. SMALL MULTIPLES / TRELLIS CHARTS
**Seite:** 80-81, 84

#### Aufbau:
1. **Grid-Layout:** Mehrere kleine Diagramme in Raster
2. **Gleiche Achsen:** Alle Diagramme mit identischer Skalierung
3. **Eine Variable pro Chart:** Verschiedene Kategorien/Regionen
4. **Konsistentes Design:** Alle Charts gleich gestaltet

#### Gestaltungsprinzipien:
- Achsenbeschriftung nur außen
- 2x2 bis 4x4 Grid optimal
- Trends durch Vergleich erkennbar
- Platz zwischen Charts lassen

#### Anwendungsfälle:
- Regionale Vergleiche
- Zeitvergleiche verschiedener Gruppen
- A/B-Testing Ergebnisse
- Kategorien vergleichen

#### Beispiel aus Buch:
**"How Y'all, Youse and You Guys Talk" (Josh Katz, NY Times)**
- Geografische Verteilung von Dialekten
- Jedes Small Multiple = eine Frage
- Muster über USA sichtbar

---

### 10. SLOPEGRAPH / BUMP CHART
**Seite:** 81

#### Aufbau:
1. **Zwei Zeitpunkte:** Links = Start, Rechts = Ende
2. **Vertikale Achsen:** Werte oder Rankings
3. **Linien:** Verbinden gleiche Entität von links nach rechts
4. **Steigung:** Zeigt Veränderung

#### Gestaltungsprinzipien:
- Nur 2-3 Zeitpunkte (sonst Liniendiagramm)
- Labels an beiden Enden
- Crossing Points vermeiden wenn möglich
- Steile Linien = große Veränderung

#### Anwendungsfälle:
- Vorher-Nachher-Vergleiche
- Ranking-Veränderungen
- Performance-Vergleiche

---

### 11. DIVERGIERENDES BALKENDIAGRAMM
**Seite:** 77-78

#### Aufbau:
1. **Zentrale Achse:** Meist bei 0 oder 50%
2. **Balken nach links:** Negative/Gruppe A
3. **Balken nach rechts:** Positive/Gruppe B
4. **Symmetrie:** Optional

#### Gestaltungsprinzipien:
- Zentrale Linie prominent
- Kontrastierende Farben (z.B. blau vs. rot)
- Labels beidseitig lesbar
- Sortierung nach Größe oder Thema

#### Anwendungsfälle:
- Umfrageergebnisse (Zustimmung/Ablehnung)
- Geschlechtervergleiche
- Gewinn/Verlust
- Altersverteilung (Bevölkerungspyramide)

---

## BEZIEHUNGSDIAGRAMME

### 12. SCATTERPLOT / STREUDIAGRAMM
**Seite:** 79, 89

#### Aufbau:
1. **X-Achse:** Variable 1
2. **Y-Achse:** Variable 2
3. **Punkte:** Jeder Punkt = eine Beobachtung
4. **Optional:** Punktgröße für 3. Variable (Bubble Chart)

#### Gestaltungsprinzipien:
- Beide Achsen skalieren
- Transparenz bei vielen Punkten (Alpha 0.5-0.7)
- Trendlinie optional hinzufügen
- Quadranten-Aufteilung für Interpretation

#### Erweiterte Techniken:
1. **Trendlinie:** Lineare Regression
2. **Konfidenzintervall:** Schattierter Bereich
3. **Kategorien:** Unterschiedliche Farben
4. **Größencodierung:** Dritte Variable

#### Anwendungsfälle:
- Korrelationen zeigen
- Cluster identifizieren
- Ausreißer erkennen
- Muster in Daten

#### Beispiel aus Buch:
**"Losing Ground" (ProPublica)**
- Zeigt Beziehung zwischen zwei Variablen
- Cluster und Trends erkennbar

---

### 13. BUBBLE CHART
**Seite:** 89

#### Aufbau:
1. **Basis:** Scatterplot
2. **Blasengröße:** Proportional zu 3. Variable
3. **Position:** X und Y wie Scatterplot
4. **Optional:** Farbe für 4. Variable

#### Gestaltungsprinzipien:
- Blasengröße: min. 10px, max. 100px
- Transparenz: 50-70%
- Labels bei großen Blasen innen
- Legende für Größenskala

#### Herausforderungen:
- Überlappung bei vielen Blasen
- Größenwahrnehmung ungenau
- Platzbedarf hoch

---

### 14. VERBINDUNGSDIAGRAMM (Connection Plot)
**Seite:** 86

#### Aufbau:
1. **Knoten:** Entitäten als Punkte
2. **Kanten:** Linien zwischen Knoten
3. **Gewichtung:** Liniendicke für Stärke
4. **Layout:** Optimiert für Lesbarkeit

#### Gestaltungsprinzipien:
- Wichtige Knoten größer
- Liniendicke = Beziehungsstärke
- Farben für Kategorien
- Minimale Überschneidungen

#### Anwendungsfälle:
- Netzwerkanalyse
- Flüsse zwischen Regionen
- Verbindungen zeigen
- Abhängigkeiten

---

### 15. CHORD DIAGRAM
**Seite:** 86

#### Aufbau:
1. **Kreis:** Kategorien am Umfang
2. **Bögen:** Verbindungen zwischen Kategorien
3. **Bogendicke:** Proportional zu Flussgröße
4. **Farben:** Herkunft oder Kategorie

#### Gestaltungsprinzipien:
- Kategorien logisch anordnen
- Farbverlauf für Flussrichtung
- Transparenz für Überlappungen
- Max. 12-15 Kategorien

#### Anwendungsfälle:
- Migration
- Handelsströme
- Kommunikationsmuster
- Geldflüsse

---

### 16. SANKEY DIAGRAM
**Seite:** 84, 86

#### Aufbau:
1. **Knoten:** Kategorien/Stufen
2. **Flüsse:** Breite proportional zu Menge
3. **Von links nach rechts:** Zeitliche/logische Abfolge
4. **Verzweigungen:** Aufteilung und Zusammenführung

#### Gestaltungsprinzipien:
- Flussbreite exakt proportional
- Farben für Quelle oder Kategorie
- Labels an Knoten
- Werte bei Flüssen angeben

#### Anwendungsfälle:
- Energieflüsse
- Budgetverteilung
- User Journeys
- Produktionsabläufe

#### Beispiel aus Buch:
**"Buying Power: The Families Funding the 2016 Presidential Election" (NY Times)**
- Geldflüsse von Familien zu Kandidaten
- Mehrere Ebenen und Verzweigungen
- Komplexe Beziehungen visualisiert

---

## HIERARCHISCHE DIAGRAMME

### 17. TREEMAP
**Seite:** 89

#### Aufbau:
1. **Rechtecke:** Jede Kategorie als Rechteck
2. **Größe:** Proportional zu Wert
3. **Verschachtelung:** Hierarchieebenen
4. **Farben:** Kategorien oder Werte

#### Gestaltungsprinzipien:
- Größte Kategorien zuerst
- Farbskala für Werte (z.B. Heatmap)
- Labels bei ausreichender Größe
- Grenzen zwischen Kategorien klar

#### Algorithmen:
1. **Squarified:** Optimiert für Quadrate
2. **Slice and Dice:** Abwechselnd horizontal/vertikal
3. **Strip:** Reihen-basiert

#### Anwendungsfälle:
- Marktanteile
- Dateigrößen
- Budgetaufteilung
- Portfolio-Übersicht

---

### 18. SUNBURST DIAGRAM
**Seite:** 89

#### Aufbau:
1. **Zentrum:** Wurzel der Hierarchie
2. **Ringe:** Hierarchieebenen von innen nach außen
3. **Segmente:** Proportional zu Wert
4. **Farben:** Kategorien

#### Gestaltungsprinzipien:
- Max. 3-4 Ebenen
- Zentrum prominent
- Labels radial oder tangential
- Interaktiv ideal (Drill-down)

#### Vorteile:
- Kompakt
- Hierarchie klar
- Ästhetisch ansprechend

#### Nachteile:
- Schwer zu vergleichen
- Äußere Ringe werden klein
- Nicht für alle verständlich

---

### 19. CIRCLE PACKING
**Seite:** 89

#### Aufbau:
1. **Kreise:** Jede Kategorie als Kreis
2. **Größe:** Proportional zu Wert
3. **Verschachtelung:** Kleinere Kreise in größeren
4. **Farben:** Kategorien oder Hierarchieebenen

#### Gestaltungsprinzipien:
- Klare Grenzen zwischen Kreisen
- Labels bei großen Kreisen
- Hierarchie durch Verschachtelung
- Platzverschwendung akzeptieren

---

## GEOGRAFISCHE VISUALISIERUNGEN

### 20. CHOROPLETH MAP (Thematische Karte)
**Seite:** 83

#### Aufbau:
1. **Grundkarte:** Geographische Grenzen
2. **Farbcodierung:** Werte pro Region
3. **Farbskala:** Kontinuierlich oder kategorisch
4. **Legende:** Farbzuordnung

#### Gestaltungsprinzipien:
- Sinnvolle Farbskala (z.B. ColorBrewer)
- 5-7 Farbstufen optimal
- Normalisierung beachten (pro Fläche/Einwohner)
- Labels für wichtige Regionen

#### Varianten:
1. **Sequenziell:** Ein Farbton, verschiedene Helligkeiten
2. **Divergierend:** Zwei Farbtöne mit Mittelpunkt
3. **Kategorisch:** Unterschiedliche Farben

#### Beispiel aus Buch:
**"Countries with the Most Land Neighbours"**
- Anzahl Nachbarländer farbcodiert
- Geografische Muster erkennbar

---

### 21. PROPORTIONAL SYMBOL MAP
**Seite:** 83

#### Aufbau:
1. **Grundkarte:** Geographie
2. **Symbole:** Kreise/Quadrate an Orten
3. **Größe:** Proportional zu Wert
4. **Position:** Zentroid oder exakter Ort

#### Gestaltungsprinzipien:
- Symbole skalieren (nicht Fläche!)
- Transparenz bei Überlappung
- Größenskala in Legende
- Max. 3 Größenordnungen

#### Anwendungsfälle:
- Bevölkerung
- Ereignisse an Orten
- Standorte mit Werten

---

### 22. DOT DENSITY MAP
**Seite:** 83

#### Aufbau:
1. **Punkte:** Jeder Punkt = X Einheiten
2. **Verteilung:** Zufällig in Gebieten
3. **Dichte:** Zeigt Konzentration
4. **Farben:** Optional für Kategorien

#### Gestaltungsprinzipien:
- Punktgröße: 1-2px
- Verhältnis klar kommunizieren (1 Punkt = 100 Personen)
- Gleichmäßige Verteilung innerhalb Gebieten
- Transparenz für Dichte-Effekt

---

### 23. FLOW MAP
**Seite:** 86

#### Aufbau:
1. **Grundkarte:** Geographie
2. **Pfeile/Linien:** Flüsse zwischen Orten
3. **Dicke:** Proportional zu Menge
4. **Richtung:** Durch Pfeil oder Farbverlauf

#### Gestaltungsprinzipien:
- Gebogene Linien für Ästhetik
- Transparenz für Überlappungen
- Farben für Quelle oder Ziel
- Animation optional für Zeit

#### Anwendungsfälle:
- Migration
- Warenverkehr
- Flugverbindungen
- Pendlerströme

---

## KOMPLEXE VISUALISIERUNGEN

### 24. HEATMAP / MATRIX PLOT
**Seite:** 89

#### Aufbau:
1. **Grid:** Zeilen und Spalten
2. **Zellen:** Farbcodiert nach Wert
3. **Achsen:** Kategorien
4. **Farbskala:** Kontinuierlich

#### Gestaltungsprinzipien:
- Divergierende Skala bei Positiv/Negativ
- Werte optional in Zellen
- Sortierung für Muster
- Max. 50x50 Grid

#### Anwendungsfälle:
- Korrelationsmatrizen
- Zeit x Kategorie (z.B. Wochentage x Stunden)
- Vergleichstabellen
- Clustering-Ergebnisse

---

### 25. PARALLEL COORDINATES
**Seite:** 89

#### Aufbau:
1. **Vertikale Achsen:** Eine pro Variable
2. **Linien:** Verbinden Werte eines Datensatzes
3. **Kreuzungen:** Zeigen Beziehungen
4. **Farben:** Kategorien oder Cluster

#### Gestaltungsprinzipien:
- 3-10 Achsen optimal
- Achsen-Reihenfolge wichtig
- Interaktivität ideal (Brushing & Linking)
- Transparenz für viele Linien

#### Anwendungsfälle:
- Multidimensionale Daten
- Cluster identifizieren
- Ausreißer erkennen
- Profile vergleichen

---

### 26. RADAR / SPIDER CHART
**Seite:** 89

#### Aufbau:
1. **Achsen:** Radial vom Zentrum
2. **Achsen-Anzahl:** 3-8 optimal
3. **Linien:** Verbinden Werte, bilden Polygon
4. **Fläche:** Optional ausgefüllt

#### Gestaltungsprinzipien:
- Achsen gleichmäßig verteilt
- Skalierung bei 0 beginnen
- Max. 3 Polygone übereinander
- Transparenz bei Überlappung

#### Anwendungsfälle:
- Skill-Profile
- Produktvergleiche
- Leistungsmetriken
- Qualitätsbewertungen

#### Kritik:
- Reihenfolge beeinflusst Form
- Flächenvergleich schwierig
- Nicht für viele Dimensionen

---

### 27. STREAMGRAPH
**Seite:** 54

#### Aufbau:
1. **Basis:** Gestapeltes Flächendiagramm
2. **Symmetrie:** Zentral um Mittellinie
3. **Fließende Formen:** Organisches Aussehen
4. **Farben:** Kategorien

#### Gestaltungsprinzipien:
- Glättung der Kurven
- Kontrastierende Farben
- Labels schwierig (Interaktivität hilft)
- Baseline variabel

#### Anwendungsfälle:
- Themen über Zeit
- Musikgenres
- Social Media Trends
- Organische Datenströme

---

### 28. ARC DIAGRAM
**Seite:** 86

#### Aufbau:
1. **Horizontale Linie:** Knoten aufgereiht
2. **Bögen:** Verbindungen über/unter Linie
3. **Bogenhöhe:** Optional gewichtet
4. **Reihenfolge:** Wichtig für Lesbarkeit

#### Gestaltungsprinzipien:
- Knoten logisch sortieren
- Bogendicke für Gewicht
- Farben für Kategorien
- Minimale Überschneidungen

#### Anwendungsfälle:
- Sequenzanalyse
- Soziale Netzwerke (einfach)
- Zeitliche Verbindungen

---

### 29. RIDGELINE PLOT (JOYPLOT)
**Seite:** Nicht explizit, aber verwandt mit Flächen

#### Aufbau:
1. **Stapel:** Mehrere Verteilungskurven
2. **Überlappung:** Teilweise übereinander
3. **Y-Position:** Jede Kurve auf eigener Höhe
4. **Füllung:** Optional

#### Gestaltungsprinzipien:
- Transparenz für Überlappung
- Gleiche X-Achse
- Sortierung chronologisch oder nach Größe
- Labels links

#### Anwendungsfälle:
- Verteilungen über Zeit
- Temperaturverläufe über Monate
- Dichten vergleichen

---

### 30. VIOLIN PLOT
**Seite:** Nicht explizit

#### Aufbau:
1. **Basis:** Box Plot
2. **Verteilung:** Gespiegelt an beiden Seiten
3. **Breite:** Proportional zu Dichte
4. **Box Plot:** Optional in Mitte

#### Gestaltungsprinzipien:
- Symmetrische Darstellung
- Box Plot für Quartile
- Punkte für Ausreißer
- Vergleich mehrerer Gruppen

#### Anwendungsfälle:
- Verteilungsvergleiche
- Statistische Analysen
- Multimodale Verteilungen zeigen

---

## SPEZIELLE DIAGRAMMTYPEN

### 31. WATERFALL CHART (Wasserfalldiagramm)
**Seite:** Nicht explizit, aber verwandt

#### Aufbau:
1. **Startwert:** Erste Säule
2. **Veränderungen:** Schwebende Balken
3. **Endwert:** Letzte Säule
4. **Verbindungen:** Linien zwischen Balken

#### Gestaltungsprinzipien:
- Positive Werte: grün/blau
- Negative Werte: rot/orange
- Subtotale prominent
- Labels mit Werten

#### Anwendungsfälle:
- Finanzielle Veränderungen
- Gewinn- und Verlustrechnung
- Schrittweise Berechnungen
- Bestandsveränderungen

---

### 32. MARIMEKKO CHART
**Seite:** Nicht explizit

#### Aufbau:
1. **Säulen:** Variable Breite
2. **Segmente:** Gestapelt in Säulen
3. **Breite:** Proportional zu Variable 1
4. **Höhe:** Proportional zu Variable 2

#### Gestaltungsprinzipien:
- Zwei Dimensionen gleichzeitig
- Prozentuale oder absolute Werte
- Konsistente Farben für Kategorien
- Komplexität beachten

#### Anwendungsfälle:
- Marktanalyse (Marktgröße × Marktanteil)
- Zweidimensionale Verteilungen

---

### 33. CALENDAR HEATMAP
**Seite:** Nicht explizit, aber verwandt mit Heatmap

#### Aufbau:
1. **Grid:** Tage als Zellen
2. **Wochen:** Zeilen
3. **Monate:** Spalten oder Sektionen
4. **Farbe:** Intensität des Werts

#### Gestaltungsprinzipien:
- Ein Jahr auf einen Blick
- Wochenenden hervorheben
- Farbskala deutlich
- Muster über Wochen/Monate erkennbar

#### Anwendungsfälle:
- GitHub Contributions
- Aktivitätsmuster
- Temperaturen
- Gewohnheits-Tracking

---

### 34. WORD CLOUD (Wortwolke)
**Seite:** Nicht explizit

#### Aufbau:
1. **Wörter:** Verschiedene Größen
2. **Größe:** Proportional zu Häufigkeit/Wichtigkeit
3. **Anordnung:** Optimiert für Platz
4. **Farben:** Optional kategorisch

#### Gestaltungsprinzipien:
- Lesbare Schriftgrößen (min. 10pt)
- Wichtigste Wörter zentral
- Max. 50-100 Wörter
- Kontrastreiche Farben

#### Kritik:
- Ungenau für Wertevergleiche
- Platzverschwendung
- Visuell ansprechend, analytisch schwach

#### Anwendungsfälle:
- Textzusammenfassungen
- Keyword-Übersichten
- Qualitative Daten

---

## INTERAKTIVE VISUALISIERUNGEN

### 35. ANIMATED TRANSITIONS
**Seite:** Mehrfach erwähnt

#### Prinzipien:
1. **Smooth Transitions:** Sanfte Übergänge
2. **Konstante Objekte:** Gleiche Elemente bleiben erkennbar
3. **Timing:** 300-600ms optimal
4. **Easing:** Nicht-linear (ease-in-out)

#### Anwendungsfälle:
- Zeitreihen animieren
- Sortierung zeigen
- Zustandsänderungen
- Storytelling

---

### 36. DRILL-DOWN HIERARCHIEN
**Seite:** 89

#### Prinzipien:
1. **Ebenen:** Schrittweise detaillierter
2. **Breadcrumbs:** Navigation zeigen
3. **Zoom:** Optional visuell zoomen
4. **Kontext:** Übergeordnete Ebene sichtbar

#### Anwendungsfälle:
- Treemaps
- Sunburst Diagramme
- Geografische Hierarchien
- Organisationsstrukturen

---

## DESIGN-PRINZIPIEN (ALLGEMEIN)

### Farbwahl:
1. **Kategorisch:** Unterschiedliche Farbtöne
2. **Sequenziell:** Ein Farbton, verschiedene Helligkeiten
3. **Divergierend:** Zwei Farbtöne mit Mittelpunkt
4. **Barrierefreiheit:** Colorblind-safe Paletten

### Typografie:
- **Titel:** 16-24pt, Bold
- **Achsenbeschriftungen:** 10-12pt
- **Datenlabels:** 9-11pt
- **Schriftart:** Sans-serif für digitale Medien

### Achsen:
- **Y-Achse bei 0:** Bei Balken/Säulen immer
- **Grid-Lines:** Sparsam, 20-30% Opacity
- **Ticks:** Alle 5er oder 10er Schritte
- **Labels:** Horizontal für Lesbarkeit

### Legende:
- **Position:** Rechts oder oben
- **Reihenfolge:** Wie im Diagramm
- **Direkte Labels:** Besser als separate Legende
- **Interaktiv:** Filtern durch Klick

---

## HÄUFIGE FEHLER VERMEIDEN

### 1. SÄULEN NICHT BEI 0 STARTEN
❌ **Falsch:** Y-Achse beginnt bei 50
✅ **Richtig:** Y-Achse beginnt bei 0
**Grund:** Verzerrte Proportionen

### 2. 3D-EFFEKTE
❌ **Falsch:** 3D-Säulen, 3D-Kreisdiagramme
✅ **Richtig:** 2D-Darstellung
**Grund:** Perspektive verzerrt Werte

### 3. ZU VIELE FARBEN
❌ **Falsch:** 15 verschiedene Farben
✅ **Richtig:** 5-7 Farben maximal
**Grund:** Überforderung, schlechte Unterscheidbarkeit

### 4. KREISDIAGRAMME MIT >5 SEGMENTEN
❌ **Falsch:** 12 Kuchenstücke
✅ **Richtig:** Balkendiagramm verwenden
**Grund:** Winkel schwer vergleichbar

### 5. DOPPELTE Y-ACHSEN
❌ **Falsch:** Links und rechts verschiedene Skalen
✅ **Richtig:** Zwei separate Diagramme oder normalisieren
**Grund:** Manipulation möglich

### 6. CHART JUNK
❌ **Falsch:** Dekorative Elemente, Schatten, Texturen
✅ **Richtig:** Minimalistisches Design
**Grund:** Ablenkung vom Inhalt

### 7. UNSORTIERTE KATEGORIEN
❌ **Falsch:** Alphabetisch ohne Grund
✅ **Richtig:** Nach Größe oder logisch sortiert
**Grund:** Muster nicht erkennbar

---

## DIAGRAMM-AUSWAHL-GUIDE

### ZEITREIHEN:
- **1 Variable:** Liniendiagramm
- **2-3 Variablen:** Mehrere Linien oder Flächendiagramm
- **>3 Variablen:** Small Multiples
- **Mit Ereignissen:** Annotierte Timeline

### VERGLEICHE:
- **Kategorien:** Balkendiagramm
- **Zeit + Kategorien:** Gruppierte Säulen
- **Anteile:** Gestapelte Balken oder Treemap
- **Rankings:** Sortiertes Balkendiagramm

### BEZIEHUNGEN:
- **2 Variablen:** Scatterplot
- **3 Variablen:** Bubble Chart
- **Netzwerk:** Connection Plot oder Chord Diagram
- **Flüsse:** Sankey Diagram

### VERTEILUNGEN:
- **Eine Variable:** Histogramm oder Box Plot
- **Mehrere Gruppen:** Violin Plot oder Ridgeline
- **Über Zeit:** Ridgeline Plot

### GEOGRAPHIE:
- **Regionen:** Choropleth Map
- **Punkte:** Proportional Symbol Map
- **Flüsse:** Flow Map
- **Dichte:** Dot Density Map

### HIERARCHIEN:
- **Kompakt:** Treemap
- **Kreisförmig:** Sunburst
- **Detailliert:** Circle Packing

---

## WERKZEUGE & RESSOURCEN

### Visualisierungs-Tools:
1. **Tableau:** Business Intelligence
2. **D3.js:** Web-basiert, hochflexibel
3. **Python:** matplotlib, seaborn, plotly
4. **R:** ggplot2
5. **Excel/Google Sheets:** Einfache Charts

### Farbpaletten:
1. **ColorBrewer:** Kartographie-optimiert
2. **Viridis:** Colorblind-safe
3. **Adobe Color:** Harmonische Paletten
4. **Coolors:** Generator

### Schriftarten:
1. **Roboto:** Google, Sans-serif
2. **Open Sans:** Vielseitig
3. **Lato:** Modern, lesbar
4. **Source Sans Pro:** Adobe

---

## ZUSAMMENFASSUNG

Dieses Dokument basiert auf **Data Visualisation: A Handbook for Data Driven Design** von Andy Kirk (2016) und deckt über 30 verschiedene Diagrammtypen ab, von grundlegenden Balkendiagrammen bis zu komplexen Sankey Diagrams.

**Wichtigste Prinzipien:**
1. **Klarheit vor Schönheit** - Die Botschaft muss klar sein
2. **Daten-Tinte-Ratio** - Minimiere unnötige Elemente
3. **Konsistenz** - Einheitliche Skalen, Farben, Schriften
4. **Kontext** - Achsen, Legenden, Titel sind essentiell
5. **Zielgruppe** - Anpassen an Wissensstand

**Auswahl-Prozess:**
1. Was will ich zeigen? (Vergleich, Trend, Beziehung, Verteilung)
2. Welche Daten habe ich? (Kategorisch, kontinuierlich, zeitlich)
3. Wie viele Variablen? (1, 2, 3+)
4. Welches Medium? (Print, Web, Präsentation)
5. Wer ist die Zielgruppe? (Experten, Allgemeinheit)

---

**Quellen:**
- Kirk, A. (2016). *Data Visualisation: A Handbook for Data Driven Design*. SAGE Publications.
- Alle Diagrammbeispiele aus dem genannten Buch, Seiten 1-175

**Letzte Aktualisierung:** 2024
**Version:** 1.0

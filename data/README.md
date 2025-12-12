# Testdaten Übersicht

Diese Datei dokumentiert die modulare Testdaten-Struktur für AMORPH v5.

## Struktur

```
data/
├── animalia/
│   ├── index.json                 # Sammlungs-Index
│   └── monarchfalter/             # Spezies-Ordner
│       ├── index.json             # Basis-Info + Perspektiven-Liste
│       ├── identification.json    # Taxonomie, Merkmale
│       ├── ecology.json           # Lebensraum, Ökologie
│       ├── geography.json         # Verbreitung, Migration
│       ├── conservation.json      # Schutzstatus, Bedrohungen
│       ├── chemistry.json         # Biochemie, Inhaltsstoffe
│       ├── temporal.json          # Lebenszyklus, Phänologie
│       ├── statistics.json        # Größen, Statistiken
│       ├── interactions.json      # Symbiosen, Prädation
│       ├── safety.json            # Toxizität, Warnhinweise
│       ├── research.json          # Forschung, Publikationen
│       ├── culture.json           # Kulturelle Bedeutung
│       ├── economy.json           # Wirtschaft, Handel
│       ├── medicine.json          # Medizinische Aspekte
│       ├── culinary.json          # Kulinarische Nutzung
│       └── cultivation.json       # Zucht, Anbau
│
├── fungi/
│   ├── index.json
│   └── steinpilz/
│       └── (15 Perspektiven-Dateien)
│
├── plantae/
│   ├── index.json
│   └── ginkgo/
│       └── (15 Perspektiven-Dateien)
│
└── bacteria/
    ├── index.json
    └── ecoli/
        └── (15 Perspektiven-Dateien)
```

## Kingdoms & Spezies

| Kingdom   | Spezies         | Wissenschaftlich      | Besonderheiten                |
|-----------|-----------------|----------------------|-------------------------------|
| Animalia  | Monarchfalter   | Danaus plexippus     | Migration, Timeline-Morph    |
| Fungi     | Steinpilz       | Boletus edulis       | Mykorrhiza, Kulinarik        |
| Plantae   | Ginkgo          | Ginkgo biloba        | Lebendes Fossil, Medizin     |
| Bacteria  | E. coli         | Escherichia coli     | Forschung, Biotechnologie    |

## Verwendete Morphs pro Perspektive

### identification.json
- `object` → Taxonomie-Hierarchie
- `list` → Synonyme, Merkmale
- `text` → Beschreibungen
- `boolean` → Eigenschaften (geschlechtsdimorphismus)

### ecology.json
- `range` → Höhenlage, pH, Temperatur `{min, max}`
- `number` → Einzelwerte mit Einheit
- `list` → Lebensräume, ökologische Funktionen
- `object` → Verschachtelte Anforderungen

### geography.json
- `list` → Regionen, Länder
- `object` → Verbreitungsdaten mit Koordinaten
- `text` → Beschreibungen

### conservation.json
- `badge` → IUCN-Status
- `progress` → Bedrohungsgrad (0-100)
- `list` → Maßnahmen
- `boolean` → Schutzstatus

### chemistry.json
- `pie` → Zusammensetzung
- `bar` → Nährwerte
- `number` → Messwerte
- `list` → Verbindungen

### temporal.json
- `timeline` → Lebenszyklus-Phasen
- `range` → Dauer-Spannen
- `object` → Phänologie

### statistics.json
- `stats` → Größenstatistiken `{min, max, durchschnitt, std_abweichung}`
- `range` → Messbereich
- `number` → Einzelwerte

### interactions.json
- `radar` → Interaktions-Intensitäten `{achse, wert}`
- `list` → Partner, Symbiosen
- `object` → Interaktionsdetails

### safety.json
- `progress` → Toxizitätsgrad
- `badge` → Warnhinweise
- `list` → Symptome, Maßnahmen
- `boolean` → Essbar/Giftig

### research.json
- `progress` → Forschungsintensität
- `list` → Publikationen, offene Fragen
- `number` → Statistiken

### culture.json
- `text` → Beschreibungen
- `list` → Kulturelle Aspekte
- `object` → Traditionen

### economy.json
- `range` → Preise `{min, max}`
- `bar` → Marktanteile
- `rating` → Handelswert
- `number` → Marktvolumen

### medicine.json
- `progress` → Evidenzgrad
- `list` → Anwendungen, Indikationen
- `text` → Empfehlungen

### culinary.json
- `boolean` → Essbar
- `rating` → Geschmacksprofil
- `number` → Bewertungen
- `list` → Rezepte, Gerichte

### cultivation.json
- `progress` → Schwierigkeitsgrad
- `range` → Anforderungen (Temperatur, pH, Licht)
- `list` → Methoden, Tipps

## Konfiguration

In `config/daten.yaml`:

```yaml
quelle:
  typ: json-perspektiven
  indexUrl: ./data/fungi/index.json
  baseUrl: ./data/fungi/
```

Zum Wechseln zwischen Kingdoms einfach den Pfad anpassen:
- `./data/animalia/` → Monarchfalter
- `./data/fungi/` → Steinpilz
- `./data/plantae/` → Ginkgo
- `./data/bacteria/` → E. coli

## Dateien-Statistik

- **Gesamt:** 68 JSON-Dateien
- **Pro Spezies:** 16 Dateien (1 Index + 15 Perspektiven)
- **Kingdoms:** 4
- **Perspektiven:** 15 pro Spezies

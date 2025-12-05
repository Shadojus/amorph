# Schema-Ordner

Modulares Schema-System für AMORPH. Trennt unveränderliche Basis-Konfiguration von anpassbaren Projekt-spezifischen Einstellungen.

## Übersicht

Das Schema-System ist die **Single Source of Truth** für alle Daten-Definitionen:
- Feld-Typen und Labels
- Semantische Suchregeln
- Perspektiven (Filter + Farben)
- Citation/Advertisement Metadaten

## Struktur

```
schema/
├── index.yaml            # Index und Dokumentation
├── basis.yaml            # Kern-System (NICHT ÄNDERN)
├── felder.yaml           # Feld-Definitionen (anpassbar)
├── semantik.yaml         # Such-Mappings (anpassbar)
└── perspektiven/         # Perspektiven (austauschbar)
    ├── index.yaml        # Aktive Perspektiven-Liste
    ├── kulinarisch.yaml
    ├── sicherheit.yaml
    ├── anbau.yaml
    ├── wissenschaft.yaml
    ├── medizin.yaml
    └── statistik.yaml
```

## Module

### basis.yaml (unveränderlich)
- Meta-Konfiguration (nameField, idField, bildField)
- Kern-Felder (id, slug, name, bild)
- Optionale Attribute (citation, advertisement)

### felder.yaml (anpassbar)
- Feld-Reihenfolge
- Feld-Definitionen mit Typ, Label, Suche
- Feld-spezifische Farben

### semantik.yaml (anpassbar)
- Keyword-Mappings für intelligente Suche
- Kategorien: Essbarkeit, Standort, Saison, Geschmack, Zubereitung

### perspektiven/index.yaml (Steuerung)
```yaml
aktiv:
  - kulinarisch
  - sicherheit
  - anbau
  - wissenschaft
  - medizin
  - statistik
```

### perspektiven/*.yaml (austauschbar)
Jede Perspektive als eigene Datei:
```yaml
id: kulinarisch
name: Kulinarisch
symbol: 🍳
farben: ['#4ade80', '#22c55e', '#16a34a', '#15803d']
felder: [essbarkeit, geschmack, zubereitung]
keywords: [essbar, essen, kochen, rezept]
```

## Optionale Feld-Attribute

Jedes Feld kann diese optionalen Metadaten haben:

```yaml
# In felder.yaml
wissenschaftlich:
  typ: string
  label: Wissenschaftlicher Name
  citation:
    quelle: "MycoBank"
    url: "https://www.mycobank.org"
    datum: "2024-01"
    autor: "Fungorum Index"
    lizenz: "CC-BY-SA"
  advertisement:
    sponsor: "Fungi Labs"
    typ: "sponsored_content"
    url: "https://sponsor.example.com"
    kampagne: "fungi-2024"
    kennzeichnung: true
```

## Neue Perspektive hinzufügen

1. Datei erstellen: `perspektiven/meine_perspektive.yaml`
2. ID zu aktiv hinzufügen: `perspektiven/index.yaml`

## Perspektive deaktivieren

ID aus `perspektiven/index.yaml` entfernen.

## Fallback

Wenn `schema/` nicht existiert, wird `schema.yaml` verwendet (Legacy-Modus).

## Prinzip

**Datengetrieben**: Morph-Typen werden aus der DATENSTRUKTUR erkannt, nicht im Schema definiert.

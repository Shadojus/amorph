# AMORPH Template

Minimales Starter-Template für neue AMORPH-Projekte.

## Schnellstart

1. **Template kopieren:**
   ```bash
   cp -r template/ mein-projekt/
   ```

2. **Schema anpassen** (`config/schema.yaml`):
   - Felder definieren
   - Semantische Suche konfigurieren
   - Perspektiven festlegen

3. **Daten erstellen** (`data/items.json`):
   - Array von Objekten
   - Felder entsprechend Schema

4. **Server starten:**
   ```bash
   npx serve -p 3000
   ```

## Dateien

```
template/
├── index.html          ← Einstiegspunkt
├── config/
│   ├── manifest.yaml   ← App-Metadaten
│   ├── daten.yaml      ← Datenquelle
│   ├── schema.yaml     ← Feldstruktur & Suche
│   ├── morphs.yaml     ← Darstellungs-Config
│   ├── features.yaml   ← Feature-Aktivierung
│   └── observer.yaml   ← Debug-Config
└── data/
    └── items.json      ← Beispieldaten
```

## Anpassung

### 1. Schema definieren

```yaml
# config/schema.yaml
felder:
  titel:
    typ: string
    suche:
      gewicht: 100
  
  kategorie:
    typ: tag
    suche:
      gewicht: 50

semantik:
  wichtig:
    keywords: [wichtig, priorität, dringend]
    feld: kategorie
    werte: [wichtig, urgent]
    score: 50

perspektiven:
  details:
    name: Details
    symbol: 📋
    felder: [beschreibung, notizen]
    keywords: [detail, info, mehr]
```

### 2. Daten erstellen

```json
[
  {
    "id": 1,
    "titel": "Erstes Item",
    "kategorie": "wichtig",
    "beschreibung": "Eine Beschreibung"
  }
]
```

### 3. Morphs konfigurieren

```yaml
# config/morphs.yaml
felder:
  titel: text
  kategorie: tag

config:
  tag:
    farben:
      wichtig: "#ef4444"
      normal: "#3b82f6"
```

## Beispiel-Projekte

- **Pilze** (Standard): Pilz-Datenbank
- **Bücher**: Buchsammlung
- **Rezepte**: Kochrezepte
- **Produkte**: Produktkatalog

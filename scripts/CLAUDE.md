# Scripts

Validierungs- und Index-Scripts für das AMORPH Daten-System.

## Dateien

| Script | Zeilen | Zweck | NPM Command |
|--------|--------|-------|-------------|
| `validate.js` | 593 | JSON-Daten gegen Blueprints validieren | `npm run validate` |
| `build-index.js` | 164 | Universe-Index aus Ordnern generieren | `npm run build:index` |

---

## validate.js (593 Zeilen)

Automatische Zod-Schema-Generierung aus Blueprint-YAML-Dateien.
Validiert alle JSON-Daten gegen die definierten Morph-Typen.

### Usage

```bash
npm run validate              # Alle Daten validieren
npm run validate:list         # Verfügbare Perspektiven + Feld-Counts
npm run validate:stats        # Morph-Typ Statistiken

# Direkt mit Node:
node scripts/validate.js              # Alle validieren
node scripts/validate.js -s steinpilz # Einzelne Spezies
node scripts/validate.js -p culinary  # Nur eine Perspektive
node scripts/validate.js --list       # Perspektiven auflisten
node scripts/validate.js --stats      # Morph-Typ Statistiken
```

### Funktionsweise

1. Liest alle `*.blueprint.yaml` aus `config/schema/perspektiven/blueprints/`
2. Parst Morph-Typ Kommentare (`# morph: badge` oder `morph: badge` in Objekten)
3. Generiert Zod-Schemas basierend auf den Morph-Typen
4. Validiert alle JSON-Dateien in `data/{kingdom}/{species}/`

### Output

```
🔍 AMORPH Daten-Validierung

📋 15 Perspektiven, 4427 Felder

📁 Prüfe animalia/alpine-marmot...
   ✓ index.json
   ✓ conservation.json
   ✓ ecology.json
   ...

══════════════════════════════════════════
✅ 11 Dateien geprüft
✅ 0 Fehler
✅ 0 Warnungen
══════════════════════════════════════════
```

### Morph-Schemas

Der Validator kennt alle 43 Primitive Morph-Typen:

| Kategorie | Morphs |
|-----------|--------|
| Primitives | text, number, boolean, tag, badge, link, image |
| Rating | rating, progress, severity, dosage, gauge |
| Charts | bar, pie, radar, sparkline, heatmap, treemap, sunburst |
| Complex | list, steps, timeline, lifecycle, network, hierarchy |
| Stats | stats, comparison, boxplot, scatterplot, dotplot |
| Special | map, citation, currency, object |

---

## build-index.js (164 Zeilen)

Scannt alle Spezies-Ordner und erstellt `universe-index.json`.
Das Frontend lädt nur diese eine Datei beim Start = schneller Initial-Load.

### Usage

```bash
npm run build:index           # Index generieren
node scripts/build-index.js   # Direkt
```

### Funktionsweise

1. Scannt `data/{kingdom}/` Ordner (fungi, plantae, animalia, bacteria)
2. Liest `index.json` jeder Spezies
3. Erkennt verfügbare Perspektiven (JSON-Dateien)
4. Generiert `data/universe-index.json`
5. Aktualisiert Kingdom-Indexes (`data/{kingdom}/index.json`)

### Output

```
🔨 Building Universe Index...

  🍄 Fungi: 0 species
  🌿 Plantae: 1 species
  🦋 Animalia: 1 species
  🦠 Bacteria: 0 species

✅ Universe index created: data/universe-index.json
   2 species total across 4 kingdoms
```

### Generierte Dateien

```
data/
├── universe-index.json       ← Haupt-Index (Frontend lädt nur diese)
├── animalia/index.json       ← Kingdom-Index
├── bacteria/index.json
├── fungi/index.json
└── plantae/index.json
```

---

## NPM Scripts

Definiert in `package.json`:

```json
{
  "scripts": {
    "validate": "node scripts/validate.js",
    "validate:list": "node scripts/validate.js --list",
    "validate:stats": "node scripts/validate.js --stats",
    "build:index": "node scripts/build-index.js"
  }
}
```

---

## Workflow

### Neue Spezies hinzufügen

```bash
# 1. Ordner erstellen
mkdir data/fungi/steinpilz

# 2. index.json erstellen (Core-Daten)
# 3. Perspektiven-JSON erstellen (siehe Blueprints)

# 4. Validieren
npm run validate

# 5. Index aktualisieren
npm run build:index
```

### Für Claude-Agenten

1. Blueprints lesen: `config/schema/perspektiven/blueprints/*.blueprint.yaml`
2. JSON-Dateien erstellen
3. `npm run validate` ausführen
4. `npm run build:index` ausführen

---

## Abhängigkeiten

| Package | Version | Zweck |
|---------|---------|-------|
| `zod` | ^4.2.1 | Schema-Validierung |
| `js-yaml` | ^4.1.1 | Blueprint-Parsing |

---

## Architektur

Das System verwendet **reine JSON-Dateien** (keine Datenbank):

```
data/
├── universe-index.json       ← Index für Frontend (Lazy Loading)
└── {kingdom}/
    └── {species}/
        ├── index.json        ← Core-Daten
        └── {perspective}.json ← Perspektiven-Daten
```

Vorteile:
- KI-Agenten können Dateien direkt lesen/schreiben
- Git-versionierbar
- Human-readable
- Kein Server-Setup nötig

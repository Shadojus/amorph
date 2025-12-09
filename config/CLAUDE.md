# Konfiguration

Eine Datei = Ein Aspekt. YAML als Single Source of Truth.

## Dateien

```
config/
├── manifest.yaml   ← App-Name, Version, Titel
├── daten.yaml      ← Datenquelle (JSON-Pfad)
├── morphs.yaml     ← Morph-Config, Typ-Erkennung
├── features.yaml   ← Aktive Features
├── observer.yaml   ← Debug, Analytics
└── schema/         ← Modulares Schema-System
    ├── basis.yaml      ← Kern-Konfiguration
    ├── felder.yaml     ← ~200 Feld-Definitionen
    ├── semantik.yaml   ← Such-Mappings
    └── perspektiven/   ← 17 Perspektiven-Dateien
```

## Schema-System (17 Perspektiven)

### perspektiven/index.yaml

```yaml
aktiv:
  - kulinarisch
  - sicherheit
  - anbau
  - wissenschaft
  - medizin
  - statistik
  - chemie
  - sensorik
  - oekologie
  - temporal
  - geografie
  - wirtschaft
  - naturschutz
  - kultur
  - forschung
  - interaktionen
  - visual
```

### Perspektiven-Datei (z.B. chemie.yaml)

```yaml
id: chemie
name: Chemie
symbol: 🧪
farben: ['#9f7aea', '#805ad5', '#6b46c1', '#553c9a']
beschreibung: Chemische Zusammensetzung und Stoffwechsel
felder:
  - chemie_primaer_metabolite
  - chemie_sekundaer_metabolite
  - chemie_volatilome
  - chemie_enzyme
```

## Datengetriebene Erkennung

Pipeline erkennt Morphs automatisch aus Datenstruktur:

| Datenstruktur | Erkannter Morph |
|---------------|-----------------|
| `{ min: 0, max: 10 }` | `range` |
| `{ min, max, avg }` | `stats` |
| `[{ axis, value }]` (3+) | `radar` |
| `"essbar"` (keyword) | `badge` |
| `4.5` (0-10, dezimal) | `rating` |

## Neue Perspektive hinzufügen

1. Datei erstellen: `config/schema/perspektiven/meine_perspektive.yaml`
2. ID zu `perspektiven/index.yaml` hinzufügen
3. Felder in `felder.yaml` definieren
4. CSS in `styles/perspektiven.css` hinzufügen
5. Compare-Morph in `themes/pilze/morphs/compare/` erstellen

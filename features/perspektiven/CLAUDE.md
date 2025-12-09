# Feature: Perspektiven

17 verschiedene Blickwinkel auf dieselben Daten.

## Übersicht

Das Perspektiven-Feature bietet:
- **17 Perspektiven** mit Multi-Color Glow
- 4-Farben-Grid pro Perspektive (aus schema/perspektiven/*.yaml)
- Auto-Aktivierung bei relevanten Suchergebnissen
- Keywords aus Schema für Auto-Detection
- Badges in Suchleiste für aktive Perspektiven
- **Modulares System**: Perspektiven aus einzelnen YAML-Dateien

**Hinweis**: Die Perspektiven-Logik ist primär in `features/header/index.js` implementiert.

## 17 Perspektiven

| ID | Name | Symbol | Farbe |
|----|------|--------|-------|
| kulinarisch | Kulinarisch | 🍳 | Grün |
| sicherheit | Sicherheit | ⚠️ | Rot |
| anbau | Anbau | 🌱 | Braun |
| wissenschaft | Wissenschaft | 🔬 | Blau |
| medizin | Medizin | 💊 | Türkis |
| statistik | Statistik | 📊 | Grau |
| chemie | Chemie | 🧪 | Violett |
| sensorik | Sensorik | 👃 | Orange |
| oekologie | Ökologie | 🌿 | Grün |
| temporal | Temporal | ⏰ | Indigo |
| geografie | Geografie | 🗺️ | Blau |
| wirtschaft | Wirtschaft | 💰 | Gold |
| naturschutz | Naturschutz | 🛡️ | Rot |
| kultur | Kultur | 📜 | Braun |
| forschung | Forschung | 📚 | Cyan |
| interaktionen | Interaktionen | 🔗 | Magenta |
| visual | Visual | 🎨 | Rainbow |

## Config aus schema/perspektiven/

```
config/schema/perspektiven/
├── index.yaml        # Liste der 17 aktiven Perspektiven
├── kulinarisch.yaml
├── sicherheit.yaml
├── anbau.yaml
├── wissenschaft.yaml
├── medizin.yaml
├── statistik.yaml
├── chemie.yaml       # NEU
├── sensorik.yaml     # NEU
├── oekologie.yaml    # NEU
├── temporal.yaml     # NEU
├── geografie.yaml    # NEU
├── wirtschaft.yaml   # NEU
├── naturschutz.yaml  # NEU
├── kultur.yaml       # NEU
├── forschung.yaml    # NEU
├── interaktionen.yaml # NEU
└── visual.yaml       # NEU
```

## Neue Perspektive hinzufügen

1. Neue YAML-Datei erstellen: `config/schema/perspektiven/meine_perspektive.yaml`
2. ID zu `index.yaml` hinzufügen
3. Felder zu `felder.yaml` hinzufügen
4. CSS zu `styles/perspektiven.css` hinzufügen
5. Compare-Morph in `themes/pilze/morphs/compare/` erstellen

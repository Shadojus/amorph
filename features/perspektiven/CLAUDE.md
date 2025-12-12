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
| culinary | culinary | 🍳 | Grün |
| safety | safety | ⚠️ | Rot |
| cultivation | cultivation | 🌱 | Braun |
| wissenschaft | Wissenschaft | 🔬 | Blau |
| medicine | medicine | 💊 | Türkis |
| statistics | statistics | 📊 | Grau |
| chemistry | chemistry | 🧪 | Violett |
| sensorik | Sensorik | 👃 | Orange |
| ecology | Ökologie | 🌿 | Grün |
| temporal | Temporal | ⏰ | Indigo |
| geography | geography | 🗺️ | Blau |
| economy | economy | 💰 | Gold |
| conservation | conservation | 🛡️ | Rot |
| culture | culture | 📜 | Braun |
| research | research | 📚 | Cyan |
| interactions | interactions | 🔗 | Magenta |
| visual | Visual | 🎨 | Rainbow |

## Config aus schema/perspektiven/

```
config/schema/perspektiven/
├── index.yaml        # Liste der 17 aktiven Perspektiven
├── culinary.yaml
├── safety.yaml
├── cultivation.yaml
├── wissenschaft.yaml
├── medicine.yaml
├── statistics.yaml
├── chemistry.yaml       # NEU
├── sensorik.yaml     # NEU
├── ecology.yaml    # NEU
├── temporal.yaml     # NEU
├── geography.yaml    # NEU
├── economy.yaml   # NEU
├── conservation.yaml  # NEU
├── culture.yaml       # NEU
├── research.yaml    # NEU
├── interactions.yaml # NEU
└── visual.yaml       # NEU
```

## Neue Perspektive hinzufügen

1. Neue YAML-Datei erstellen: `config/schema/perspektiven/meine_perspektive.yaml`
2. ID zu `index.yaml` hinzufügen
3. Felder zu `felder.yaml` hinzufügen
4. CSS zu `styles/perspektiven.css` hinzufügen

**Kein Theme-Code nötig!** smartCompare erkennt Typen automatisch.

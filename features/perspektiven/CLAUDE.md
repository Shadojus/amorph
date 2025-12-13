# Feature: Perspektiven

15 verschiedene Blickwinkel auf Pilzdaten.

## 15 Perspektiven

| ID | Symbol | Farbe |
|----|--------|-------|
| chemistry | 🧪 | Violett |
| conservation | 🛡️ | Rot |
| culinary | 🍳 | Grün |
| cultivation | 🌱 | Braun |
| culture | 📜 | Braun |
| ecology | 🌿 | Grün |
| economy | 💰 | Gold |
| geography | 🗺️ | Blau |
| identification | 🔍 | Grau |
| interactions | 🔗 | Magenta |
| medicine | 💊 | Türkis |
| research | 📚 | Cyan |
| safety | ⚠️ | Rot |
| statistics | 📊 | Grau |
| temporal | ⏰ | Indigo |

## Config

```
config/schema/perspektiven/
├── index.yaml        ← Aktive Liste
├── chemistry.yaml
├── conservation.yaml
└── ...
```

## Neue Perspektive

1. YAML in `config/schema/perspektiven/`
2. ID zu `index.yaml` hinzufügen
3. CSS zu `styles/perspektiven/` hinzufügen

**Kein Theme-Code nötig!** smartCompare erkennt automatisch.

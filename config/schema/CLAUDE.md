# Schema-Ordner

Modulares Schema-System für AMORPH mit 17 Perspektiven.

## Übersicht

Das Schema-System ist die **Single Source of Truth** für alle Daten-Definitionen:
- Feld-Typen und Labels (~200 Felder)
- Semantische Suchregeln
- 17 Perspektiven (Filter + Farben)

## Struktur

```
schema/
├── index.yaml            # Index und Dokumentation
├── basis.yaml            # Kern-System (NICHT ÄNDERN)
├── felder.yaml           # ~200 Feld-Definitionen
├── semantik.yaml         # Such-Mappings
└── perspektiven/         # 17 Perspektiven
    ├── index.yaml        # Aktive Perspektiven-Liste
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

## Neue Perspektive hinzufügen

1. Datei erstellen: `perspektiven/meine_perspektive.yaml`
2. ID zu `index.yaml` hinzufügen
3. Felder zu `felder.yaml` hinzufügen
4. CSS zu `styles/perspektiven.css` hinzufügen
5. Compare-Morph in `themes/pilze/morphs/compare/` erstellen

## Perspektive deaktivieren

ID aus `perspektiven/index.yaml` entfernen (Datei kann bleiben).

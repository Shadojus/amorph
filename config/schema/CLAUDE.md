# Schema

Data-driven modulares Schema-System.

## Struktur

```
schema/
├── index.yaml        ← Dokumentation
├── basis.yaml        ← Kern-Konfiguration
├── semantik.yaml     ← Such-Mappings
└── perspektiven/     ← 15 Perspektiven (self-contained)
    ├── index.yaml    ← Aktive Perspektiven-Liste
    ├── chemistry.yaml
    ├── conservation.yaml
    ├── culinary.yaml
    ├── cultivation.yaml
    ├── culture.yaml
    ├── ecology.yaml
    ├── economy.yaml
    ├── geography.yaml
    ├── identification.yaml
    ├── interactions.yaml
    ├── medicine.yaml
    ├── research.yaml
    ├── safety.yaml
    ├── statistics.yaml
    └── temporal.yaml
```

## Perspektiven-Datei Format

```yaml
id: my_perspective
name: My Perspective
symbol: 🔮
farben:
  - "rgba(r, g, b, 0.65)"
felder:
  - field_name_1
  - field_name_2
keywords:
  - suchbegriff
```

## Neue Perspektive

1. YAML-Datei erstellen in `perspektiven/`
2. ID zu `perspektiven/index.yaml` hinzufügen
3. CSS zu `styles/perspektiven/` hinzufügen

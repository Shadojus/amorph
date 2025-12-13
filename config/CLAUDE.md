# Config

YAML als Single Source of Truth.

## Dateien

```
config/
├── manifest.yaml   ← App-Name, Version
├── daten.yaml      ← Datenquelle (JSON-Pfad)
├── morphs.yaml     ← Morph-Config, Typ-Erkennung
├── features.yaml   ← Aktive Features
├── observer.yaml   ← Debug-Config
└── schema/         ← Modulares Schema-System
    ├── basis.yaml
    ├── index.yaml
    ├── semantik.yaml
    └── perspektiven/   ← 15 Perspektiven-Dateien
```

## Schema-System

Perspektiven definieren ihre eigenen Felder:

```yaml
# perspektiven/chemistry.yaml
id: chemistry
name: Chemie
symbol: 🧪
farben: ['#9f7aea', '#805ad5', '#6b46c1', '#553c9a']
felder:
  - chemistry_primaer_metabolite
  - chemistry_sekundaer_metabolite
  - chemistry_enzyme
```

## Neue Perspektive

1. `config/schema/perspektiven/name.yaml` erstellen
2. ID zu `perspektiven/index.yaml` hinzufügen
3. CSS zu `styles/perspektiven/name.css` hinzufügen

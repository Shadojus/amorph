# Config

YAML als Single Source of Truth.

## Dateien

| Datei | Zweck |
|-------|-------|
| `manifest.yaml` | App-Name, Version |
| `daten.yaml` | Datenquelle (JSON-Pfad) |
| `morphs.yaml` | Morph-Config, Typ-Erkennung |
| `features.yaml` | Aktive Features |
| `observer.yaml` | Debug-Config |

## Schema-System

```
schema/
├── basis.yaml       ← Kern-Felder
├── semantik.yaml    ← Suche, Farben, Schwellwerte
└── perspektiven/    ← 15 Perspektiven-Definitionen
```

### semantik.yaml

```yaml
visuell:
  farben:
    kritisch: "#f44336"
    warnung: "#ff9800"
    positiv: "#4caf50"
  schwellwerte:
    standard: [30, 70]
```

## Neue Perspektive

1. YAML erstellen: `schema/perspektiven/name.yaml`
2. ID hinzufügen: `perspektiven/index.yaml`
3. CSS erstellen: `styles/perspektiven/name.css`

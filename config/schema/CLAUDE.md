# Schema

Modulares Schema-System.

## Struktur

```
schema/
├── basis.yaml        ← Kern-Felder (id, name, slug)
├── semantik.yaml     ← Suche, Farben, Schwellwerte
└── perspektiven/     ← 15 Perspektiven
    ├── index.yaml    ← Aktive Liste
    ├── chemistry.yaml
    ├── ecology.yaml
    └── ...
```

## semantik.yaml

```yaml
visuell:
  farben:
    kritisch: "#f44336"
    warnung: "#ff9800"  
    positiv: "#4caf50"
  schwellwerte:
    standard: [30, 70]      # <30 kritisch, >70 positiv
    invertiert: [70, 30]    # Umgekehrt für Toxizität
```

## Perspektiven-Format

```yaml
id: chemistry
name: Chemie
symbol: 🧪
farben: ['#9f7aea', '#805ad5']
felder:
  - chemistry_primaer_metabolite
  - chemistry_sekundaer_metabolite
keywords:
  - metabolit
  - enzym
```

## Neue Perspektive

1. YAML erstellen: `perspektiven/name.yaml`
2. ID hinzufügen: `perspektiven/index.yaml`
3. CSS erstellen: `styles/perspektiven/name.css`

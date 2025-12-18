# Feature: Einzelansicht

Detail-Seite für einzelne Items.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Detail-Rendering |
| `einzelansicht.css` | Detail-Styles |

## Route

```
/:slug → /alpine-marmot, /deadly-nightshade
```

## Features

- SEO-freundliche URLs (slug-basiert)
- Zurück-Button zur Übersicht
- Alle Felder automatisch gerendert
- Nach Perspektiven gruppiert
- Perspektiven-Filter aktiv

## Perspektiven-Gruppierung

```
🧪 Chemie
├── Primäre Metabolite
└── Sekundäre Metabolite

🌿 Ökologie
├── Symbiose-Partner
└── Habitat

💊 Medizin
├── Wirkstoffe
└── Dosierung
```

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `amorph:route-change` | IN | Navigation zu Item |
| `perspektiven:geaendert` | IN | Perspektiven-Filter |

## Datenfluss

1. Route `/:slug` erkannt
2. `dataSource.getBySlug(slug)` → Item laden
3. Item-Felder nach aktiven Perspektiven filtern
4. Gruppiert rendern

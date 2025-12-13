# Feature: Einzelansicht

Vollständige Pilz-Detailseite.

## Route

```
/:slug → /steinpilz, /pfifferling, /shiitake
```

## Features

- SEO-freundliche URLs
- Zurück-Button zur Übersicht
- Alle Felder automatisch gerendert
- Nach Perspektiven gruppiert

## Perspektiven-Gruppierung

```
🧪 Chemie
├── Primäre Metabolite
├── Sekundäre Metabolite
└── Enzyme

🌿 Ökologie
├── Symbiose-Partner
└── Habitat
```

## CSS

- `.amorph-einzelansicht` - Container
- `.einzelansicht-header` - Header + Zurück
- `.einzelansicht-bild` - Großes Bild
- `.einzelansicht-felder` - Feld-Grid
- `.einzelansicht-perspektive` - Perspektiven-Gruppe

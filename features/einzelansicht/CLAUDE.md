# Feature: Einzelansicht

Vollständige Pilz-Detailseite als eigene Page.

## Übersicht

- **Route**: `/:slug` (SEO-freundlich)
- **Zurück**: Button zur Übersicht
- **Datengetrieben**: Alle Felder werden automatisch gerendert

## URL-Schema

```
/steinpilz     → Einzelansicht Steinpilz
/pfifferling   → Einzelansicht Pfifferling
```

## CSS-Klassen

- `.amorph-einzelansicht` - Container
- `.einzelansicht-header` - Header mit Zurück-Button
- `.einzelansicht-bild` - Großes Bild
- `.einzelansicht-beschreibung` - Beschreibungstext
- `.einzelansicht-felder` - Grid der Feld-Sections
- `.einzelansicht-feld` - Einzelnes Feld

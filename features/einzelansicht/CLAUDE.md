# Feature: Einzelansicht

Vollständige Pilz-Detailseite als eigene Page.

## Übersicht

- **Route**: `/:slug` (SEO-freundlich)
- **Zurück**: Button zur Übersicht
- **Datengetrieben**: Alle Felder werden automatisch gerendert
- **17 Perspektiven**: Felder gruppiert nach Perspektive

## URL-Schema

```
/steinpilz     → Einzelansicht Steinpilz
/pfifferling   → Einzelansicht Pfifferling
/shiitake      → Einzelansicht Shiitake
```

## Perspektiven-Gruppierung

Felder werden nach ihren Perspektiven gruppiert angezeigt:

```
🧪 Chemie
├── Primäre Metabolite
├── Sekundäre Metabolite
└── Enzyme

👃 Sensorik
├── Aroma-Profil
├── Geschmack
└── Textur
```

## CSS-Klassen

- `.amorph-einzelansicht` - Container
- `.einzelansicht-header` - Header mit Zurück-Button
- `.einzelansicht-bild` - Großes Bild
- `.einzelansicht-beschreibung` - Beschreibungstext
- `.einzelansicht-felder` - Grid der Feld-Sections
- `.einzelansicht-feld` - Einzelnes Feld
- `.einzelansicht-perspektive` - Perspektiven-Gruppe

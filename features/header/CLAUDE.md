# Feature: Header

App-Header mit Branding, Suche, Perspektiven, Auswahl.

## Layout

| Zeile | Inhalt |
|-------|--------|
| 0 | Branding (Logo + Bifroest) |
| 1 | Suche + Aktive-Filter-Badges + Ansicht-Switch |
| 2 | 15 Perspektiven-Buttons |
| 3 | Ausgewählte Pilze (Badges mit ×) |

## Features

- **Live-Suche**: Mit Debounce
- **15 Perspektiven**: Toggle-Buttons
- **Auswahl-Badges**: Links zur Einzelansicht, × zum Entfernen
- **Glass-Design**: Transparenter Header mit Blur

## Events

**Emittiert:**
- `header:suche:ergebnisse`
- `perspektiven:geaendert`
- `amorph:ansicht-wechsel`
- `amorph:remove-from-selection`

**Hört auf:**
- `amorph:auswahl-geaendert`
- `amorph:auto-search`

## CSS

- `.amorph-header` - Glass-Container
- `.amorph-suche-wrapper` - Suchzeile
- `.amorph-perspektiven` - Perspektiven-Grid
- `.amorph-auswahl-badge` - Pilz-Badge mit Glass

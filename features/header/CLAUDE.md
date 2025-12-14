# Feature: Header

App-Header mit Branding, Suche, Perspektiven, Auswahl.

## Layout

| Zeile | Inhalt |
|-------|--------|
| 0 | Branding (Logo) |
| 1 | Suche + Ansicht-Switch |
| 2 | 15 Perspektiven-Buttons |
| 3 | Ausgewählte Items |

## Events

**Emittiert:**
- `header:suche:ergebnisse`
- `perspektiven:geaendert`
- `amorph:ansicht-wechsel`

**Hört auf:**
- `amorph:auswahl-geaendert`

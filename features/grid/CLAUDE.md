# Feature: Grid

Glasmorphism-Karten-Layout für die Hauptansicht.

## Übersicht

Das Grid-Feature bietet:
- Layouts: Liste, Grid, Kompakt
- **Black Glasmorphism Design**
- **Perspektiven-Feld-Visibility**: Zeigt/versteckt Felder basierend auf aktiven Perspektiven
- Layout wird auf `[data-amorph-container]` via `data-layout` gesetzt

## Glasmorphism

```css
.glass-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Perspektiven-Integration

Felder haben `data-perspektive-*` Attribute:

```html
<amorph-container 
  data-field="chemistry_primaer_metabolite"
  data-perspektive-chemistry="true">
```

Bei aktiver Perspektive werden nur zugehörige Felder angezeigt.

## Layouts

| Layout | Beschreibung | Icon |
|--------|--------------|------|
| `liste` | Vertikal, ein Element pro Zeile | ☰ |
| `grid` | Karten-Layout, mehrere Spalten | ⊞ |
| `kompakt` | Minimale Höhe, dichte Darstellung | ▤ |

## Feld-Auswahl

- Jedes Feld in einer Card ist klickbar
- Klick auf Feld → Event `amorph:feld-auswahl` mit `{pilzId, feldName, wert}`
- Ausgewählte Felder bekommen `.feld-ausgewaehlt` Klasse
- Perspektiven-Glow verstärkt sich bei Auswahl

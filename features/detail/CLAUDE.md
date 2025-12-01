# Feature: Detail (Pinboard)

Ausgewählte Daten als interaktive Pinnwand.

## Konzept

Das Pinboard ist eine **visuelle Arbeitsfläche** für ausgewählte Daten:
- Daten werden als "Pins" (Karten) dargestellt
- Pins können **gruppiert** werden (nach Pilz, Feld, Perspektive)
- Pins sind **drag & drop** repositionierbar
- **Verbindungslinien** zeigen Beziehungen
- **Zoom & Pan** für große Sammlungen

## Gruppierungsmodi

| Modus | Icon | Beschreibung |
|-------|------|--------------|
| Pilz | 🍄 | Alle Felder eines Pilzes zusammen |
| Feld | 📋 | Gleiche Felder verschiedener Pilze zusammen |
| Perspektive | 👁️ | Nach Perspektiven-Zugehörigkeit |
| Frei | ✨ | Jeder Pin einzeln, frei positionierbar |

## Layout

```
┌─────────────────────────────────────────────────┐
│ [🍄][📋][👁️][✨]   [−][100%][+][⊡]   [🗑️ Leeren]│  ← Toolbar
├─────────────────────────────────────────────────┤
│                                                 │
│    ┌──────────┐         ┌──────────┐           │
│    │ Steinpilz │←───────→│Pfifferling│          │
│    │ ┌──┐┌──┐ │         │ ┌──┐┌──┐ │          │
│    │ │Pin││Pin│ │         │ │Pin││Pin│ │          │
│    │ └──┘└──┘ │         │ └──┘└──┘ │          │
│    └──────────┘         └──────────┘           │
│           ↘                 ↙                  │
│            ┌──────────┐                        │
│            │ Temperatur│  ← Gemeinsames Feld   │
│            │ 15-25°C   │                       │
│            └──────────┘                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Interaktionen

- **Klick auf Gruppen-Header** → Drag zum Repositionieren
- **Mausrad + Shift** → Pan (verschieben)
- **Mausrad + Ctrl** → Zoom
- **[⊡] Button** → Zoom zurücksetzen, alles zeigen
- **[🗑️] Button** → Auswahl leeren

## CSS Klassen

```css
.amorph-pinboard              /* Haupt-Container */
.amorph-pinboard-toolbar      /* Toolbar oben */
.amorph-pinboard-canvas       /* Scroll-Container */
.amorph-pinboard-content      /* Transform-Container (zoom/pan) */
.amorph-pinboard-connections  /* SVG für Linien */

.amorph-pin-gruppe            /* Gruppen-Container */
.amorph-pin-gruppe-header     /* Gruppen-Titel (draggable) */
.amorph-pins                  /* Pins-Container in Gruppe */

.amorph-pin                   /* Einzelner Pin */
.amorph-pin-bild              /* Bild-Pin */
.amorph-pin-label             /* Feld-Label */
.amorph-pin-wert              /* Feld-Wert */
.amorph-pin-pilz              /* Pilz-Name (bei Feld-Gruppierung) */
```

## Events

- Hört auf `amorph:auswahl-geaendert` → Re-render
- Hört auf `amorph:ansicht-wechsel` → Show/Hide

## Abhängigkeiten

- `features/ansichten/index.js` - Auswahl-State
- `util/semantic.js` - Feld-Config, Perspektiven

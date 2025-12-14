# Feature: Header

App-Header mit Branding, Suche, Perspektiven, Auswahl.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Header-Rendering |
| `header.css` | Header-Styles |

## Layout

| Zeile | Inhalt |
|-------|--------|
| 0 | Branding (Logo + App-Name aus manifest.yaml) |
| 1 | Suche + Ansicht-Switch (Karten/Vergleich) |
| 2 | 15 Perspektiven-Buttons |
| 3 | Ausgewählte Items (Pills) |

## Config (aus manifest.yaml)

```yaml
branding:
  logo: "./assets/logo.svg"
  name: "AMORPH"
```

## Events

**Emittiert:**
- `header:suche:ergebnisse` - Query + Ergebnisse + matchedTerms
- `header:suche:fehler` - Bei Fehlern
- `perspektiven:geaendert` - Perspektiven aktiviert/deaktiviert
- `amorph:ansicht-wechsel` - Karten ↔ Vergleich

**Hört auf:**
- `amorph:auswahl-geaendert` - Ausgewählte Items anzeigen

## Suche

- Semantische Suche aus Schema
- Fuzzy-Matching
- matchedTerms für Highlighting
- Debounced Input

## Perspektiven-Buttons

```html
<button class="perspektive-btn" data-perspektive="chemistry">
  <span class="symbol">🧪</span>
  <span class="name">Chemie</span>
</button>
```

## Auswahl-Pills

Zeigt ausgewählte Items mit Farbe:

```html
<div class="auswahl-pill pilz-farbe-0">
  <span>Steinpilz</span>
  <button class="remove">×</button>
</div>
```

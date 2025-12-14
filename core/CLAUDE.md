# Core

Das Herz von AMORPH.

## Dateien

| Datei | Zweck |
|-------|-------|
| `config.js` | Lädt YAML-Konfigurationen |
| `pipeline.js` | Transformiert Daten → DOM |
| `container.js` | Web Component `<amorph-container>` |

## pipeline.js

Datengetriebene Transformation mit Kirk-Prinzipien:

```javascript
transform(daten, config, morphs)

// Ablauf:
// 1. detectType(wert) - Struktur analysieren
// 2. findMorph(type) - Passenden Morph wählen
// 3. morph(wert, config) - DOM generieren
// 4. Container mit data-label für Labels
```

### Typ-Erkennung

| Funktion | Erkennt |
|----------|---------|
| `detectNumberType()` | rating, progress, number |
| `detectStringType()` | badge, tag, link, text |
| `detectArrayType()` | sparkline, radar, timeline, list |
| `detectObjectType()` | stats, range, pie, gauge, object |

### Label-Formatierung

```javascript
formatFieldLabel('PROTEIN_G')  // → "Protein (g)"
formatFieldLabel('spore_size') // → "Spore Size"
```

## container.js

```html
<amorph-container 
  data-quelle="./data/pilze/index.json"
  data-config="./config/">
</amorph-container>
```

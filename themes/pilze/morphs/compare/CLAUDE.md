# Theme Compare Morphs - Pilze

## Zweck

Perspektiven-spezifische Compare-Visualisierungen für das Pilze-Theme.

## Architektur

```
themes/pilze/morphs/compare/
├── index.js          # Registry & Export
├── kulinarisch.js    # 🍳 Kulinarische Perspektive
├── sicherheit.js     # ⚠️ Sicherheits-Perspektive
├── anbau.js          # 🌱 Anbau-Perspektive
├── wissenschaft.js   # 🔬 Wissenschafts-Perspektive
├── medizin.js        # 💊 Medizin-Perspektive
└── statistik.js      # 📊 Statistik-Perspektive
```

## Interface

Jeder Perspektiven-Morph hat die Signatur:

```javascript
function comparePerspektive(items, perspektive, schema) {
  // items: [{id, name, data, farbe}]
  // perspektive: {id, name, symbol, farben, felder}
  // schema: {felder, ...}
  return HTMLElement;
}
```

## Datengetriebenes Prinzip

1. **Felder filtern**: Nur Items mit vorhandenen Daten für das Feld anzeigen
2. **Typ erkennen**: Datenstruktur bestimmt den Morph (NICHT der Feldname!)
3. **Compare-Morph nutzen**: Generische Morphs aus `morphs/compare/`

## Beispiel

```javascript
// In kulinarisch.js
const geschmackItems = items.filter(i => i.data.geschmack);
if (geschmackItems.length > 0) {
  const section = createSection('Geschmack', perspektive.farben?.[1]);
  const mapped = geschmackItems.map(i => ({
    id: i.id, 
    name: i.name, 
    wert: i.data.geschmack, 
    farbe: i.farbe
  }));
  section.addContent(compareList(mapped, {}));
  sections.appendChild(section);
}
```

## Erweiterung

Neue Perspektive hinzufügen:

1. Datei erstellen: `themes/pilze/morphs/compare/neue.js`
2. In `index.js` registrieren:
   ```javascript
   import { compareNeue } from './neue.js';
   export const perspektivenMorphs = {
     // ...
     neue: compareNeue
   };
   ```

## Wichtig

- Die Perspektiven kommen aus `schema.yaml`
- Die Morphs werden NICHT im Schema definiert
- Die Farben kommen aus `perspektive.farben`

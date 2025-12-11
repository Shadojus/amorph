# Theme: Pilze - Compare Morphs

17 perspektiven-spezifische Vergleichs-Morphs für Pilzdaten.

## Dateien

```
themes/pilze/morphs/compare/
├── index.js           # Export: perspektivenMorphs Map
├── culinary.js     # 🍳 Geschmack, Zubereitung, Rezepte
├── safety.js      # ⚠️ Toxine, Verwechslung, Symptome
├── cultivation.js           # 🌱 Substrate, Ertrag, Schwierigkeit
├── wissenschaft.js    # 🔬 Taxonomie, Genetik, Phylogenie
├── medicine.js         # 💊 Wirkstoffe, Therapie, Dosierung
├── statistics.js       # 📊 Fundstatistics, Saisonalität
├── chemistry.js          # 🧪 Metabolite, Enzyme, Pigmente
├── sensorik.js        # 👃 Aroma, Textur, Geschmack
├── ecology.js       # 🌿 Habitat, Symbiosen, Klima
├── temporal.js        # ⏰ Lebenszyklus, Wachstum, Alter
├── geography.js       # 🗺️ Verbreitung, Höhenlage, Regionen
├── economy.js      # 💰 Marktpreis, Handel, Produktion
├── conservation.js     # 🛡️ IUCN-Status, Schutzmaßnahmen
├── culture.js          # 📜 Mythologie, Geschichte, Traditionen
├── research.js       # 📚 Publikationen, Studien, Patente
├── interactions.js   # 🔗 Wirte, Mikrobiom, Konkurrenz
└── visual.js          # 🎨 Bilder, Farben, Morphologie
```

## Verwendung

```javascript
// In features/vergleich/index.js
import { perspektivenMorphs } from '../themes/pilze/morphs/compare/index.js';

// Map<perspektivId, compareFn>
const compareFn = perspektivenMorphs.get('chemistry');
const element = compareFn(items, perspektive, schema);
```

## Compare-Morph Signatur

```javascript
/**
 * @param {Array} items - Array von Pilz-Objekten
 * @param {Object} perspektive - { id, name, symbol, farben, felder }
 * @param {Object} schema - { felder, perspektiven }
 * @returns {HTMLElement} - Container mit Vergleichs-Visualisierung
 */
function compareculinary(items, perspektive, schema) {
  // 1. Felder aus Perspektive extrahieren
  // 2. Für jedes Feld: passenden Compare-Primitive wählen
  // 3. Mit Perspektiven-Farben rendern
}
```

## Farben aus Perspektive

Jede Perspektive definiert 4 Farben in schema/perspektiven/*.yaml:

```yaml
# chemistry.yaml
id: chemistry
farben:
  primaer: "#9C27B0"    # Violett
  sekundaer: "#E040FB"
  akzent: "#EA80FC"
  hintergrund: "#1A0A1F"
```

Diese werden für Gradient-Glows und Highlight-Farben verwendet.

## Beispiel-Implementation

```javascript
// chemistry.js
export function comparechemistry(items, perspektive, schema) {
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-chemistry';
  
  // Metabolite vergleichen
  const metaboliteSection = compareBar(
    items.map(i => ({
      name: i.name,
      wert: i.chemistry_primaer_metabolite?.length || 0
    })),
    { label: 'Primäre Metabolite', einheit: 'Anzahl' }
  );
  
  container.appendChild(metaboliteSection);
  return container;
}
```

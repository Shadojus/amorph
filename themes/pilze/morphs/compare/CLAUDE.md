# Theme: Pilze - Compare Morphs

17 perspektiven-spezifische Vergleichs-Morphs für Pilzdaten.

## Dateien

```
themes/pilze/morphs/compare/
├── index.js           # Export: perspektivenMorphs Map
├── kulinarisch.js     # 🍳 Geschmack, Zubereitung, Rezepte
├── sicherheit.js      # ⚠️ Toxine, Verwechslung, Symptome
├── anbau.js           # 🌱 Substrate, Ertrag, Schwierigkeit
├── wissenschaft.js    # 🔬 Taxonomie, Genetik, Phylogenie
├── medizin.js         # 💊 Wirkstoffe, Therapie, Dosierung
├── statistik.js       # 📊 Fundstatistik, Saisonalität
├── chemie.js          # 🧪 Metabolite, Enzyme, Pigmente
├── sensorik.js        # 👃 Aroma, Textur, Geschmack
├── oekologie.js       # 🌿 Habitat, Symbiosen, Klima
├── temporal.js        # ⏰ Lebenszyklus, Wachstum, Alter
├── geografie.js       # 🗺️ Verbreitung, Höhenlage, Regionen
├── wirtschaft.js      # 💰 Marktpreis, Handel, Produktion
├── naturschutz.js     # 🛡️ IUCN-Status, Schutzmaßnahmen
├── kultur.js          # 📜 Mythologie, Geschichte, Traditionen
├── forschung.js       # 📚 Publikationen, Studien, Patente
├── interaktionen.js   # 🔗 Wirte, Mikrobiom, Konkurrenz
└── visual.js          # 🎨 Bilder, Farben, Morphologie
```

## Verwendung

```javascript
// In features/vergleich/index.js
import { perspektivenMorphs } from '../themes/pilze/morphs/compare/index.js';

// Map<perspektivId, compareFn>
const compareFn = perspektivenMorphs.get('chemie');
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
function compareKulinarisch(items, perspektive, schema) {
  // 1. Felder aus Perspektive extrahieren
  // 2. Für jedes Feld: passenden Compare-Primitive wählen
  // 3. Mit Perspektiven-Farben rendern
}
```

## Farben aus Perspektive

Jede Perspektive definiert 4 Farben in schema/perspektiven/*.yaml:

```yaml
# chemie.yaml
id: chemie
farben:
  primaer: "#9C27B0"    # Violett
  sekundaer: "#E040FB"
  akzent: "#EA80FC"
  hintergrund: "#1A0A1F"
```

Diese werden für Gradient-Glows und Highlight-Farben verwendet.

## Beispiel-Implementation

```javascript
// chemie.js
export function compareChemie(items, perspektive, schema) {
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-chemie';
  
  // Metabolite vergleichen
  const metaboliteSection = compareBar(
    items.map(i => ({
      name: i.name,
      wert: i.chemie_primaer_metabolite?.length || 0
    })),
    { label: 'Primäre Metabolite', einheit: 'Anzahl' }
  );
  
  container.appendChild(metaboliteSection);
  return container;
}
```

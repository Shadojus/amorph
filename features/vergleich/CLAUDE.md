# Feature: Vergleich (Vektorraum)

Laterale Lösung: Informationen durch Raumeinteilung und Vektoren verknüpfen.

## Übersicht

Das Vergleich-Feature bietet:
- **Glasmorphism Design** (identisch zu Grid-View)
- Sammel-Diagramm mit Pilz-Legende (farbige Punkte)
- **17 Perspektiven-aware Morphs** (Label + Farben aus schema/perspektiven/)
- Multi-Perspektiven Glow
- **Theme-Compare-Morphs Integration**: Nutzt `themes/pilze/morphs/compare/`
- **Suche-Highlights**: Markiert Suchbegriffe im Vergleich-View

## Theme-Compare-Morphs

17 perspektiven-spezifische Compare-Morphs:

| Perspektive | Compare-Morph | Fokus |
|-------------|---------------|-------|
| culinary | culinary.js | Geschmack, Zubereitung |
| safety | safety.js | Toxine, Verwechslung |
| cultivation | cultivation.js | Substrate, Ertrag |
| wissenschaft | wissenschaft.js | Taxonomie |
| medicine | medicine.js | Wirkstoffe |
| statistics | statistics.js | Fundstatistics |
| chemistry | chemistry.js | Metabolite, Enzyme |
| sensorik | sensorik.js | Aroma, Textur |
| ecology | ecology.js | Habitat, Symbiosen |
| temporal | temporal.js | Lebenszyklus |
| geography | geography.js | Verbreitung |
| economy | economy.js | Markt, Preise |
| conservation | conservation.js | IUCN-Status |
| culture | culture.js | Mythologie |
| research | research.js | Publikationen |
| interactions | interactions.js | Wirte |
| visual | visual.js | Bilder |

## Glasmorphism

```css
.compare-perspektive {
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.92));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}
```

## Dynamisches Laden

```javascript
// features/vergleich/index.js
const module = await import(`../../themes/${thema}/morphs/compare/index.js`);
const compareFn = module.perspektivenMorphs[perspId];
const el = compareFn(items, perspektive, schema);
```

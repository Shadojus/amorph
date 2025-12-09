# Compare Morphs

Vergleichs-Visualisierungen für mehrere Items nebeneinander.

## Dateien

```
morphs/compare/
├── base.js       ← Utils: erstelleFarben(), detectType()
├── index.js      ← Export aller Compare-Morphs
├── primitives/   ← 16 generische Compare-Primitives
└── composites/   ← Smart/Diff Compare
```

## Theme-Compare-Morphs (17 Perspektiven)

Perspektiven-spezifische Morphs in `themes/pilze/morphs/compare/`:

```
themes/pilze/morphs/compare/
├── index.js           # Export aller 17 Compare-Morphs
├── kulinarisch.js     # Geschmack, Zubereitung
├── sicherheit.js      # Toxine, Verwechslung
├── anbau.js           # Substrate, Ertrag
├── wissenschaft.js    # Taxonomie, Genetik
├── medizin.js         # Wirkstoffe, Therapie
├── statistik.js       # Fundstatistik
├── chemie.js          # Metabolite, Enzyme
├── sensorik.js        # Aroma, Textur
├── oekologie.js       # Habitat, Symbiosen
├── temporal.js        # Lebenszyklus
├── geografie.js       # Verbreitung
├── wirtschaft.js      # Markt, Preise
├── naturschutz.js     # IUCN-Status
├── kultur.js          # Mythologie
├── forschung.js       # Publikationen
├── interaktionen.js   # Wirte, Mikrobiom
└── visual.js          # Bilder, Farben
```

## Farb-System (CSS Single Source of Truth!)

```javascript
// base.js - erstelleFarben()
export function erstelleFarben(items) {
  return items.map((item, index) => ({
    name: item._meta?.name || item.name || `Item ${index + 1}`,
    farbIndex: index % 12,
    farbKlasse: `pilz-farbe-${index % 12}`
  }));
}
```

**CSS macht das Styling** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```

## Compare-Morph Signatur

```javascript
function compareMorph(items, perspektive, schema) → HTMLElement

// items = Array von Pilz-Objekten
// perspektive = { id, name, symbol, farben, felder }
// schema = { felder: {...}, perspektiven: [...] }
```

## Generische Compare-Primitives

| Morph | Datentyp | Visualisierung |
|-------|----------|----------------|
| `compareBar` | `number` | Horizontale Balken |
| `compareRating` | `0-5, 0-10` | Sterne ★★★☆☆ |
| `compareRadar` | `[{axis,value}]` | Überlagerte Radars |
| `comparePie` | `{key:number}` | Kreisdiagramme |
| `compareTag` | `string` | Farbige Tags |
| `compareText` | `string` | Text-Vergleich |

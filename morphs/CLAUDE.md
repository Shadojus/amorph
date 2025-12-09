# Morphs

Reine Funktionen. Keine Klassen. Kein Zustand. **Keine Seiteneffekte!**

## Struktur

```
morphs/
├── index.js          ← Zentrale Registry + compareMorph()
├── primitives/       ← 16 Basis-Morphs (text, bar, radar, etc.)
├── compare/          ← Generische Compare-Morphs
│   ├── base.js       ← Utils: erstelleFarben(), detectType()
│   ├── index.js      ← Export aller Compare-Morphs
│   ├── primitives/   ← 16 Compare-Primitives
│   └── composites/   ← Smart/Diff Compare
├── suche.js          ← Feature: Suchfeld
├── perspektiven.js   ← Feature: Perspektiven-Buttons
└── header.js         ← Feature: App-Header
```

## MORPH-PURITY REGEL

```javascript
// ✅ ERLAUBT in Morphs:
document.createElement()     // DOM erstellen
element.appendChild()        // DOM aufbauen
element.addEventListener()   // Lokale Events auf eigenem Element

// ❌ VERBOTEN in Morphs:
document.dispatchEvent()     // → Nur Features dürfen Events dispatchen!
document.addEventListener()  // → Nie global!
```

**Morphs sind REINE Transformationen:** `(wert, config) → HTMLElement`

## Theme-Compare-Morphs

Perspektiven-spezifische Vergleiche in `themes/pilze/morphs/compare/`:

| Perspektive | Datei | Fokus |
|-------------|-------|-------|
| kulinarisch | kulinarisch.js | Geschmack, Zubereitung |
| sicherheit | sicherheit.js | Toxine, Verwechslung |
| anbau | anbau.js | Substrate, Ertrag |
| wissenschaft | wissenschaft.js | Taxonomie, Genetik |
| medizin | medizin.js | Wirkstoffe, Therapie |
| statistik | statistik.js | Fundstatistik |
| chemie | chemie.js | Metabolite, Enzyme |
| sensorik | sensorik.js | Aroma, Textur |
| oekologie | oekologie.js | Habitat, Symbiosen |
| temporal | temporal.js | Lebenszyklus |
| geografie | geografie.js | Verbreitung |
| wirtschaft | wirtschaft.js | Markt, Preise |
| naturschutz | naturschutz.js | IUCN-Status |
| kultur | kultur.js | Mythologie |
| forschung | forschung.js | Publikationen |
| interaktionen | interaktionen.js | Wirte, Mikrobiom |
| visual | visual.js | Bilder, Farben |

## Farb-System (CSS Single Source of Truth!)

```javascript
// base.js - erstelleFarben()
export function erstelleFarben(items) {
  return items.map((item, index) => ({
    name: item._meta?.name || item.name,
    farbIndex: index % 12,
    farbKlasse: `pilz-farbe-${index % 12}`
  }));
}
```

**CSS macht das Styling** (`pilz-farben.css`):
```css
.pilz-farbe-0 { --pilz-text: rgb(0, 255, 255); }
```

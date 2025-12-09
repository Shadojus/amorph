# Themes

Theme-spezifische Anpassungen für verschiedene Datendomänen.

## Struktur

```
themes/
└── pilze/
    └── morphs/
        └── compare/           # 17 Perspektiven-Compare-Morphs
            ├── index.js       # Export aller Compare-Morphs
            ├── kulinarisch.js
            ├── sicherheit.js
            ├── anbau.js
            ├── wissenschaft.js
            ├── medizin.js
            ├── statistik.js
            ├── chemie.js      # NEU
            ├── sensorik.js    # NEU
            ├── oekologie.js   # NEU
            ├── temporal.js    # NEU
            ├── geografie.js   # NEU
            ├── wirtschaft.js  # NEU
            ├── naturschutz.js # NEU
            ├── kultur.js      # NEU
            ├── forschung.js   # NEU
            ├── interaktionen.js # NEU
            └── visual.js      # NEU
```

## 17 Perspektiven-Compare-Morphs

Jeder Compare-Morph hat dieselbe Signatur:

```javascript
export function compareChemie(items, perspektive, schema) {
  // items = Array von Pilz-Objekten
  // perspektive = { id, name, symbol, farben, felder }
  // schema = Komplettes Schema mit felder-Definitionen
  return HTMLElement;
}
```

### Struktur eines Compare-Morphs

```javascript
// Gruppen definieren
const gruppen = {
  'primaer': { titel: 'Primäre Metabolite', felder: [...] },
  'sekundaer': { titel: 'Sekundäre Metabolite', felder: [...] }
};

// Sections erstellen
function addSection(container, titel, inhalt) { ... }
function addGroupHeader(container, symbol, titel) { ... }

// Main-Funktion
export function comparePerspektive(items, perspektive, schema) {
  const container = document.createElement('div');
  // Gruppen durchlaufen, Felder vergleichen
  return container;
}
```

## Integration

Das Vergleich-Feature lädt Theme-Morphs dynamisch:

```javascript
// features/vergleich/index.js
const module = await import(`../../themes/${thema}/morphs/compare/index.js`);
const compareFn = module.perspektivenMorphs[perspId];
const el = compareFn(items, perspektive, schema);
```

## Fallback

Wenn kein Theme-Morph existiert, nutzt das System generische Compare-Morphs aus `morphs/compare/`.

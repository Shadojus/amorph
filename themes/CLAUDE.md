# Themes

## Zweck

Theme-spezifische Anpassungen für verschiedene Datendomänen (Pilze, Pflanzen, etc.).

## Struktur

```
themes/
└── [thema]/
    ├── config/        # Theme-spezifische Konfiguration (optional)
    │   └── *.yaml
    ├── data/          # Theme-spezifische Daten (optional)
    │   └── *.json
    └── morphs/
        └── compare/   # Perspektiven-spezifische Compare-Morphs
            ├── index.js
            └── [perspektive].js
```

## Theme-Austauschbarkeit

Das System ist so konzipiert, dass ein Theme-Wechsel automatisch funktioniert:

1. **Gleiche Schema-Struktur**: Perspektiven mit `felder` Array
2. **Gleiche Compare-Morph-Signatur**: `(items, perspektive, schema) → HTMLElement`
3. **Datengetriebene Erkennung**: `detectType()` erkennt Typen aus Datenstruktur

### Beispiel: Neues Theme "pflanzen"

```
themes/
├── pilze/           # Bestehend
└── pflanzen/        # Neu
    └── morphs/
        └── compare/
            ├── index.js
            ├── kulinarisch.js   # Andere Felder, gleiche Signatur
            ├── heilkunde.js     # Neue Perspektive
            └── botanik.js       # Neue Perspektive
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

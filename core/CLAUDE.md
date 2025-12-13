# Core

Das Herz von AMORPH.

## Dateien

```
core/
├── config.js     ← Lädt YAML + 15 Perspektiven
├── pipeline.js   ← Transformiert Daten durch Morphs
└── container.js  ← Web Component <amorph-container>
```

## config.js

Lädt alle YAML-Konfigurationen:
- manifest, daten, morphs, observer, features
- Modulares Schema inkl. 15 Perspektiven

## pipeline.js

Datengetriebene Transformation:

```javascript
transform(daten, config, morphs)
// 1. Typ aus Schema oder detectType(wert)
// 2. Passenden Morph aufrufen
// 3. DOM mit data-perspektive-* Attributen
```

## container.js

```html
<amorph-container 
  data-quelle="./data/pilze/index.json"
  data-config="./config/">
</amorph-container>
```

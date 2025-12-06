# Core

Das Herz von AMORPH. Drei Dateien, eine Aufgabe: Daten transformieren.

## Dateien

```
core/
├── config.js     ← Lädt YAML-Konfiguration
├── pipeline.js   ← Transformiert Daten durch Morphs (datengetrieben!)
└── container.js  ← Web Component als Morph-Container
```

## config.js

Lädt alle YAML-Konfigurationsdateien und merged sie:

```javascript
export async function ladeConfig(basePath = './config/') {
  const [manifest, schema, features, morphs, observer] = await Promise.all([
    loadYAML(basePath + 'manifest.yaml'),
    loadYAML(basePath + 'schema.yaml'),
    loadYAML(basePath + 'features.yaml'),
    loadYAML(basePath + 'morphs.yaml'),
    loadYAML(basePath + 'observer.yaml')
  ]);
  return { manifest, schema, features, morphs, observer };
}
```

## pipeline.js

Transformiert Daten → DOM. Datengetriebene Typ-Erkennung:

```javascript
export function transform(daten, config, morphs) {
  // 1. Typ aus Schema oder detectType(wert)
  // 2. Passenden Morph aufrufen
  // 3. DOM-Element zurückgeben
}
```

## container.js

Web Component `<amorph-container>`:

```html
<amorph-container 
  data-quelle="./data/pilze.json"
  data-config="./config/">
</amorph-container>
```

Keine versteckten Abhängigkeiten. Keine Magie. Nur Funktionen die Daten transformieren.

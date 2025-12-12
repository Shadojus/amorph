# Core

Das Herz von AMORPH. Drei Dateien, eine Aufgabe: Daten transformieren.

## Dateien

```
core/
├── config.js     ← Lädt YAML-Konfiguration + 17 Perspektiven
├── pipeline.js   ← Transformiert Daten durch Morphs (datengetrieben!)
└── container.js  ← Web Component als Morph-Container
```

## config.js

Lädt alle YAML-Konfigurationsdateien inkl. modularem Schema:

```javascript
export async function ladeConfig(basePath = './config/') {
  // Lädt manifest, daten, morphs, observer, features
  // + Modulares Schema: basis, felder, semantik
  // + 17 Perspektiven aus perspektiven/*.yaml
}
```

## pipeline.js

Transformiert Daten → DOM. Datengetriebene Typ-Erkennung:

```javascript
export function transform(daten, config, morphs) {
  // 1. Typ aus Schema oder detectType(wert)
  // 2. Passenden Morph aufrufen
  // 3. DOM-Element mit data-perspektive-* Attributen
}
```

### Perspektiven-Attribute

Pipeline fügt automatisch Perspektiven-Attribute hinzu:

```html
<amorph-container 
  data-field="chemistry_primaer_metabolite"
  data-perspektive-chemistry="true">
```

## container.js

Web Component `<amorph-container>`:

```html
<amorph-container 
  data-quelle="./data/fungi.json"
  data-config="./config/">
</amorph-container>
```

Keine versteckten Abhängigkeiten. Keine Magie. Nur Funktionen die Daten transformieren.

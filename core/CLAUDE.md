# Core

Das Herz von AMORPH. Drei Dateien, eine Aufgabe: Daten transformieren.

## Übersicht

```
config.js   → Lädt und validiert Konfiguration
pipeline.js → Transformiert Daten durch Morphs
container.js → Web Component als Morph-Container
```

## config.js

Lädt alle YAML-Dateien aus dem Config-Ordner. Keine Magie, keine Verschachtelung.

```javascript
// config.js
const CONFIG_FILES = [
  'manifest.yaml',
  'daten.yaml', 
  'morphs.yaml',
  'observer.yaml',
  'features.yaml'
];

export async function loadConfig(basePath = './config/') {
  const config = {};
  
  for (const file of CONFIG_FILES) {
    const name = file.replace('.yaml', '');
    try {
      const response = await fetch(basePath + file);
      if (!response.ok) {
        if (name === 'manifest' || name === 'daten') {
          throw new Error(`Pflichtdatei fehlt: ${file}`);
        }
        continue; // Optionale Dateien überspringen
      }
      const text = await response.text();
      config[name] = parseYAML(text);
    } catch (e) {
      console.error(`Fehler beim Laden von ${file}:`, e);
      throw e;
    }
  }
  
  validateConfig(config);
  return config;
}

function parseYAML(text) {
  // Einfacher YAML-Parser für flache Strukturen
  // Für Produktion: js-yaml library
  const result = {};
  let currentKey = null;
  let currentObject = result;
  const stack = [result];
  
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    
    const indent = line.search(/\S/);
    const content = line.trim();
    
    if (content.endsWith(':') && !content.includes(': ')) {
      // Neues Objekt
      const key = content.slice(0, -1);
      currentObject[key] = {};
      currentObject = currentObject[key];
      currentKey = key;
    } else if (content.includes(': ')) {
      // Key-Value
      const [key, ...valueParts] = content.split(': ');
      let value = valueParts.join(': ').trim();
      
      // Typ-Konvertierung
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);
      else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      currentObject[key.trim()] = value;
    }
  }
  
  return result;
}

function validateConfig(config) {
  // Pflichtfelder prüfen
  if (!config.manifest?.name) {
    throw new Error('manifest.yaml: name fehlt');
  }
  if (!config.daten?.quelle) {
    throw new Error('daten.yaml: quelle fehlt');
  }
}

export function getEnvValue(value) {
  // Ersetzt ${VAR} durch Umgebungsvariablen
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{(\w+)\}/g, (_, name) => {
    return globalThis[name] || '';
  });
}
```

## pipeline.js

Die Transformationspipeline. Nimmt Daten, findet passende Morphs, gibt DOM zurück.

```javascript
// pipeline.js
import { morphs } from '../morphs/index.js';
import { AmorphContainer } from './container.js';

export function transform(daten, config, customMorphs = {}) {
  const alleMorphs = { ...morphs, ...customMorphs };
  
  function morphen(wert, feldname = null) {
    // 1. Typ erkennen
    const typ = detectType(wert);
    
    // 2. Morph finden
    const morphName = findMorph(typ, wert, feldname, config.morphs);
    const morph = alleMorphs[morphName];
    
    if (!morph) {
      console.warn(`Morph nicht gefunden: ${morphName}, nutze text`);
      return alleMorphs.text(wert, {});
    }
    
    // 3. Morph ausführen
    const morphConfig = getMorphConfig(morphName, config);
    const element = morph(wert, morphConfig, morphen);
    
    // 4. In Container wrappen
    const container = document.createElement('amorph-container');
    container.setAttribute('data-morph', morphName);
    if (feldname) container.setAttribute('data-field', feldname);
    container.appendChild(element);
    
    return container;
  }
  
  // Wenn Daten ein Objekt sind, jedes Feld morphen
  if (typeof daten === 'object' && daten !== null && !Array.isArray(daten)) {
    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(daten)) {
      const container = morphen(value, key);
      fragment.appendChild(container);
    }
    return fragment;
  }
  
  return morphen(daten);
}

function detectType(wert) {
  if (wert === null || wert === undefined) return 'null';
  if (Array.isArray(wert)) return 'array';
  if (typeof wert === 'boolean') return 'boolean';
  if (typeof wert === 'number') return 'number';
  if (typeof wert === 'string') return 'string';
  if (typeof wert === 'object') {
    if ('min' in wert && 'max' in wert) return 'range';
    return 'object';
  }
  return 'unknown';
}

function findMorph(typ, wert, feldname, morphConfig) {
  // 1. Explizite Feld-Zuweisung prüfen
  if (feldname && morphConfig?.felder?.[feldname]) {
    return morphConfig.felder[feldname];
  }
  
  // 2. Regeln prüfen
  if (morphConfig?.regeln) {
    for (const regel of morphConfig.regeln) {
      if (matchesRegel(regel, typ, wert)) {
        return regel.morph;
      }
    }
  }
  
  // 3. Standard-Mapping
  const defaults = {
    'string': 'text',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'list',
    'object': 'object',
    'range': 'range',
    'null': 'text'
  };
  
  return defaults[typ] || 'text';
}

function matchesRegel(regel, typ, wert) {
  if (regel.typ && regel.typ !== typ) return false;
  if (regel.hat && typeof wert === 'object') {
    return regel.hat.every(key => key in wert);
  }
  if (regel.maxLaenge && typeof wert === 'string') {
    return wert.length <= regel.maxLaenge;
  }
  return true;
}

function getMorphConfig(morphName, config) {
  return config.morphs?.config?.[morphName] || {};
}

// Render-Funktion für den Einstiegspunkt
export async function render(container, daten, config) {
  // Container leeren
  container.innerHTML = '';
  
  // Transformieren
  const dom = transform(daten, config);
  
  // Einfügen
  container.appendChild(dom);
  
  // Event für Observer
  container.dispatchEvent(new CustomEvent('amorph:rendered', {
    detail: { daten, timestamp: Date.now() }
  }));
}
```

## container.js

Web Component als Container für Morphs. Isoliert, sauber, beobachtbar.

```javascript
// container.js
export class AmorphContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Minimales Base-CSS im Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        contain: content;
      }
      :host([inline]) {
        display: inline-block;
      }
      ::slotted(*) {
        max-width: 100%;
      }
    `;
    
    this.shadowRoot.appendChild(style);
    
    // Slot für Content
    const slot = document.createElement('slot');
    this.shadowRoot.appendChild(slot);
  }
  
  connectedCallback() {
    // Event für Observer
    this.dispatchEvent(new CustomEvent('amorph:mounted', {
      bubbles: true,
      detail: {
        morph: this.dataset.morph,
        field: this.dataset.field
      }
    }));
  }
  
  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('amorph:unmounted', {
      bubbles: true,
      detail: {
        morph: this.dataset.morph,
        field: this.dataset.field
      }
    }));
  }
  
  // Erlaubt das Setzen von Attributen für Perspektiven
  static get observedAttributes() {
    return ['data-perspektive'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-perspektive') {
      this.dispatchEvent(new CustomEvent('amorph:perspektive', {
        bubbles: true,
        detail: { perspektive: newValue, vorher: oldValue }
      }));
    }
  }
}

// Registrieren
if (!customElements.get('amorph-container')) {
  customElements.define('amorph-container', AmorphContainer);
}
```

## Zusammenspiel

```
1. loadConfig()       → Konfiguration laden
2. transform(daten)   → Daten durch Morphs jagen
3. AmorphContainer    → Ergebnis in Web Component wrappen
4. render()           → In DOM einfügen
```

Keine versteckten Abhängigkeiten. Keine Magie. Nur Funktionen die Daten transformieren.

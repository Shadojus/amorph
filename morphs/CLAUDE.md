# Morphs

Reine Funktionen. Keine Klassen. Kein Zustand.

## 🚧 AKTUELLER STAND

### Implementiert
- Alle Morphs funktionieren: text, number, boolean, tag, range, list, object, image, link
- Jeder Morph erzeugt `<span class="amorph-{type}">` Element

### TODO für Feld-Auswahl
- Morphs müssen **klickbar** werden für Feld-Auswahl
- Klick auf Morph-Element → dispatcht Event mit Feld-Infos
- Ausgewählte Felder bekommen `.ausgewaehlt` Klasse → Glow-Effekt

```javascript
// GEPLANT: Morphs erhalten click-handler
el.dataset.feldName = config.name;  // z.B. "temperatur"
el.dataset.pilzId = config.pilzId;   // z.B. "1"
// Klick → Event → Feld wird zur Auswahl hinzugefügt
```

## Was ist ein Morph?

Ein Morph ist eine Funktion die Daten in ein DOM-Element transformiert:

```javascript
function morph(wert, config) → HTMLElement
```

Das ist die ganze API. Keine Lifecycle-Methoden, keine Registrierung, keine Magie.

## Die Morphs

### text.js

Der einfachste Morph. Macht aus allem Text.

```javascript
// morphs/text.js
export function text(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-text';
  el.textContent = String(wert ?? '');
  
  if (config.maxLaenge && el.textContent.length > config.maxLaenge) {
    el.textContent = el.textContent.slice(0, config.maxLaenge) + '…';
    el.title = String(wert);
  }
  
  return el;
}
```

### number.js

Zahlen mit optionaler Formatierung.

```javascript
// morphs/number.js
export function number(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-number';
  
  let formatted = Number(wert);
  
  if (config.dezimalen !== undefined) {
    formatted = formatted.toFixed(config.dezimalen);
  }
  
  if (config.tausenderTrennzeichen) {
    formatted = formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  if (config.einheit) {
    formatted = `${formatted} ${config.einheit}`;
  }
  
  el.textContent = formatted;
  return el;
}
```

### boolean.js

Wahrheitswerte als Icons oder Text.

```javascript
// morphs/boolean.js
export function boolean(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-boolean';
  el.setAttribute('data-value', String(!!wert));
  
  if (config.alsIcon) {
    el.textContent = wert ? '✓' : '✗';
    el.setAttribute('aria-label', wert ? 'Ja' : 'Nein');
  } else if (config.labels) {
    el.textContent = wert ? config.labels.wahr : config.labels.falsch;
  } else {
    el.textContent = wert ? 'Ja' : 'Nein';
  }
  
  return el;
}
```

### tag.js

Kurze Texte als Tags/Badges.

```javascript
// morphs/tag.js
export function tag(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-tag';
  el.textContent = String(wert);
  
  // Farbe basierend auf Wert (falls konfiguriert)
  if (config.farben && config.farben[wert]) {
    el.style.setProperty('--tag-farbe', config.farben[wert]);
  }
  
  return el;
}
```

### range.js

Bereiche wie Temperatur, Preise, etc.

```javascript
// morphs/range.js
export function range(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-range';
  
  const min = wert.min ?? 0;
  const max = wert.max ?? 100;
  const einheit = config.einheit || wert.einheit || '';
  
  // Textdarstellung
  const text = document.createElement('span');
  text.className = 'amorph-range-text';
  text.textContent = `${min}${einheit} – ${max}${einheit}`;
  el.appendChild(text);
  
  // Optionale Visualisierung
  if (config.visualisierung) {
    const bar = document.createElement('span');
    bar.className = 'amorph-range-bar';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', text.textContent);
    
    // CSS Custom Properties für Styling
    const skalaMin = config.skala?.min ?? 0;
    const skalaMax = config.skala?.max ?? 100;
    const startPercent = ((min - skalaMin) / (skalaMax - skalaMin)) * 100;
    const endPercent = ((max - skalaMin) / (skalaMax - skalaMin)) * 100;
    
    bar.style.setProperty('--range-start', `${startPercent}%`);
    bar.style.setProperty('--range-end', `${endPercent}%`);
    
    el.appendChild(bar);
  }
  
  return el;
}
```

### list.js

Arrays als Listen. Ruft rekursiv Morphs auf.

```javascript
// morphs/list.js
export function list(wert, config = {}, morphen) {
  const el = document.createElement('ul');
  el.className = 'amorph-list';
  
  if (!Array.isArray(wert)) {
    console.warn('list-morph erwartet Array, bekam:', typeof wert);
    return el;
  }
  
  for (const item of wert) {
    const li = document.createElement('li');
    
    // Rekursiv morphen
    if (morphen) {
      li.appendChild(morphen(item));
    } else {
      li.textContent = String(item);
    }
    
    el.appendChild(li);
  }
  
  // Limit?
  if (config.maxItems && wert.length > config.maxItems) {
    el.setAttribute('data-truncated', 'true');
    el.setAttribute('data-total', wert.length);
  }
  
  return el;
}
```

### object.js

Objekte als Key-Value-Paare.

```javascript
// morphs/object.js
export function object(wert, config = {}, morphen) {
  const el = document.createElement('dl');
  el.className = 'amorph-object';
  
  if (typeof wert !== 'object' || wert === null) {
    console.warn('object-morph erwartet Objekt, bekam:', typeof wert);
    return el;
  }
  
  // Welche Felder anzeigen?
  const felder = config.felder || Object.keys(wert);
  
  for (const key of felder) {
    if (!(key in wert)) continue;
    
    const dt = document.createElement('dt');
    dt.textContent = config.labels?.[key] || key;
    el.appendChild(dt);
    
    const dd = document.createElement('dd');
    if (morphen) {
      dd.appendChild(morphen(wert[key], key));
    } else {
      dd.textContent = String(wert[key]);
    }
    el.appendChild(dd);
  }
  
  return el;
}
```

### image.js

Bilder sicher laden.

```javascript
// morphs/image.js
export function image(wert, config = {}) {
  const el = document.createElement('figure');
  el.className = 'amorph-image';
  
  const img = document.createElement('img');
  
  // URL ermitteln
  const src = typeof wert === 'string' ? wert : wert.url || wert.src;
  
  // Sichere URL prüfen
  if (src && isAllowedUrl(src, config.erlaubteDomains)) {
    img.src = src;
    img.alt = wert.alt || config.alt || '';
    img.loading = 'lazy';
  } else {
    img.alt = 'Bild nicht verfügbar';
    el.setAttribute('data-error', 'invalid-url');
  }
  
  el.appendChild(img);
  
  // Caption?
  if (wert.caption || config.caption) {
    const caption = document.createElement('figcaption');
    caption.textContent = wert.caption || config.caption;
    el.appendChild(caption);
  }
  
  return el;
}

function isAllowedUrl(url, erlaubteDomains) {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Nur http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Domain-Whitelist prüfen
    if (erlaubteDomains && erlaubteDomains.length > 0) {
      return erlaubteDomains.some(d => parsed.hostname.endsWith(d));
    }
    
    return true;
  } catch {
    return false;
  }
}
```

### link.js

Links mit Sicherheitsprüfung.

```javascript
// morphs/link.js
export function link(wert, config = {}) {
  const el = document.createElement('a');
  el.className = 'amorph-link';
  
  const url = typeof wert === 'string' ? wert : wert.url || wert.href;
  const text = typeof wert === 'string' ? wert : wert.text || wert.label || url;
  
  // URL validieren
  if (url && isValidUrl(url)) {
    el.href = url;
    el.textContent = text;
    
    // Externe Links
    if (isExternal(url)) {
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  } else {
    el.textContent = text;
    el.removeAttribute('href');
    el.setAttribute('data-invalid', 'true');
  }
  
  return el;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isExternal(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}
```

## index.js - Export

```javascript
// morphs/index.js
export { text } from './text.js';
export { number } from './number.js';
export { boolean } from './boolean.js';
export { tag } from './tag.js';
export { range } from './range.js';
export { list } from './list.js';
export { object } from './object.js';
export { image } from './image.js';
export { link } from './link.js';

// Alle als Objekt für Pipeline
import { text } from './text.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { tag } from './tag.js';
import { range } from './range.js';
import { list } from './list.js';
import { object } from './object.js';
import { image } from './image.js';
import { link } from './link.js';

export const morphs = {
  text,
  number,
  boolean,
  tag,
  range,
  list,
  object,
  image,
  link
};
```

## Eigene Morphs erstellen

```javascript
// Einfach eine Funktion exportieren
export function meinMorph(wert, config) {
  const el = document.createElement('div');
  el.className = 'mein-morph';
  // ... transformieren ...
  return el;
}

// In der Pipeline registrieren
import { meinMorph } from './mein-morph.js';

transform(daten, config, { meinMorph });
```

## Regeln

1. **Immer ein Element zurückgeben** - Nie null, nie undefined
2. **Keine Seiteneffekte** - Kein Zustand, keine globalen Variablen
3. **Keine innerHTML** - Immer DOM-APIs nutzen (XSS-Schutz)
4. **Config optional** - Morph muss ohne Config funktionieren
5. **morphen-Callback nutzen** - Für rekursive Strukturen

## CSS-Klassen Konvention

Jeder Morph setzt seine CSS-Klasse:
- `.amorph-text`
- `.amorph-number`
- `.amorph-boolean`
- `.amorph-tag`
- `.amorph-range`
- `.amorph-list`
- `.amorph-object`
- `.amorph-image`
- `.amorph-link`

Das erlaubt globales Styling ohne in die Morphs einzugreifen.

# Morphs

Reine Funktionen. Keine Klassen. Kein Zustand. **Keine Seiteneffekte!**

## Ordnerstruktur

```
morphs/
├── primitives/           # 17 Basis-Morphs (domänenunabhängig)
│   ├── text.js           # String-Darstellung
│   ├── number.js         # Zahlen
│   ├── boolean.js        # Ja/Nein
│   ├── tag.js            # Farbige Chips
│   ├── badge.js          # Status-Labels (gedämpfte Farben)
│   ├── range.js          # Min-Max Slider + Legende
│   ├── list.js           # String-Listen
│   ├── object.js         # Key-Value Paare
│   ├── image.js          # Bilder
│   ├── link.js           # URLs
│   ├── pie.js            # Kreisdiagramm + Legende
│   ├── bar.js            # Balkendiagramm + Achsenbeschriftung
│   ├── radar.js          # Radar-Chart + Achsen-Labels
│   ├── rating.js         # Sterne-Bewertung
│   ├── progress.js       # Fortschrittsbalken
│   ├── stats.js          # Statistik-Karte + Legende
│   ├── timeline.js       # Zeitliche Abfolge + Legende
│   └── index.js          # Re-Export
│
├── compare/              # Generische Compare-Morphs
│   ├── base.js           # Utils (erstelleFarben, detectType, createSection)
│   ├── primitives/       # 16 Compare-Primitive (alle mit Legenden)
│   │   ├── bar.js, barGroup.js, rating.js, tag.js, list.js
│   │   ├── image.js, radar.js, pie.js, text.js, timeline.js
│   │   ├── stats.js, progress.js, boolean.js, object.js, range.js
│   │   └── index.js
│   └── index.js          # Haupt-Export
│
├── suche.js              # Feature: Suchfeld
├── perspektiven.js       # Feature: Perspektiven-Buttons
├── header.js             # Feature: App-Header
├── index.js              # Zentrale Registry
└── CLAUDE.md             # Diese Dokumentation
```

### Implementierte Morphs

#### Primitives (17) - Mit Legenden
- text, number, boolean, tag, badge, range, list, object, image, link
- **Diagramme mit Legenden**: pie, bar, radar, stats, timeline (alle mit Achsenbeschriftungen)
- rating, progress

#### Compare-Morphs (16) - Mit Legenden
| Morph | Datentyp | Visualisierung |
|-------|----------|----------------|
| `compareBar` | `number` | Horizontale Balken + Wert-Legende |
| `compareBarGroup` | `[{label,value}]` | Gruppierte Balken + Farbige Legende |
| `compareRating` | `0-5, 0-10` | Sterne ★★★☆☆ |
| `compareProgress` | `0-100` | Prozent-Balken + Legende |
| `compareRange` | `{min,max}` | Range-Visualisierung + Legende |
| `compareStats` | `{min,max,avg}` | Box-Plot Style + Legende |
| `compareTag` | `string` | Farbige Tags |
| `compareList` | `string[]` | Listen-Vergleich |
| `compareRadar` | `[{axis,value}]` | Überlagerte Radars + Pilz-Legende |
| `comparePie` | `{key:number}` | Kreisdiagramme + Segment-Legende |
| `compareTimeline` | `[{date,event}]` | Zeitliche Events + Pilz-Legende |
| `compareImage` | `url` | Bildergalerie |
| `compareBoolean` | `true/false` | Ja/Nein Icons |
| `compareObject` | `{key:value}` | Tabellen-Diff |
| `compareText` | `string` | Text-Vergleich |

### MORPH-PURITY REGEL

```javascript
// ✅ ERLAUBT in Morphs:
document.createElement()     // DOM erstellen
element.appendChild()        // DOM aufbauen
element.addEventListener()   // Lokale Events auf eigenem Element
config.onCallback?.()        // Callbacks aufrufen

// ❌ VERBOTEN in Morphs:
document.dispatchEvent()     // → Nutze Callbacks!
document.addEventListener()  // → Nutze Methoden auf Element!
window.addEventListener()    // → Nie global!
window.location             // → Nur für URL-Parsing (read-only)
```

**Warum?** Morphs sind REINE Transformationen: `(wert, config) → HTMLElement`

## DATENGETRIEBENE MORPH-ERKENNUNG

Die Pipeline erkennt automatisch den passenden Morph anhand der **DATENSTRUKTUR** (nicht Feldname!).

### Erkennungs-Kaskade

```
1. Schema-Typ: felder.feldname.typ (schema/felder.yaml)
        ↓ falls nicht definiert
2. Erkennung: detectType(wert) mit erkennungConfig (morphs.yaml)
        ↓ falls keine Regel greift
3. Regeln: morphs.yaml/regeln (typ-basiert)
        ↓ falls keine Regel greift
4. Defaults: string→text, number→number, array→list, object→object
```

## Badge-Farben (Gedämpft)

Badges verwenden gedämpfte Farben für ein elegantes Design:
```javascript
// Beispiel aus badge.js
variants: {
  essbar: '#60c090',      // Gedämpftes Grün
  giftig: '#d06080',      // Gedämpftes Rot
  verfügbar: '#60a0d0',   // Gedämpftes Blau
  // ...
}
```

### Automatische Erkennung (aus morphs.yaml)

| Datenstruktur | Erkannter Morph | Config-Quelle |
|---------------|-----------------|---------------|
| `{min: 10, max: 25}` | `range` | `erkennung.objekt.range.benoetigtKeys` |
| `{min, max, avg, count}` | `stats` | `erkennung.objekt.stats.benoetigtKeys` |
| `{A: 30, B: 50}` (nur Zahlen) | `pie` | `erkennung.objekt.pie.nurNumerisch` |
| `[{axis: "X", value: 80}]` (3+) | `radar` | `erkennung.array.radar.benoetigtKeys` |
| `[{date: "...", event: "..."}]` | `timeline` | `erkennung.array.timeline.benoetigtKeys` |
| `[{label: "A", value: 10}]` | `pie`/`bar` | `erkennung.array.pie/bar.labelKeys` |
| Zahl 0-10 mit Dezimalen | `rating` | `erkennung.rating` |
| Zahl 0-100 Integer | `progress` | `erkennung.progress` |
| String mit Badge-Keyword | `badge` | `erkennung.badge.keywords` |

### Schema-Definition für explizite Zuweisung

```yaml
# config/schema.yaml
felder:
  # Range-Morph für Temperatur
  temperatur:
    typ: range
    label: Temperatur
    einheit: °C
  
  # Pie-Chart für Nährwerte
  naehrwerte:
    typ: pie
    label: Nährwerte
  
  # Bar-Chart für Inhaltsstoffe
  inhaltsstoffe:
    typ: bar
    label: Wirkstoffe
    maxBalken: 6
  
  # Radar für Eigenschaften-Profil
  profil:
    typ: radar
    label: Eigenschaften
  
  # Rating für Bewertungen
  geschmack_rating:
    typ: rating
    label: Geschmack
    maxStars: 5
  
  # Progress für Fortschritt
  reifegrad:
    typ: progress
    label: Reifegrad
    einheit: '%'
  
  # Stats für Statistiken
  statistik:
    typ: stats
    label: Übersicht
  
  # Timeline für Entwicklung
  lebenszyklus:
    typ: timeline
    label: Lebenszyklus
  
  # Badge für Status
  essbarkeit:
    typ: badge
    label: Essbarkeit
```

### Datenbeispiele für jeden Morph

```javascript
// PIE - Kreisdiagramm
{
  naehrwerte: [
    { label: "Protein", value: 25 },
    { label: "Kohlenhydrate", value: 45 },
    { label: "Fett", value: 30 }
  ]
}
// ODER als Objekt:
{ naehrwerte: { Protein: 25, Kohlenhydrate: 45, Fett: 30 } }

// BAR - Balkendiagramm
{
  wirkstoffe: [
    { label: "Beta-Glucan", value: 12.5, unit: "mg" },
    { label: "Ergothionein", value: 8.3, unit: "mg" },
    { label: "Lentinan", value: 5.1, unit: "mg" }
  ]
}

// RADAR - Spider-Chart (mind. 3 Achsen)
{
  profil: [
    { axis: "Geschmack", value: 85 },
    { axis: "Textur", value: 70 },
    { axis: "Aroma", value: 90 },
    { axis: "Umami", value: 75 },
    { axis: "Würze", value: 60 }
  ]
}

// RATING - Sterne-Bewertung
{ geschmack_rating: 4.5 }
// ODER:
{ geschmack_rating: { rating: 4.5, max: 5 } }

// PROGRESS - Fortschrittsbalken
{ reifegrad: 75 }
// ODER:
{ reifegrad: { value: 75, max: 100, label: "Reife" } }

// STATS - Statistik-Karte
{
  ernte_stats: {
    min: 50,
    max: 200,
    avg: 125,
    count: 42,
    unit: "g"
  }
}

// TIMELINE - Zeitliche Abfolge
{
  lebenszyklus: [
    { date: "Tag 1-3", event: "Myzel-Wachstum" },
    { date: "Tag 4-7", event: "Primordien" },
    { date: "Tag 8-14", event: "Fruchtkörper", active: true }
  ]
}

// BADGE - Status-Label
{ essbarkeit: "essbar" }
// ODER mit Variant:
{ essbarkeit: { status: "essbar", variant: "success" } }
```

## TODO für Feld-Auswahl
- Morphs müssen **klickbar** werden für Feld-Auswahl
- Klick auf Morph-Element → dispatcht Event mit Feld-Infos
- Ausgewählte Felder bekommen `.ausgewaehlt` Klasse → Glow-Effekt

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

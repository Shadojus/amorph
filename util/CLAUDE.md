# Util

Kleine Helfer. Keine Abhängigkeiten.

## 🚧 AKTUELLER STAND (02.12.2025 - FINAL)

### ✅ Implementiert
- `dom.js` - Sichere DOM-Manipulation
- `fetch.js` - Datenbank-Zugriff + Highlight-System
- `session.js` - Session-Handling
- `semantic.js` - **Config-Gateway** (Schema + Morphs-Config)

### semantic.js - Das Config-Gateway

**Zentrale Anlaufstelle für alle Config-Werte aus YAML:**

```javascript
// === SCHEMA-ZUGRIFF ===
setSchema(schema)              // Schema setzen (wird beim Start aufgerufen)
getSchema()                    // Ganzes Schema holen
getFeldReihenfolge()           // Array der Feldnamen in definierter Reihenfolge
sortBySchemaOrder(obj)         // Objekt nach Schema-Reihenfolge sortieren
getFeldConfig(feldname)        // Config für einzelnes Feld
getFeldMorphs()                // Map feldName → typ aus Schema
getVersteckteFelder()          // Array der versteckten Felder
getAlleFeldConfigs()           // Alle Feld-Configs

// === MORPHS-CONFIG ZUGRIFF ===
setMorphsConfig(config)        // Morphs-Config setzen (wird beim Start aufgerufen)
getFarben(palette)             // Holt Farben: 'pilze', 'diagramme', 'standard'
getBadgeConfig()               // Holt Badge-Variants & Colors

// === SEMANTISCHE SUCHE ===
semanticScore(item, query)     // Berechnet Relevanz-Score für Item
getSuchfelder()                // Array der durchsuchbaren Felder

// === PERSPEKTIVEN ===
getPerspektivenKeywords()      // Keywords für Auto-Aktivierung
getPerspektivenListe()         // Alle Perspektiven als Array
getPerspektivenMorphConfig()   // Morph-Config basierend auf Perspektiven
getAllePerspektivenFarben()    // 4-Farben-Grid für aktive Perspektiven
```

### ⚠️ Bekannter Hardcode in semantic.js

| Zeile | Was | Status |
|-------|-----|--------|
| 159 | `'ganzjährig'` String-Check | 🟡 Sollte aus Schema kommen |
| 304 | `['#808080']` Fallback-Farbe | ✅ Akzeptabler Fallback |

### fetch.js - Datenquellen + Highlights

```javascript
// Datenquelle erstellen
createDataSource(config)

// Highlight-System für Suchtreffer
highlightMatches(element, matchedTerms)  // Markiert Suchtreffer im DOM
clearHighlights(container)               // Entfernt alle Highlights
```

## dom.js

Sichere DOM-Manipulation.

```javascript
// util/dom.js

/**
 * Element erstellen mit Attributen und Kindern
 */
export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data')) {
      element.dataset[key.slice(4).toLowerCase()] = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }
  
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  
  return element;
}

/**
 * Text sicher setzen (kein innerHTML!)
 */
export function setText(element, text) {
  element.textContent = String(text ?? '');
}

/**
 * Attribute sicher setzen
 */
export function setAttr(element, name, value) {
  if (value === null || value === undefined) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, String(value));
  }
}

/**
 * CSS-Klassen toggle
 */
export function toggleClass(element, className, force) {
  return element.classList.toggle(className, force);
}

/**
 * Element leeren
 */
export function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Query mit Fallback
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
```

## fetch.js

Datenbank-Zugriff abstrahiert.

```javascript
// util/fetch.js

/**
 * DataSource Factory
 */
export function createDataSource(config) {
  const { typ, url, headers = {} } = config.quelle;
  
  switch (typ) {
    case 'pocketbase':
      return new PocketBaseSource(url, config);
    case 'rest':
      return new RestSource(url, headers);
    case 'json':
      return new JsonSource(url);
    default:
      throw new Error(`Unbekannter Datenquellen-Typ: ${typ}`);
  }
}

class PocketBaseSource {
  constructor(url, config) {
    this.url = url;
    this.sammlung = config.quelle.sammlung;
  }
  
  async query({ search, limit = 50, filter } = {}) {
    const params = new URLSearchParams();
    params.set('perPage', limit);
    
    if (search) {
      params.set('filter', `name~"${escapeFilter(search)}"`);
    }
    if (filter) {
      params.set('filter', filter);
    }
    
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`PocketBase Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  }
  
  async getOne(id) {
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records/${id}`
    );
    
    if (!response.ok) {
      throw new Error(`PocketBase Fehler: ${response.status}`);
    }
    
    return response.json();
  }
}

class RestSource {
  constructor(url, headers) {
    this.url = url;
    this.headers = headers;
  }
  
  async query({ search, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (limit) params.set('limit', limit);
    
    const response = await fetch(`${this.url}?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`REST Fehler: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getOne(id) {
    const response = await fetch(`${this.url}/${id}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`REST Fehler: ${response.status}`);
    }
    
    return response.json();
  }
}

class JsonSource {
  constructor(url) {
    this.url = url;
    this.data = null;
  }
  
  async load() {
    if (!this.data) {
      const response = await fetch(this.url);
      this.data = await response.json();
    }
    return this.data;
  }
  
  async query({ search, limit = 50 } = {}) {
    const data = await this.load();
    let items = Array.isArray(data) ? data : data.items || [];
    
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(item => 
        JSON.stringify(item).toLowerCase().includes(lower)
      );
    }
    
    return items.slice(0, limit);
  }
  
  async getOne(id) {
    const data = await this.load();
    const items = Array.isArray(data) ? data : data.items || [];
    return items.find(item => item.id === id);
  }
}

/**
 * Filter-String escapen
 */
function escapeFilter(str) {
  return str.replace(/["\\]/g, '\\$&');
}
```

## session.js

Session-Handling.

```javascript
// util/session.js

/**
 * Session aus Cookie oder Storage lesen
 */
export function getSession() {
  // Cookie versuchen
  const cookie = document.cookie
    .split('; ')
    .find(c => c.startsWith('amorph_session='));
  
  if (cookie) {
    return { id: cookie.split('=')[1], source: 'cookie' };
  }
  
  // SessionStorage (falls erlaubt)
  try {
    const stored = sessionStorage.getItem('amorph_session');
    if (stored) {
      return { id: stored, source: 'storage' };
    }
  } catch {
    // Storage nicht verfügbar
  }
  
  return null;
}

/**
 * Session erstellen
 */
export function createSession() {
  const id = crypto.randomUUID();
  
  // In Cookie speichern (httpOnly nicht möglich im Browser)
  document.cookie = `amorph_session=${id}; path=/; SameSite=Strict; max-age=86400`;
  
  return { id, source: 'cookie' };
}

/**
 * Session löschen
 */
export function clearSession() {
  document.cookie = 'amorph_session=; path=/; max-age=0';
  try {
    sessionStorage.removeItem('amorph_session');
  } catch {
    // Ignorieren
  }
}
```

## validate.js

Einfache Validierung.

```javascript
// util/validate.js

/**
 * Wert gegen Typ prüfen
 */
export function isType(wert, typ) {
  switch (typ) {
    case 'string':
      return typeof wert === 'string';
    case 'number':
      return typeof wert === 'number' && !isNaN(wert);
    case 'boolean':
      return typeof wert === 'boolean';
    case 'array':
      return Array.isArray(wert);
    case 'object':
      return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
    case 'range':
      return isType(wert, 'object') && 'min' in wert && 'max' in wert;
    default:
      return true;
  }
}

/**
 * Objekt gegen Schema prüfen
 */
export function validateSchema(daten, schema) {
  const fehler = [];
  
  for (const [feld, typ] of Object.entries(schema)) {
    if (!(feld in daten)) {
      fehler.push(`Feld fehlt: ${feld}`);
      continue;
    }
    
    const erwarteterTyp = typeof typ === 'object' ? typ.typ : typ;
    if (!isType(daten[feld], erwarteterTyp)) {
      fehler.push(`${feld}: erwartet ${erwarteterTyp}, bekam ${typeof daten[feld]}`);
    }
  }
  
  return fehler;
}

/**
 * URL validieren
 */
export function isValidUrl(url, erlaubteProtokolle = ['http:', 'https:']) {
  try {
    const parsed = new URL(url, window.location.origin);
    return erlaubteProtokolle.includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

## Keine Abhängigkeiten

Diese Funktionen haben keine externen Abhängigkeiten. Sie nutzen nur Browser-APIs:
- `document.createElement`
- `fetch`
- `URL`
- `crypto.randomUUID`

Das macht sie leicht testbar und portabel.

## semantic.js

Schema-basierte semantische Suche. Ersetzt hardcodierte Suchlogik durch konfigurierbare Regeln aus `config/schema.yaml`.

```javascript
import { setSchema, semanticScore, getPerspektivenKeywords, getSuchfelder } from './semantic.js';

// Schema setzen (nach Config-Load)
setSchema(config.schema);

// Semantische Suche
const { score, matches } = semanticScore(item, 'essbar pilze');
// → { score: 80, matches: ['Essbar', 'Speisepilz'] }

// Perspektiven-Keywords abrufen
const keywords = getPerspektivenKeywords();
// → { kulinarisch: ['rezept', 'kochen'], sicherheit: ['giftig', 'gefährlich'], ... }

// Suchfelder mit Gewichtung
const felder = getSuchfelder();
// → { name: { gewicht: 100, exakt: true }, beschreibung: { gewicht: 20 }, ... }
```

### Debug-Logging

Alle Funktionen loggen über `debug.suche()` und `debug.perspektiven()`:

- **Schema geladen**: Zeigt geladene Felder, Semantik-Regeln, Perspektiven
- **Semantik-Analyse startet**: Bei jeder Suchanfrage pro Item
- **Semantik-Match**: Bei gefundenen Treffern mit Score
- **Semantik-Ergebnis**: Gesamtscore pro Item
- **Warnungen**: Falls kein Schema geladen ist

### Strategien

Die semantische Suche unterstützt verschiedene Matching-Strategien:

| Strategie | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `werte` | Exakte Werte-Übereinstimmung | `essbarkeit: Essbar` |
| `enthält` | Teilstring-Suche in Feld | `standort enthält "wald"` |
| `existiert` | Prüft ob Feld nicht leer ist | `verwechslung hat Einträge` |
| `aktuell` | Aktueller Monat in Saison | `saison enthält "November"` |


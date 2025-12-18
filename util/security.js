/**
 * AMORPH Security Utilities
 * 
 * Sichere DOM-Manipulation und Input-Sanitization
 */

// ============================================================================
// HTML Sanitization
// ============================================================================

/**
 * Erlaubte HTML-Tags für sanitizeHTML
 */
const ALLOWED_TAGS = new Set([
  'span', 'div', 'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img', 'svg', 'path', 'circle', 'rect', 'line', 'text', 'g',
  'code', 'pre', 'blockquote', 'hr',
  'details', 'summary', 'figure', 'figcaption'
]);

/**
 * Erlaubte Attribute
 */
const ALLOWED_ATTRS = new Set([
  'class', 'id', 'style', 'title', 'alt', 'src', 'href', 'target',
  'data-*', 'aria-*', 'role',
  // SVG-spezifisch
  'd', 'fill', 'stroke', 'stroke-width', 'viewBox', 'width', 'height',
  'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2',
  'transform', 'opacity', 'stroke-dasharray', 'stroke-linecap'
]);

/**
 * Erlaubte URL-Schemes
 */
const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Escapet HTML-Entitäten
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Unescapet HTML-Entitäten
 * @param {string} str 
 * @returns {string}
 */
export function unescapeHtml(str) {
  if (str === null || str === undefined) return '';
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Prüft ob ein URL-Scheme erlaubt ist
 * @param {string} url 
 * @returns {boolean}
 */
function isUrlSafe(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return ALLOWED_SCHEMES.has(parsed.protocol);
  } catch {
    // Relative URLs sind OK
    return !url.includes(':') || url.startsWith('data:image/');
  }
}

/**
 * Prüft ob ein Attribut erlaubt ist
 * @param {string} name 
 * @returns {boolean}
 */
function isAttrAllowed(name) {
  if (ALLOWED_ATTRS.has(name)) return true;
  if (name.startsWith('data-')) return true;
  if (name.startsWith('aria-')) return true;
  return false;
}

/**
 * Sanitiert HTML-String (einfache Version ohne externe Bibliothek)
 * @param {string} html 
 * @param {Object} options
 * @param {Set<string>} [options.allowedTags] - Zusätzliche erlaubte Tags
 * @returns {string}
 */
export function sanitizeHtml(html, options = {}) {
  if (!html) return '';
  
  const allowedTags = options.allowedTags 
    ? new Set([...ALLOWED_TAGS, ...options.allowedTags])
    : ALLOWED_TAGS;
  
  // Parse HTML
  const template = document.createElement('template');
  template.innerHTML = html;
  
  // Rekursiv säubern
  sanitizeNode(template.content, allowedTags);
  
  return template.innerHTML;
}

/**
 * Sanitiert einen DOM-Knoten rekursiv
 * @param {Node} node 
 * @param {Set<string>} allowedTags 
 */
function sanitizeNode(node, allowedTags) {
  // Collect nodes to process (avoid modifying while iterating)
  const children = Array.from(node.childNodes);
  
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {Element} */ (child);
      const tagName = el.tagName.toLowerCase();
      
      // Nicht erlaubte Tags entfernen
      if (!allowedTags.has(tagName)) {
        // Script/style komplett entfernen
        if (tagName === 'script' || tagName === 'style') {
          el.remove();
          continue;
        }
        // Andere Tags: Inhalt behalten, Tag entfernen
        while (el.firstChild) {
          node.insertBefore(el.firstChild, el);
        }
        el.remove();
        // Re-sanitize the moved children
        sanitizeNode(node, allowedTags);
        return;
      }
      
      // Gefährliche Attribute entfernen
      const attrsToRemove = [];
      for (const attr of el.attributes) {
        // Event Handler (onclick, onerror, etc.)
        if (attr.name.startsWith('on')) {
          attrsToRemove.push(attr.name);
          continue;
        }
        
        // javascript: URLs
        if (['href', 'src', 'action'].includes(attr.name)) {
          if (!isUrlSafe(attr.value)) {
            attrsToRemove.push(attr.name);
          }
        }
        
        // Nicht erlaubte Attribute
        if (!isAttrAllowed(attr.name)) {
          attrsToRemove.push(attr.name);
        }
      }
      
      for (const attrName of attrsToRemove) {
        el.removeAttribute(attrName);
      }
      
      // Rekursiv
      sanitizeNode(el, allowedTags);
    }
  }
}

// ============================================================================
// Safe DOM Helpers
// ============================================================================

/**
 * Erstellt ein Element mit sicheren Attributen
 * @param {string} tag 
 * @param {Object} [attrs]
 * @param {string|Node|(string|Node)[]} [children]
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = null) {
  const el = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    
    // Event Handler als Funktionen erlauben
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
      continue;
    }
    
    // Keine Event Handler als Strings!
    if (key.startsWith('on')) continue;
    
    // Klassen als Array oder String
    if (key === 'class' || key === 'className') {
      el.className = Array.isArray(value) ? value.join(' ') : String(value);
      continue;
    }
    
    // Style als Objekt oder String
    if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
      continue;
    }
    
    // Data-Attribute (data-foo or dataFoo)
    if (key.startsWith('data-')) {
      el.setAttribute(key, String(value));
      continue;
    }
    if (key.startsWith('data') && key.length > 4 && key[4] === key[4].toUpperCase()) {
      // dataFoo -> data-foo
      const dataKey = key.slice(4).replace(/([A-Z])/g, '-$1').toLowerCase();
      el.setAttribute('data' + dataKey, String(value));
      continue;
    }
    
    // Normale Attribute
    el.setAttribute(key, String(value));
  }
  
  // Children hinzufügen
  if (children !== null) {
    appendChildren(el, children);
  }
  
  return el;
}

/**
 * Fügt Kinder sicher hinzu
 * @param {Element} parent 
 * @param {string|Node|(string|Node)[]} children 
 */
export function appendChildren(parent, children) {
  const items = Array.isArray(children) ? children : [children];
  
  for (const child of items) {
    if (child === null || child === undefined) continue;
    
    if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      // Strings als textContent (sicher!)
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/**
 * Setzt Text-Inhalt sicher
 * @param {Element} el 
 * @param {string} text 
 */
export function setTextContent(el, text) {
  el.textContent = text ?? '';
}

/**
 * Setzt HTML-Inhalt nach Sanitization
 * @param {Element} el 
 * @param {string} html 
 * @param {Object} [options] - Optionen für sanitizeHtml
 */
export function setInnerHtml(el, html, options = {}) {
  el.innerHTML = sanitizeHtml(html, options);
}

/**
 * Erstellt ein Leer-Element (für "keine Daten")
 * @param {string} className 
 * @param {string} text 
 * @returns {HTMLElement}
 */
export function createEmptyElement(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitiert einen String für die Anzeige
 * @param {*} value 
 * @param {Object} options
 * @param {number} [options.maxLength=1000] - Maximale Länge
 * @param {boolean} [options.trim=true] - Whitespace trimmen
 * @returns {string}
 */
export function sanitizeString(value, { maxLength = 1000, trim = true } = {}) {
  if (value === null || value === undefined) return '';
  
  let str = String(value);
  
  if (trim) {
    str = str.trim();
  }
  
  if (str.length > maxLength) {
    str = str.slice(0, maxLength) + '…';
  }
  
  return str;
}

/**
 * Sanitiert eine Zahl
 * @param {*} value 
 * @param {Object} options
 * @param {number} [options.min] - Minimalwert
 * @param {number} [options.max] - Maximalwert
 * @param {number} [options.default=0] - Default bei ungültigem Wert
 * @returns {number}
 */
export function sanitizeNumber(value, { min, max, default: defaultVal = 0 } = {}) {
  let num = Number(value);
  
  if (!Number.isFinite(num)) {
    return defaultVal;
  }
  
  if (min !== undefined && num < min) num = min;
  if (max !== undefined && num > max) num = max;
  
  return num;
}

/**
 * Sanitiert eine URL
 * @param {string} url 
 * @param {Object} options
 * @param {boolean} [options.allowData=false] - data: URLs erlauben
 * @returns {string|null} - null wenn ungültig
 */
export function sanitizeUrl(url, { allowData = false } = {}) {
  if (!url) return null;
  
  // Relative URLs sind OK (beginnen mit / oder sind ohne Scheme)
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }
  
  // Check for dangerous schemes before parsing
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('vbscript:')) {
    return null;
  }
  
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Erlaubte Schemes prüfen
    if (ALLOWED_SCHEMES.has(parsed.protocol)) {
      return parsed.href;
    }
    
    // Data-URLs für Bilder erlauben
    if (allowData && parsed.protocol === 'data:' && url.startsWith('data:image/')) {
      return url;
    }
    
    return null;
  } catch {
    // Keine URL mit Scheme, also relativ
    if (!url.includes(':')) {
      return url;
    }
    return null;
  }
}

/**
 * Sanitiert ein Objekt rekursiv
 * @param {*} obj 
 * @param {number} [depth=5] - Maximale Tiefe
 * @returns {*}
 */
export function sanitizeObject(obj, depth = 5) {
  if (depth <= 0) return '[max depth]';
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number') {
    return Number.isFinite(obj) ? obj : null;
  }
  
  if (typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth - 1));
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Gefährliche Keys überspringen
      if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
        continue;
      }
      result[sanitizeString(key, { maxLength: 100 })] = sanitizeObject(value, depth - 1);
    }
    return result;
  }
  
  // Funktionen und andere Typen ignorieren
  return null;
}

// ============================================================================
// Template Literal Tag für sichere HTML-Interpolation
// ============================================================================

/**
 * Template Tag für sicheres HTML
 * Verwendung: html`<div>${unsafeValue}</div>`
 * @param {TemplateStringsArray} strings 
 * @param  {...any} values 
 * @returns {string}
 */
export function html(strings, ...values) {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    
    if (i < values.length) {
      const value = values[i];
      
      // Bereits sanitierte Werte (markiert mit __safe)
      if (value && value.__safe) {
        result += value.value;
      }
      // Nodes: nicht interpolierbar
      else if (value instanceof Node) {
        result += '[Node]';
      }
      // Alles andere escapen
      else {
        result += escapeHtml(value);
      }
    }
  }
  
  return result;
}

/**
 * Markiert einen Wert als bereits sicher (für html``)
 * @param {string} value 
 * @returns {{ __safe: true, value: string }}
 */
export function safe(value) {
  return { __safe: true, value: String(value) };
}

// ============================================================================
// CSP Helper
// ============================================================================

/**
 * Erstellt einen Nonce für Inline-Scripts
 * @returns {string}
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * CSP-Header-Empfehlung für AMORPH
 */
export const CSP_RECOMMENDATION = `
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
`.trim().replace(/\s+/g, ' ');

// ============================================================================
// Export
// ============================================================================

export default {
  escapeHtml,
  unescapeHtml,
  sanitizeHtml,
  createElement,
  appendChildren,
  setTextContent,
  setInnerHtml,
  createEmptyElement,
  sanitizeString,
  sanitizeNumber,
  sanitizeUrl,
  sanitizeObject,
  html,
  safe,
  generateNonce,
  CSP_RECOMMENDATION
};

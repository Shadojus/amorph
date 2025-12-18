import { debug } from '../../../observer/debug.js';

/**
 * Helper to format any value safely - prevents [object Object]
 */
function formatVal(v) {
  if (v === null || v === undefined) return '–';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    if (v.name) return v.name;
    if (v.label) return v.label;
    if (v.title) return v.title;
    if (v.value !== undefined) return formatVal(v.value);
    return '{...}';
  }
  return String(v);
}

/**
 * TEXT MORPH - Stellt primitive Werte als Text dar
 * 
 * Kann auch als Fallback für Objekte dienen, die kein
 * spezifisches Morph haben.
 */
export function text(wert, config = {}) {
  debug.morphs('text', { wert: String(wert).slice(0, 50), config });
  const el = document.createElement('span');
  el.className = 'amorph-text';
  
  // Objekte intelligent darstellen
  if (typeof wert === 'object' && wert !== null) {
    // Array: Inline-Liste (format each item)
    if (Array.isArray(wert)) {
      el.textContent = wert.map(formatVal).join(', ');
    } 
    // Objekt: Versuche sinnvolle Darstellung
    else {
      // Bekannte Felder bevorzugen
      if (wert.name) {
        el.textContent = String(wert.name);
      } else if (wert.label) {
        el.textContent = String(wert.label);
      } else if (wert.title || wert.titel) {
        el.textContent = String(wert.title || wert.titel);
      } else if (wert.value !== undefined) {
        el.textContent = formatVal(wert.value);
      } else {
        // Fallback: Key-Value Paare
        const entries = Object.entries(wert)
          .slice(0, 3) // Max 3 Einträge
          .map(([k, v]) => `${k}: ${formatVal(v)}`)
          .join(', ');
        el.textContent = entries || '(leer)';
        el.classList.add('amorph-text-object');
      }
    }
  } else {
    el.textContent = formatVal(wert);
  }
  
  if (config.maxLaenge && el.textContent.length > config.maxLaenge) {
    el.textContent = el.textContent.slice(0, config.maxLaenge) + '…';
    el.title = formatVal(wert);
  }
  
  return el;
}

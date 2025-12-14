import { debug } from '../../../observer/debug.js';

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
    // Array: Inline-Liste
    if (Array.isArray(wert)) {
      el.textContent = wert.join(', ');
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
        el.textContent = String(wert.value);
      } else {
        // Fallback: Key-Value Paare
        const entries = Object.entries(wert)
          .slice(0, 3) // Max 3 Einträge
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? '...' : v}`)
          .join(', ');
        el.textContent = entries || '(leer)';
        el.classList.add('amorph-text-object');
      }
    }
  } else {
    el.textContent = String(wert ?? '');
  }
  
  if (config.maxLaenge && el.textContent.length > config.maxLaenge) {
    el.textContent = el.textContent.slice(0, config.maxLaenge) + '…';
    el.title = String(wert);
  }
  
  return el;
}

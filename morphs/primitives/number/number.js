import { debug } from '../../../observer/debug.js';

/**
 * NUMBER MORPH - Formatiert Zahlen intelligent
 * 
 * Kirk-Prinzip: Zahlen müssen lesbar sein
 * - Automatische Dezimalstellen
 * - Tausender-Trennung bei großen Zahlen
 * - Einheit wenn verfügbar
 */
export function number(wert, config = {}) {
  debug.morphs('number', { wert, einheit: config.einheit });
  const el = document.createElement('span');
  el.className = 'amorph-number';
  
  let num = Number(wert);
  let formatted;
  
  // Sehr kleine Zahlen wissenschaftlich
  if (num !== 0 && Math.abs(num) < 0.001) {
    formatted = num.toExponential(2);
  }
  // Explizite Dezimalstellen
  else if (config.dezimalen !== undefined) {
    formatted = num.toFixed(config.dezimalen);
  }
  // Automatische Formatierung
  else if (Number.isInteger(num)) {
    // Große Ganzzahlen: Tausender-Trennung
    if (Math.abs(num) >= 1000) {
      formatted = num.toLocaleString('de-DE');
    } else {
      formatted = String(num);
    }
  } else {
    // Dezimalzahlen: Max 2 Stellen, führende Nullen entfernen
    formatted = num.toFixed(2).replace(/\.?0+$/, '');
  }
  
  // Legacy-Option
  if (config.tausenderTrennzeichen && !formatted.includes('.') && !formatted.includes(',')) {
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  // Einheit anfügen
  if (config.einheit) {
    formatted = `${formatted} ${config.einheit}`;
  }
  
  el.textContent = formatted;
  return el;
}

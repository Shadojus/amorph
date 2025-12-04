import { debug } from '../../observer/debug.js';

export function boolean(wert, config = {}) {
  debug.morphs('boolean', { wert: !!wert, alsIcon: config.alsIcon });
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

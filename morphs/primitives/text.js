import { debug } from '../../observer/debug.js';

export function text(wert, config = {}) {
  debug.morphs('text', { wert: String(wert).slice(0, 50), config });
  const el = document.createElement('span');
  el.className = 'amorph-text';
  el.textContent = String(wert ?? '');
  
  if (config.maxLaenge && el.textContent.length > config.maxLaenge) {
    el.textContent = el.textContent.slice(0, config.maxLaenge) + '…';
    el.title = String(wert);
  }
  
  return el;
}

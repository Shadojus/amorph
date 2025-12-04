import { debug } from '../../observer/debug.js';

export function list(wert, config = {}, morphen) {
  const el = document.createElement('ul');
  el.className = 'amorph-list';
  
  if (!Array.isArray(wert)) {
    debug.warn('list-morph erwartet Array', { bekam: typeof wert });
    return el;
  }
  
  debug.morphs('list', { anzahl: wert.length, maxItems: config.maxItems });
  
  const items = config.maxItems ? wert.slice(0, config.maxItems) : wert;
  
  for (const item of items) {
    const li = document.createElement('li');
    if (morphen) {
      li.appendChild(morphen(item));
    } else {
      li.textContent = String(item);
    }
    el.appendChild(li);
  }
  
  if (config.maxItems && wert.length > config.maxItems) {
    el.setAttribute('data-truncated', 'true');
    el.setAttribute('data-total', wert.length);
  }
  
  return el;
}

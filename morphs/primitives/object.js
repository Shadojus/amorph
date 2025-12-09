import { debug } from '../../observer/debug.js';

export function object(wert, config = {}, morphen) {
  const el = document.createElement('dl');
  el.className = 'amorph-object';
  
  if (typeof wert !== 'object' || wert === null) {
    debug.warn('object-morph erwartet Objekt', { bekam: typeof wert });
    return el;
  }
  
  debug.morphs('object', { keys: Object.keys(wert) });
  
  const felder = config.felder || Object.keys(wert);
  
  for (const key of felder) {
    if (!(key in wert)) continue;
    
    const dt = document.createElement('dt');
    dt.textContent = config.labels?.[key] || key;
    el.appendChild(dt);
    
    const dd = document.createElement('dd');
    if (morphen) {
      const morphed = morphen(wert[key], key);
      if (morphed && morphed instanceof Node) {
        dd.appendChild(morphed);
      } else {
        // Fallback: Objekte als JSON, primitives als String
        const val = wert[key];
        if (typeof val === 'object' && val !== null) {
          dd.textContent = JSON.stringify(val);
        } else {
          dd.textContent = String(val ?? '');
        }
      }
    } else {
      const val = wert[key];
      if (typeof val === 'object' && val !== null) {
        dd.textContent = JSON.stringify(val);
      } else {
        dd.textContent = String(val);
      }
    }
    el.appendChild(dd);
  }
  
  return el;
}

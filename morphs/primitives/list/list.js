import { debug } from '../../../observer/debug.js';

// Format a value for display (handle objects)
function formatValue(val) {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // Known object patterns
    if (val.name) return val.name;
    if (val.label) return val.label;
    if (val.title) return val.title;
    if (val.value) return formatValue(val.value);
    // Step objects: "1. Do something"
    if (val.step !== undefined && val.label) return `${val.step}. ${val.label}`;
    // Date+event objects
    if (val.date && val.event) return `${val.date}: ${val.event}`;
    // Small objects: show key-value pairs
    const keys = Object.keys(val);
    if (keys.length <= 3) {
      return keys.map(k => `${k}: ${formatValue(val[k])}`).join(', ');
    }
    return `{${keys.length} fields}`;
  }
  return String(val);
}

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
      const morphed = morphen(item);
      if (morphed && morphed instanceof Node) {
        li.appendChild(morphed);
      } else {
        // Fallback: formatValue handles objects and primitives
        li.textContent = formatValue(item);
      }
    } else {
      li.textContent = formatValue(item);
    }
    el.appendChild(li);
  }
  
  if (config.maxItems && wert.length > config.maxItems) {
    el.setAttribute('data-truncated', 'true');
    el.setAttribute('data-total', wert.length);
  }
  
  return el;
}

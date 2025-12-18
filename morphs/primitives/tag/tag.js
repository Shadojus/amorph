import { debug } from '../../../observer/debug.js';

// Format value for display - handles objects properly
function formatValue(val) {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (val.name) return val.name;
    if (val.label) return val.label;
    if (val.title) return val.title;
    if (val.value !== undefined) return formatValue(val.value);
    if (Array.isArray(val)) return val.map(v => formatValue(v)).join(', ');
    const keys = Object.keys(val);
    if (keys.length === 0) return '–';
    if (keys.length <= 2) return keys.map(k => `${k}: ${formatValue(val[k])}`).join(', ');
    return `{${keys.length} Felder}`;
  }
  return String(val);
}

export function tag(wert, config = {}) {
  const hatFarbe = !!config.farben?.[wert];
  debug.morphs('tag', { 
    wert, 
    hatFarbe,
    farbe: config.farben?.[wert] || null,
    alleFarben: config.farben ? Object.keys(config.farben) : []
  });
  const el = document.createElement('span');
  el.className = 'amorph-tag';
  el.textContent = formatValue(wert);
  
  if (config.farben && config.farben[wert]) {
    el.style.setProperty('--tag-farbe', config.farben[wert]);
    debug.morphs('tag Farbe gesetzt', { wert, farbe: config.farben[wert] });
  }
  
  return el;
}

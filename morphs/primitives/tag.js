import { debug } from '../../observer/debug.js';

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
  el.textContent = String(wert);
  
  if (config.farben && config.farben[wert]) {
    el.style.setProperty('--tag-farbe', config.farben[wert]);
    debug.morphs('tag Farbe gesetzt', { wert, farbe: config.farben[wert] });
  }
  
  return el;
}

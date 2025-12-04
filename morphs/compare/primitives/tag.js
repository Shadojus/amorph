/**
 * COMPARE TAG - Chip-Vergleich für kategorische Daten
 */

import { debug } from '../../../observer/debug.js';

export function compareTag(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-tag';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const chips = document.createElement('div');
  chips.className = 'compare-chips';
  
  // Gruppiere nach Wert
  const nachWert = new Map();
  items.forEach(item => {
    const key = String(item.wert || '').toLowerCase();
    if (!nachWert.has(key)) {
      nachWert.set(key, { wert: item.wert, items: [] });
    }
    nachWert.get(key).items.push(item);
  });
  
  nachWert.forEach(({ wert, items: gruppeItems }) => {
    const chip = document.createElement('div');
    chip.className = 'compare-chip';
    
    const wertKey = String(wert || '').toLowerCase();
    const tagFarbe = config.farben?.[wertKey] || gruppeItems[0]?.farbe || '#666';
    
    chip.innerHTML = `
      <span class="chip-wert" style="background:${tagFarbe}">${wert || '–'}</span>
      <span class="chip-items">${gruppeItems.map(p => 
        `<span style="color:${p.farbe}">${p.name}</span>`
      ).join(', ')}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

export default compareTag;

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
    const ersteFarbKlasse = gruppeItems[0]?.farbKlasse || '';
    chip.className = `compare-chip ${ersteFarbKlasse}`;
    
    // Inline-Styles für jeden Namen (CSS greift nicht zuverlässig)
    const itemSpans = gruppeItems.map(p => {
      const textColor = p.textFarbe || p.farbe || 'white';
      const pName = p.name || p.id || '–';
      return `<span class="${p.farbKlasse || ''}" style="color:${textColor}">${pName}</span>`;
    }).join(', ');
    
    chip.innerHTML = `
      <span class="chip-wert">${wert || '–'}</span>
      <span class="chip-items">${itemSpans}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

export default compareTag;

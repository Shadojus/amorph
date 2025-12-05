/**
 * COMPARE TAG - Chip-Vergleich für kategorische Daten
 */

import { debug } from '../../../observer/debug.js';

// Hex zu RGBA konvertieren
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
    
    // Farbe transparenter machen für Glass-Effekt
    const transparenteFarbe = tagFarbe.startsWith('rgba') 
      ? tagFarbe.replace(/,[\s]*[\d.]+\)$/, ', 0.35)')
      : tagFarbe.startsWith('#') 
        ? hexToRgba(tagFarbe, 0.35)
        : `rgba(100, 100, 100, 0.35)`;
    
    chip.innerHTML = `
      <span class="chip-wert" style="background:${transparenteFarbe}">${wert || '–'}</span>
      <span class="chip-items">${gruppeItems.map(p => 
        `<span style="color:${p.textFarbe || p.farbe}">${p.name}</span>`
      ).join(', ')}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

export default compareTag;

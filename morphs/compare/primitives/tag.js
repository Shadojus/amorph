/**
 * COMPARE TAG - Chip comparison for categorical data
 */

import { debug } from '../../../../observer/debug.js';

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
  
  // Group by value
  const byValue = new Map();
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const key = String(val || '').toLowerCase();
    if (!byValue.has(key)) {
      byValue.set(key, { value: val, items: [] });
    }
    byValue.get(key).items.push(item);
  });
  
  byValue.forEach(({ value, items: groupItems }) => {
    const chip = document.createElement('div');
    const firstColorClass = groupItems[0]?.colorClass || groupItems[0]?.farbKlasse || '';
    chip.className = `compare-chip ${firstColorClass}`;
    
    // Inline styles for each name (CSS doesn't work reliably)
    const itemSpans = groupItems.map(p => {
      const textColor = p.textColor || p.textFarbe || p.color || p.farbe || 'white';
      const pName = p.name || p.id || '–';
      return `<span class="${p.colorClass || p.farbKlasse || ''}" style="color:${textColor}">${pName}</span>`;
    }).join(', ');
    
    chip.innerHTML = `
      <span class="chip-value">${value || '–'}</span>
      <span class="chip-items">${itemSpans}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

export default compareTag;

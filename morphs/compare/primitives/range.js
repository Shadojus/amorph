/**
 * COMPARE RANGE - Range comparison (min/max)
 */

import { debug } from '../../../../observer/debug.js';

export function compareRange(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-range';
  
  // Find global min/max
  let globalMin = Infinity;
  let globalMax = -Infinity;
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    if (typeof val === 'object' && val !== null) {
      const min = val.min ?? val.von ?? val.from ?? 0;
      const max = val.max ?? val.bis ?? val.to ?? min;
      if (min < globalMin) globalMin = min;
      if (max > globalMax) globalMax = max;
    } else if (typeof val === 'number') {
      if (val < globalMin) globalMin = val;
      if (val > globalMax) globalMax = val;
    }
  });
  
  const range = globalMax - globalMin || 1;
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    let min, max;
    
    if (typeof val === 'object' && val !== null) {
      min = val.min ?? val.von ?? val.from ?? 0;
      max = val.max ?? val.bis ?? val.to ?? min;
    } else if (typeof val === 'number') {
      min = max = val;
    } else {
      min = max = 0;
    }
    
    const leftPercent = ((min - globalMin) / range) * 100;
    const widthPercent = ((max - min) / range) * 100 || 2; // at least 2% for points
    
    const row = document.createElement('div');
    row.className = `range-row ${item.colorClass || item.farbKlasse || ''}`;
    
    const itemName = item.name || item.id || '–';
    
    // NO inline styles for colors! CSS classes handle this via pilz-farbe-X
    row.innerHTML = `
      <div class="range-name">${itemName}</div>
      <div class="range-track">
        <div class="range-bar" style="left:${leftPercent}%;width:${widthPercent}%"></div>
      </div>
      <div class="range-values">${min}${min !== max ? ` – ${max}` : ''}</div>
    `;
    el.appendChild(row);
  });
  
  // Scale
  const scale = document.createElement('div');
  scale.className = 'range-scale';
  scale.innerHTML = `
    <span>${globalMin}</span>
    <span>${globalMax}</span>
  `;
  el.appendChild(scale);
  
  return el;
}

export default compareRange;

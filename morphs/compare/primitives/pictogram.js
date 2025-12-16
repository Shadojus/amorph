/**
 * COMPARE PICTOGRAM - Pictogram comparison
 * Shows pictogram icons with counts
 */

import { debug } from '../../../../observer/debug.js';

export function comparePictogram(items, config = {}) {
  debug.morphs('comparePictogram', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pictogram';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-pictogram-container';
  
  // Determine max for scaling
  const values = items.map(item => {
    const val = item.value ?? item.wert;
    return typeof val === 'number' ? val : (val?.count ?? val?.value ?? 0);
  });
  const maxVal = Math.max(...values, 1);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-pictogram-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'pictogram-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Pictogram icons
    const val = item.value ?? item.wert;
    const count = typeof val === 'number' ? val : (val?.count ?? val?.value ?? 0);
    const icon = val?.icon ?? '●';
    const displayCount = Math.min(10, Math.ceil((count / maxVal) * 10)); // Max 10 icons
    
    const iconsWrap = document.createElement('div');
    iconsWrap.className = 'pictogram-icons';
    
    for (let i = 0; i < displayCount; i++) {
      const iconEl = document.createElement('span');
      iconEl.className = 'pictogram-icon';
      iconEl.textContent = icon;
      iconsWrap.appendChild(iconEl);
    }
    
    row.appendChild(iconsWrap);
    
    // Value
    const wert = document.createElement('span');
    wert.className = 'pictogram-wert';
    wert.textContent = count.toLocaleString();
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default comparePictogram;

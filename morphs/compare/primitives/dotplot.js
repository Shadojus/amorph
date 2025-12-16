/**
 * COMPARE DOTPLOT - Dot plot comparison
 * Shows dots positioned by value
 */

import { debug } from '../../../../observer/debug.js';

export function compareDotplot(items, config = {}) {
  debug.morphs('compareDotplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-dotplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-dotplot-container';
  
  // Determine max value
  const values = items.map(item => {
    const val = item.value ?? item.wert;
    return typeof val === 'number' ? val : (val?.value ?? (parseFloat(val) || 0));
  });
  const maxVal = config.max || Math.max(...values, 100);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-dotplot-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'dotplot-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Track with dot
    const track = document.createElement('div');
    track.className = 'dotplot-track';
    
    const val = item.value ?? item.wert;
    const numVal = typeof val === 'number' ? val : (val?.value ?? (parseFloat(val) || 0));
    const percent = (numVal / maxVal) * 100;
    
    const dot = document.createElement('div');
    dot.className = 'dotplot-dot';
    dot.style.left = `${percent}%`;
    track.appendChild(dot);
    row.appendChild(track);
    
    // Value
    const wert = document.createElement('span');
    wert.className = 'dotplot-wert';
    wert.textContent = numVal.toLocaleString();
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareDotplot;

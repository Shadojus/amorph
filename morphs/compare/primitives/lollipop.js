/**
 * COMPARE LOLLIPOP - Lollipop chart comparison
 * Shows bars with dots at the end
 */

import { debug } from '../../../../observer/debug.js';

export function compareLollipop(items, config = {}) {
  debug.morphs('compareLollipop', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-lollipop';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-lollipop-container';
  
  // Determine max value
  const values = items.map(item => {
    const val = item.value ?? item.wert;
    return typeof val === 'number' ? val : (val?.value ?? (parseFloat(val) || 0));
  });
  const maxVal = config.max || Math.max(...values, 100);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-lollipop-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
      row.style.setProperty('--pilz-line', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'lollipop-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Lollipop track
    const track = document.createElement('div');
    track.className = 'lollipop-track';
    
    const val = item.value ?? item.wert;
    const numVal = typeof val === 'number' ? val : (val?.value ?? (parseFloat(val) || 0));
    const percent = (numVal / maxVal) * 100;
    
    // Stick
    const stick = document.createElement('div');
    stick.className = 'lollipop-stick';
    stick.style.width = `${percent}%`;
    track.appendChild(stick);
    
    // Dot
    const dot = document.createElement('div');
    dot.className = 'lollipop-dot';
    dot.style.left = `${percent}%`;
    track.appendChild(dot);
    
    row.appendChild(track);
    
    // Value
    const wert = document.createElement('span');
    wert.className = 'lollipop-wert';
    wert.textContent = numVal.toLocaleString();
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareLollipop;

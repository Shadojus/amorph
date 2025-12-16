/**
 * COMPARE BUBBLE - Bubble chart comparison
 * Shows bubbles sized by value
 */

import { debug } from '../../../../observer/debug.js';

export function compareBubble(items, config = {}) {
  debug.morphs('compareBubble', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bubble';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-bubble-container';
  
  // Determine max value for scaling
  const values = items.map(item => {
    const val = item.value ?? item.wert;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') return val.size ?? val.value ?? 0;
    return parseFloat(val) || 0;
  });
  const maxVal = Math.max(...values, 1);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-bubble-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'bubble-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Bubble
    const val = item.value ?? item.wert;
    const numVal = typeof val === 'number' ? val : (val?.size ?? val?.value ?? (parseFloat(val) || 0));
    const size = Math.sqrt(numVal / maxVal) * 40 + 10; // Scale between 10-50px
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble-circle';
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    row.appendChild(bubble);
    
    // Value
    const wert = document.createElement('span');
    wert.className = 'bubble-wert';
    wert.textContent = numVal.toLocaleString();
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBubble;

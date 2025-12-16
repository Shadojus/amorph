/**
 * COMPARE BADGE - Side-by-side badge comparison
 * Shows badges for each item with their colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareBadge(items, config = {}) {
  debug.morphs('compareBadge', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-badge';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-badge-container';
  
  items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'compare-badge-wrap';
    
    // Pilz-Farbe setzen
    if (item.color) {
      wrap.style.setProperty('--pilz-line', item.color);
      wrap.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'badge-name';
    name.textContent = item.name || item.id || '';
    wrap.appendChild(name);
    
    // Badge value
    const badge = document.createElement('span');
    badge.className = 'badge-value';
    const val = item.value ?? item.wert ?? '';
    badge.textContent = typeof val === 'object' ? (val.label || val.text || val.status || JSON.stringify(val)) : String(val);
    wrap.appendChild(badge);
    
    container.appendChild(wrap);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBadge;

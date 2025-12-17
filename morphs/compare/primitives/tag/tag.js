/**
 * COMPARE TAG - Chip comparison for categorical data
 * Uses the exact same HTML structure as the original tag morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareTag(items, config = {}) {
  debug.morphs('compareTag', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-tag';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all tags
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    const color = item.farbe || item.color;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original tag structure
    const tagEl = document.createElement('span');
    tagEl.className = 'amorph-tag';
    tagEl.textContent = String(val ?? '–');
    
    // Apply color if provided
    if (color) {
      tagEl.style.setProperty('--tag-farbe', color);
    }
    
    wrapper.appendChild(tagEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareTag;

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
    
    // Neon pilz colors
    const baseColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || baseColor;
    const textColor = item.textFarbe || baseColor;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply neon color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Use original tag structure with neon
    const tagEl = document.createElement('span');
    tagEl.className = 'amorph-tag';
    tagEl.textContent = String(val ?? '–');
    
    // Apply neon color
    tagEl.style.setProperty('--tag-farbe', baseColor);
    tagEl.style.borderColor = baseColor;
    tagEl.style.boxShadow = `0 0 6px ${glowColor}`;
    
    wrapper.appendChild(tagEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareTag;

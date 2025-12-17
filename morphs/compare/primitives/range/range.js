/**
 * COMPARE RANGE - Range comparison (min/max)
 * Uses the exact same HTML structure as the original range morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareRange(items, config = {}) {
  debug.morphs('compareRange', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-range';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all range displays
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Extract range values
    let min, max;
    if (typeof rawVal === 'object' && rawVal !== null) {
      min = rawVal.min ?? rawVal.von ?? rawVal.from ?? 0;
      max = rawVal.max ?? rawVal.bis ?? rawVal.to ?? min;
    } else if (typeof rawVal === 'number') {
      min = max = rawVal;
    } else {
      min = max = 0;
    }
    
    const einheit = config.einheit || rawVal?.einheit || rawVal?.unit || '';
    
    // Use original range structure
    const rangeEl = document.createElement('span');
    rangeEl.className = 'amorph-range';
    
    // Range text
    const text = document.createElement('span');
    text.className = 'amorph-range-text';
    text.textContent = `${min}${einheit} – ${max}${einheit}`;
    rangeEl.appendChild(text);
    
    // Visual bar
    const bar = document.createElement('span');
    bar.className = 'amorph-range-bar';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', text.textContent);
    if (item.farbe) bar.style.background = item.farbe;
    
    const skalaMin = config.skala?.min ?? 0;
    const skalaMax = config.skala?.max ?? Math.max(max * 1.2, 100);
    const startPercent = ((min - skalaMin) / (skalaMax - skalaMin)) * 100;
    const endPercent = ((max - skalaMin) / (skalaMax - skalaMin)) * 100;
    
    bar.style.setProperty('--range-start', `${startPercent}%`);
    bar.style.setProperty('--range-end', `${endPercent}%`);
    
    rangeEl.appendChild(bar);
    
    wrapper.appendChild(rangeEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareRange;

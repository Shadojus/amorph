/**
 * COMPARE BOOLEAN - Boolean comparison (Yes/No)
 * Uses the exact same HTML structure as the original boolean morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareBoolean(items, config = {}) {
  debug.morphs('compareBoolean', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-boolean';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all booleans
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    const isTrue = rawVal === true || rawVal === 'ja' || rawVal === 'yes' || rawVal === 1;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original boolean structure
    const boolEl = document.createElement('span');
    boolEl.className = 'amorph-boolean';
    boolEl.setAttribute('data-value', String(isTrue));
    if (item.farbe) boolEl.style.color = item.farbe;
    
    if (config.alsIcon) {
      boolEl.textContent = isTrue ? '✓' : '✗';
      boolEl.setAttribute('aria-label', isTrue ? 'Ja' : 'Nein');
    } else if (config.labels) {
      boolEl.textContent = isTrue ? config.labels.wahr : config.labels.falsch;
    } else {
      boolEl.textContent = isTrue ? 'Ja' : 'Nein';
    }
    
    wrapper.appendChild(boolEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBoolean;

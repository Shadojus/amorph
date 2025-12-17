/**
 * COMPARE NUMBER - Numeric comparison
 * Uses the exact same HTML structure as the original number morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareNumber(items, config = {}) {
  debug.morphs('compareNumber', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-number';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all numbers
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
    
    // Use original number structure
    const numberEl = document.createElement('span');
    numberEl.className = 'amorph-number';
    if (item.farbe) numberEl.style.color = item.farbe;
    
    let num = Number(rawVal);
    let formatted;
    
    if (num !== 0 && Math.abs(num) < 0.001) {
      formatted = num.toExponential(2);
    } else if (config.dezimalen !== undefined) {
      formatted = num.toFixed(config.dezimalen);
    } else if (Number.isInteger(num)) {
      if (Math.abs(num) >= 1000) {
        formatted = num.toLocaleString('de-DE');
      } else {
        formatted = String(num);
      }
    } else {
      formatted = num.toFixed(2).replace(/\.?0+$/, '');
    }
    
    if (config.einheit) {
      formatted = `${formatted} ${config.einheit}`;
    }
    
    numberEl.textContent = formatted;
    
    wrapper.appendChild(numberEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareNumber;

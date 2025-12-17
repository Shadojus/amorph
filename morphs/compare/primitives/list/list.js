/**
 * COMPARE LIST - List comparison
 * Uses the exact same HTML structure as the original list morph
 */

import { debug } from '../../../../observer/debug.js';

// Format a value for display (handle objects)
function formatValue(val) {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (val.name) return val.name;
    if (val.label) return val.label;
    if (val.title) return val.title;
    if (val.value) return formatValue(val.value);
    if (val.step && val.label) return `${val.step}. ${val.label}`;
    const keys = Object.keys(val);
    if (keys.length <= 3) {
      return keys.map(k => `${k}: ${val[k]}`).join(', ');
    }
    return `{${keys.length} fields}`;
  }
  return String(val);
}

export function compareList(items, config = {}) {
  debug.morphs('compareList', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-list';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all lists
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
    const labelText = item.name || item.id || '';
    label.textContent = labelText && labelText !== 'undefined' ? labelText : `#${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Use original list structure
    const listEl = document.createElement('ul');
    listEl.className = 'amorph-list';
    // Apply subtle neon to list bullets
    listEl.style.setProperty('--list-bullet-color', baseColor);
    
    if (!Array.isArray(val)) {
      // Single value - wrap in list
      const li = document.createElement('li');
      li.textContent = formatValue(val);
      listEl.appendChild(li);
    } else {
      const listItems = config.maxItems ? val.slice(0, config.maxItems) : val;
      
      for (const listItem of listItems) {
        const li = document.createElement('li');
        li.textContent = formatValue(listItem);
        listEl.appendChild(li);
      }
      
      if (config.maxItems && val.length > config.maxItems) {
        listEl.setAttribute('data-truncated', 'true');
        listEl.setAttribute('data-total', val.length);
      }
    }
    
    wrapper.appendChild(listEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareList;

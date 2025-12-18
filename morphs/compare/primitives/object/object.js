/**
 * COMPARE OBJECT - Object comparison (nested data)
 * Uses the exact same HTML structure as the original object morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareObject(items, config = {}) {
  debug.morphs('compareObject', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-object';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    const labelText = item.name || item.id || '';
    label.textContent = labelText && labelText !== 'undefined' ? labelText : `#${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original object structure
    const objectEl = document.createElement('dl');
    objectEl.className = 'amorph-object';
    
    if (typeof rawVal !== 'object' || rawVal === null) {
      objectEl.innerHTML = '<span class="amorph-object-leer">Keine Objektdaten</span>';
    } else {
      const keys = Object.keys(rawVal).slice(0, 5);
      
      keys.forEach(key => {
        const val = rawVal[key];
        if (val === null || val === undefined) return;
        
        const dt = document.createElement('dt');
        dt.textContent = formatLabel(key);
        dt.style.fontSize = '9px';
        dt.style.opacity = '0.7';
        objectEl.appendChild(dt);
        
        const dd = document.createElement('dd');
        dd.style.fontSize = '10px';
        dd.style.marginLeft = '0';
        dd.style.marginBottom = '2px';
        
        if (typeof val === 'number') {
          dd.textContent = formatNumber(val, key);
          dd.classList.add('amorph-object-number');
        } else if (typeof val === 'boolean') {
          dd.textContent = val ? '✓' : '✗';
          dd.classList.add(val ? 'amorph-object-true' : 'amorph-object-false');
        } else if (Array.isArray(val)) {
          dd.textContent = val.slice(0, 3).join(', ') + (val.length > 3 ? '...' : '');
        } else if (typeof val === 'object') {
          dd.textContent = '{...}';
        } else {
          dd.textContent = String(val).slice(0, 30);
        }
        
        objectEl.appendChild(dd);
      });
    }
    
    wrapper.appendChild(objectEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function formatLabel(key) {
  // Remove leading underscore if present
  let label = String(key || '');
  if (label.startsWith('_')) {
    label = label.slice(1);
  }
  return label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatNumber(val, key) {
  const lower = key.toLowerCase();
  if (lower.includes('percent') || lower.includes('prozent')) {
    return `${val}%`;
  }
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  if (Number.isInteger(val)) return val.toLocaleString();
  return val.toFixed(2);
}

export default compareObject;

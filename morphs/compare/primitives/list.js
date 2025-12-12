/**
 * COMPARE LIST - List comparison with overlap display
 */

import { debug } from '../../../../observer/debug.js';

// Format a value for display (handle objects)
function formatValue(val) {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // Known object patterns
    if (val.name) return val.name;
    if (val.label) return val.label;
    if (val.title) return val.title;
    if (val.value) return formatValue(val.value);
    // Step objects
    if (val.step && val.label) return `${val.step}. ${val.label}`;
    // Small objects: show key-value pairs
    const keys = Object.keys(val);
    if (keys.length <= 3) {
      return keys.map(k => `${k}: ${val[k]}`).join(', ');
    }
    return `{${keys.length} fields}`;
  }
  return String(val);
}

export function compareList(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-list';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Collect all unique values
  const allValues = new Map();
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const list = Array.isArray(val) ? val : [val];
    list.forEach(v => {
      if (!allValues.has(v)) {
        allValues.set(v, []);
      }
      allValues.get(v).push(item);
    });
  });
  
  const container = document.createElement('div');
  container.className = 'compare-list-items';
  
  // Sort: shared values first
  const sorted = [...allValues.entries()].sort((a, b) => b[1].length - a[1].length);
  
  sorted.forEach(([value, ownerItems]) => {
    const row = document.createElement('div');
    row.className = 'compare-list-item';
    
    if (ownerItems.length > 1) {
      row.classList.add('shared');
    }
    
    // Inline styles for reliable dot rendering
    const dots = ownerItems.map(p => {
      const bgColor = p.bgColor || p.bgFarbe || p.color || p.farbe || 'rgba(100,100,100,0.5)';
      const pName = p.name || p.id || '–';
      return `<span class="item-dot" style="background-color:${bgColor}" title="${pName}"></span>`;
    }).join('');
    
    row.innerHTML = `
      <span class="list-value">${formatValue(value)}</span>
      <span class="list-items">${dots}</span>
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareList;

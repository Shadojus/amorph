/**
 * COMPARE OBJECT - Object comparison (nested data)
 */

import { debug } from '../../../../observer/debug.js';

export function compareObject(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-object';
  
  // Collect all keys
  const allKeys = new Set();
  items.forEach(item => {
    const val = item.value ?? item.wert;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.keys(val).forEach(k => allKeys.add(k));
    }
  });
  
  if (allKeys.size === 0) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Header
  const header = document.createElement('div');
  header.className = 'object-header';
  header.innerHTML = '<div class="object-key-header">Field</div>';
  items.forEach(item => {
    const itemName = item.name || item.id || '–';
    header.innerHTML += `<div class="object-name" style="color:${item.textColor || item.textFarbe || item.color || item.farbe || '#fff'}">${itemName}</div>`;
  });
  el.appendChild(header);
  
  // Rows for each key
  allKeys.forEach(key => {
    const row = document.createElement('div');
    row.className = 'object-row';
    row.innerHTML = `<div class="object-key">${key}</div>`;
    
    items.forEach(item => {
      const itemVal = item.value ?? item.wert;
      const val = itemVal?.[key];
      const displayValue = val === undefined || val === null 
        ? '–' 
        : typeof val === 'object' 
          ? JSON.stringify(val) 
          : String(val);
      
      const cell = document.createElement('div');
      cell.className = 'object-cell';
      cell.textContent = displayValue;
      row.appendChild(cell);
    });
    
    el.appendChild(row);
  });
  
  return el;
}

export default compareObject;

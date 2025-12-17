/**
 * COMPARE STATS - Statistics grid comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareStats(items, config = {}) {
  debug.morphs('compareStats', { itemCount: items?.length, items });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stats';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Collect all stats keys
  const allKeys = new Set();
  items.forEach(item => {
    const val = item.value ?? item.wert;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.keys(val).forEach(k => allKeys.add(k));
    }
  });
  
  if (allKeys.size === 0) {
    el.innerHTML = '<div class="compare-empty">No statistics</div>';
    return el;
  }
  
  // Header
  const header = document.createElement('div');
  header.className = 'stats-header';
  header.innerHTML = '<div class="stats-label">Stat</div>';
  items.forEach(item => {
    const itemName = item.name || item.id || '–';
    const textStyle = item.textFarbe ? ` style="color:${item.textFarbe}"` : '';
    header.innerHTML += `<div class="stats-name"${textStyle}>${itemName}</div>`;
  });
  el.appendChild(header);
  
  // Rows
  allKeys.forEach(key => {
    const row = document.createElement('div');
    row.className = 'stats-row';
    row.innerHTML = `<div class="stats-label">${key}</div>`;
    
    // Values for this row
    const values = items.map(item => {
      const itemVal = item.value ?? item.wert;
      const val = itemVal?.[key];
      return typeof val === 'number' ? val : 0;
    });
    const maxValue = Math.max(...values);
    
    items.forEach((item, idx) => {
      const itemVal = item.value ?? item.wert;
      const val = itemVal?.[key];
      const numValue = typeof val === 'number' ? val : 0;
      const percent = maxValue > 0 ? (numValue / maxValue) * 100 : 0;
      const isMax = numValue === maxValue && maxValue > 0;
      
      const cell = document.createElement('div');
      cell.className = 'stats-cell' + (isMax ? ' stats-max' : '');
      const barStyle = item.farbe ? `background:${item.farbe};` : '';
      cell.innerHTML = `
        <div class="stats-bar-bg">
          <div class="stats-bar" style="width:${percent}%;${barStyle}"></div>
        </div>
        <span class="stats-value">${val ?? '–'}</span>
      `;
      row.appendChild(cell);
    });
    
    el.appendChild(row);
  });
  
  return el;
}

export default compareStats;

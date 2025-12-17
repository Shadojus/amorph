/**
 * COMPARE PROGRESS - Progress bar comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareProgress(items, config = {}) {
  debug.morphs('compareProgress', { itemCount: items?.length, items });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-progress';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const values = items.map(i => {
    const val = i.value ?? i.wert;
    return typeof val === 'number' ? val : 0;
  });
  const maxValue = values.length > 0 ? Math.max(...values, 1) : 1;
  debug.morphs('compareProgress maxValue', { values, maxValue });
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const numValue = typeof val === 'number' ? val : 0;
    const percent = maxValue > 0 ? (numValue / maxValue) * 100 : 0;
    
    const row = document.createElement('div');
    row.className = 'progress-row';
    
    const itemName = item.name || item.id || '–';
    
    // Apply inline styles for colors
    const fillStyle = item.farbe ? `background:${item.farbe};` : '';
    const nameStyle = item.textFarbe ? `color:${item.textFarbe};` : '';
    
    row.innerHTML = `
      <div class="progress-name" style="${nameStyle}">${itemName}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${percent}%;${fillStyle}"></div>
      </div>
      <div class="progress-value">${numValue}%</div>
    `;
    el.appendChild(row);
  });
  
  return el;
}

export default compareProgress;

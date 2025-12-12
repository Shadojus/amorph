/**
 * COMPARE PROGRESS - Progress bar comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareProgress(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-progress';
  
  const maxValue = Math.max(...items.map(i => {
    const val = i.value ?? i.wert;
    return typeof val === 'number' ? val : 0;
  }));
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const numValue = typeof val === 'number' ? val : 0;
    const percent = maxValue > 0 ? (numValue / maxValue) * 100 : 0;
    
    const row = document.createElement('div');
    row.className = `progress-row ${item.colorClass || item.farbKlasse || ''}`;
    
    const itemName = item.name || item.id || '–';
    
    // NO inline styles! CSS handles colors via pilz-farbe-X class
    row.innerHTML = `
      <div class="progress-name">${itemName}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${percent}%"></div>
      </div>
      <div class="progress-value">${numValue}%</div>
    `;
    el.appendChild(row);
  });
  
  return el;
}

export default compareProgress;

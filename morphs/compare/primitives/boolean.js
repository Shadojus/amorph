/**
 * COMPARE BOOLEAN - Boolean comparison (Yes/No)
 */

import { debug } from '../../../../observer/debug.js';

export function compareBoolean(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-boolean';
  
  const container = document.createElement('div');
  container.className = 'compare-boolean-container';
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const isTrue = val === true || val === 'ja' || val === 'yes' || val === 1;
    const isFalse = val === false || val === 'nein' || val === 'no' || val === 0;
    
    const boolWrap = document.createElement('div');
    boolWrap.className = `compare-boolean-wrap ${item.colorClass || item.farbKlasse || ''}`;
    
    const itemName = item.name || item.id || '–';
    // NO inline styles! CSS handles colors via pilz-farbe-X class
    boolWrap.innerHTML = `
      <div class="boolean-name">${itemName}</div>
      <div class="boolean-value ${isTrue ? 'boolean-yes' : ''} ${isFalse ? 'boolean-no' : ''}">
        ${isTrue ? '✓' : isFalse ? '✗' : '–'}
      </div>
    `;
    container.appendChild(boolWrap);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBoolean;

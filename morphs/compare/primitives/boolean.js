/**
 * COMPARE BOOLEAN - Boolean-Vergleich (Ja/Nein)
 */

import { debug } from '../../../observer/debug.js';

export function compareBoolean(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-boolean';
  
  const container = document.createElement('div');
  container.className = 'compare-boolean-container';
  
  items.forEach(item => {
    const isTrue = item.wert === true || item.wert === 'ja' || item.wert === 'yes' || item.wert === 1;
    const isFalse = item.wert === false || item.wert === 'nein' || item.wert === 'no' || item.wert === 0;
    
    const boolWrap = document.createElement('div');
    boolWrap.className = 'compare-boolean-wrap';
    boolWrap.innerHTML = `
      <div class="boolean-name" style="color:${item.farbe}">${item.name}</div>
      <div class="boolean-wert ${isTrue ? 'boolean-ja' : ''} ${isFalse ? 'boolean-nein' : ''}">
        ${isTrue ? '✓' : isFalse ? '✗' : '–'}
      </div>
    `;
    container.appendChild(boolWrap);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBoolean;

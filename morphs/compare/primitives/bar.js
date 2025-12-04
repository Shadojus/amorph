/**
 * COMPARE BAR - Horizontale Balken für numerische Vergleiche
 * 
 * @param {Array} items - [{id, name, wert, farbe}]
 * @param {Object} config - {max, einheit, label}
 */

import { debug } from '../../../observer/debug.js';

export function compareBar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  // Max-Wert ermitteln
  const werte = items.map(i => {
    if (typeof i.wert === 'object' && 'min' in i.wert) {
      return (i.wert.min + i.wert.max) / 2;
    }
    return Number(i.wert) || 0;
  });
  const maxWert = config.max || Math.max(...werte, 1);
  
  // Label
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Balken
  const bars = document.createElement('div');
  bars.className = 'compare-bars';
  
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'compare-bar-row';
    
    let numWert = typeof item.wert === 'object' && 'min' in item.wert
      ? (item.wert.min + item.wert.max) / 2
      : Number(item.wert) || 0;
    
    const displayWert = typeof item.wert === 'object' && 'min' in item.wert
      ? `${item.wert.min}–${item.wert.max}`
      : String(item.wert);
    
    const pct = Math.min(100, (numWert / maxWert) * 100);
    
    row.innerHTML = `
      <span class="bar-name" style="color:${item.farbe}">${item.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;background:${item.farbe}"></div>
      </div>
      <span class="bar-wert">${displayWert}${config.einheit || ''}</span>
    `;
    
    bars.appendChild(row);
  });
  
  el.appendChild(bars);
  return el;
}

export default compareBar;

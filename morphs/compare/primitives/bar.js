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
    row.className = `compare-bar-row ${item.farbKlasse || ''}`;
    
    // CSS Custom Properties auf Parent setzen - ermöglicht Highlighting!
    const textColor = item.textFarbe || 'rgba(255,255,255,0.85)';
    const fillColor = item.farbe || 'rgba(100,100,100,0.5)';
    row.style.setProperty('--item-text', textColor);
    row.style.setProperty('--item-fill', fillColor);
    
    let numWert = typeof item.wert === 'object' && 'min' in item.wert
      ? (item.wert.min + item.wert.max) / 2
      : Number(item.wert) || 0;
    
    const displayWert = typeof item.wert === 'object' && 'min' in item.wert
      ? `${item.wert.min}–${item.wert.max}`
      : String(item.wert);
    
    const pct = Math.min(100, (numWert / maxWert) * 100);
    
    // Kein Inline-Style auf Kindern - CSS nutzt var(--item-text) etc.
    row.innerHTML = `
      <span class="bar-name">${item.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="bar-wert">${displayWert}${config.einheit || ''}</span>
    `;
    
    bars.appendChild(row);
  });
  
  el.appendChild(bars);
  
  // Skala unter den Balken
  const scale = document.createElement('div');
  scale.className = 'compare-bar-scale';
  scale.innerHTML = `
    <span class="scale-min">0</span>
    <span class="scale-max">${maxWert}${config.einheit || ''}</span>
  `;
  el.appendChild(scale);
  
  return el;
}

export default compareBar;

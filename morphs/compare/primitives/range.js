/**
 * COMPARE RANGE - Bereichs-Vergleich (min/max)
 */

import { debug } from '../../../observer/debug.js';

export function compareRange(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-range';
  
  // Globalen Min/Max finden
  let globalMin = Infinity;
  let globalMax = -Infinity;
  
  items.forEach(item => {
    const wert = item.wert;
    if (typeof wert === 'object' && wert !== null) {
      const min = wert.min ?? wert.von ?? wert.from ?? 0;
      const max = wert.max ?? wert.bis ?? wert.to ?? min;
      if (min < globalMin) globalMin = min;
      if (max > globalMax) globalMax = max;
    } else if (typeof wert === 'number') {
      if (wert < globalMin) globalMin = wert;
      if (wert > globalMax) globalMax = wert;
    }
  });
  
  const range = globalMax - globalMin || 1;
  
  items.forEach(item => {
    const wert = item.wert;
    let min, max;
    
    if (typeof wert === 'object' && wert !== null) {
      min = wert.min ?? wert.von ?? wert.from ?? 0;
      max = wert.max ?? wert.bis ?? wert.to ?? min;
    } else if (typeof wert === 'number') {
      min = max = wert;
    } else {
      min = max = 0;
    }
    
    const leftProzent = ((min - globalMin) / range) * 100;
    const widthProzent = ((max - min) / range) * 100 || 2; // mindestens 2% für Punkte
    
    const row = document.createElement('div');
    row.className = `range-row ${item.farbKlasse || ''}`;
    
    // Inline-Styles für Name und Bar (CSS greift nicht zuverlässig)
    const textColor = item.textFarbe || item.farbe || 'white';
    const barColor = item.farbe || 'rgba(100,100,100,0.5)';
    
    row.innerHTML = `
      <div class="range-name" style="color:${textColor}">${item.name}</div>
      <div class="range-track">
        <div class="range-bar" style="left:${leftProzent}%;width:${widthProzent}%;background-color:${barColor}"></div>
      </div>
      <div class="range-werte">${min}${min !== max ? ` – ${max}` : ''}</div>
    `;
    el.appendChild(row);
  });
  
  // Skala
  const skala = document.createElement('div');
  skala.className = 'range-skala';
  skala.innerHTML = `
    <span>${globalMin}</span>
    <span>${globalMax}</span>
  `;
  el.appendChild(skala);
  
  return el;
}

export default compareRange;

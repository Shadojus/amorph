/**
 * COMPARE PROGRESS - Fortschrittsbalken-Vergleich
 */

import { debug } from '../../../observer/debug.js';

export function compareProgress(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-progress';
  
  const maxWert = Math.max(...items.map(i => typeof i.wert === 'number' ? i.wert : 0));
  
  items.forEach(item => {
    const wert = typeof item.wert === 'number' ? item.wert : 0;
    const prozent = maxWert > 0 ? (wert / maxWert) * 100 : 0;
    
    const row = document.createElement('div');
    row.className = `progress-row ${item.farbKlasse || ''}`;
    
    // Immer Inline-Styles für zuverlässige Darstellung
    const textColor = item.textFarbe || 'rgba(255,255,255,0.85)';
    const fillColor = item.farbe || 'rgba(100,100,100,0.5)';
    const itemName = item.name || item.id || '–';
    
    row.innerHTML = `
      <div class="progress-name" style="color:${textColor}">${itemName}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${prozent}%;background-color:${fillColor}"></div>
      </div>
      <div class="progress-wert">${wert}%</div>
    `;
    el.appendChild(row);
  });
  
  return el;
}

export default compareProgress;

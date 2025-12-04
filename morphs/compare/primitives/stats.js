/**
 * COMPARE STATS - Statistik-Grid-Vergleich
 */

import { debug } from '../../../observer/debug.js';

export function compareStats(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stats';
  
  // Alle Stats-Keys sammeln
  const allKeys = new Set();
  items.forEach(item => {
    if (typeof item.wert === 'object' && !Array.isArray(item.wert)) {
      Object.keys(item.wert).forEach(k => allKeys.add(k));
    }
  });
  
  if (allKeys.size === 0) {
    el.innerHTML = '<div class="compare-leer">Keine Statistiken</div>';
    return el;
  }
  
  // Header
  const header = document.createElement('div');
  header.className = 'stats-header';
  header.innerHTML = '<div class="stats-label">Stat</div>';
  items.forEach(item => {
    header.innerHTML += `<div class="stats-name" style="color:${item.farbe}">${item.name}</div>`;
  });
  el.appendChild(header);
  
  // Rows
  allKeys.forEach(key => {
    const row = document.createElement('div');
    row.className = 'stats-row';
    row.innerHTML = `<div class="stats-label">${key}</div>`;
    
    // Werte für diese Zeile
    const werte = items.map(item => {
      const val = item.wert?.[key];
      return typeof val === 'number' ? val : 0;
    });
    const maxWert = Math.max(...werte);
    
    items.forEach((item, idx) => {
      const wert = item.wert?.[key];
      const numWert = typeof wert === 'number' ? wert : 0;
      const prozent = maxWert > 0 ? (numWert / maxWert) * 100 : 0;
      const isMax = numWert === maxWert && maxWert > 0;
      
      const cell = document.createElement('div');
      cell.className = 'stats-cell' + (isMax ? ' stats-max' : '');
      cell.innerHTML = `
        <div class="stats-bar-bg">
          <div class="stats-bar" style="width:${prozent}%;background:${item.farbe}"></div>
        </div>
        <span class="stats-wert">${wert ?? '–'}</span>
      `;
      row.appendChild(cell);
    });
    
    el.appendChild(row);
  });
  
  return el;
}

export default compareStats;

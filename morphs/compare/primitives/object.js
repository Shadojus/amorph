/**
 * COMPARE OBJECT - Objekt-Vergleich (verschachtelte Daten)
 */

import { debug } from '../../../observer/debug.js';

export function compareObject(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-object';
  
  // Alle Keys sammeln
  const allKeys = new Set();
  items.forEach(item => {
    if (typeof item.wert === 'object' && item.wert !== null && !Array.isArray(item.wert)) {
      Object.keys(item.wert).forEach(k => allKeys.add(k));
    }
  });
  
  if (allKeys.size === 0) {
    el.innerHTML = '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  // Header
  const header = document.createElement('div');
  header.className = 'object-header';
  header.innerHTML = '<div class="object-key-header">Feld</div>';
  items.forEach(item => {
    header.innerHTML += `<div class="object-name ${item.farbKlasse || ''} pilz-text">${item.name}</div>`;
  });
  el.appendChild(header);
  
  // Rows für jeden Key
  allKeys.forEach(key => {
    const row = document.createElement('div');
    row.className = 'object-row';
    row.innerHTML = `<div class="object-key">${key}</div>`;
    
    items.forEach(item => {
      const wert = item.wert?.[key];
      const displayWert = wert === undefined || wert === null 
        ? '–' 
        : typeof wert === 'object' 
          ? JSON.stringify(wert) 
          : String(wert);
      
      const cell = document.createElement('div');
      cell.className = 'object-cell';
      cell.textContent = displayWert;
      row.appendChild(cell);
    });
    
    el.appendChild(row);
  });
  
  return el;
}

export default compareObject;

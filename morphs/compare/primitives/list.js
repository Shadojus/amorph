/**
 * COMPARE LIST - Listen-Vergleich mit Overlap-Anzeige
 */

import { debug } from '../../../observer/debug.js';

export function compareList(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-list';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle einzigartigen Werte sammeln
  const alleWerte = new Map();
  items.forEach(item => {
    const liste = Array.isArray(item.wert) ? item.wert : [item.wert];
    liste.forEach(v => {
      if (!alleWerte.has(v)) {
        alleWerte.set(v, []);
      }
      alleWerte.get(v).push(item);
    });
  });
  
  const container = document.createElement('div');
  container.className = 'compare-list-items';
  
  // Sortiere: Gemeinsame zuerst
  const sorted = [...alleWerte.entries()].sort((a, b) => b[1].length - a[1].length);
  
  sorted.forEach(([wert, ownerItems]) => {
    const row = document.createElement('div');
    row.className = 'compare-list-item';
    
    if (ownerItems.length > 1) {
      row.classList.add('gemeinsam');
    }
    
    // Inline-Styles für zuverlässige Darstellung der Dots
    const dots = ownerItems.map(p => {
      const bgColor = p.bgFarbe || p.farbe || 'rgba(100,100,100,0.5)';
      const pName = p.name || p.id || '–';
      return `<span class="item-dot" style="background-color:${bgColor}" title="${pName}"></span>`;
    }).join('');
    
    row.innerHTML = `
      <span class="list-wert">${wert}</span>
      <span class="list-items">${dots}</span>
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareList;

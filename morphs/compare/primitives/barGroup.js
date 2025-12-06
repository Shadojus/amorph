/**
 * COMPARE BAR GROUP - Für Arrays von Bar-Objekten (z.B. Wirkstoffe)
 * Jedes Item hat einen Array von {label, value, unit}
 * Zeigt gruppierte Balken pro Label, vergleicht Items side-by-side
 */

import { debug } from '../../../observer/debug.js';

export function compareBarGroup(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar-group';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle Labels sammeln (z.B. alle Wirkstoffe)
  const alleLabels = new Map(); // label -> [{item, value, unit}]
  
  items.forEach(item => {
    const arr = item.wert;
    if (!Array.isArray(arr)) return;
    
    arr.forEach(entry => {
      const lbl = entry.label || entry.name || 'Unbekannt';
      if (!alleLabels.has(lbl)) {
        alleLabels.set(lbl, []);
      }
      alleLabels.get(lbl).push({
        item,
        value: entry.value,
        unit: entry.unit || ''
      });
    });
  });
  
  // Globales Maximum pro Label ermitteln
  const container = document.createElement('div');
  container.className = 'bar-group-container';
  
  alleLabels.forEach((entries, lbl) => {
    const group = document.createElement('div');
    group.className = 'bar-group';
    
    const maxVal = Math.max(...entries.map(e => e.value || 0), 1);
    const unit = entries[0]?.unit || '';
    
    // Label-Header
    const header = document.createElement('div');
    header.className = 'bar-group-label';
    header.textContent = lbl;
    group.appendChild(header);
    
    // Bars für jeden Item
    const barsWrap = document.createElement('div');
    barsWrap.className = 'bar-group-bars';
    
    entries.forEach(entry => {
      const pct = Math.min(100, (entry.value / maxVal) * 100);
      const bar = document.createElement('div');
      bar.className = `bar-group-bar ${entry.item.farbKlasse || ''}`;
      bar.innerHTML = `
        <span class="bar-name pilz-text">${entry.item.name}</span>
        <div class="bar-track">
          <div class="bar-fill pilz-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-wert">${entry.value}${unit}</span>
      `;
      barsWrap.appendChild(bar);
    });
    
    group.appendChild(barsWrap);
    container.appendChild(group);
  });
  
  el.appendChild(container);
  
  // Legende für Items
  const legende = document.createElement('div');
  legende.className = 'bar-group-legende';
  items.forEach(item => {
    legende.innerHTML += `
      <span class="legende-item ${item.farbKlasse || ''}">
        <span class="legende-dot pilz-bg"></span>
        ${item.name}
      </span>
    `;
  });
  el.appendChild(legende);
  
  return el;
}

export default compareBarGroup;

/**
 * COMPARE BAR GROUP - For arrays of bar objects (e.g. compounds)
 * Each item has an array of {label, value, unit}
 * Shows grouped bars per label, compares items side-by-side
 */

import { debug } from '../../../../observer/debug.js';

export function compareBarGroup(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar-group';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Collect all labels (e.g. all compounds)
  const allLabels = new Map(); // label -> [{item, value, unit}]
  
  items.forEach(item => {
    const arr = item.value ?? item.wert;
    if (!Array.isArray(arr)) return;
    
    arr.forEach(entry => {
      const lbl = entry.label || entry.name || 'Unknown';
      if (!allLabels.has(lbl)) {
        allLabels.set(lbl, []);
      }
      allLabels.get(lbl).push({
        item,
        value: entry.value,
        unit: entry.unit || ''
      });
    });
  });
  
  // Determine global maximum per label
  const container = document.createElement('div');
  container.className = 'bar-group-container';
  
  allLabels.forEach((entries, lbl) => {
    const group = document.createElement('div');
    group.className = 'bar-group';
    
    const maxVal = Math.max(...entries.map(e => e.value || 0), 1);
    const unit = entries[0]?.unit || '';
    
    // Label header
    const header = document.createElement('div');
    header.className = 'bar-group-label';
    header.textContent = lbl;
    group.appendChild(header);
    
    // Bars for each item
    const barsWrap = document.createElement('div');
    barsWrap.className = 'bar-group-bars';
    
    entries.forEach(entry => {
      const pct = Math.min(100, (entry.value / maxVal) * 100);
      const itemName = entry.item.name || entry.item.id || '–';
      const fillColor = entry.item.farbe || '';
      const textColor = entry.item.textFarbe || '';
      
      const bar = document.createElement('div');
      bar.className = 'bar-group-bar';
      bar.innerHTML = `
        <span class="bar-name" style="color:${textColor}">${itemName}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${fillColor}"></div>
        </div>
        <span class="bar-value">${entry.value}${unit}</span>
      `;
      barsWrap.appendChild(bar);
    });
    
    group.appendChild(barsWrap);
    container.appendChild(group);
  });
  
  el.appendChild(container);
  
  // Legend for items
  const legend = document.createElement('div');
  legend.className = 'bar-group-legend';
  items.forEach(item => {
    const fillColor = item.farbe || '';
    const itemName = item.name || item.id || '–';
    legend.innerHTML += `
      <span class="legend-item">
        <span class="legend-dot" style="background:${fillColor}"></span>
        ${itemName}
      </span>
    `;
  });
  el.appendChild(legend);
  
  return el;
}

export default compareBarGroup;

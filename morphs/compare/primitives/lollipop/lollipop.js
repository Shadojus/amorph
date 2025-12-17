/**
 * COMPARE LOLLIPOP - UNIFIED Lollipop chart comparison
 * All items shown in ONE chart with item colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareLollipop(items, config = {}) {
  debug.morphs('compareLollipop', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-lollipop';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const dataItems = normalisiereWert(rawVal);
    return {
      ...item,
      dataItems,
      index: idx,
      // Neon pilz colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  }).filter(item => item.dataItems.length > 0);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Lollipop-Daten</div>';
    return el;
  }
  
  // Find global max value
  let globalMax = 0;
  parsedItems.forEach(item => {
    item.dataItems.forEach(d => {
      if (d.value > globalMax) globalMax = d.value;
    });
  });
  globalMax = globalMax || 1;
  
  // UNIFIED lollipop container
  const lollipopContainer = document.createElement('div');
  lollipopContainer.className = 'amorph-lollipop amorph-lollipop-compare';
  
  // One row per item, showing top values
  parsedItems.forEach(item => {
    const sorted = [...item.dataItems].sort((a, b) => b.value - a.value);
    
    sorted.slice(0, 4).forEach((dataItem, i) => {
      const percent = (dataItem.value / globalMax) * 100;
      
      const row = document.createElement('div');
      row.className = 'amorph-lollipop-row-compare';
      if (i === 0) row.classList.add('is-max');
      
      // Item name + data label
      const label = document.createElement('span');
      label.className = 'amorph-lollipop-label';
      label.innerHTML = `<span class="lollipop-item-name" style="color:${item.textFarbe || item.color}">${item.name || item.id}</span> <span class="lollipop-data-label">${dataItem.label}</span>`;
      row.appendChild(label);
      
      // Track
      const track = document.createElement('div');
      track.className = 'amorph-lollipop-track';
      
      // Line with neon effect
      const line = document.createElement('div');
      line.className = 'amorph-lollipop-line';
      line.style.width = `${percent}%`;
      line.style.background = item.color;
      line.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
      track.appendChild(line);
      
      // Dot with neon effect
      const dot = document.createElement('div');
      dot.className = 'amorph-lollipop-dot';
      dot.style.left = `${percent}%`;
      dot.style.background = item.color;
      dot.style.boxShadow = `0 0 8px ${item.glowColor || item.color}`;
      track.appendChild(dot);
      
      row.appendChild(track);
      
      // Value
      const valueEl = document.createElement('span');
      valueEl.className = 'amorph-lollipop-value';
      valueEl.textContent = dataItem.value.toLocaleString();
      valueEl.style.color = item.color;
      row.appendChild(valueEl);
      
      lollipopContainer.appendChild(row);
    });
  });
  
  el.appendChild(lollipopContainer);
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        items.push({
          label: item.label || item.name || item.kategorie || '',
          value: item.value || item.wert || 0
        });
      } else if (typeof item === 'number') {
        items.push({ label: `${items.length + 1}`, value: item });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'number') {
        items.push({ label: key, value });
      }
    }
  }
  
  return items;
}

export default compareLollipop;

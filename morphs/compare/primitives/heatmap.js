/**
 * COMPARE HEATMAP - Heatmap comparison
 * Shows heatmap data as color intensity bars
 */

import { debug } from '../../../../observer/debug.js';

export function compareHeatmap(items, config = {}) {
  debug.morphs('compareHeatmap', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-heatmap';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-heatmap-container';
  
  // Find global min/max
  let globalMin = Infinity, globalMax = -Infinity;
  items.forEach(item => {
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val.flat() : [val];
    data.forEach(v => {
      const num = typeof v === 'number' ? v : (v?.value ?? 0);
      globalMin = Math.min(globalMin, num);
      globalMax = Math.max(globalMax, num);
    });
  });
  const range = globalMax - globalMin || 1;
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-heatmap-row';
    
    // Name
    const name = document.createElement('span');
    name.className = 'heatmap-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Heatmap cells
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val.flat().slice(0, 10) : [val]; // Max 10 cells
    
    const cellsWrap = document.createElement('div');
    cellsWrap.className = 'heatmap-cells';
    
    const baseColor = item.color || 'rgb(100, 150, 255)';
    
    data.forEach(v => {
      const num = typeof v === 'number' ? v : (v?.value ?? 0);
      const intensity = (num - globalMin) / range;
      
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.style.opacity = 0.2 + intensity * 0.8;
      cell.title = num.toString();
      cellsWrap.appendChild(cell);
    });
    
    row.appendChild(cellsWrap);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareHeatmap;

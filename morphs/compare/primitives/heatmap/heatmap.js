/**
 * COMPARE HEATMAP - Heatmap comparison
 * Uses the exact same HTML structure as the original heatmap morph
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
  
  // Container for all heatmaps
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original heatmap structure
    const heatmapEl = document.createElement('div');
    heatmapEl.className = 'amorph-heatmap';
    
    // Normalize data to matrix
    const { matrix, rows, cols, min, max } = normalisiereDaten(rawVal);
    
    if (matrix.length === 0) {
      heatmapEl.innerHTML = '<span class="amorph-heatmap-leer">Keine Matrix-Daten</span>';
    } else {
      const grid = document.createElement('div');
      grid.className = 'amorph-heatmap-grid';
      grid.style.setProperty('--cols', cols.length);
      grid.style.setProperty('--rows', rows.length);
      
      // Column headers if available
      if (cols.some(c => c !== null)) {
        const headerRow = document.createElement('div');
        headerRow.className = 'amorph-heatmap-header-row';
        
        const corner = document.createElement('div');
        corner.className = 'amorph-heatmap-corner';
        headerRow.appendChild(corner);
        
        for (const col of cols) {
          const colHeader = document.createElement('div');
          colHeader.className = 'amorph-heatmap-col-header';
          colHeader.textContent = col || '';
          headerRow.appendChild(colHeader);
        }
        grid.appendChild(headerRow);
      }
      
      // Matrix rows
      const range = max - min || 1;
      for (let i = 0; i < rows.length; i++) {
        const row = document.createElement('div');
        row.className = 'amorph-heatmap-row';
        
        if (rows[i] !== null) {
          const rowHeader = document.createElement('div');
          rowHeader.className = 'amorph-heatmap-row-header';
          rowHeader.textContent = rows[i];
          row.appendChild(rowHeader);
        }
        
        for (let j = 0; j < cols.length; j++) {
          const value = matrix[i]?.[j] ?? 0;
          const intensity = (value - min) / range;
          
          const cell = document.createElement('div');
          cell.className = 'amorph-heatmap-cell';
          cell.style.setProperty('--intensity', intensity);
          cell.title = String(value);
          row.appendChild(cell);
        }
        
        grid.appendChild(row);
      }
      
      heatmapEl.appendChild(grid);
    }
    
    wrapper.appendChild(heatmapEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereDaten(wert) {
  let matrix = [];
  let rows = [];
  let cols = [];
  let min = Infinity;
  let max = -Infinity;
  
  if (Array.isArray(wert)) {
    // 2D array
    if (Array.isArray(wert[0])) {
      matrix = wert;
      rows = wert.map((_, i) => null);
      cols = wert[0]?.map((_, i) => null) || [];
    } else {
      // 1D array - make single row
      matrix = [wert];
      rows = [null];
      cols = wert.map((_, i) => null);
    }
  } else if (typeof wert === 'object' && wert !== null) {
    // Structured data with rows/cols
    matrix = wert.values || wert.matrix || wert.data || [];
    rows = wert.rows || wert.zeilen || [];
    cols = wert.cols || wert.columns || wert.spalten || [];
  }
  
  // Find min/max
  matrix.forEach(row => {
    if (Array.isArray(row)) {
      row.forEach(v => {
        const num = typeof v === 'number' ? v : (v?.value ?? 0);
        if (isFinite(num)) {
          if (num < min) min = num;
          if (num > max) max = num;
        }
      });
    }
  });
  
  if (!isFinite(min)) min = 0;
  if (!isFinite(max)) max = 100;
  
  return { matrix, rows, cols, min, max };
}

export default compareHeatmap;

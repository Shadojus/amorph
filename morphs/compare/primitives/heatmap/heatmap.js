/**
 * COMPARE HEATMAP - Heatmap comparison with NEON pilz colors
 * Each item's heatmap uses its specific neon color scheme
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
  
  // Container for heatmaps
  const container = document.createElement('div');
  container.className = 'amorph-heatmap-compare-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    const lineColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-heatmap-item';
    
    // Label with item name and neon glow
    const label = document.createElement('div');
    label.className = 'compare-heatmap-label';
    label.innerHTML = `
      <span class="heatmap-item-indicator" style="background: ${lineColor}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span style="color: ${textColor}">${item.name || item.id || `Item ${itemIndex + 1}`}</span>
    `;
    wrapper.appendChild(label);
    
    // Use original heatmap structure
    const heatmapEl = document.createElement('div');
    heatmapEl.className = 'amorph-heatmap amorph-heatmap-neon';
    heatmapEl.style.setProperty('--heatmap-base-color', lineColor);
    heatmapEl.style.setProperty('--heatmap-glow-color', glowColor);
    
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
          colHeader.style.color = textColor;
          headerRow.appendChild(colHeader);
        }
        grid.appendChild(headerRow);
      }
      
      // Extract hue from lineColor for intensity gradient
      const hue = parseInt(lineColor.match(/\d+/)?.[0] || 280);
      
      // Matrix rows
      const range = max - min || 1;
      for (let i = 0; i < rows.length; i++) {
        const row = document.createElement('div');
        row.className = 'amorph-heatmap-row';
        
        if (rows[i] !== null) {
          const rowHeader = document.createElement('div');
          rowHeader.className = 'amorph-heatmap-row-header';
          rowHeader.textContent = rows[i];
          rowHeader.style.color = textColor;
          row.appendChild(rowHeader);
        }
        
        for (let j = 0; j < cols.length; j++) {
          const value = matrix[i]?.[j] ?? 0;
          const intensity = (value - min) / range;
          
          const cell = document.createElement('div');
          cell.className = 'amorph-heatmap-cell amorph-heatmap-cell-neon';
          
          // Use neon color with varying lightness based on intensity
          const lightness = 20 + intensity * 50;
          const saturation = 60 + intensity * 30;
          cell.style.background = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + intensity * 0.7})`;
          
          // Add glow for high values
          if (intensity > 0.6) {
            cell.style.boxShadow = `0 0 ${8 * intensity}px ${glowColor}`;
          }
          
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

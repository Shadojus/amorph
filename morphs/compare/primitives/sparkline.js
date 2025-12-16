/**
 * COMPARE SPARKLINE - Side-by-side sparkline comparison
 * Shows trend lines with mini charts
 */

import { debug } from '../../../../observer/debug.js';

export function compareSparkline(items, config = {}) {
  debug.morphs('compareSparkline', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-sparkline';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-sparkline-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-sparkline-row';
    
    // Pilz-Farbe setzen
    if (item.color) {
      row.style.setProperty('--pilz-line', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'sparkline-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Sparkline canvas
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val : (val.data || val.values || []);
    
    if (data.length > 0) {
      const canvas = document.createElement('canvas');
      canvas.className = 'sparkline-canvas';
      canvas.width = 100;
      canvas.height = 24;
      
      const ctx = canvas.getContext('2d');
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      
      const lineColor = item.color || getComputedStyle(row).getPropertyValue('--pilz-line').trim() || 'rgba(100, 150, 255, 0.8)';
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * canvas.width;
        const y = canvas.height - ((v - min) / range) * (canvas.height - 4) - 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
      row.appendChild(canvas);
    } else {
      const empty = document.createElement('span');
      empty.className = 'sparkline-empty';
      empty.textContent = '—';
      row.appendChild(empty);
    }
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareSparkline;

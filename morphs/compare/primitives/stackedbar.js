/**
 * COMPARE STACKEDBAR - Stacked bar chart comparison
 * Shows stacked bar values
 */

import { debug } from '../../../../observer/debug.js';

export function compareStackedbar(items, config = {}) {
  debug.morphs('compareStackedbar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stackedbar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-stackedbar-container';
  
  // Find max total
  const totals = items.map(item => {
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val : (val.data ?? val.segments ?? [val]);
    return data.reduce((sum, v) => sum + (typeof v === 'number' ? v : (v?.value ?? 0)), 0);
  });
  const maxTotal = Math.max(...totals, 1);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-stackedbar-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'stackedbar-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Stacked bar track
    const track = document.createElement('div');
    track.className = 'stackedbar-track';
    
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val : (val.data ?? val.segments ?? [val]);
    const total = data.reduce((sum, v) => sum + (typeof v === 'number' ? v : (v?.value ?? 0)), 0);
    const percent = (total / maxTotal) * 100;
    
    // Segments
    let offset = 0;
    data.forEach((seg, i) => {
      const segVal = typeof seg === 'number' ? seg : (seg?.value ?? 0);
      const segPercent = (segVal / total) * percent;
      
      const segment = document.createElement('div');
      segment.className = 'stackedbar-segment';
      segment.style.left = `${offset}%`;
      segment.style.width = `${segPercent}%`;
      segment.style.opacity = 0.4 + (i / data.length) * 0.6;
      track.appendChild(segment);
      
      offset += segPercent;
    });
    
    row.appendChild(track);
    
    // Total value
    const wert = document.createElement('span');
    wert.className = 'stackedbar-wert';
    wert.textContent = total.toLocaleString();
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareStackedbar;

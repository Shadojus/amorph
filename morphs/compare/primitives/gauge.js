/**
 * COMPARE GAUGE - Side-by-side gauge comparison
 * Shows gauge values as horizontal bars with color zones
 */

import { debug } from '../../../../observer/debug.js';

export function compareGauge(items, config = {}) {
  debug.morphs('compareGauge', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-gauge';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-gauge-container';
  
  // Determine max value
  const values = items.map(item => {
    const val = item.value ?? item.wert;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') return val.value ?? val.score ?? 0;
    return parseFloat(val) || 0;
  });
  const maxVal = config.max || Math.max(...values, 100);
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-gauge-row';
    
    // Pilz-Farbe setzen
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'gauge-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Gauge track
    const track = document.createElement('div');
    track.className = 'gauge-track';
    
    const val = item.value ?? item.wert;
    const numVal = typeof val === 'number' ? val : (val?.value ?? val?.score ?? (parseFloat(val) || 0));
    const percent = Math.min(100, (numVal / maxVal) * 100);
    
    const fill = document.createElement('div');
    fill.className = 'gauge-fill';
    fill.style.width = `${percent}%`;
    fill.style.backgroundColor = 'var(--pilz-fill, rgba(100, 150, 255, 0.6))';
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value
    const wert = document.createElement('span');
    wert.className = 'gauge-wert';
    wert.textContent = typeof val === 'object' ? `${numVal}` : String(val);
    row.appendChild(wert);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareGauge;

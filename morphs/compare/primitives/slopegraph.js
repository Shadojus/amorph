/**
 * COMPARE SLOPEGRAPH - Slope graph comparison
 * Shows change between two points
 */

import { debug } from '../../../../observer/debug.js';

export function compareSlopegraph(items, config = {}) {
  debug.morphs('compareSlopegraph', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-slopegraph';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-slopegraph-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-slopegraph-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'slopegraph-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Values
    const val = item.value ?? item.wert ?? {};
    const start = val.start ?? val.from ?? val[0] ?? 0;
    const end = val.end ?? val.to ?? val[1] ?? 0;
    const change = end - start;
    const changePercent = start !== 0 ? ((change / Math.abs(start)) * 100).toFixed(1) : '—';
    
    // Start value
    const startEl = document.createElement('span');
    startEl.className = 'slopegraph-start';
    startEl.textContent = start.toLocaleString();
    row.appendChild(startEl);
    
    // Arrow
    const arrow = document.createElement('span');
    arrow.className = 'slopegraph-arrow';
    arrow.textContent = change > 0 ? '↗' : change < 0 ? '↘' : '→';
    arrow.style.color = change > 0 ? 'var(--pilz-fill, #4ade80)' : change < 0 ? 'var(--pilz-fill, #f87171)' : 'inherit';
    row.appendChild(arrow);
    
    // End value
    const endEl = document.createElement('span');
    endEl.className = 'slopegraph-end';
    endEl.textContent = end.toLocaleString();
    row.appendChild(endEl);
    
    // Change
    const changeEl = document.createElement('span');
    changeEl.className = 'slopegraph-change';
    changeEl.textContent = `${change > 0 ? '+' : ''}${changePercent}%`;
    row.appendChild(changeEl);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareSlopegraph;

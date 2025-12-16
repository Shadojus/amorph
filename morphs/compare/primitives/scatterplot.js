/**
 * COMPARE SCATTERPLOT - Scatter plot comparison
 * Shows x/y data points
 */

import { debug } from '../../../../observer/debug.js';

export function compareScatterplot(items, config = {}) {
  debug.morphs('compareScatterplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-scatterplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-scatterplot-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-scatterplot-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'scatterplot-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Data summary
    const val = item.value ?? item.wert ?? [];
    const data = Array.isArray(val) ? val : (val.points ?? val.data ?? []);
    
    const summary = document.createElement('span');
    summary.className = 'scatterplot-summary';
    summary.textContent = `${data.length || 0} points`;
    row.appendChild(summary);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareScatterplot;

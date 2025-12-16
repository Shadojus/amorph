/**
 * COMPARE NETWORK - Network graph comparison
 * Shows network data summary
 */

import { debug } from '../../../../observer/debug.js';

export function compareNetwork(items, config = {}) {
  debug.morphs('compareNetwork', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-network';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-network-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-network-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'network-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Network summary
    const val = item.value ?? item.wert ?? {};
    const nodes = val.nodes ?? val.vertices ?? [];
    const edges = val.edges ?? val.links ?? [];
    
    const summary = document.createElement('span');
    summary.className = 'network-summary';
    summary.textContent = `${nodes.length || 0} nodes, ${edges.length || 0} edges`;
    row.appendChild(summary);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareNetwork;

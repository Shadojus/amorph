/**
 * COMPARE HIERARCHY - Hierarchy/tree comparison
 * Shows hierarchical data as indented list
 */

import { debug } from '../../../../observer/debug.js';

export function compareHierarchy(items, config = {}) {
  debug.morphs('compareHierarchy', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-hierarchy';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-hierarchy-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-hierarchy-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'hierarchy-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Hierarchy summary
    const val = item.value ?? item.wert ?? {};
    const summary = document.createElement('span');
    summary.className = 'hierarchy-summary';
    
    // Count nodes
    function countNodes(node) {
      if (!node) return 0;
      if (Array.isArray(node)) return node.reduce((sum, n) => sum + countNodes(n), 0);
      const children = node.children ?? node.nodes ?? [];
      return 1 + (Array.isArray(children) ? children.reduce((sum, c) => sum + countNodes(c), 0) : 0);
    }
    
    const nodeCount = countNodes(val);
    summary.textContent = `${nodeCount} nodes`;
    row.appendChild(summary);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareHierarchy;

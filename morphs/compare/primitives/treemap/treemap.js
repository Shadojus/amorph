/**
 * COMPARE TREEMAP - Treemap comparison
 * Uses the exact same HTML structure as the original treemap morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareTreemap(items, config = {}) {
  debug.morphs('compareTreemap', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-treemap';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all treemaps
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
    
    // Use original treemap structure (simplified)
    const treemapEl = document.createElement('div');
    treemapEl.className = 'amorph-treemap';
    
    // Normalize data
    const treemapItems = normalisiereWert(rawVal);
    
    if (treemapItems.length === 0) {
      treemapEl.innerHTML = '<span class="amorph-treemap-leer">Keine Treemap-Daten</span>';
    } else {
      const total = treemapItems.reduce((sum, t) => sum + Math.abs(t.value), 0) || 1;
      
      const grid = document.createElement('div');
      grid.className = 'amorph-treemap-grid';
      grid.style.display = 'flex';
      grid.style.flexWrap = 'wrap';
      grid.style.gap = '2px';
      
      // Show up to 6 items
      treemapItems.slice(0, 6).forEach((t, i) => {
        const cell = document.createElement('div');
        cell.className = 'amorph-treemap-cell';
        const size = Math.max(20, Math.sqrt(t.value / total) * 60);
        cell.style.width = `${size}px`;
        cell.style.height = `${size}px`;
        cell.style.backgroundColor = `rgba(${80 + i * 20}, ${140 + i * 15}, ${220 - i * 10}, 0.6)`;
        cell.title = `${t.label}: ${t.value}`;
        
        const text = document.createElement('span');
        text.className = 'amorph-treemap-label';
        text.textContent = t.label.slice(0, 8);
        text.style.fontSize = '8px';
        text.style.color = 'rgba(255,255,255,0.8)';
        cell.appendChild(text);
        
        grid.appendChild(cell);
      });
      
      treemapEl.appendChild(grid);
    }
    
    wrapper.appendChild(treemapEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        items.push({
          label: item.label || item.name || item.kategorie || '',
          value: item.value || item.wert || item.size || 0,
          group: item.group || item.gruppe || ''
        });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'number') {
        items.push({ label: key, value, group: '' });
      } else if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'number') {
            items.push({ label: subKey, value: subValue, group: key });
          }
        }
      }
    }
  }
  
  return items.sort((a, b) => b.value - a.value);
}

export default compareTreemap;

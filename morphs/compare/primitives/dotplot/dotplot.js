/**
 * COMPARE DOTPLOT - Dot plot comparison
 * Uses the exact same HTML structure as the original dotplot morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareDotplot(items, config = {}) {
  debug.morphs('compareDotplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-dotplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original dotplot structure
    const dotplotEl = document.createElement('div');
    dotplotEl.className = 'amorph-dotplot';
    
    const categories = normalisiereWert(rawVal);
    
    if (categories.length === 0) {
      dotplotEl.innerHTML = '<span class="amorph-dotplot-leer">Keine Dotplot-Daten</span>';
    } else {
      const allValues = categories.flatMap(c => c.values);
      const globalMin = Math.min(...allValues, 0);
      const globalMax = Math.max(...allValues, 100);
      const range = globalMax - globalMin || 1;
      
      const dotplotContainer = document.createElement('div');
      dotplotContainer.className = 'amorph-dotplot-container';
      
      categories.slice(0, 4).forEach(category => {
        const row = document.createElement('div');
        row.className = 'amorph-dotplot-row';
        
        const categoryLabel = document.createElement('span');
        categoryLabel.className = 'amorph-dotplot-label';
        categoryLabel.textContent = category.name;
        categoryLabel.style.fontSize = '9px';
        categoryLabel.style.width = '40px';
        row.appendChild(categoryLabel);
        
        const track = document.createElement('div');
        track.className = 'amorph-dotplot-track';
        track.style.flex = '1';
        track.style.height = '16px';
        track.style.position = 'relative';
        track.style.background = 'rgba(100, 150, 200, 0.1)';
        track.style.borderRadius = '8px';
        
        category.values.slice(0, 6).forEach((val, i) => {
          const dot = document.createElement('div');
          dot.className = 'amorph-dotplot-dot';
          const percent = ((val - globalMin) / range) * 100;
          dot.style.position = 'absolute';
          dot.style.left = `${percent}%`;
          dot.style.top = '50%';
          dot.style.transform = 'translate(-50%, -50%)';
          dot.style.width = '8px';
          dot.style.height = '8px';
          dot.style.borderRadius = '50%';
          dot.style.background = `rgba(${100 + i * 15}, ${160 + i * 10}, 255, 0.7)`;
          dot.title = val.toString();
          track.appendChild(dot);
        });
        
        row.appendChild(track);
        dotplotContainer.appendChild(row);
      });
      
      dotplotEl.appendChild(dotplotContainer);
    }
    
    wrapper.appendChild(dotplotEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const categories = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item.category) {
        categories.push({
          name: item.category,
          values: Array.isArray(item.values) ? item.values : [item.values]
        });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, values] of Object.entries(wert)) {
      if (Array.isArray(values)) {
        categories.push({ name: key, values });
      } else if (typeof values === 'number') {
        categories.push({ name: key, values: [values] });
      }
    }
  }
  
  return categories;
}

export default compareDotplot;

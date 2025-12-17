/**
 * COMPARE DOTPLOT - UNIFIED Dot plot comparison
 * All dots from all items shown in ONE chart with item colors
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
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const categories = normalisiereWert(rawVal);
    return {
      ...item,
      categories,
      index: idx,
      // Neon pilz colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  }).filter(item => item.categories.length > 0);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Dotplot-Daten</div>';
    return el;
  }
  
  // Find global min/max across all values
  let globalMin = Infinity, globalMax = -Infinity;
  parsedItems.forEach(item => {
    item.categories.forEach(cat => {
      cat.values.forEach(v => {
        if (v < globalMin) globalMin = v;
        if (v > globalMax) globalMax = v;
      });
    });
  });
  
  globalMin = Math.min(globalMin, 0);
  const range = globalMax - globalMin || 1;
  
  // UNIFIED dotplot container
  const dotplotContainer = document.createElement('div');
  dotplotContainer.className = 'amorph-dotplot amorph-dotplot-compare';
  
  // Get all unique category names
  const allCategories = new Set();
  parsedItems.forEach(item => {
    item.categories.forEach(cat => allCategories.add(cat.name));
  });
  
  // One row per category, dots from all items
  Array.from(allCategories).slice(0, 6).forEach(catName => {
    const row = document.createElement('div');
    row.className = 'amorph-dotplot-row-compare';
    
    // Category label
    const label = document.createElement('span');
    label.className = 'amorph-dotplot-label';
    label.textContent = catName;
    row.appendChild(label);
    
    // Track with all items' dots
    const track = document.createElement('div');
    track.className = 'amorph-dotplot-track';
    
    parsedItems.forEach(item => {
      const cat = item.categories.find(c => c.name === catName);
      if (!cat) return;
      
      cat.values.slice(0, 6).forEach(val => {
        const percent = ((val - globalMin) / range) * 100;
        
        // Glow
        const glow = document.createElement('div');
        glow.className = 'amorph-dotplot-dot-glow';
        glow.style.left = `${percent}%`;
        glow.style.background = item.glowColor || item.color;
        track.appendChild(glow);
        
        // Dot
        const dot = document.createElement('div');
        dot.className = 'amorph-dotplot-dot';
        dot.style.left = `${percent}%`;
        dot.style.background = item.color;
        dot.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
        dot.title = `${item.name}: ${val}`;
        track.appendChild(dot);
      });
    });
    
    row.appendChild(track);
    dotplotContainer.appendChild(row);
  });
  
  // Scale
  const scale = document.createElement('div');
  scale.className = 'amorph-dotplot-scale';
  scale.innerHTML = `<span>${globalMin.toFixed(1)}</span><span>${globalMax.toFixed(1)}</span>`;
  dotplotContainer.appendChild(scale);
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'amorph-dotplot-legend';
  
  parsedItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'dotplot-legend-item';
    
    const dot = document.createElement('span');
    dot.className = 'dotplot-legend-dot';
    dot.style.background = item.color;
    dot.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
    
    const name = document.createElement('span');
    name.className = 'dotplot-legend-name';
    name.textContent = item.name || item.id;
    if (item.textFarbe) name.style.color = item.textFarbe;
    
    legendItem.appendChild(dot);
    legendItem.appendChild(name);
    legend.appendChild(legendItem);
  });
  
  dotplotContainer.appendChild(legend);
  el.appendChild(dotplotContainer);
  
  return el;
}

function normalisiereWert(wert) {
  const categories = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        // Format 1: {category: 'name', values: [...]}
        if (item.category) {
          categories.push({
            name: item.category,
            values: Array.isArray(item.values) ? item.values : [item.values]
          });
        }
        // Format 2: {label: 'name', value: 50} - Single value per label
        else if (item.label && (item.value !== undefined || item.score !== undefined)) {
          const val = item.value ?? item.score ?? item.wert ?? 0;
          categories.push({
            name: item.label,
            values: [val]
          });
        }
        // Format 3: {name: 'name', value: 50}
        else if (item.name && (item.value !== undefined || item.score !== undefined)) {
          const val = item.value ?? item.score ?? item.wert ?? 0;
          categories.push({
            name: item.name,
            values: [val]
          });
        }
        // Format 4: {axis: 'name', value: 50} (radar-style)
        else if (item.axis && item.value !== undefined) {
          categories.push({
            name: item.axis,
            values: [item.value]
          });
        }
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

/**
 * COMPARE GROUPEDBAR - UNIFIED grouped bar chart comparison
 * All items shown in unified groups with NEON pilz colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareGroupedbar(items, config = {}) {
  debug.morphs('compareGroupedbar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-groupedbar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Normalize all items' data
  const normalizedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const { categories, series, data } = normalisiereWert(rawVal);
    return { ...item, categories, series, data, index: idx };
  }).filter(item => item.categories.length > 0);
  
  if (normalizedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Grouped-Bar Daten</div>';
    return el;
  }
  
  // Find global max across all items
  let globalMax = 0;
  normalizedItems.forEach(item => {
    item.data.forEach(d => {
      Object.values(d.values || {}).forEach(v => {
        if (typeof v === 'number' && v > globalMax) globalMax = v;
      });
    });
  });
  if (globalMax === 0) globalMax = 1;
  
  // Create unified container
  const groupedbarEl = document.createElement('div');
  groupedbarEl.className = 'amorph-groupedbar amorph-groupedbar-compare';
  
  // For each item, show its grouped bars with item-specific neon colors
  normalizedItems.forEach((item, itemIdx) => {
    const lineColor = item.lineFarbe || item.farbe || `hsl(${itemIdx * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    // Item header
    const itemHeader = document.createElement('div');
    itemHeader.className = 'groupedbar-item-header';
    itemHeader.innerHTML = `
      <span class="groupedbar-item-indicator" style="background: ${lineColor}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span class="groupedbar-item-name" style="color: ${textColor}">${item.name || item.id || `Item ${itemIdx + 1}`}</span>
    `;
    groupedbarEl.appendChild(itemHeader);
    
    // Generate neon colors for series based on item color
    const baseHue = parseInt(lineColor.match(/\d+/)?.[0] || 280);
    const getSeriesColor = (idx) => {
      const hue = (baseHue + idx * 50) % 360;
      return `hsla(${hue}, 80%, 55%, 0.85)`;
    };
    
    // Series legend
    if (item.series.length > 1) {
      const legend = document.createElement('div');
      legend.className = 'amorph-groupedbar-legend-compare';
      
      item.series.forEach((s, idx) => {
        const color = getSeriesColor(idx);
        const legendItem = document.createElement('span');
        legendItem.className = 'groupedbar-legend-item';
        legendItem.innerHTML = `
          <span class="groupedbar-legend-color" style="background: ${color}; box-shadow: 0 0 6px ${color}"></span>
          <span>${s}</span>
        `;
        legend.appendChild(legendItem);
      });
      groupedbarEl.appendChild(legend);
    }
    
    // Chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'amorph-groupedbar-chart-compare';
    
    item.data.slice(0, 5).forEach(cat => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'amorph-groupedbar-category-compare';
      
      const catLabel = document.createElement('div');
      catLabel.className = 'amorph-groupedbar-category-label-compare';
      catLabel.textContent = cat.category;
      categoryEl.appendChild(catLabel);
      
      const bars = document.createElement('div');
      bars.className = 'amorph-groupedbar-bars-compare';
      
      item.series.forEach((s, seriesIdx) => {
        const value = cat.values[s] || 0;
        const height = (value / globalMax) * 100;
        const color = getSeriesColor(seriesIdx);
        
        const bar = document.createElement('div');
        bar.className = 'amorph-groupedbar-bar-compare';
        bar.style.height = `${Math.max(height, 3)}%`;
        bar.style.background = color;
        bar.style.boxShadow = `0 0 8px ${color}`;
        bar.title = `${s}: ${value}`;
        bars.appendChild(bar);
      });
      
      categoryEl.appendChild(bars);
      chartContainer.appendChild(categoryEl);
    });
    
    groupedbarEl.appendChild(chartContainer);
  });
  
  el.appendChild(groupedbarEl);
  return el;
}

function normalisiereWert(wert) {
  const categories = [];
  const seriesSet = new Set();
  const data = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item.category) {
        const cat = item.category;
        categories.push(cat);
        const values = item.values || {};
        Object.keys(values).forEach(k => seriesSet.add(k));
        data.push({ category: cat, values });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [cat, values] of Object.entries(wert)) {
      if (typeof values === 'object') {
        categories.push(cat);
        Object.keys(values).forEach(k => seriesSet.add(k));
        data.push({ category: cat, values });
      }
    }
  }
  
  return { categories, series: Array.from(seriesSet), data };
}

export default compareGroupedbar;

/**
 * COMPARE GROUPEDBAR - Grouped bar chart comparison
 * Uses the exact same HTML structure as the original groupedbar morph
 */

import { debug } from '../../../../observer/debug.js';

// Blue theme colors
const SERIES_COLORS = [
  'rgba(100, 180, 255, 0.8)',
  'rgba(80, 160, 240, 0.8)',
  'rgba(60, 140, 220, 0.8)',
  'rgba(120, 200, 255, 0.7)',
  'rgba(40, 120, 200, 0.8)'
];

export function compareGroupedbar(items, config = {}) {
  debug.morphs('compareGroupedbar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-groupedbar';
  
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
    
    // Original groupedbar structure
    const groupedbarEl = document.createElement('div');
    groupedbarEl.className = 'amorph-groupedbar';
    
    const { categories, series, data } = normalisiereWert(rawVal);
    
    if (categories.length === 0) {
      groupedbarEl.innerHTML = '<span class="amorph-groupedbar-leer">Keine Grouped-Bar Daten</span>';
    } else {
      const allValues = data.flatMap(d => Object.values(d.values || {})).filter(v => typeof v === 'number');
      const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;
      
      const seriesFarben = {};
      series.forEach((s, i) => {
        seriesFarben[s] = SERIES_COLORS[i % SERIES_COLORS.length];
      });
      
      // Legend (compact)
      if (series.length > 1) {
        const legend = document.createElement('div');
        legend.className = 'amorph-groupedbar-legend';
        legend.style.display = 'flex';
        legend.style.gap = '6px';
        legend.style.fontSize = '9px';
        legend.style.marginBottom = '4px';
        
        series.forEach(s => {
          const legendItem = document.createElement('span');
          legendItem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;background:${seriesFarben[s]};margin-right:2px;border-radius:1px;"></span>${s}`;
          legend.appendChild(legendItem);
        });
        groupedbarEl.appendChild(legend);
      }
      
      // Chart container
      const chartContainer = document.createElement('div');
      chartContainer.className = 'amorph-groupedbar-chart';
      
      data.slice(0, 4).forEach(cat => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'amorph-groupedbar-category';
        
        const catLabel = document.createElement('div');
        catLabel.className = 'amorph-groupedbar-category-label';
        catLabel.textContent = cat.category;
        catLabel.style.fontSize = '9px';
        catLabel.style.marginBottom = '2px';
        categoryEl.appendChild(catLabel);
        
        const bars = document.createElement('div');
        bars.className = 'amorph-groupedbar-bars';
        bars.style.display = 'flex';
        bars.style.gap = '2px';
        bars.style.height = '20px';
        bars.style.alignItems = 'flex-end';
        
        series.forEach(s => {
          const value = cat.values[s] || 0;
          const height = (value / maxValue) * 100;
          
          const bar = document.createElement('div');
          bar.className = 'amorph-groupedbar-bar';
          bar.style.width = '12px';
          bar.style.height = `${Math.max(height, 2)}%`;
          bar.style.background = seriesFarben[s];
          bar.style.borderRadius = '1px';
          bar.title = `${s}: ${value}`;
          bars.appendChild(bar);
        });
        
        categoryEl.appendChild(bars);
        chartContainer.appendChild(categoryEl);
      });
      
      groupedbarEl.appendChild(chartContainer);
    }
    
    wrapper.appendChild(groupedbarEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

/**
 * 📊 GROUPEDBAR MORPH - Gruppierte Balken
 * 
 * Zeigt mehrere Werte pro Kategorie nebeneinander
 * Basiert auf Kirk's Prinzipien: Grouped Bar für Vergleiche
 * Fig 6.5, 6.9 - Messi Goals/Games, Oscar Nominations
 * 
 * Input: [{category: "2020", values: {A: 10, B: 20}}]
 *    oder: {2020: {Games: 30, Goals: 20}, 2021: {...}}
 * Output: Gruppierte vertikale oder horizontale Balken
 */

import { debug } from '../../../observer/debug.js';
import { getFarben } from '../../../util/semantic.js';

// Serien-Farben
const SERIES_COLORS = [
  'rgba(100, 150, 200, 0.8)',   // Blue
  'rgba(200, 150, 100, 0.8)',   // Orange
  'rgba(150, 200, 100, 0.8)',   // Green
  'rgba(200, 100, 150, 0.8)',   // Pink
  'rgba(150, 100, 200, 0.8)',   // Purple
  'rgba(200, 200, 100, 0.8)'    // Yellow
];

export function groupedbar(wert, config = {}) {
  debug.morphs('groupedbar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-groupedbar';
  
  // Daten normalisieren
  const { categories, series, data } = normalisiereWert(wert);
  
  if (categories.length === 0) {
    el.innerHTML = '<span class="amorph-groupedbar-leer">Keine Grouped-Bar Daten</span>';
    return el;
  }
  
  // Farben zuweisen
  const farben = getFarben('diagramme') || SERIES_COLORS;
  const seriesFarben = {};
  series.forEach((s, i) => {
    seriesFarben[s] = config.farben?.[s] || farben[i % farben.length];
  });
  
  // Max-Wert für Skalierung (mit Fallback für leere Daten)
  const allValues = data.flatMap(d => Object.values(d.values || {})).filter(v => typeof v === 'number');
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-groupedbar-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Legende
  if (config.showLegend !== false && series.length > 1) {
    const legend = document.createElement('div');
    legend.className = 'amorph-groupedbar-legend';
    
    for (const s of series) {
      const item = document.createElement('div');
      item.className = 'amorph-groupedbar-legend-item';
      item.innerHTML = `
        <span class="amorph-groupedbar-legend-color" style="background: ${seriesFarben[s]}"></span>
        <span class="amorph-groupedbar-legend-label">${s}</span>
      `;
      legend.appendChild(item);
    }
    el.appendChild(legend);
  }
  
  // Y-Achse (optional)
  const chartContainer = document.createElement('div');
  chartContainer.className = 'amorph-groupedbar-chart';
  
  if (config.showYAxis !== false) {
    const yAxis = document.createElement('div');
    yAxis.className = 'amorph-groupedbar-yaxis';
    
    // Ticks
    const ticks = 5;
    for (let i = ticks; i >= 0; i--) {
      const tick = document.createElement('div');
      tick.className = 'amorph-groupedbar-ytick';
      tick.textContent = formatValue(maxValue * (i / ticks), config);
      yAxis.appendChild(tick);
    }
    chartContainer.appendChild(yAxis);
  }
  
  // Bars Container
  const barsContainer = document.createElement('div');
  barsContainer.className = 'amorph-groupedbar-bars';
  barsContainer.style.setProperty('--num-categories', categories.length);
  barsContainer.style.setProperty('--num-series', series.length);
  
  // Gruppen erstellen
  for (const item of data) {
    const group = document.createElement('div');
    group.className = 'amorph-groupedbar-group';
    
    // Bars in der Gruppe
    const barsWrapper = document.createElement('div');
    barsWrapper.className = 'amorph-groupedbar-bars-wrapper';
    
    for (const s of series) {
      const value = item.values[s] || 0;
      const height = (value / maxValue) * 100;
      
      const barContainer = document.createElement('div');
      barContainer.className = 'amorph-groupedbar-bar-container';
      
      const bar = document.createElement('div');
      bar.className = 'amorph-groupedbar-bar';
      bar.style.height = `${height}%`;
      bar.style.background = seriesFarben[s];
      bar.title = `${s}: ${formatValue(value, config)}`;
      
      // Wert-Label
      if (config.showValues !== false && height > 10) {
        const valueLabel = document.createElement('span');
        valueLabel.className = 'amorph-groupedbar-value';
        valueLabel.textContent = formatValue(value, config);
        bar.appendChild(valueLabel);
      }
      
      barContainer.appendChild(bar);
      barsWrapper.appendChild(barContainer);
    }
    
    group.appendChild(barsWrapper);
    
    // Kategorie-Label
    const label = document.createElement('div');
    label.className = 'amorph-groupedbar-label';
    label.textContent = item.category;
    group.appendChild(label);
    
    barsContainer.appendChild(group);
  }
  
  chartContainer.appendChild(barsContainer);
  el.appendChild(chartContainer);
  
  return el;
}

function normalisiereWert(wert) {
  const categories = [];
  const seriesSet = new Set();
  const data = [];
  
  // Array Format: [{category, values: {A, B}}]
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        const category = item.category || item.label || item.name || item.year || item.jahr || item.kategorie || '';
        const values = item.values || item.data || item.werte || {};
        
        // Wenn values ein Objekt ist
        if (typeof values === 'object' && !Array.isArray(values) && Object.keys(values).length > 0) {
          categories.push(category);
          Object.keys(values).forEach(k => seriesSet.add(k));
          data.push({ category, values });
        }
        // Wenn item selbst die Werte enthält (außer category/label)
        else {
          const vals = {};
          const excludeKeys = ['category', 'label', 'name', 'year', 'jahr', 'kategorie'];
          for (const [k, v] of Object.entries(item)) {
            if (!excludeKeys.includes(k) && typeof v === 'number') {
              vals[k] = v;
              seriesSet.add(k);
            }
          }
          if (Object.keys(vals).length > 0) {
            categories.push(category);
            data.push({ category, values: vals });
          }
        }
      }
    }
  }
  
  // Object Format: {Category: {Series: value}}
  else if (typeof wert === 'object' && wert !== null) {
    for (const [category, values] of Object.entries(wert)) {
      if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
        categories.push(category);
        Object.keys(values).forEach(k => seriesSet.add(k));
        data.push({ category, values });
      }
    }
  }
  
  return {
    categories,
    series: Array.from(seriesSet),
    data
  };
}

function formatValue(value, config) {
  if (config?.format === 'percent') {
    return `${value.toFixed(0)}%`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(config?.decimals ?? 0);
}

export default groupedbar;

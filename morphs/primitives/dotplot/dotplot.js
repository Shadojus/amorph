/**
 * 🔴 DOTPLOT MORPH - Streudiagramm für Kategorien
 * 
 * Zeigt Verteilung von Werten innerhalb Kategorien
 * Basiert auf Kirk's Prinzipien: Dot Plot für diskrete Punkte
 * Fig 6.19 - Comparing Critics Scores for Movie Franchises
 * 
 * Input: [{category: "Marvel", values: [85, 78, 92, 65]}]
 *    oder: {Marvel: [85, 78, 92], DC: [65, 70, 55]}
 * Output: Horizontale Dot-Streifen pro Kategorie
 */

import { debug } from '../../../observer/debug.js';

export function dotplot(wert, config = {}) {
  debug.morphs('dotplot', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-dotplot';
  
  // Daten normalisieren
  const categories = normalisiereWert(wert);
  
  if (categories.length === 0) {
    el.innerHTML = '<span class="amorph-dotplot-leer">Keine Dotplot-Daten</span>';
    return el;
  }
  
  // Globales Min/Max
  const allValues = categories.flatMap(c => c.values);
  const globalMin = config.min ?? Math.min(...allValues);
  const globalMax = config.max ?? Math.max(...allValues);
  const range = globalMax - globalMin || 1;
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-dotplot-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // X-Achse Header
  const xAxis = document.createElement('div');
  xAxis.className = 'amorph-dotplot-xaxis';
  
  // Skala-Ticks
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const value = globalMin + (range / ticks) * i;
    const tick = document.createElement('span');
    tick.className = 'amorph-dotplot-tick';
    tick.textContent = formatValue(value, config);
    xAxis.appendChild(tick);
  }
  el.appendChild(xAxis);
  
  // Container
  const container = document.createElement('div');
  container.className = 'amorph-dotplot-container';
  
  // Kategorien
  for (const category of categories) {
    const row = erstelleRow(category, globalMin, range, config);
    container.appendChild(row);
  }
  
  el.appendChild(container);
  
  // Stats Summary (optional)
  if (config.showStats) {
    const stats = document.createElement('div');
    stats.className = 'amorph-dotplot-stats';
    stats.innerHTML = `
      <span>Range: ${formatValue(globalMin, config)} - ${formatValue(globalMax, config)}</span>
      <span>Total: ${allValues.length} points</span>
    `;
    el.appendChild(stats);
  }
  
  return el;
}

function normalisiereWert(wert) {
  // Array Format
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object' && item !== null) {
        const values = item.values || item.scores || item.points || item.punkte || item.data || item.werte || [];
        return {
          label: item.category || item.kategorie || item.label || item.name || item.gruppe || '',
          values: Array.isArray(values) ? values.filter(v => typeof v === 'number') : []
        };
      }
      return null;
    }).filter(c => c && c.values.length > 0);
  }
  
  // Object Format: {Category: [values]}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([_, values]) => Array.isArray(values))
      .map(([label, values]) => ({
        label,
        values: values.filter(v => typeof v === 'number')
      }))
      .filter(c => c.values.length > 0);
  }
  
  return [];
}

function erstelleRow(category, globalMin, range, config) {
  const row = document.createElement('div');
  row.className = 'amorph-dotplot-row';
  
  // Label
  const label = document.createElement('div');
  label.className = 'amorph-dotplot-label';
  label.textContent = category.label;
  row.appendChild(label);
  
  // Dot Container
  const dotContainer = document.createElement('div');
  dotContainer.className = 'amorph-dotplot-dots';
  
  // Grid Lines (Hintergrund)
  for (let i = 0; i <= 4; i++) {
    const gridLine = document.createElement('div');
    gridLine.className = 'amorph-dotplot-gridline';
    gridLine.style.left = `${i * 25}%`;
    dotContainer.appendChild(gridLine);
  }
  
  // Statistiken berechnen
  const sorted = [...category.values].sort((a, b) => a - b);
  const mean = category.values.reduce((a, b) => a + b, 0) / category.values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // Median-Linie (optional)
  if (config.showMedian !== false && category.values.length > 2) {
    const medianPos = ((median - globalMin) / range) * 100;
    const medianLine = document.createElement('div');
    medianLine.className = 'amorph-dotplot-median';
    medianLine.style.left = `${medianPos}%`;
    medianLine.title = `Median: ${formatValue(median, config)}`;
    dotContainer.appendChild(medianLine);
  }
  
  // Dots
  for (const value of category.values) {
    const pos = ((value - globalMin) / range) * 100;
    
    const dot = document.createElement('div');
    dot.className = 'amorph-dotplot-dot';
    dot.style.left = `${pos}%`;
    
    // Jitter für überlappende Punkte
    const jitter = (Math.random() - 0.5) * 10;
    dot.style.top = `calc(50% + ${jitter}px)`;
    
    // Color by value (optional)
    if (config.colorByValue) {
      const intensity = (value - globalMin) / range;
      dot.style.background = `rgba(${255 * (1 - intensity)}, ${255 * intensity}, 128, 0.8)`;
    }
    
    dot.title = formatValue(value, config);
    dotContainer.appendChild(dot);
  }
  
  row.appendChild(dotContainer);
  
  // Count
  const count = document.createElement('div');
  count.className = 'amorph-dotplot-count';
  count.textContent = `n=${category.values.length}`;
  row.appendChild(count);
  
  return row;
}

function formatValue(value, config) {
  if (config?.format === 'percent') {
    return `${value.toFixed(0)}%`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(config?.decimals ?? 0);
}

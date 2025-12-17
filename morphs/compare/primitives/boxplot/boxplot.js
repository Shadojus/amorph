/**
 * COMPARE BOXPLOT - UNIFIED boxplot comparison
 * All boxplots shown in ONE chart with item colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareBoxplot(items, config = {}) {
  debug.morphs('compareBoxplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-boxplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items and find global min/max
  let globalMin = Infinity, globalMax = -Infinity;
  
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert ?? {};
    
    const min = rawVal.min ?? rawVal.minimum ?? 0;
    const max = rawVal.max ?? rawVal.maximum ?? 100;
    const q1 = rawVal.q1 ?? rawVal.quartile1 ?? rawVal.lower ?? min + (max - min) * 0.25;
    const q3 = rawVal.q3 ?? rawVal.quartile3 ?? rawVal.upper ?? min + (max - min) * 0.75;
    const median = rawVal.median ?? rawVal.med ?? (q1 + q3) / 2;
    
    if (isFinite(min)) globalMin = Math.min(globalMin, min);
    if (isFinite(max)) globalMax = Math.max(globalMax, max);
    
    return {
      ...item,
      min, max, q1, q3, median,
      index: idx,
      // Neon pilz colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  });
  
  if (!isFinite(globalMin)) globalMin = 0;
  if (!isFinite(globalMax)) globalMax = 100;
  const range = globalMax - globalMin || 1;
  
  // UNIFIED boxplot container
  const boxplotContainer = document.createElement('div');
  boxplotContainer.className = 'amorph-boxplot amorph-boxplot-compare';
  
  // All boxplots as rows
  parsedItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'amorph-boxplot-row-compare';
    
    // Name label
    const label = document.createElement('div');
    label.className = 'amorph-boxplot-label';
    label.textContent = item.name || item.id;
    if (item.textFarbe) label.style.color = item.textFarbe;
    row.appendChild(label);
    
    // Visualization
    const viz = document.createElement('div');
    viz.className = 'amorph-boxplot-viz';
    
    // Calculate positions
    const minPos = ((item.min - globalMin) / range) * 100;
    const maxPos = ((item.max - globalMin) / range) * 100;
    const q1Pos = ((item.q1 - globalMin) / range) * 100;
    const q3Pos = ((item.q3 - globalMin) / range) * 100;
    const medianPos = ((item.median - globalMin) / range) * 100;
    
    // Whisker line (min to max)
    const whiskerLine = document.createElement('div');
    whiskerLine.className = 'amorph-boxplot-whisker-line';
    whiskerLine.style.left = `${minPos}%`;
    whiskerLine.style.width = `${maxPos - minPos}%`;
    whiskerLine.style.background = item.color;
    whiskerLine.style.boxShadow = `0 0 4px ${item.glowColor || item.color}`;
    viz.appendChild(whiskerLine);
    
    // Box (Q1 to Q3)
    const box = document.createElement('div');
    box.className = 'amorph-boxplot-box';
    box.style.left = `${q1Pos}%`;
    box.style.width = `${q3Pos - q1Pos}%`;
    box.style.background = item.color;
    box.style.opacity = '0.4';
    box.style.boxShadow = `0 0 8px ${item.glowColor || item.color}`;
    viz.appendChild(box);
    
    // Median line
    const medianLine = document.createElement('div');
    medianLine.className = 'amorph-boxplot-median';
    medianLine.style.left = `${medianPos}%`;
    medianLine.style.background = item.color;
    medianLine.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
    viz.appendChild(medianLine);
    
    // Min endpoint
    const minPoint = document.createElement('div');
    minPoint.className = 'amorph-boxplot-endpoint';
    minPoint.style.left = `${minPos}%`;
    minPoint.style.background = item.color;
    minPoint.title = `Min: ${item.min}`;
    viz.appendChild(minPoint);
    
    // Max endpoint
    const maxPoint = document.createElement('div');
    maxPoint.className = 'amorph-boxplot-endpoint';
    maxPoint.style.left = `${maxPos}%`;
    maxPoint.style.background = item.color;
    maxPoint.title = `Max: ${item.max}`;
    viz.appendChild(maxPoint);
    
    row.appendChild(viz);
    
    // Values
    const values = document.createElement('div');
    values.className = 'amorph-boxplot-values';
    values.innerHTML = `<span style="color:${item.color}">${formatValue(item.median)}</span>`;
    row.appendChild(values);
    
    boxplotContainer.appendChild(row);
  });
  
  // Scale
  const scale = document.createElement('div');
  scale.className = 'amorph-boxplot-scale';
  scale.innerHTML = `<span>${formatValue(globalMin)}</span><span>${formatValue(globalMax)}</span>`;
  boxplotContainer.appendChild(scale);
  
  el.appendChild(boxplotContainer);
  return el;
}

function formatValue(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export default compareBoxplot;

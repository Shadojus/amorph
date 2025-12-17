/**
 * COMPARE BOXPLOT - Side-by-side boxplot comparison
 * Uses the exact same HTML structure as the original boxplot morph
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
  
  // Container for all boxplots
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Determine global min/max
  let globalMin = Infinity, globalMax = -Infinity;
  items.forEach(item => {
    const val = item.value ?? item.wert ?? {};
    const minVal = val.min ?? val.minimum ?? val.q1 ?? 0;
    const maxVal = val.max ?? val.maximum ?? val.q3 ?? 100;
    if (isFinite(minVal)) globalMin = Math.min(globalMin, minVal);
    if (isFinite(maxVal)) globalMax = Math.max(globalMax, maxVal);
  });
  
  if (!isFinite(globalMin)) globalMin = 0;
  if (!isFinite(globalMax)) globalMax = 100;
  const range = globalMax - globalMin || 1;
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert ?? {};
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original boxplot structure
    const boxplotEl = document.createElement('div');
    boxplotEl.className = 'amorph-boxplot';
    
    // Extract boxplot values
    const min = rawVal.min ?? rawVal.minimum ?? 0;
    const max = rawVal.max ?? rawVal.maximum ?? 100;
    const q1 = rawVal.q1 ?? rawVal.quartile1 ?? rawVal.lower ?? min + (max - min) * 0.25;
    const q3 = rawVal.q3 ?? rawVal.quartile3 ?? rawVal.upper ?? min + (max - min) * 0.75;
    const median = rawVal.median ?? rawVal.med ?? (q1 + q3) / 2;
    
    const boxplotContainer = document.createElement('div');
    boxplotContainer.className = 'amorph-boxplot-container';
    
    const row = document.createElement('div');
    row.className = 'amorph-boxplot-row';
    
    // Visualization
    const viz = document.createElement('div');
    viz.className = 'amorph-boxplot-viz';
    
    // Calculate positions
    const minPos = ((min - globalMin) / range) * 100;
    const maxPos = ((max - globalMin) / range) * 100;
    const q1Pos = ((q1 - globalMin) / range) * 100;
    const q3Pos = ((q3 - globalMin) / range) * 100;
    const medianPos = ((median - globalMin) / range) * 100;
    
    viz.style.setProperty('--min-pos', `${minPos}%`);
    viz.style.setProperty('--max-pos', `${maxPos}%`);
    viz.style.setProperty('--q1-pos', `${q1Pos}%`);
    viz.style.setProperty('--q3-pos', `${q3Pos}%`);
    viz.style.setProperty('--median-pos', `${medianPos}%`);
    viz.style.setProperty('--box-width', `${q3Pos - q1Pos}%`);
    
    // Left whisker
    const whiskerLeft = document.createElement('div');
    whiskerLeft.className = 'amorph-boxplot-whisker amorph-boxplot-whisker-left';
    viz.appendChild(whiskerLeft);
    
    // Box
    const box = document.createElement('div');
    box.className = 'amorph-boxplot-box';
    viz.appendChild(box);
    
    // Median line
    const medianLine = document.createElement('div');
    medianLine.className = 'amorph-boxplot-median';
    viz.appendChild(medianLine);
    
    // Right whisker
    const whiskerRight = document.createElement('div');
    whiskerRight.className = 'amorph-boxplot-whisker amorph-boxplot-whisker-right';
    viz.appendChild(whiskerRight);
    
    // Endpoints
    const minPoint = document.createElement('div');
    minPoint.className = 'amorph-boxplot-endpoint amorph-boxplot-min';
    minPoint.title = `Min: ${min}`;
    viz.appendChild(minPoint);
    
    const maxPoint = document.createElement('div');
    maxPoint.className = 'amorph-boxplot-endpoint amorph-boxplot-max';
    maxPoint.title = `Max: ${max}`;
    viz.appendChild(maxPoint);
    
    row.appendChild(viz);
    
    // Values annotation
    const values = document.createElement('div');
    values.className = 'amorph-boxplot-values';
    values.innerHTML = `<span class="amorph-boxplot-val-median">${formatValue(median)}</span>`;
    row.appendChild(values);
    
    boxplotContainer.appendChild(row);
    boxplotEl.appendChild(boxplotContainer);
    
    wrapper.appendChild(boxplotEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function formatValue(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export default compareBoxplot;

/**
 * COMPARE BOXPLOT - Side-by-side boxplot comparison
 * Shows statistical distributions
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
  
  const container = document.createElement('div');
  container.className = 'compare-boxplot-container';
  
  // Determine global min/max
  let globalMin = Infinity, globalMax = -Infinity;
  items.forEach(item => {
    const val = item.value ?? item.wert ?? {};
    globalMin = Math.min(globalMin, val.min ?? val.q1 ?? 0);
    globalMax = Math.max(globalMax, val.max ?? val.q3 ?? 100);
  });
  const range = globalMax - globalMin || 1;
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-boxplot-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'boxplot-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Boxplot track
    const track = document.createElement('div');
    track.className = 'boxplot-track';
    
    const val = item.value ?? item.wert ?? {};
    const min = val.min ?? 0;
    const q1 = val.q1 ?? val.lower ?? 25;
    const median = val.median ?? val.mid ?? 50;
    const q3 = val.q3 ?? val.upper ?? 75;
    const max = val.max ?? 100;
    
    // Calculate positions
    const minPos = ((min - globalMin) / range) * 100;
    const q1Pos = ((q1 - globalMin) / range) * 100;
    const medianPos = ((median - globalMin) / range) * 100;
    const q3Pos = ((q3 - globalMin) / range) * 100;
    const maxPos = ((max - globalMin) / range) * 100;
    
    // Whiskers
    const whisker = document.createElement('div');
    whisker.className = 'boxplot-whisker';
    whisker.style.left = `${minPos}%`;
    whisker.style.width = `${maxPos - minPos}%`;
    track.appendChild(whisker);
    
    // Box
    const box = document.createElement('div');
    box.className = 'boxplot-box';
    box.style.left = `${q1Pos}%`;
    box.style.width = `${q3Pos - q1Pos}%`;
    track.appendChild(box);
    
    // Median line
    const medianLine = document.createElement('div');
    medianLine.className = 'boxplot-median';
    medianLine.style.left = `${medianPos}%`;
    track.appendChild(medianLine);
    
    row.appendChild(track);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareBoxplot;

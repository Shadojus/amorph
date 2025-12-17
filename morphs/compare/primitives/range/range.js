/**
 * COMPARE RANGE - UNIFIED range comparison (min/max)
 * All items shown as overlapping ranges on a common scale
 */

import { debug } from '../../../../observer/debug.js';

export function compareRange(items, config = {}) {
  debug.morphs('compareRange', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-range';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items to find global min/max for scale
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    let min, max, einheit = '';
    
    if (typeof rawVal === 'object' && rawVal !== null) {
      // Support various formats: {min, max}, {von, bis}, {from, to}, {start, end}
      min = rawVal.min ?? rawVal.von ?? rawVal.from ?? rawVal.start ?? rawVal.low ?? 0;
      max = rawVal.max ?? rawVal.bis ?? rawVal.to ?? rawVal.end ?? rawVal.high ?? min;
      einheit = rawVal.einheit || rawVal.unit || config.einheit || '';
      
      // Handle nested value object: {value: {min, max}}
      if (rawVal.value && typeof rawVal.value === 'object') {
        min = rawVal.value.min ?? rawVal.value.von ?? min;
        max = rawVal.value.max ?? rawVal.value.bis ?? max;
      }
    } else if (typeof rawVal === 'number') {
      // Single number - show as point on scale
      min = max = rawVal;
    } else if (typeof rawVal === 'string') {
      // Try to parse "5-7" or "5 - 7" format
      const rangeMatch = rawVal.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
      if (rangeMatch) {
        min = parseFloat(rangeMatch[1]);
        max = parseFloat(rangeMatch[2]);
      } else {
        min = max = parseFloat(rawVal) || 0;
      }
    } else {
      min = max = 0;
    }
    
    return { ...item, min, max, einheit, index: idx };
  });
  
  // Calculate global scale
  const globalMin = config.skala?.min ?? Math.min(...parsedItems.map(p => p.min));
  const globalMax = config.skala?.max ?? Math.max(...parsedItems.map(p => p.max)) * 1.1;
  const globalRange = globalMax - globalMin || 1;
  const einheit = parsedItems[0]?.einheit || '';
  
  // UNIFIED range container
  const rangeChart = document.createElement('div');
  rangeChart.className = 'amorph-range amorph-range-compare';
  
  // Scale header
  const scaleHeader = document.createElement('div');
  scaleHeader.className = 'range-scale-header';
  scaleHeader.innerHTML = `
    <span class="range-scale-min">${globalMin}${einheit}</span>
    <span class="range-scale-max">${globalMax.toFixed(0)}${einheit}</span>
  `;
  rangeChart.appendChild(scaleHeader);
  
  // All ranges in one container
  const rangesContainer = document.createElement('div');
  rangesContainer.className = 'range-items-unified';
  
  parsedItems.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'range-item-row';
    
    // Use NEON colors
    const lineColor = item.lineFarbe || item.farbe || `hsl(${item.index * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    // Item name with neon text
    const label = document.createElement('span');
    label.className = 'range-item-label';
    label.textContent = item.name || item.id || `Item ${item.index + 1}`;
    label.style.color = textColor;
    row.appendChild(label);
    
    // Range bar track
    const track = document.createElement('div');
    track.className = 'range-item-track';
    
    // Range bar fill with NEON glow
    const fill = document.createElement('div');
    fill.className = 'range-item-fill';
    const startPercent = ((item.min - globalMin) / globalRange) * 100;
    const endPercent = ((item.max - globalMin) / globalRange) * 100;
    fill.style.left = `${startPercent}%`;
    fill.style.width = `${endPercent - startPercent}%`;
    fill.style.background = lineColor;
    fill.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 5px rgba(255,255,255,0.3)`;
    
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value text with neon color
    const value = document.createElement('span');
    value.className = 'range-item-value';
    value.textContent = `${item.min}${einheit} – ${item.max}${einheit}`;
    value.style.color = lineColor;
    row.appendChild(value);
    
    rangesContainer.appendChild(row);
  });
  
  rangeChart.appendChild(rangesContainer);
  el.appendChild(rangeChart);
  
  return el;
}

export default compareRange;
  
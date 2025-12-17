/**
 * COMPARE BAR - UNIFIED horizontal bars for numeric comparisons
 * All items shown as bars in ONE chart for direct comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareBar(items, config = {}) {
  debug.morphs('compareBar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse values for each item
  const parsedItems = items.map((item, i) => {
    const rawVal = item.value ?? item.wert;
    const parsed = parseValue(rawVal);
    return { ...item, ...parsed, index: i };
  });
  
  // Find global max for consistent scaling
  const maxValue = config.max || Math.max(...parsedItems.map(p => p.numeric), 1);
  const einheit = config.unit || config.einheit || '';
  
  // SINGLE unified bar chart container
  const barChart = document.createElement('div');
  barChart.className = 'amorph-bar amorph-bar-compare';
  
  // Optional label/title
  if (config.label) {
    const header = document.createElement('div');
    header.className = 'amorph-bar-header';
    header.innerHTML = `<div class="amorph-bar-titel">${config.label}</div>`;
    barChart.appendChild(header);
  }
  
  // Container for all bars
  const barContainer = document.createElement('div');
  barContainer.className = 'amorph-bar-container amorph-bar-container-compare';
  
  // Create ONE bar row per item (all in same container) with NEON colors
  parsedItems.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'amorph-bar-row amorph-bar-row-compare';
    row.setAttribute('data-item-id', item.id || item.index);
    
    // Item name as label with neon text color
    const label = document.createElement('span');
    label.className = 'amorph-bar-label';
    label.textContent = item.name || item.id || `Item ${item.index + 1}`;
    const textColor = item.textFarbe || item.lineFarbe || item.farbe;
    if (textColor) label.style.color = textColor;
    row.appendChild(label);
    
    // Track with fill - use item NEON color
    const track = document.createElement('div');
    track.className = 'amorph-bar-track';
    
    const fill = document.createElement('div');
    fill.className = 'amorph-bar-fill';
    const percent = maxValue > 0 ? (item.numeric / maxValue) * 100 : 0;
    fill.style.width = `${percent}%`;
    
    // Use item-specific NEON color with glow
    const lineColor = item.lineFarbe || item.farbe || `hsl(${item.index * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    fill.style.background = lineColor;
    fill.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 5px rgba(255,255,255,0.3)`;
    
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value annotation with neon color
    const value = document.createElement('span');
    value.className = 'amorph-bar-value';
    value.textContent = formatValue(item.numeric, einheit);
    value.style.color = lineColor;
    row.appendChild(value);
    
    barContainer.appendChild(row);
  });
  
  barChart.appendChild(barContainer);
  
  // Scale (once, at bottom)
  const scale = document.createElement('div');
  scale.className = 'amorph-bar-scale';
  scale.innerHTML = `
    <span class="amorph-bar-scale-min">0</span>
    <span class="amorph-bar-scale-max">${formatValue(maxValue, einheit)}</span>
  `;
  barChart.appendChild(scale);
  
  el.appendChild(barChart);
  return el;
}

/**
 * Extract numeric value and display format from various input types
 */
function parseValue(val) {
  if (val === null || val === undefined) {
    return { numeric: 0, display: '–', label: '' };
  }
  
  if (typeof val === 'number') {
    return { numeric: val, display: String(val), label: '' };
  }
  
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return { numeric: isNaN(num) ? 0 : num, display: val, label: '' };
  }
  
  if (typeof val === 'object') {
    // {value: 30, min: 0, max: 100}
    if ('value' in val) {
      const numVal = typeof val.value === 'number' ? val.value : parseFloat(val.value) || 0;
      const label = val.label || val.name || '';
      return { numeric: numVal, display: String(numVal), label };
    }
    
    // {min: 10, max: 50} - range
    if ('min' in val && 'max' in val) {
      const mid = (val.min + val.max) / 2;
      return { numeric: mid, display: `${val.min}–${val.max}`, label: '' };
    }
    
    // {level: 3, label: "Medium"}
    if ('level' in val) {
      const numVal = typeof val.level === 'number' ? val.level : parseFloat(val.level) || 0;
      const label = val.label || '';
      return { numeric: numVal, display: String(numVal), label };
    }
    
    // {score: 85}
    if ('score' in val) {
      const numVal = typeof val.score === 'number' ? val.score : parseFloat(val.score) || 0;
      return { numeric: numVal, display: String(numVal), label: '' };
    }
  }
  
  return { numeric: 0, display: String(val), label: '' };
}

function formatValue(value, unit) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k${unit}`;
  if (Number.isInteger(value)) return `${value}${unit}`;
  if (value >= 1) return `${value.toFixed(1)}${unit}`;
  return `${value.toFixed(2)}${unit}`;
}

export default compareBar;

/**
 * COMPARE BAR - Horizontal bars for numeric comparisons
 * Uses the exact same HTML structure as the original bar morph
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
  
  // Container for all bar charts
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Parse values for each item
  const parsedItems = items.map((item, i) => {
    const rawVal = item.value ?? item.wert;
    const parsed = parseValue(rawVal);
    return { ...item, ...parsed, index: i };
  });
  
  // Find global max for consistent scaling
  const maxValue = config.max || Math.max(...parsedItems.map(p => p.numeric), 1);
  const einheit = config.unit || config.einheit || '';
  
  // Create a bar chart for each item using original structure
  parsedItems.forEach((item) => {
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const itemEl = document.createElement('div');
    itemEl.className = 'amorph-bar';
    
    // Header with item name - apply inline text color
    const header = document.createElement('div');
    header.className = 'amorph-bar-header';
    
    const titel = document.createElement('div');
    titel.className = 'amorph-bar-titel';
    titel.textContent = item.name || item.id || `Item ${item.index + 1}`;
    if (item.textFarbe) titel.style.color = item.textFarbe;
    header.appendChild(titel);
    
    itemEl.appendChild(header);
    
    // Container for the bar
    const barContainer = document.createElement('div');
    barContainer.className = 'amorph-bar-container';
    
    // Single bar row
    const row = document.createElement('div');
    row.className = 'amorph-bar-row';
    
    // Label (optional - can be the value description)
    const label = document.createElement('span');
    label.className = 'amorph-bar-label';
    label.textContent = item.label || '';
    row.appendChild(label);
    
    // Track with fill - apply inline styles for colors
    const track = document.createElement('div');
    track.className = 'amorph-bar-track';
    
    const fill = document.createElement('div');
    fill.className = 'amorph-bar-fill';
    const percent = maxValue > 0 ? (item.numeric / maxValue) * 100 : 0;
    fill.style.width = `${percent}%`;
    if (item.farbe) fill.style.background = item.farbe;
    
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value annotation
    const value = document.createElement('span');
    value.className = 'amorph-bar-value';
    value.textContent = formatValue(item.numeric, einheit);
    row.appendChild(value);
    
    barContainer.appendChild(row);
    itemEl.appendChild(barContainer);
    
    // Scale
    const scale = document.createElement('div');
    scale.className = 'amorph-bar-scale';
    scale.innerHTML = `
      <span class="amorph-bar-scale-min">0</span>
      <span class="amorph-bar-scale-max">${formatValue(maxValue, einheit)}</span>
    `;
    itemEl.appendChild(scale);
    
    wrapper.appendChild(itemEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

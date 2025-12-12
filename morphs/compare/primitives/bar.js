/**
 * COMPARE BAR - Horizontal bars for numeric comparisons
 * 
 * Supports various value formats:
 * - Simple number: 42
 * - Range object: {min: 10, max: 50}
 * - Value with range: {value: 30, min: 0, max: 100}
 * - Object with value: {value: 42, label: "High"}
 * 
 * @param {Array} items - [{id, name, value, color}]
 * @param {Object} config - {max, unit, label}
 */

import { debug } from '../../../../observer/debug.js';

/**
 * Extract numeric value and display format from various input types
 */
function parseValue(val) {
  if (val === null || val === undefined) {
    return { numeric: 0, display: '–' };
  }
  
  if (typeof val === 'number') {
    return { numeric: val, display: String(val) };
  }
  
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return { numeric: isNaN(num) ? 0 : num, display: val };
  }
  
  if (typeof val === 'object') {
    // {value: 30, min: 0, max: 100} - use value
    if ('value' in val) {
      const numVal = typeof val.value === 'number' ? val.value : parseFloat(val.value) || 0;
      return { numeric: numVal, display: String(numVal) };
    }
    
    // {min: 10, max: 50} - range without explicit value, use midpoint
    if ('min' in val && 'max' in val) {
      const mid = (val.min + val.max) / 2;
      return { numeric: mid, display: `${val.min}–${val.max}` };
    }
    
    // {level: 3, label: "Medium"} - use level
    if ('level' in val) {
      const numVal = typeof val.level === 'number' ? val.level : parseFloat(val.level) || 0;
      const display = val.label ? `${val.label} (${numVal})` : String(numVal);
      return { numeric: numVal, display };
    }
    
    // {score: 85} - use score
    if ('score' in val) {
      const numVal = typeof val.score === 'number' ? val.score : parseFloat(val.score) || 0;
      return { numeric: numVal, display: String(numVal) };
    }
  }
  
  return { numeric: 0, display: String(val) };
}

export function compareBar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all values first
  const parsedItems = items.map(item => {
    const rawVal = item.value ?? item.wert;
    const parsed = parseValue(rawVal);
    // Check if raw value has its own max
    const itemMax = (typeof rawVal === 'object' && rawVal?.max) || null;
    return { ...item, ...parsed, itemMax };
  });
  
  // Determine max value
  const numericValues = parsedItems.map(p => p.numeric);
  const itemMaxes = parsedItems.map(p => p.itemMax).filter(Boolean);
  const maxValue = config.max || Math.max(...itemMaxes, ...numericValues, 1);
  
  // Label
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Bars
  const bars = document.createElement('div');
  bars.className = 'compare-bars';
  
  parsedItems.forEach((item) => {
    const row = document.createElement('div');
    row.className = `compare-bar-row ${item.colorClass || item.farbKlasse || ''}`;
    
    const pct = Math.min(100, (item.numeric / maxValue) * 100);
    const itemName = item.name || item.id || '–';
    
    // NO inline styles for colors! CSS classes handle this via pilz-farbe-X
    row.innerHTML = `
      <span class="bar-name">${itemName}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="bar-value">${item.display}${config.unit || config.einheit || ''}</span>
    `;
    
    bars.appendChild(row);
  });
  
  el.appendChild(bars);
  
  // Scale below the bars
  const scale = document.createElement('div');
  scale.className = 'compare-bar-scale';
  scale.innerHTML = `
    <span class="scale-min">0</span>
    <span class="scale-max">${maxValue}${config.unit || config.einheit || ''}</span>
  `;
  el.appendChild(scale);
  
  return el;
}

export default compareBar;

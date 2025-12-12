/**
 * COMPARE TEXT - Side-by-side text comparison
 * Handles various value types intelligently
 */

import { debug } from '../../../../observer/debug.js';

/**
 * Format a value for display
 * - Strings: as-is
 * - Numbers: formatted
 * - Objects with label: show label
 * - Objects with value: show value
 * - Objects: show key-value pairs
 * - Arrays: comma-separated
 */
function formatValue(val) {
  if (val === null || val === undefined) return '–';
  if (typeof val === 'string') return val || '–';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '✓ Yes' : '✗ No';
  
  if (Array.isArray(val)) {
    if (val.length === 0) return '–';
    // Array of objects - format each
    if (typeof val[0] === 'object') {
      return val.map(v => formatValue(v)).join(', ');
    }
    return val.join(', ');
  }
  
  if (typeof val === 'object') {
    // Common patterns for display-friendly rendering
    if ('label' in val) return val.label;
    if ('name' in val) return val.name;
    if ('title' in val) return val.title;
    if ('text' in val) return val.text;
    
    // Value with unit
    if ('value' in val && 'unit' in val) {
      return `${val.value} ${val.unit}`;
    }
    
    // Just value
    if ('value' in val) {
      return formatValue(val.value);
    }
    
    // Range
    if ('min' in val && 'max' in val) {
      return `${val.min}–${val.max}`;
    }
    
    // Level with label
    if ('level' in val) {
      return val.label ? `${val.label} (${val.level})` : String(val.level);
    }
    
    // Small objects: show as key-value pairs
    const keys = Object.keys(val);
    if (keys.length <= 4) {
      return keys.map(k => `${k}: ${formatValue(val[k])}`).join(', ');
    }
    
    // Large objects: just show key count
    return `{${keys.length} fields}`;
  }
  
  return String(val);
}

export function compareText(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-text';
  
  const container = document.createElement('div');
  container.className = 'compare-text-container';
  
  items.forEach(item => {
    const textWrap = document.createElement('div');
    textWrap.className = `compare-text-wrap ${item.colorClass || item.farbKlasse || ''}`;
    
    // Use CSS custom properties for color (set by pilz-farbe-X class)
    // Only use inline style as fallback if no color class
    const itemName = item.name || item.id || '–';
    const val = item.value ?? item.wert;
    const displayVal = formatValue(val);
    
    textWrap.innerHTML = `
      <div class="text-header">${itemName}</div>
      <div class="text-content">${displayVal}</div>
    `;
    container.appendChild(textWrap);
  });
  
  el.appendChild(container);
  return el;
}

export default compareText;

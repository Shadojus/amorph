/**
 * COMPARE RATING - Star rating comparison
 * Supports both simple values and complex objects like {value: 95, min: 0, max: 100}
 */

import { debug } from '../../../../observer/debug.js';

/**
 * Extract numeric value from various formats:
 * - Simple number: 5 → 5
 * - Object with value: {value: 95, max: 100} → 95
 * - Object with level: {level: 3, label: "Medium"} → 3
 * - String number: "5" → 5
 */
function extractValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  if (typeof val === 'object') {
    // Try common value keys
    if ('value' in val) return extractValue(val.value);
    if ('level' in val) return extractValue(val.level);
    if ('score' in val) return extractValue(val.score);
    if ('rating' in val) return extractValue(val.rating);
    if ('wert' in val) return extractValue(val.wert);
  }
  return 0;
}

/**
 * Extract max value from object or use config default
 */
function extractMax(val, configMax) {
  if (typeof val === 'object' && val !== null) {
    if ('max' in val) return val.max;
    if ('maxValue' in val) return val.maxValue;
  }
  return configMax;
}

export function compareRating(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-rating';
  
  const defaultMax = config.max || config.maxStars || 5;
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const rows = document.createElement('div');
  rows.className = 'compare-rows';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = `compare-rating-row ${item.colorClass || item.farbKlasse || ''}`;
    
    const rawVal = item.value ?? item.wert;
    const val = extractValue(rawVal);
    const max = extractMax(rawVal, defaultMax);
    
    // Normalize to star scale (if value is percentage-like, convert to stars)
    const normalizedVal = max > 10 ? Math.round((val / max) * defaultMax) : Math.round(val);
    const displayVal = max > 10 ? `${val}%` : val;
    
    const filled = Math.min(normalizedVal, defaultMax);
    // NO inline styles! CSS handles colors via pilz-farbe-X class
    const stars = Array(defaultMax).fill(0).map((_, i) => 
      `<span class="star ${i < filled ? 'filled' : ''}">${i < filled ? '★' : '☆'}</span>`
    ).join('');
    
    const itemName = item.name || item.id || '–';
    row.innerHTML = `
      <span class="rating-name">${itemName}</span>
      <div class="rating-stars">${stars}</div>
      <span class="rating-value">${displayVal}</span>
    `;
    
    rows.appendChild(row);
  });
  
  el.appendChild(rows);
  return el;
}

export default compareRating;

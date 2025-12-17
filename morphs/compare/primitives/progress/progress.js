/**
 * COMPARE PROGRESS - Progress bar comparison
 * Uses the exact same HTML structure as the original progress morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareProgress(items, config = {}) {
  debug.morphs('compareProgress', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-progress';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all progress bars
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Extract values
    let value, maxValue;
    
    if (typeof rawVal === 'number') {
      value = rawVal;
      maxValue = detectMax(rawVal, config);
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      value = rawVal.value || rawVal.current || rawVal.progress || rawVal.wert || 0;
      maxValue = rawVal.max || rawVal.total || rawVal.von || detectMax(value, config);
    } else {
      value = parseFloat(rawVal) || 0;
      maxValue = 100;
    }
    
    const percent = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
    const einheit = config.einheit || rawVal?.unit || rawVal?.einheit || '';
    
    // Use original progress structure
    const progressEl = document.createElement('div');
    progressEl.className = 'amorph-progress';
    
    // Track
    const track = document.createElement('div');
    track.className = 'amorph-progress-track';
    track.title = `${formatValue(value, einheit)} / ${formatValue(maxValue, einheit)} (${percent.toFixed(0)}%)`;
    
    // Fill - apply inline style for color
    const fill = document.createElement('div');
    fill.className = 'amorph-progress-fill';
    fill.style.width = `${percent}%`;
    if (item.farbe) fill.style.background = item.farbe;
    
    // Color based on percent
    if (percent >= 80) {
      fill.classList.add('amorph-progress-high');
    } else if (percent >= 50) {
      fill.classList.add('amorph-progress-medium');
    } else {
      fill.classList.add('amorph-progress-low');
    }
    
    track.appendChild(fill);
    
    // Value display
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'amorph-progress-value-display';
    valueDisplay.textContent = `${formatValue(value, einheit)}`;
    
    progressEl.appendChild(track);
    progressEl.appendChild(valueDisplay);
    
    wrapper.appendChild(progressEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function detectMax(value, config) {
  if (config?.max) return config.max;
  if (value > 100) return 1000;
  if (value > 10) return 100;
  return 100;
}

function formatValue(value, einheit) {
  if (Number.isInteger(value)) return `${value}${einheit}`;
  return `${value.toFixed(1)}${einheit}`;
}

export default compareProgress;

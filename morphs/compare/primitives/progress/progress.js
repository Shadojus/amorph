/**
 * COMPARE PROGRESS - UNIFIED Progress bar comparison
 * All items shown as stacked progress bars for direct comparison
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
  
  // Parse all items and find global max
  let globalMax = 0;
  
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
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
    
    globalMax = Math.max(globalMax, maxValue);
    
    return {
      ...item,
      value,
      maxValue,
      index: idx,
      // Farben werden durchgereicht, item hat bereits lineFarbe etc.
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  });
  
  const einheit = config.einheit || '';
  
  // UNIFIED progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'amorph-progress amorph-progress-compare';
  
  // All progress bars stacked with NEON glow
  parsedItems.forEach(item => {
    const percent = globalMax > 0 ? Math.min(100, (item.value / globalMax) * 100) : 0;
    
    const row = document.createElement('div');
    row.className = 'amorph-progress-row-compare';
    
    // Name label with neon text color
    const label = document.createElement('div');
    label.className = 'amorph-progress-label';
    label.textContent = item.name || item.id;
    const textColor = item.textFarbe || item.lineFarbe || item.farbe;
    if (textColor) label.style.color = textColor;
    row.appendChild(label);
    
    // Track with fill
    const track = document.createElement('div');
    track.className = 'amorph-progress-track';
    track.title = `${formatValue(item.value, einheit)} / ${formatValue(item.maxValue, einheit)}`;
    
    // NEON fill with glow
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    
    const fill = document.createElement('div');
    fill.className = 'amorph-progress-fill';
    fill.style.width = `${percent}%`;
    fill.style.background = lineColor;
    fill.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 5px rgba(255,255,255,0.3)`;
    
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value with neon color
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'amorph-progress-value-display';
    valueDisplay.textContent = formatValue(item.value, einheit);
    valueDisplay.style.color = lineColor;
    row.appendChild(valueDisplay);
    
    progressContainer.appendChild(row);
  });
  
  // Scale indicator
  const scale = document.createElement('div');
  scale.className = 'amorph-progress-scale';
  scale.innerHTML = `<span>0</span><span>${formatValue(globalMax, einheit)}</span>`;
  progressContainer.appendChild(scale);
  
  el.appendChild(progressContainer);
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

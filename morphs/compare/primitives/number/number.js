/**
 * COMPARE NUMBER - UNIFIED Numeric comparison
 * All numbers shown as big values with comparative bars
 */

import { debug } from '../../../../observer/debug.js';

export function compareNumber(items, config = {}) {
  debug.morphs('compareNumber', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-number';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items and find global max
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const num = Number(rawVal) || 0;
    
    return {
      ...item,
      value: num,
      index: idx,
      // Farben werden durchgereicht, item hat bereits lineFarbe etc.
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  });
  
  const maxVal = Math.max(...parsedItems.map(i => Math.abs(i.value)), 1);
  
  // UNIFIED number container
  const numberContainer = document.createElement('div');
  numberContainer.className = 'amorph-number amorph-number-compare';
  
  // Primary big numbers at top with NEON glow
  const primarySection = document.createElement('div');
  primarySection.className = 'number-primary-compare';
  
  parsedItems.forEach(item => {
    // Use NEON colors
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'number-primary-item';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'number-primary-name';
    nameEl.textContent = item.name || item.id;
    nameEl.style.color = textColor;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'number-primary-value';
    valueEl.textContent = formatNumber(item.value, config);
    valueEl.style.color = lineColor;
    valueEl.style.textShadow = `0 0 20px ${glowColor}`;
    
    itemEl.appendChild(nameEl);
    itemEl.appendChild(valueEl);
    primarySection.appendChild(itemEl);
  });
  
  numberContainer.appendChild(primarySection);
  
  // Comparative bars below with NEON glow
  const barsSection = document.createElement('div');
  barsSection.className = 'number-bars-compare';
  
  parsedItems.forEach(item => {
    const percent = (Math.abs(item.value) / maxVal) * 100;
    
    // Use NEON colors
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    
    const row = document.createElement('div');
    row.className = 'number-bar-row';
    
    const label = document.createElement('div');
    label.className = 'number-bar-label';
    label.textContent = item.name || item.id;
    row.appendChild(label);
    
    const track = document.createElement('div');
    track.className = 'number-bar-track';
    
    const fill = document.createElement('div');
    fill.className = 'number-bar-fill';
    fill.style.width = `${percent}%`;
    fill.style.background = lineColor;
    fill.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 5px rgba(255,255,255,0.3)`;
    
    track.appendChild(fill);
    row.appendChild(track);
    
    const val = document.createElement('div');
    val.className = 'number-bar-value';
    val.textContent = formatNumber(item.value, config);
    val.style.color = lineColor;
    row.appendChild(val);
    
    barsSection.appendChild(row);
  });
  
  numberContainer.appendChild(barsSection);
  el.appendChild(numberContainer);
  
  return el;
}

function formatNumber(num, config) {
  let formatted;
  
  if (num !== 0 && Math.abs(num) < 0.001) {
    formatted = num.toExponential(2);
  } else if (config.dezimalen !== undefined) {
    formatted = num.toFixed(config.dezimalen);
  } else if (Number.isInteger(num)) {
    if (Math.abs(num) >= 1000) {
      formatted = num.toLocaleString('de-DE');
    } else {
      formatted = String(num);
    }
  } else {
    formatted = num.toFixed(2).replace(/\.?0+$/, '');
  }
  
  if (config.einheit) {
    formatted = `${formatted} ${config.einheit}`;
  }
  
  return formatted;
}

export default compareNumber;

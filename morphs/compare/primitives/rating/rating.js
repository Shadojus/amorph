/**
 * COMPARE RATING - UNIFIED Star rating comparison
 * All ratings shown as rows with stars and bars for direct comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareRating(items, config = {}) {
  debug.morphs('compareRating', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-rating';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    let value, maxValue;
    
    if (typeof rawVal === 'number') {
      value = rawVal;
      maxValue = detectMax(rawVal);
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      value = rawVal.rating || rawVal.score || rawVal.value || rawVal.stars || rawVal.level || 0;
      maxValue = rawVal.max || rawVal.von || rawVal.outOf || detectMax(value);
    } else {
      value = parseFloat(rawVal) || 0;
      maxValue = 5;
    }
    
    return {
      ...item,
      value,
      maxValue,
      index: idx,
      // Farben werden durchgereicht, item hat bereits lineFarbe etc.
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  });
  
  const maxStars = config.maxStars || 5;
  const icon = config.icon || '★';
  const emptyIcon = config.emptyIcon || '☆';
  const halfIcon = config.halfIcon || '⯨';
  
  // UNIFIED rating container
  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'amorph-rating amorph-rating-compare';
  
  parsedItems.forEach(item => {
    const normalizedValue = (item.value / item.maxValue) * maxStars;
    const fullStars = Math.floor(normalizedValue);
    const hasHalf = normalizedValue % 1 >= 0.25 && normalizedValue % 1 < 0.75;
    const hasAlmostFull = normalizedValue % 1 >= 0.75;
    const percent = (item.value / item.maxValue) * 100;
    
    // Use NEON colors
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    const row = document.createElement('div');
    row.className = 'amorph-rating-row-compare';
    
    // Name with neon text
    const nameEl = document.createElement('div');
    nameEl.className = 'amorph-rating-name';
    nameEl.textContent = item.name || item.id;
    nameEl.style.color = textColor;
    row.appendChild(nameEl);
    
    // Stars with NEON glow
    const starsEl = document.createElement('div');
    starsEl.className = 'amorph-rating-stars';
    starsEl.style.color = lineColor;
    starsEl.style.textShadow = `0 0 8px ${glowColor}`;
    
    for (let i = 0; i < maxStars; i++) {
      const star = document.createElement('span');
      star.className = 'amorph-rating-star';
      
      if (i < fullStars || (i === fullStars && hasAlmostFull)) {
        star.textContent = icon;
        star.classList.add('amorph-rating-full');
      } else if (i === fullStars && hasHalf) {
        star.textContent = halfIcon;
        star.classList.add('amorph-rating-half');
      } else {
        star.textContent = emptyIcon;
        star.classList.add('amorph-rating-empty');
        star.style.textShadow = 'none';
      }
      
      starsEl.appendChild(star);
    }
    
    row.appendChild(starsEl);
    
    // Bar with NEON glow
    const barEl = document.createElement('div');
    barEl.className = 'amorph-rating-bar-track';
    
    const fill = document.createElement('div');
    fill.className = 'amorph-rating-bar-fill';
    fill.style.width = `${percent}%`;
    fill.style.background = lineColor;
    fill.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 5px rgba(255,255,255,0.3)`;
    barEl.appendChild(fill);
    row.appendChild(barEl);
    
    // Value with neon color
    const valueEl = document.createElement('div');
    valueEl.className = 'amorph-rating-value';
    valueEl.textContent = `${item.value.toFixed(1)}/${item.maxValue}`;
    valueEl.style.color = lineColor;
    row.appendChild(valueEl);
    
    ratingContainer.appendChild(row);
  });
  
  el.appendChild(ratingContainer);
  return el;
}

function detectMax(value) {
  if (value > 10) return 100;
  if (value > 5) return 10;
  return 5;
}

export default compareRating;

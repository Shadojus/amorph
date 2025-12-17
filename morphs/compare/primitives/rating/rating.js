/**
 * COMPARE RATING - Star rating comparison
 * Uses the exact same HTML structure as the original rating morph
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
  
  // Container for all ratings
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
    
    // Extract value and max
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
    
    // Use original rating structure
    const ratingEl = document.createElement('span');
    ratingEl.className = 'amorph-rating';
    
    // Normalize to 5-star scale
    const maxStars = config.maxStars || 5;
    const normalizedValue = (value / maxValue) * maxStars;
    const fullStars = Math.floor(normalizedValue);
    const hasHalf = normalizedValue % 1 >= 0.25 && normalizedValue % 1 < 0.75;
    const hasAlmostFull = normalizedValue % 1 >= 0.75;
    
    // Icons
    const icon = config.icon || '★';
    const emptyIcon = config.emptyIcon || '☆';
    const halfIcon = config.halfIcon || '⯨';
    
    // Stars container
    const starsContainer = document.createElement('span');
    starsContainer.className = 'amorph-rating-stars';
    
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
      }
      
      starsContainer.appendChild(star);
    }
    
    ratingEl.appendChild(starsContainer);
    
    // Numeric value
    if (config.showValue !== false) {
      const valueEl = document.createElement('span');
      valueEl.className = 'amorph-rating-value';
      valueEl.textContent = `${value.toFixed(1)}/${maxValue}`;
      ratingEl.appendChild(valueEl);
    }
    
    wrapper.appendChild(ratingEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function detectMax(value) {
  if (value > 10) return 100;
  if (value > 5) return 10;
  return 5;
}

export default compareRating;

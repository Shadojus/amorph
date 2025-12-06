/**
 * COMPARE RATING - Sterne-Vergleich
 */

import { debug } from '../../../observer/debug.js';

export function compareRating(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-rating';
  
  const max = config.max || config.maxStars || 5;
  
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
    row.className = `compare-rating-row ${item.farbKlasse || ''}`;
    
    // Inline-Styles (CSS greift nicht zuverlässig)
    const textColor = item.textFarbe || item.farbe || 'white';
    const starColor = item.farbe || 'gold';
    
    const filled = Math.round(Number(item.wert) || 0);
    const stars = Array(max).fill(0).map((_, i) => 
      `<span class="star ${i < filled ? 'filled' : ''}" style="${i < filled ? `color:${starColor}` : ''}">${i < filled ? '★' : '☆'}</span>`
    ).join('');
    
    row.innerHTML = `
      <span class="rating-name" style="color:${textColor}">${item.name}</span>
      <div class="rating-stars">${stars}</div>
      <span class="rating-wert">${item.wert}</span>
    `;
    
    rows.appendChild(row);
  });
  
  el.appendChild(rows);
  return el;
}

export default compareRating;

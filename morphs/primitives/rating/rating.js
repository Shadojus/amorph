/**
 * ⭐ RATING MORPH - Sterne-Bewertung
 * 
 * Zeigt Bewertungen als Sterne/Icons
 * DATENGETRIEBEN - Erkennt Zahlen 0-5 oder 0-10 oder 0-100
 * 
 * Input: 4.5 oder {rating: 4.5, max: 5}
 * Output: ⭐⭐⭐⭐⯨ (4.5/5)
 */

import { debug } from '../../../observer/debug.js';

export function rating(wert, config = {}) {
  debug.morphs('rating', { wert, typ: typeof wert });
  
  const el = document.createElement('span');
  el.className = 'amorph-rating';
  
  // Wert extrahieren
  let value, maxValue;
  
  if (typeof wert === 'number') {
    value = wert;
    maxValue = detectMax(wert);
  } else if (typeof wert === 'object') {
    value = wert.rating || wert.score || wert.value || wert.stars || 0;
    maxValue = wert.max || wert.von || wert.outOf || detectMax(value);
  } else {
    value = 0;
    maxValue = 5;
  }
  
  // Auf 5-Sterne-Skala normalisieren
  const maxStars = config.maxStars || 5;
  const normalizedValue = (value / maxValue) * maxStars;
  const fullStars = Math.floor(normalizedValue);
  const hasHalf = normalizedValue % 1 >= 0.25 && normalizedValue % 1 < 0.75;
  const hasAlmostFull = normalizedValue % 1 >= 0.75;
  
  // Icon wählen
  const icon = config.icon || '★';
  const emptyIcon = config.emptyIcon || '☆';
  const halfIcon = config.halfIcon || '⯨';
  
  // Sterne rendern
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
  
  el.appendChild(starsContainer);
  
  // Numerischer Wert (optional)
  if (config.showValue !== false) {
    const valueEl = document.createElement('span');
    valueEl.className = 'amorph-rating-value';
    valueEl.textContent = `${value.toFixed(1)}/${maxValue}`;
    el.appendChild(valueEl);
  }
  
  return el;
}

function detectMax(value) {
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  return 100;
}

/**
 * COMPARE IMAGE - Image gallery comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareImage(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-image';
  
  const gallery = document.createElement('div');
  gallery.className = 'compare-gallery';
  
  items.forEach(item => {
    const val = item.value ?? item.wert;
    if (!val) return;
    
    const imgWrap = document.createElement('div');
    imgWrap.className = `compare-img-wrap ${item.colorClass || item.farbKlasse || ''}`;
    
    // Inline styles for reliable rendering
    const bgColor = item.color || item.farbe || 'rgba(100,100,100,0.5)';
    const textColor = item.textColor || item.textFarbe || 'white';
    const itemName = item.name || item.id || '–';
    imgWrap.innerHTML = `
      <img src="${val}" alt="${itemName}" loading="lazy">
      <span class="img-label" style="background-color:${bgColor};color:${textColor}">${itemName}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

export default compareImage;

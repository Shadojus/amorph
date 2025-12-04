/**
 * COMPARE IMAGE - Bildergalerie
 */

import { debug } from '../../../observer/debug.js';

export function compareImage(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-image';
  
  const gallery = document.createElement('div');
  gallery.className = 'compare-gallery';
  
  items.forEach(item => {
    if (!item.wert) return;
    
    const imgWrap = document.createElement('div');
    imgWrap.className = 'compare-img-wrap';
    imgWrap.style.borderColor = item.farbe;
    
    imgWrap.innerHTML = `
      <img src="${item.wert}" alt="${item.name}" loading="lazy">
      <span class="img-label" style="background:${item.farbe}">${item.name}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

export default compareImage;

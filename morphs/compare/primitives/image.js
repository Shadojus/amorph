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
    imgWrap.className = `compare-img-wrap ${item.farbKlasse || ''}`;
    
    imgWrap.innerHTML = `
      <img src="${item.wert}" alt="${item.name}" loading="lazy">
      <span class="img-label pilz-fill pilz-text">${item.name}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

export default compareImage;

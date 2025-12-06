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
    
    // Inline-Styles für zuverlässige Darstellung
    const bgColor = item.farbe || 'rgba(100,100,100,0.5)';
    const textColor = item.textFarbe || 'white';
    imgWrap.innerHTML = `
      <img src="${item.wert}" alt="${item.name}" loading="lazy">
      <span class="img-label" style="background-color:${bgColor};color:${textColor}">${item.name}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

export default compareImage;

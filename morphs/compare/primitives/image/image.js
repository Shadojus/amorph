/**
 * COMPARE IMAGE - Image gallery comparison
 * Uses the exact same HTML structure as the original image morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareImage(items, config = {}) {
  debug.morphs('compareImage', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-image';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all images
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    if (!rawVal) return;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original image structure (figure)
    const figure = document.createElement('figure');
    figure.className = 'amorph-image';
    
    const img = document.createElement('img');
    const src = typeof rawVal === 'string' ? rawVal : rawVal?.url || rawVal?.src;
    
    if (src && isAllowedUrl(src, config.erlaubteDomains)) {
      img.src = src;
      img.alt = (typeof rawVal === 'object' ? rawVal.alt : null) || config.alt || item.name || '';
      img.loading = 'lazy';
    } else {
      img.alt = 'Bild nicht verfügbar';
      figure.setAttribute('data-error', 'invalid-url');
    }
    
    figure.appendChild(img);
    
    // Caption if available
    const caption = typeof rawVal === 'object' ? rawVal.caption : null;
    if (caption || config.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption || config.caption;
      figure.appendChild(figcaption);
    }
    
    wrapper.appendChild(figure);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function isAllowedUrl(url, erlaubteDomains) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (erlaubteDomains && erlaubteDomains.length > 0) {
      return erlaubteDomains.some(d => parsed.hostname.endsWith(d));
    }
    return true;
  } catch {
    return false;
  }
}

export default compareImage;

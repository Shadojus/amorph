/**
 * COMPARE LINK - Link comparison
 * Uses the exact same HTML structure as the original link morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareLink(items, config = {}) {
  debug.morphs('compareLink', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-link';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all links
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Neon pilz colors
    const baseColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || baseColor;
    const textColor = item.textFarbe || baseColor;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply neon color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Use original link structure
    const url = typeof rawVal === 'string' ? rawVal : rawVal?.url || rawVal?.href;
    const text = typeof rawVal === 'string' ? rawVal : rawVal?.text || rawVal?.label || url;
    
    const linkEl = document.createElement('a');
    linkEl.className = 'amorph-link';
    linkEl.style.color = baseColor;
    linkEl.style.textShadow = `0 0 4px ${glowColor}`;
    
    if (url && isValidUrl(url)) {
      linkEl.href = url;
      linkEl.textContent = text;
      
      if (isExternal(url)) {
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
      }
    } else {
      linkEl.textContent = text || 'Kein Link';
      linkEl.removeAttribute('href');
      linkEl.setAttribute('data-invalid', 'true');
    }
    
    wrapper.appendChild(linkEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isExternal(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export default compareLink;

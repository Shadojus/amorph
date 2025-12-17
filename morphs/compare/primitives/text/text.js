/**
 * COMPARE TEXT - Side-by-side text comparison
 * Uses the exact same HTML structure as the original text morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareText(items, config = {}) {
  debug.morphs('compareText', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-text';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all text items
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    
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
    
    // Use original text structure with subtle neon
    const textEl = document.createElement('span');
    textEl.className = 'amorph-text';
    // Don't apply heavy neon to text content (just keep readable)
    
    // Format the value using original text morph logic
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        textEl.textContent = val.join(', ');
      } else {
        if (val.name) {
          textEl.textContent = String(val.name);
        } else if (val.label) {
          textEl.textContent = String(val.label);
        } else if (val.title || val.titel) {
          textEl.textContent = String(val.title || val.titel);
        } else if (val.value !== undefined) {
          textEl.textContent = String(val.value);
        } else {
          const entries = Object.entries(val)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? '...' : v}`)
            .join(', ');
          textEl.textContent = entries || '(leer)';
          textEl.classList.add('amorph-text-object');
        }
      }
    } else {
      textEl.textContent = String(val ?? '–');
    }
    
    wrapper.appendChild(textEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareText;

/**
 * COMPARE LOLLIPOP - Lollipop chart comparison
 * Uses the exact same HTML structure as the original lollipop morph
 */

import { debug } from '../../../../observer/debug.js';

// Blue theme colors
const LOLLIPOP_FARBEN = {
  positiv: 'rgba(100, 180, 255, 0.8)',
  negativ: 'rgba(60, 120, 180, 0.8)',
  neutral: 'rgba(140, 200, 255, 0.7)'
};

export function compareLollipop(items, config = {}) {
  debug.morphs('compareLollipop', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-lollipop';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original lollipop structure
    const lollipopEl = document.createElement('div');
    lollipopEl.className = 'amorph-lollipop';
    
    const dataItems = normalisiereWert(rawVal);
    
    if (dataItems.length === 0) {
      lollipopEl.innerHTML = '<span class="amorph-lollipop-leer">Keine Lollipop-Daten</span>';
    } else {
      const sorted = dataItems.sort((a, b) => b.value - a.value);
      const maxValue = Math.max(...sorted.map(i => i.value), 1);
      
      const lollipopContainer = document.createElement('div');
      lollipopContainer.className = 'amorph-lollipop-container horizontal';
      
      sorted.slice(0, 5).forEach((dataItem, i) => {
        const row = document.createElement('div');
        row.className = 'amorph-lollipop-row';
        if (i === 0) row.classList.add('is-max');
        
        const itemLabel = document.createElement('span');
        itemLabel.className = 'amorph-lollipop-label';
        itemLabel.textContent = dataItem.label;
        row.appendChild(itemLabel);
        
        const track = document.createElement('div');
        track.className = 'amorph-lollipop-track';
        
        const percent = (dataItem.value / maxValue) * 100;
        
        const line = document.createElement('div');
        line.className = 'amorph-lollipop-line';
        line.style.width = `${percent}%`;
        line.style.background = LOLLIPOP_FARBEN.positiv;
        track.appendChild(line);
        
        const dot = document.createElement('div');
        dot.className = 'amorph-lollipop-dot';
        dot.style.left = `${percent}%`;
        dot.style.background = LOLLIPOP_FARBEN.positiv;
        track.appendChild(dot);
        
        row.appendChild(track);
        
        const valueEl = document.createElement('span');
        valueEl.className = 'amorph-lollipop-value';
        valueEl.textContent = dataItem.value.toLocaleString();
        row.appendChild(valueEl);
        
        lollipopContainer.appendChild(row);
      });
      
      lollipopEl.appendChild(lollipopContainer);
    }
    
    wrapper.appendChild(lollipopEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        items.push({
          label: item.label || item.name || item.kategorie || '',
          value: item.value || item.wert || 0
        });
      } else if (typeof item === 'number') {
        items.push({ label: `${items.length + 1}`, value: item });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'number') {
        items.push({ label: key, value });
      }
    }
  }
  
  return items;
}

export default compareLollipop;

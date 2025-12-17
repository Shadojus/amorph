/**
 * COMPARE PICTOGRAM - Pictogram comparison
 * Uses the exact same HTML structure as the original pictogram morph
 */

import { debug } from '../../../../observer/debug.js';

const STANDARD_ICONS = {
  person: '👤', menschen: '👤', people: '👤', users: '👤',
  pilze: '🍄', pflanzen: '🌱', tiere: '🐾',
  geld: '💰', punkte: '●', default: '■'
};

export function comparePictogram(items, config = {}) {
  debug.morphs('comparePictogram', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pictogram';
  
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
    
    // Original pictogram structure
    const pictogramEl = document.createElement('div');
    pictogramEl.className = 'amorph-pictogram';
    
    const dataItems = normalisiereWert(rawVal);
    
    if (dataItems.length === 0) {
      pictogramEl.innerHTML = '<span class="amorph-pictogram-leer">Keine Pictogram-Daten</span>';
    } else {
      dataItems.slice(0, 3).forEach(dataItem => {
        const row = document.createElement('div');
        row.className = 'amorph-pictogram-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '6px';
        row.style.marginBottom = '4px';
        
        if (dataItem.label) {
          const itemLabel = document.createElement('div');
          itemLabel.className = 'amorph-pictogram-label';
          itemLabel.textContent = dataItem.label;
          itemLabel.style.fontSize = '9px';
          itemLabel.style.width = '30px';
          row.appendChild(itemLabel);
        }
        
        const grid = document.createElement('div');
        grid.className = 'amorph-pictogram-grid';
        grid.style.display = 'flex';
        grid.style.flexWrap = 'wrap';
        grid.style.gap = '1px';
        
        const iconCount = Math.min(10, dataItem.value);
        for (let i = 0; i < iconCount; i++) {
          const icon = document.createElement('span');
          icon.className = 'amorph-pictogram-icon';
          icon.textContent = dataItem.icon;
          icon.style.fontSize = '10px';
          grid.appendChild(icon);
        }
        
        row.appendChild(grid);
        
        const valueEl = document.createElement('span');
        valueEl.className = 'amorph-pictogram-value';
        valueEl.textContent = dataItem.value.toLocaleString();
        valueEl.style.fontSize = '9px';
        valueEl.style.opacity = '0.7';
        row.appendChild(valueEl);
        
        pictogramEl.appendChild(row);
      });
    }
    
    wrapper.appendChild(pictogramEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (typeof wert === 'number') {
    items.push({ label: '', value: wert, icon: STANDARD_ICONS.default });
  } else if (typeof wert === 'object' && !Array.isArray(wert)) {
    const count = wert.count || wert.value || wert.wert || 0;
    const icon = wert.icon || getIconForLabel(wert.label) || STANDARD_ICONS.default;
    items.push({ label: wert.label || '', value: count, icon });
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        const count = item.count || item.value || item.wert || 0;
        const icon = item.icon || getIconForLabel(item.label) || STANDARD_ICONS.default;
        items.push({ label: item.label || '', value: count, icon });
      }
    }
  }
  
  return items;
}

function getIconForLabel(label) {
  if (!label) return null;
  const lowerLabel = label.toLowerCase();
  for (const [key, icon] of Object.entries(STANDARD_ICONS)) {
    if (lowerLabel.includes(key)) return icon;
  }
  return null;
}

export default comparePictogram;

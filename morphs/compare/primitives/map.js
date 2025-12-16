/**
 * COMPARE MAP - Map/geo comparison
 * Shows location data
 */

import { debug } from '../../../../observer/debug.js';

export function compareMap(items, config = {}) {
  debug.morphs('compareMap', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-map';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-map-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-map-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'map-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Location info
    const val = item.value ?? item.wert ?? {};
    const location = document.createElement('span');
    location.className = 'map-location';
    
    if (val.lat !== undefined && val.lng !== undefined) {
      location.textContent = `${val.lat.toFixed(2)}°, ${val.lng.toFixed(2)}°`;
    } else if (val.location) {
      location.textContent = val.location;
    } else if (typeof val === 'string') {
      location.textContent = val;
    } else {
      location.textContent = JSON.stringify(val);
    }
    
    row.appendChild(location);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareMap;

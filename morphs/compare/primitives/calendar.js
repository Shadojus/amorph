/**
 * COMPARE CALENDAR - Calendar/date comparison
 * Shows dates side by side
 */

import { debug } from '../../../../observer/debug.js';

export function compareCalendar(items, config = {}) {
  debug.morphs('compareCalendar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-calendar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-calendar-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-calendar-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-text', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'calendar-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Date value
    const val = item.value ?? item.wert;
    let dateStr = '';
    
    if (val instanceof Date) {
      dateStr = val.toLocaleDateString();
    } else if (typeof val === 'string') {
      dateStr = val;
    } else if (typeof val === 'object') {
      dateStr = val.date ?? val.start ?? val.text ?? JSON.stringify(val);
    }
    
    const date = document.createElement('span');
    date.className = 'calendar-date';
    date.textContent = dateStr;
    row.appendChild(date);
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareCalendar;

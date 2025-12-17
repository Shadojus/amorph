/**
 * COMPARE CALENDAR - Calendar/date comparison
 * Uses the exact same HTML structure as the original calendar morph
 */

import { debug } from '../../../../observer/debug.js';

const MONTHS = [
  { name: 'Jan', num: 1 }, { name: 'Feb', num: 2 }, { name: 'Mär', num: 3 },
  { name: 'Apr', num: 4 }, { name: 'Mai', num: 5 }, { name: 'Jun', num: 6 },
  { name: 'Jul', num: 7 }, { name: 'Aug', num: 8 }, { name: 'Sep', num: 9 },
  { name: 'Okt', num: 10 }, { name: 'Nov', num: 11 }, { name: 'Dez', num: 12 }
];

export function compareCalendar(items, config = {}) {
  debug.morphs('compareCalendar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-calendar';
  
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
    
    // Original calendar structure (strip mode)
    const calendarEl = document.createElement('div');
    calendarEl.className = 'amorph-calendar';
    calendarEl.setAttribute('data-mode', 'strip');
    
    const events = normalisiereKalender(rawVal);
    
    const strip = document.createElement('div');
    strip.className = 'amorph-calendar-strip';
    strip.style.display = 'flex';
    strip.style.gap = '1px';
    
    MONTHS.forEach((month, i) => {
      const monthEl = document.createElement('div');
      monthEl.className = 'amorph-calendar-month';
      monthEl.title = month.name;
      
      const isActive = events.monthData[i]?.active;
      monthEl.style.width = '8px';
      monthEl.style.height = '16px';
      monthEl.style.borderRadius = '2px';
      monthEl.style.background = isActive 
        ? 'rgba(100, 180, 255, 0.7)' 
        : 'rgba(100, 150, 200, 0.15)';
      
      if (isActive) monthEl.classList.add('is-active');
      
      strip.appendChild(monthEl);
    });
    
    calendarEl.appendChild(strip);
    
    wrapper.appendChild(calendarEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereKalender(wert) {
  const monthData = Array(12).fill(null).map(() => ({ active: false, events: [] }));
  
  if (typeof wert === 'object' && !Array.isArray(wert)) {
    // {jan: true, feb: false, ...} format
    const monthMap = { jan: 0, feb: 1, mar: 2, mär: 2, apr: 3, mai: 4, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dez: 11, dec: 11 };
    for (const [key, val] of Object.entries(wert)) {
      const monthIdx = monthMap[key.toLowerCase().slice(0, 3)];
      if (monthIdx !== undefined && val) {
        monthData[monthIdx].active = true;
      }
    }
  } else if (Array.isArray(wert)) {
    // Array of events with month info
    for (const item of wert) {
      const month = item.monat || item.month;
      if (month) {
        const monthIdx = parseMonthIndex(month);
        if (monthIdx !== -1) {
          monthData[monthIdx].active = true;
        }
      }
    }
  }
  
  return { monthData, events: [] };
}

function parseMonthIndex(month) {
  if (typeof month === 'number') return month - 1;
  const monthMap = { jan: 0, feb: 1, mar: 2, mär: 2, märz: 2, apr: 3, april: 3, mai: 4, may: 4, jun: 5, juni: 5, jul: 6, juli: 6, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dez: 11, dec: 11 };
  return monthMap[(month + '').toLowerCase().slice(0, 3)] ?? -1;
}

export default compareCalendar;

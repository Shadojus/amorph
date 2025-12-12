/**
 * COMPARE TIMELINE - Timeline comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareTimeline(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-timeline';
  
  // Collect all events and sort by date
  const allEvents = [];
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const events = Array.isArray(val) ? val : [val];
    events.forEach(evt => {
      // Distinguish string vs object
      const isString = typeof evt === 'string';
      allEvents.push({
        name: item.name || '',
        color: item.color || item.farbe,
        textColor: item.textColor || item.textFarbe,
        bgColor: item.bgColor || item.bgFarbe,
        colorClass: item.colorClass || item.farbKlasse,
        date: isString ? evt : (evt?.datum || evt?.date || ''),
        label: isString ? '' : (evt?.label || evt?.name || '')
      });
    });
  });
  
  allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const timeline = document.createElement('div');
  timeline.className = 'timeline-track';
  
  allEvents.forEach(evt => {
    const point = document.createElement('div');
    point.className = `timeline-point ${evt.colorClass || evt.farbKlasse || ''}`;
    
    // NO inline styles! CSS handles colors via pilz-farbe-X class
    point.innerHTML = `
      <div class="timeline-marker"></div>
      <div class="timeline-label">
        <span class="timeline-date">${evt.date || '–'}</span>
        ${evt.label ? `<span class="timeline-text">${evt.label}</span>` : ''}
        <span class="timeline-name">${evt.name || ''}</span>
      </div>
    `;
    timeline.appendChild(point);
  });
  
  el.appendChild(timeline);
  return el;
}

export default compareTimeline;

/**
 * COMPARE TIMELINE - Timeline-Vergleich
 */

import { debug } from '../../../observer/debug.js';

export function compareTimeline(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-timeline';
  
  // Alle Events sammeln und nach Datum sortieren
  const allEvents = [];
  items.forEach(item => {
    const events = Array.isArray(item.wert) ? item.wert : [item.wert];
    events.forEach(evt => {
      allEvents.push({
        name: item.name,
        farbe: item.farbe,
        farbKlasse: item.farbKlasse,
        datum: evt.datum || evt.date || evt,
        label: evt.label || evt.name || ''
      });
    });
  });
  
  allEvents.sort((a, b) => new Date(a.datum) - new Date(b.datum));
  
  const timeline = document.createElement('div');
  timeline.className = 'timeline-track';
  
  allEvents.forEach(evt => {
    const punkt = document.createElement('div');
    punkt.className = `timeline-punkt ${evt.farbKlasse || ''}`;
    punkt.innerHTML = `
      <div class="timeline-marker pilz-bg"></div>
      <div class="timeline-label">
        <span class="timeline-datum">${evt.datum}</span>
        <span class="timeline-text">${evt.label}</span>
        <span class="timeline-name pilz-text">${evt.name}</span>
      </div>
    `;
    timeline.appendChild(punkt);
  });
  
  el.appendChild(timeline);
  return el;
}

export default compareTimeline;

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
      // String vs. Object unterscheiden
      const isString = typeof evt === 'string';
      allEvents.push({
        name: item.name || '',
        farbe: item.farbe,
        textFarbe: item.textFarbe,
        bgFarbe: item.bgFarbe,
        farbKlasse: item.farbKlasse,
        datum: isString ? evt : (evt?.datum || evt?.date || ''),
        label: isString ? '' : (evt?.label || evt?.name || '')
      });
    });
  });
  
  allEvents.sort((a, b) => new Date(a.datum) - new Date(b.datum));
  
  const timeline = document.createElement('div');
  timeline.className = 'timeline-track';
  
  allEvents.forEach(evt => {
    const punkt = document.createElement('div');
    punkt.className = `timeline-punkt ${evt.farbKlasse || ''}`;
    
    // Inline-Styles für zuverlässige Darstellung
    const textColor = evt.textFarbe || evt.farbe || 'rgba(255,255,255,0.85)';
    const bgColor = evt.bgFarbe || evt.farbe || 'rgba(100,100,100,0.24)';
    
    punkt.innerHTML = `
      <div class="timeline-marker" style="background-color:${bgColor}"></div>
      <div class="timeline-label">
        <span class="timeline-datum">${evt.datum || '–'}</span>
        ${evt.label ? `<span class="timeline-text">${evt.label}</span>` : ''}
        <span class="timeline-name" style="color:${textColor}">${evt.name || ''}</span>
      </div>
    `;
    timeline.appendChild(punkt);
  });
  
  el.appendChild(timeline);
  return el;
}

export default compareTimeline;

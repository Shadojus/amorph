/**
 * COMPARE TIMELINE - Timeline comparison
 * Uses the exact same HTML structure as the original timeline morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareTimeline(items, config = {}) {
  debug.morphs('compareTimeline', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-timeline';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all timelines
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Create a timeline for each item using original structure
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    const color = item.farbe || item.color || `hsl(${itemIndex * 60}, 70%, 60%)`;
    
    // Use original timeline structure
    const timelineEl = document.createElement('div');
    timelineEl.className = 'amorph-timeline';
    
    // Title with item name - apply inline text color
    const titel = document.createElement('div');
    titel.className = 'amorph-timeline-titel';
    titel.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) titel.style.color = item.textFarbe;
    timelineEl.appendChild(titel);
    
    if (!Array.isArray(val) || val.length === 0) {
      timelineEl.innerHTML += '<span class="amorph-timeline-leer">Keine Ereignisse</span>';
      container.appendChild(timelineEl);
      return;
    }
    
    // Normalize events
    const events = normalisiereWert(val).slice(0, config.maxEvents || 10);
    
    if (events.length === 0) {
      timelineEl.innerHTML += '<span class="amorph-timeline-leer">Keine gültigen Ereignisse</span>';
      container.appendChild(timelineEl);
      return;
    }
    
    // Line
    const line = document.createElement('div');
    line.className = 'amorph-timeline-line';
    line.style.backgroundColor = color;
    timelineEl.appendChild(line);
    
    // Render events
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const eventItem = document.createElement('div');
      eventItem.className = 'amorph-timeline-item';
      
      // Dot
      const dot = document.createElement('div');
      dot.className = 'amorph-timeline-dot';
      dot.style.borderColor = color;
      if (event.active || event.current || event.aktuell) {
        dot.classList.add('amorph-timeline-active');
        dot.style.backgroundColor = color;
      }
      eventItem.appendChild(dot);
      
      // Content
      const content = document.createElement('div');
      content.className = 'amorph-timeline-content';
      
      // Time
      const time = document.createElement('span');
      time.className = 'amorph-timeline-time';
      time.textContent = event.time;
      content.appendChild(time);
      
      // Description
      if (event.label) {
        const label = document.createElement('span');
        label.className = 'amorph-timeline-label';
        label.textContent = event.label;
        content.appendChild(label);
      }
      
      eventItem.appendChild(content);
      timelineEl.appendChild(eventItem);
    }
    
    container.appendChild(timelineEl);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  return wert.map(item => {
    if (typeof item === 'string') {
      return { time: item, label: '' };
    }
    
    if (typeof item === 'object') {
      // Extract time/date
      const time = item.date || item.time || item.datum || item.zeit || 
                  item.monat || item.month || item.jahr || item.year ||
                  item.periode || item.period || '';
      
      // Extract label/event
      const label = item.event || item.label || item.ereignis || 
                   item.description || item.beschreibung || item.title || '';
      
      const active = item.active || item.current || item.aktuell || false;
      
      return { time, label, active };
    }
    
    return null;
  }).filter(Boolean);
}

export default compareTimeline;

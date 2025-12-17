/**
 * COMPARE TIMELINE - UNIFIED Timeline comparison
 * All timelines shown with item-specific colors
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
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const val = item.value ?? item.wert;
    const events = Array.isArray(val) ? normalisiereWert(val) : [];
    return {
      ...item,
      events,
      index: idx,
      // Neon pilz colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  }).filter(item => item.events.length > 0);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Timeline-Daten</div>';
    return el;
  }
  
  // UNIFIED timeline container
  const timelineContainer = document.createElement('div');
  timelineContainer.className = 'amorph-timeline amorph-timeline-compare';
  
  // Create timeline for each item with its color
  parsedItems.forEach(item => {
    const itemTimeline = document.createElement('div');
    itemTimeline.className = 'amorph-timeline-item-block';
    
    // Title with item name
    const titel = document.createElement('div');
    titel.className = 'amorph-timeline-titel';
    titel.textContent = item.name || item.id;
    titel.style.color = item.textFarbe || item.color;
    itemTimeline.appendChild(titel);
    
    // Line with neon color
    const line = document.createElement('div');
    line.className = 'amorph-timeline-line';
    line.style.backgroundColor = item.color;
    line.style.boxShadow = `0 0 8px ${item.glowColor || item.color}`;
    itemTimeline.appendChild(line);
    
    // Events
    const eventsToShow = item.events.slice(0, config.maxEvents || 6);
    
    eventsToShow.forEach((event, i) => {
      const eventItem = document.createElement('div');
      eventItem.className = 'amorph-timeline-item';
      
      // Dot with neon color
      const dot = document.createElement('div');
      dot.className = 'amorph-timeline-dot';
      dot.style.borderColor = item.color;
      dot.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
      if (event.active || event.current || event.aktuell) {
        dot.classList.add('amorph-timeline-active');
        dot.style.backgroundColor = item.color;
      }
      eventItem.appendChild(dot);
      
      // Content
      const content = document.createElement('div');
      content.className = 'amorph-timeline-content';
      
      const time = document.createElement('span');
      time.className = 'amorph-timeline-time';
      time.textContent = event.time;
      time.style.color = item.color;
      content.appendChild(time);
      
      if (event.label) {
        const label = document.createElement('span');
        label.className = 'amorph-timeline-label';
        label.textContent = event.label;
        content.appendChild(label);
      }
      
      eventItem.appendChild(content);
      itemTimeline.appendChild(eventItem);
    });
    
    timelineContainer.appendChild(itemTimeline);
  });
  
  el.appendChild(timelineContainer);
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

/**
 * 📅 TIMELINE MORPH - Zeitliche Abfolge
 * 
 * Zeigt chronologische Daten als vertikale Timeline
 * DATENGETRIEBEN - Erkennt Arrays mit Datum/Zeit-Feldern
 * 
 * Input: [{date: "2024-01", event: "Start"}, {date: "2024-06", event: "Ende"}]
 *    oder: [{monat: "Januar", ereignis: "Aussaat"}, ...]
 * Output: Vertikale Timeline mit Punkten und Labels
 */

import { debug } from '../../observer/debug.js';

export function timeline(wert, config = {}) {
  debug.morphs('timeline', { typ: typeof wert, anzahl: Array.isArray(wert) ? wert.length : 0 });
  
  const el = document.createElement('div');
  el.className = 'amorph-timeline';
  
  if (!Array.isArray(wert) || wert.length === 0) {
    el.innerHTML = '<span class="amorph-timeline-leer">Keine Ereignisse</span>';
    return el;
  }
  
  // Daten normalisieren
  const events = normalisiereWert(wert).slice(0, config.maxEvents || 10);
  
  if (events.length === 0) {
    el.innerHTML = '<span class="amorph-timeline-leer">Keine gültigen Ereignisse</span>';
    return el;
  }
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-timeline-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Linie
  const line = document.createElement('div');
  line.className = 'amorph-timeline-line';
  el.appendChild(line);
  
  // Events rendern
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const item = document.createElement('div');
    item.className = 'amorph-timeline-item';
    
    // Punkt
    const dot = document.createElement('div');
    dot.className = 'amorph-timeline-dot';
    if (event.active || event.current || event.aktuell) {
      dot.classList.add('amorph-timeline-active');
    }
    item.appendChild(dot);
    
    // Content
    const content = document.createElement('div');
    content.className = 'amorph-timeline-content';
    
    // Datum/Zeit
    const time = document.createElement('span');
    time.className = 'amorph-timeline-time';
    time.textContent = event.time;
    content.appendChild(time);
    
    // Beschreibung
    if (event.label) {
      const label = document.createElement('span');
      label.className = 'amorph-timeline-label';
      label.textContent = event.label;
      content.appendChild(label);
    }
    
    item.appendChild(content);
    el.appendChild(item);
  }
  
  return el;
}

function normalisiereWert(wert) {
  return wert.map(item => {
    if (typeof item === 'string') {
      return { time: item, label: '' };
    }
    
    if (typeof item === 'object') {
      // Zeit/Datum extrahieren
      const time = item.date || item.time || item.datum || item.zeit || 
                  item.monat || item.month || item.jahr || item.year ||
                  item.periode || item.period || '';
      
      // Label/Ereignis extrahieren
      const label = item.event || item.label || item.ereignis || 
                   item.description || item.beschreibung || item.title || '';
      
      // Status
      const active = item.active || item.current || item.aktuell || false;
      
      if (time || label) {
        return { time: String(time), label: String(label), active };
      }
    }
    
    return null;
  }).filter(Boolean);
}

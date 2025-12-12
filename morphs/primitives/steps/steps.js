/**
 * 📋 STEPS MORPH - Schrittfolge/Prozess
 * 
 * Zeigt nummerierte Schritte als visuelle Sequenz
 * DATENGETRIEBEN - Erkennt Arrays mit Schritt-Strukturen
 * 
 * Input: [{schritt: 1, aktion: "..."}, ...]
 *    oder ["Schritt 1", "Schritt 2", ...]
 *    oder [{title: "...", description: "..."}]
 * Output: Nummerierte Schrittfolge mit Verbindungslinien
 */

import { debug } from '../../../observer/debug.js';

export function steps(wert, config = {}) {
  debug.morphs('steps', { typ: typeof wert, anzahl: Array.isArray(wert) ? wert.length : 0 });
  
  const el = document.createElement('div');
  el.className = 'amorph-steps';
  
  if (!Array.isArray(wert) || wert.length === 0) {
    el.innerHTML = '<span class="amorph-steps-leer">Keine Schritte</span>';
    return el;
  }
  
  // Daten normalisieren
  const stepsData = normalisiereSchritte(wert);
  const maxSteps = config.maxSteps || 10;
  const displaySteps = stepsData.slice(0, maxSteps);
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-steps-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Layout-Modus
  const mode = config.mode || (displaySteps.length <= 5 ? 'horizontal' : 'vertical');
  el.setAttribute('data-mode', mode);
  
  // Schritte-Container
  const container = document.createElement('div');
  container.className = 'amorph-steps-container';
  
  for (let i = 0; i < displaySteps.length; i++) {
    const step = displaySteps[i];
    const isLast = i === displaySteps.length - 1;
    const isActive = step.active || step.aktuell || step.current || false;
    const isCompleted = step.completed || step.abgeschlossen || i < (config.currentStep || 0);
    
    const item = document.createElement('div');
    item.className = 'amorph-steps-item';
    if (isActive) item.classList.add('amorph-steps-active');
    if (isCompleted) item.classList.add('amorph-steps-completed');
    
    // Nummer-Badge
    const badge = document.createElement('div');
    badge.className = 'amorph-steps-badge';
    badge.textContent = isCompleted ? '✓' : (step.nummer || i + 1);
    item.appendChild(badge);
    
    // Content
    const content = document.createElement('div');
    content.className = 'amorph-steps-content';
    
    // Titel
    const title = document.createElement('div');
    title.className = 'amorph-steps-title';
    title.textContent = step.title;
    content.appendChild(title);
    
    // Beschreibung (optional)
    if (step.description) {
      const desc = document.createElement('div');
      desc.className = 'amorph-steps-description';
      desc.textContent = step.description;
      content.appendChild(desc);
    }
    
    item.appendChild(content);
    
    // Verbindungslinie (nicht beim letzten)
    if (!isLast) {
      const connector = document.createElement('div');
      connector.className = 'amorph-steps-connector';
      if (isCompleted) connector.classList.add('amorph-steps-connector-completed');
      item.appendChild(connector);
    }
    
    container.appendChild(item);
  }
  
  el.appendChild(container);
  
  // Info falls gekürzt
  if (stepsData.length > maxSteps) {
    const more = document.createElement('div');
    more.className = 'amorph-steps-more';
    more.textContent = `+${stepsData.length - maxSteps} weitere Schritte`;
    el.appendChild(more);
  }
  
  return el;
}

function normalisiereSchritte(wert) {
  return wert.map((item, i) => {
    if (typeof item === 'string') {
      return {
        nummer: i + 1,
        title: item,
        description: ''
      };
    }
    
    if (typeof item === 'object') {
      return {
        nummer: item.schritt || item.step || item.nummer || item.number || i + 1,
        title: item.aktion || item.action || item.title || item.titel || 
               item.name || item.label || `Schritt ${i + 1}`,
        description: item.beschreibung || item.description || item.details || '',
        active: item.active || item.aktuell || item.current || false,
        completed: item.completed || item.abgeschlossen || item.done || false
      };
    }
    
    return {
      nummer: i + 1,
      title: String(item),
      description: ''
    };
  });
}

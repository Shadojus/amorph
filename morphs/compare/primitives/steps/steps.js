/**
 * COMPARE STEPS - Steps/process comparison
 * Uses the exact same HTML structure as the original steps morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareSteps(items, config = {}) {
  debug.morphs('compareSteps', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-steps';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all steps
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original steps structure
    const stepsEl = document.createElement('div');
    stepsEl.className = 'amorph-steps';
    
    // Normalize data to steps array
    let stepsData = [];
    if (Array.isArray(rawVal)) {
      stepsData = rawVal;
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      stepsData = rawVal.steps || rawVal.schritte || rawVal.phasen || [rawVal];
    }
    
    if (stepsData.length === 0) {
      stepsEl.innerHTML = '<span class="amorph-steps-leer">Keine Schritte</span>';
    } else {
      stepsEl.setAttribute('data-mode', stepsData.length <= 5 ? 'horizontal' : 'vertical');
      
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'amorph-steps-container';
      
      const normalizedSteps = normalisiereSchritte(stepsData);
      
      for (let i = 0; i < normalizedSteps.length; i++) {
        const step = normalizedSteps[i];
        const isLast = i === normalizedSteps.length - 1;
        
        const stepItem = document.createElement('div');
        stepItem.className = 'amorph-steps-item';
        if (step.active) stepItem.classList.add('amorph-steps-active');
        if (step.completed) stepItem.classList.add('amorph-steps-completed');
        
        // Badge with number
        const badge = document.createElement('div');
        badge.className = 'amorph-steps-badge';
        badge.textContent = step.completed ? '✓' : (step.nummer || i + 1);
        stepItem.appendChild(badge);
        
        // Content
        const content = document.createElement('div');
        content.className = 'amorph-steps-content';
        
        const title = document.createElement('div');
        title.className = 'amorph-steps-title';
        title.textContent = step.title;
        content.appendChild(title);
        
        if (step.description) {
          const desc = document.createElement('div');
          desc.className = 'amorph-steps-description';
          desc.textContent = step.description;
          content.appendChild(desc);
        }
        
        stepItem.appendChild(content);
        
        // Connector (not for last)
        if (!isLast) {
          const connector = document.createElement('div');
          connector.className = 'amorph-steps-connector';
          if (step.completed) connector.classList.add('amorph-steps-connector-completed');
          stepItem.appendChild(connector);
        }
        
        stepsContainer.appendChild(stepItem);
      }
      
      stepsEl.appendChild(stepsContainer);
    }
    
    wrapper.appendChild(stepsEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereSchritte(wert) {
  return wert.map((item, i) => {
    if (typeof item === 'string') {
      return { nummer: i + 1, title: item, description: '' };
    }
    if (typeof item === 'object') {
      return {
        nummer: item.schritt || item.step || item.nummer || i + 1,
        title: item.aktion || item.action || item.title || item.titel || item.name || item.label || `Schritt ${i + 1}`,
        description: item.beschreibung || item.description || item.details || '',
        active: item.active || item.aktuell || item.current || false,
        completed: item.completed || item.abgeschlossen || item.done || false
      };
    }
    return { nummer: i + 1, title: String(item), description: '' };
  });
}

export default compareSteps;

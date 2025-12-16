/**
 * COMPARE STEPS - Steps/process comparison
 * Shows step sequences
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
  
  const container = document.createElement('div');
  container.className = 'compare-steps-container';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-steps-row';
    
    if (item.color) {
      row.style.setProperty('--pilz-fill', item.color);
    }
    
    // Name
    const name = document.createElement('span');
    name.className = 'steps-name';
    name.textContent = item.name || item.id || '';
    row.appendChild(name);
    
    // Steps
    const val = item.value ?? item.wert ?? [];
    const steps = Array.isArray(val) ? val : (val.steps ?? [val]);
    
    const stepsWrap = document.createElement('div');
    stepsWrap.className = 'steps-wrap';
    
    steps.forEach((step, i) => {
      if (i > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'steps-arrow';
        arrow.textContent = '→';
        stepsWrap.appendChild(arrow);
      }
      
      const stepEl = document.createElement('span');
      stepEl.className = 'steps-step';
      stepEl.textContent = typeof step === 'object' ? (step.label ?? step.name ?? step.text ?? JSON.stringify(step)) : String(step);
      stepsWrap.appendChild(stepEl);
    });
    
    row.appendChild(stepsWrap);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

export default compareSteps;

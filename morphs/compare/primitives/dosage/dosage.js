/**
 * COMPARE DOSAGE - Dosage comparison
 * Uses the exact same HTML structure as the original dosage morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareDosage(items, config = {}) {
  debug.morphs('compareDosage', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-dosage';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all dosage cards
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
    
    // Use original dosage structure
    const dosageEl = document.createElement('div');
    dosageEl.className = 'amorph-dosage';
    
    // Extract dosage data
    const dose = normalisiereDosierung(rawVal);
    
    if (!dose) {
      dosageEl.innerHTML = '<span class="amorph-dosage-leer">Keine Dosierungsangaben</span>';
    } else {
      const card = document.createElement('div');
      card.className = 'amorph-dosage-card';
      card.setAttribute('data-severity', dose.severity || 'normal');
      
      // Header
      const header = document.createElement('div');
      header.className = 'amorph-dosage-header';
      
      const icon = document.createElement('span');
      icon.className = 'amorph-dosage-icon';
      icon.textContent = '💊';
      header.appendChild(icon);
      
      card.appendChild(header);
      
      // Dosage display
      const dosageDisplay = document.createElement('div');
      dosageDisplay.className = 'amorph-dosage-display';
      
      if (dose.min !== undefined && dose.max !== undefined) {
        dosageDisplay.innerHTML = `
          <span class="amorph-dosage-value">${dose.min}–${dose.max}</span>
          <span class="amorph-dosage-unit">${dose.unit}</span>
        `;
      } else {
        dosageDisplay.innerHTML = `
          <span class="amorph-dosage-value">${dose.value || 0}</span>
          <span class="amorph-dosage-unit">${dose.unit}</span>
        `;
      }
      
      card.appendChild(dosageDisplay);
      
      // Frequency
      if (dose.frequency) {
        const freq = document.createElement('div');
        freq.className = 'amorph-dosage-frequency';
        freq.textContent = dose.frequency;
        card.appendChild(freq);
      }
      
      // Warning
      if (dose.warning) {
        const warning = document.createElement('div');
        warning.className = 'amorph-dosage-warning';
        warning.innerHTML = `<span class="amorph-dosage-warning-icon">⚠️</span> ${dose.warning}`;
        card.appendChild(warning);
      }
      
      dosageEl.appendChild(card);
    }
    
    wrapper.appendChild(dosageEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereDosierung(wert) {
  if (!wert || typeof wert !== 'object') return null;
  
  const unit = wert.einheit || wert.unit || 'mg';
  
  if ('min' in wert && 'max' in wert) {
    return {
      min: wert.min,
      max: wert.max,
      unit,
      frequency: wert.frequenz || wert.frequency || '',
      warning: wert.warnung || wert.warning || '',
      severity: wert.severity || 'normal'
    };
  }
  
  if ('dosis' in wert || 'dose' in wert || 'value' in wert || 'wert' in wert) {
    return {
      value: wert.dosis || wert.dose || wert.value || wert.wert || 0,
      unit,
      frequency: wert.frequenz || wert.frequency || '',
      warning: wert.warnung || wert.warning || '',
      severity: wert.severity || 'normal'
    };
  }
  
  return null;
}

export default compareDosage;

/**
 * 💊 DOSAGE MORPH - Medizinische Dosierung
 * 
 * Zeigt Dosierungsangaben mit Warnhinweisen
 * DATENGETRIEBEN - Erkennt Dosierungs-Strukturen
 * 
 * Input: {min: 120, max: 240} oder {dosis: 500, einheit: "mg", frequenz: "3x täglich"}
 * Output: Dosierungsanzeige mit Warnhinweisen
 */

import { debug } from '../../../observer/debug.js';

export function dosage(wert, config = {}) {
  debug.morphs('dosage', { typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-dosage';
  
  // Dosierungsdaten normalisieren
  const dosages = normalisiereDosierung(wert);
  
  if (dosages.length === 0) {
    el.innerHTML = '<span class="amorph-dosage-leer">Keine Dosierungsangaben</span>';
    return el;
  }
  
  for (const dose of dosages) {
    const card = document.createElement('div');
    card.className = 'amorph-dosage-card';
    card.setAttribute('data-severity', dose.severity || 'normal');
    
    // Header mit Icon
    const header = document.createElement('div');
    header.className = 'amorph-dosage-header';
    
    const icon = document.createElement('span');
    icon.className = 'amorph-dosage-icon';
    icon.textContent = getDosageIcon(dose);
    header.appendChild(icon);
    
    if (dose.label) {
      const label = document.createElement('span');
      label.className = 'amorph-dosage-label';
      label.textContent = dose.label;
      header.appendChild(label);
    }
    
    card.appendChild(header);
    
    // Dosierung
    const dosageDisplay = document.createElement('div');
    dosageDisplay.className = 'amorph-dosage-display';
    
    if (dose.min !== undefined && dose.max !== undefined) {
      dosageDisplay.innerHTML = `
        <span class="amorph-dosage-value">${dose.min}–${dose.max}</span>
        <span class="amorph-dosage-unit">${dose.unit}</span>
      `;
    } else if (dose.value !== undefined) {
      dosageDisplay.innerHTML = `
        <span class="amorph-dosage-value">${dose.value}</span>
        <span class="amorph-dosage-unit">${dose.unit}</span>
      `;
    }
    
    card.appendChild(dosageDisplay);
    
    // Frequenz
    if (dose.frequency) {
      const freq = document.createElement('div');
      freq.className = 'amorph-dosage-frequency';
      freq.textContent = dose.frequency;
      card.appendChild(freq);
    }
    
    // Anwendung
    if (dose.route) {
      const route = document.createElement('div');
      route.className = 'amorph-dosage-route';
      route.textContent = dose.route;
      card.appendChild(route);
    }
    
    // Warnhinweis
    if (dose.warning) {
      const warning = document.createElement('div');
      warning.className = 'amorph-dosage-warning';
      warning.innerHTML = `<span class="amorph-dosage-warning-icon">⚠️</span> ${dose.warning}`;
      card.appendChild(warning);
    }
    
    // Max-Dosis Hinweis
    if (dose.maxDaily) {
      const maxDaily = document.createElement('div');
      maxDaily.className = 'amorph-dosage-max';
      maxDaily.innerHTML = `<span class="amorph-dosage-max-icon">🛑</span> Max: ${dose.maxDaily}${dose.unit}/Tag`;
      card.appendChild(maxDaily);
    }
    
    el.appendChild(card);
  }
  
  return el;
}

function normalisiereDosierung(wert) {
  const dosages = [];
  
  if (typeof wert === 'object' && !Array.isArray(wert)) {
    // Range-Format
    if ('min' in wert && 'max' in wert) {
      const unit = detectUnit(wert);
      dosages.push({
        min: wert.min,
        max: wert.max,
        unit: unit,
        label: wert.label || wert.name || extractLabelFromKey(wert),
        frequency: wert.frequenz || wert.frequency || '',
        route: wert.anwendung || wert.route || wert.verabreichung || '',
        warning: wert.warnung || wert.warning || '',
        maxDaily: wert.max_tag || wert.maxDaily || wert.tagesdosis_max || null,
        severity: detectSeverity(wert)
      });
    }
    // Einzelwert
    else if ('dosis' in wert || 'dose' in wert || 'value' in wert || 'wert' in wert) {
      const unit = detectUnit(wert);
      dosages.push({
        value: wert.dosis || wert.dose || wert.value || wert.wert || 0,
        unit: unit,
        label: wert.label || wert.name || '',
        frequency: wert.frequenz || wert.frequency || '',
        route: wert.anwendung || wert.route || wert.verabreichung || '',
        warning: wert.warnung || wert.warning || '',
        maxDaily: wert.max_tag || wert.maxDaily || null,
        severity: detectSeverity(wert)
      });
    }
    // Verschachtelte Dosierungen
    else {
      for (const [key, value] of Object.entries(wert)) {
        if (typeof value === 'object') {
          const nested = normalisiereDosierung(value);
          for (const n of nested) {
            if (!n.label) n.label = formatKey(key);
            dosages.push(n);
          }
        }
      }
    }
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      dosages.push(...normalisiereDosierung(item));
    }
  } else if (typeof wert === 'number') {
    dosages.push({
      value: wert,
      unit: 'mg',
      label: '',
      frequency: '',
      route: '',
      warning: '',
      severity: 'normal'
    });
  }
  
  return dosages;
}

function detectUnit(obj) {
  // Aus Feldnamen extrahieren
  for (const key of Object.keys(obj)) {
    const lower = String(key || '').toLowerCase();
    if (lower.includes('_mg') || lower.endsWith('mg')) return 'mg';
    if (lower.includes('_g') || lower.endsWith('g')) return 'g';
    if (lower.includes('_ml') || lower.endsWith('ml')) return 'ml';
    if (lower.includes('_l') || lower.endsWith('l')) return 'l';
    if (lower.includes('_iu') || lower.endsWith('iu')) return 'IU';
    if (lower.includes('_mcg') || lower.endsWith('mcg')) return 'µg';
  }
  
  // Explizite Einheit
  return obj.einheit || obj.unit || 'mg';
}

function extractLabelFromKey(obj) {
  for (const key of Object.keys(obj)) {
    if (key.includes('dosis') || key.includes('dose')) {
      return formatKey(key.replace(/_(mg|g|ml|l|tag|day)/gi, ''));
    }
  }
  return '';
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

function detectSeverity(obj) {
  const warning = String(obj.warnung || obj.warning || '').toLowerCase();
  if (warning.includes('gefährlich') || warning.includes('tödlich') || warning.includes('lethal')) {
    return 'danger';
  }
  if (warning.includes('vorsicht') || warning.includes('caution')) {
    return 'warning';
  }
  return 'normal';
}

function getDosageIcon(dose) {
  if (dose.route) {
    const route = String(dose.route).toLowerCase();
    if (route.includes('oral') || route.includes('schluck')) return '💊';
    if (route.includes('inhalat')) return '🌬️';
    if (route.includes('topisch') || route.includes('haut')) return '🧴';
    if (route.includes('inject') || route.includes('spritz')) return '💉';
    if (route.includes('infusion')) return '💧';
  }
  return '💊';
}

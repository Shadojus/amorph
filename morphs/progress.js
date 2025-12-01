/**
 * 📈 PROGRESS MORPH - Fortschrittsbalken
 * 
 * Zeigt Einzelwerte als Fortschrittsbalken
 * DATENGETRIEBEN - Erkennt Zahlen mit implizitem/explizitem Maximum
 * 
 * Input: 75 oder {value: 75, max: 100} oder {current: 30, total: 50}
 * Output: Horizontaler Balken mit Prozent
 */

import { debug } from '../observer/debug.js';

export function progress(wert, config = {}) {
  debug.morphs('progress', { wert, typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-progress';
  
  // Werte extrahieren
  let value, maxValue, label;
  
  if (typeof wert === 'number') {
    value = wert;
    maxValue = detectMax(wert, config);
    label = config.label || '';
  } else if (typeof wert === 'object') {
    value = wert.value || wert.current || wert.progress || wert.wert || 0;
    maxValue = wert.max || wert.total || wert.von || detectMax(value, config);
    label = wert.label || wert.name || config.label || '';
  } else {
    value = 0;
    maxValue = 100;
    label = '';
  }
  
  const percent = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
  const einheit = config.einheit || wert?.unit || wert?.einheit || '';
  
  // Header mit Label und Wert
  const header = document.createElement('div');
  header.className = 'amorph-progress-header';
  
  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'amorph-progress-label';
    labelEl.textContent = label;
    header.appendChild(labelEl);
  }
  
  const valueEl = document.createElement('span');
  valueEl.className = 'amorph-progress-value';
  valueEl.textContent = `${formatValue(value, einheit)} / ${formatValue(maxValue, einheit)}`;
  header.appendChild(valueEl);
  
  if (label || config.showHeader !== false) {
    el.appendChild(header);
  }
  
  // Track
  const track = document.createElement('div');
  track.className = 'amorph-progress-track';
  
  // Fill
  const fill = document.createElement('div');
  fill.className = 'amorph-progress-fill';
  fill.style.width = `${percent}%`;
  
  // Farbe basierend auf Prozent
  if (percent >= 80) {
    fill.classList.add('amorph-progress-high');
  } else if (percent >= 50) {
    fill.classList.add('amorph-progress-medium');
  } else {
    fill.classList.add('amorph-progress-low');
  }
  
  track.appendChild(fill);
  
  // Prozent-Anzeige im Balken
  const percentEl = document.createElement('span');
  percentEl.className = 'amorph-progress-percent';
  percentEl.textContent = `${percent.toFixed(0)}%`;
  track.appendChild(percentEl);
  
  el.appendChild(track);
  
  return el;
}

function detectMax(value, config) {
  if (config.max) return config.max;
  if (value <= 1) return 1;
  if (value <= 10) return 10;
  if (value <= 100) return 100;
  // Nächste Zehnerpotenz
  return Math.pow(10, Math.ceil(Math.log10(value)));
}

function formatValue(value, unit) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K${unit}`;
  if (value >= 1) return `${value.toFixed(0)}${unit}`;
  return `${value.toFixed(2)}${unit}`;
}

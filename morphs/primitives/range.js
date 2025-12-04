import { debug } from '../../observer/debug.js';

export function range(wert, config = {}) {
  debug.morphs('range', { min: wert.min, max: wert.max, einheit: config.einheit });
  const el = document.createElement('span');
  el.className = 'amorph-range';
  
  const min = wert.min ?? 0;
  const max = wert.max ?? 100;
  const einheit = config.einheit || wert.einheit || '';
  
  const text = document.createElement('span');
  text.className = 'amorph-range-text';
  text.textContent = `${min}${einheit} – ${max}${einheit}`;
  el.appendChild(text);
  
  if (config.visualisierung) {
    const bar = document.createElement('span');
    bar.className = 'amorph-range-bar';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', text.textContent);
    
    const skalaMin = config.skala?.min ?? 0;
    const skalaMax = config.skala?.max ?? 100;
    const startPercent = ((min - skalaMin) / (skalaMax - skalaMin)) * 100;
    const endPercent = ((max - skalaMin) / (skalaMax - skalaMin)) * 100;
    
    bar.style.setProperty('--range-start', `${startPercent}%`);
    bar.style.setProperty('--range-end', `${endPercent}%`);
    
    el.appendChild(bar);
  }
  
  return el;
}

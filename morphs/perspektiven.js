/**
 * Perspektiven Morph
 * Transformiert Perspektiven-Config zu Button-Leiste
 */

import { debug } from '../observer/debug.js';

export function perspektiven(config, morphConfig = {}) {
  debug.perspektiven('Morph erstellt', config);
  
  const liste = config.liste || [];
  
  const nav = document.createElement('nav');
  nav.className = 'amorph-perspektiven';
  nav.setAttribute('role', 'toolbar');
  
  for (const p of liste) {
    const btn = document.createElement('button');
    btn.className = 'amorph-perspektive-btn';
    btn.dataset.perspektive = p.id;
    btn.dataset.felder = JSON.stringify(p.felder || []);
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = `${p.symbol || ''} ${p.name}`.trim();
    
    if (p.farbe) {
      btn.style.setProperty('--p-farbe', p.farbe);
    }
    
    nav.appendChild(btn);
  }
  
  nav.dataset.maxAktiv = config.maxAktiv || 4;
  
  return nav;
}

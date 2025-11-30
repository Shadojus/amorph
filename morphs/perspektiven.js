/**
 * Perspektiven Morph
 * Transformiert Perspektiven-Config zu Button-Leiste
 * Liest Perspektiven aus Schema (config/schema.yaml) als Single Source of Truth
 */

import { debug } from '../observer/debug.js';
import { getPerspektivenListe } from '../util/semantic.js';

export function perspektiven(config, morphConfig = {}) {
  debug.perspektiven('Morph erstellt', config);
  
  // Perspektiven aus Schema laden (Single Source of Truth)
  // Falls in Config überschrieben, diese nutzen
  const schemaListe = getPerspektivenListe();
  const liste = config.liste?.length > 0 ? config.liste : schemaListe;
  
  debug.perspektiven('Liste Quelle', { 
    ausSchema: schemaListe.length, 
    verwendet: liste.length,
    quelle: config.liste?.length > 0 ? 'config' : 'schema'
  });
  
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

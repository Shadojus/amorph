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
    quelle: config.liste?.length > 0 ? 'config' : 'schema',
    erstePerspektive: liste[0] // Debug: Was ist in der Liste?
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
    
    // Farben-Grid unterstützen (Array mit 4 Farben)
    // Fallback auf einzelne farbe für Kompatibilität
    const farben = p.farben || (p.farbe ? [p.farbe] : ['#3b82f6']);
    debug.perspektiven('Button Farben', { id: p.id, farben, hatFarben: !!p.farben, hatFarbe: !!p.farbe });
    
    btn.style.setProperty('--p-farbe', farben[0]); // Hauptfarbe
    if (farben[1]) btn.style.setProperty('--p-farbe-1', farben[1]);
    if (farben[2]) btn.style.setProperty('--p-farbe-2', farben[2]);
    if (farben[3]) btn.style.setProperty('--p-farbe-3', farben[3]);
    
    nav.appendChild(btn);
  }
  
  nav.dataset.maxAktiv = config.maxAktiv || 4;
  
  return nav;
}

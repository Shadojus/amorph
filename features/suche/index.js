/**
 * Suche Feature (Standalone)
 * DEPRECATED: Nutze stattdessen das Header-Feature
 * 
 * Wird nur geladen wenn 'suche' in features.aktiv steht (ohne header)
 */
import { debug } from '../../observer/debug.js';
import { suche as sucheMorph } from '../../morphs/suche.js';

export default function init(ctx) {
  debug.suche('Standalone Feature Init (deprecated)', ctx.config);
  debug.warn('Suche Feature ist deprecated - nutze Header Feature');
  
  const container = document.createElement('amorph-container');
  container.setAttribute('data-morph', 'suche');
  container.setAttribute('data-field', 'suche');
  
  const form = sucheMorph(ctx.config);
  container.appendChild(form);
  
  ctx.dom.appendChild(container);
  ctx.mount('afterbegin');
}

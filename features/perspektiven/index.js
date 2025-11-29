/**
 * Perspektiven Feature (Standalone)
 * DEPRECATED: Nutze stattdessen das Header-Feature
 * 
 * Wird nur geladen wenn 'perspektiven' in features.aktiv steht (ohne header)
 */
import { debug } from '../../observer/debug.js';
import { perspektiven as perspektivenMorph } from '../../morphs/perspektiven.js';

export default function init(ctx) {
  debug.perspektiven('Standalone Feature Init (deprecated)', ctx.config);
  debug.warn('Perspektiven Feature ist deprecated - nutze Header Feature');
  
  const container = document.createElement('amorph-container');
  container.setAttribute('data-morph', 'perspektiven');
  container.setAttribute('data-field', 'perspektiven');
  
  const nav = perspektivenMorph(ctx.config);
  container.appendChild(nav);
  
  ctx.dom.appendChild(container);
  ctx.mount('afterbegin');
}

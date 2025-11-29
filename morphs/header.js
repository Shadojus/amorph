/**
 * Header Morph
 * Container für Suche + Perspektiven (wie Grid-Container)
 */

import { debug } from '../observer/debug.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';

export function header(config, morphConfig = {}) {
  debug.features('Header Morph erstellt', config);
  
  const container = document.createElement('div');
  container.className = 'amorph-header';
  
  // Suche-Morph einfügen
  if (config.suche) {
    const sucheContainer = document.createElement('amorph-container');
    sucheContainer.setAttribute('data-morph', 'suche');
    sucheContainer.setAttribute('data-field', 'suche');
    sucheContainer.appendChild(suche(config.suche));
    container.appendChild(sucheContainer);
  }
  
  // Perspektiven-Morph einfügen
  if (config.perspektiven) {
    const perspektivenContainer = document.createElement('amorph-container');
    perspektivenContainer.setAttribute('data-morph', 'perspektiven');
    perspektivenContainer.setAttribute('data-field', 'perspektiven');
    perspektivenContainer.appendChild(perspektiven(config.perspektiven));
    container.appendChild(perspektivenContainer);
  }
  
  return container;
}

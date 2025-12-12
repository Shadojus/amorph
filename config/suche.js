/**
 * Suche Morph
 * Transformiert Suche-Config zu Suchleisten-Element
 */

import { debug } from '../observer/debug.js';

export function suche(config, morphConfig = {}) {
  debug.search('Morph created', config);
  
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  
  const input = document.createElement('input');
  input.type = 'text';  // Kein 'search' - damit kein X-Button erscheint
  input.placeholder = config.placeholder || 'Suchen...';
  input.setAttribute('aria-label', 'Suche');
  input.setAttribute('autocomplete', 'off');
  
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Suchen');
  
  form.appendChild(input);
  form.appendChild(button);
  
  // Events werden vom Feature-System gesteuert
  form.dataset.live = config.live ? 'true' : 'false';
  form.dataset.debounce = config.debounce || 300;
  form.dataset.limit = config.limit || 50;
  form.dataset.erlaubeLeer = config.erlaubeLeer ? 'true' : 'false';
  
  return form;
}

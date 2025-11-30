/**
 * Header Morph
 * Container für Suche + Perspektiven + Ansicht-Switch
 * Sticky am oberen Rand
 */

import { debug } from '../observer/debug.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';

export function header(config, morphConfig = {}) {
  debug.features('Header Morph erstellt', config);
  
  const container = document.createElement('div');
  container.className = 'amorph-header';
  
  // Wrapper für max-width
  const wrapper = document.createElement('div');
  wrapper.className = 'amorph-header-wrapper';
  wrapper.style.cssText = 'max-width: 1200px; margin: 0 auto;';
  
  // Erste Zeile: Logo/Titel + Suche + Ansicht-Switch
  const zeile1 = document.createElement('div');
  zeile1.className = 'amorph-header-row';
  zeile1.style.cssText = 'display: flex; gap: var(--space-md); align-items: center; margin-bottom: var(--space-sm);';
  
  // App-Titel/Logo (aus manifest.yaml)
  const titel = document.createElement('div');
  titel.className = 'amorph-header-titel';
  titel.style.cssText = 'font-weight: 600; font-size: 1.1rem; white-space: nowrap;';
  titel.textContent = '🍄 Funginomi';
  zeile1.appendChild(titel);
  
  // Suche-Morph einfügen
  if (config.suche) {
    const sucheContainer = document.createElement('amorph-container');
    sucheContainer.setAttribute('data-morph', 'suche');
    sucheContainer.setAttribute('data-field', 'suche');
    sucheContainer.appendChild(suche(config.suche));
    zeile1.appendChild(sucheContainer);
  }
  
  // Ansicht-Switch einfügen (Grid, Detail, Vergleich)
  if (config.ansicht !== false) {
    const ansichtSwitch = erstelleAnsichtSwitch(config.ansicht || {});
    zeile1.appendChild(ansichtSwitch);
  }
  
  wrapper.appendChild(zeile1);
  
  // Zweite Zeile: Perspektiven
  if (config.perspektiven) {
    const perspektivenContainer = document.createElement('amorph-container');
    perspektivenContainer.setAttribute('data-morph', 'perspektiven');
    perspektivenContainer.setAttribute('data-field', 'perspektiven');
    perspektivenContainer.appendChild(perspektiven(config.perspektiven));
    wrapper.appendChild(perspektivenContainer);
  }
  
  container.appendChild(wrapper);
  
  return container;
}

/**
 * Erstellt den Ansicht-Switch (Karten, Detail, Vergleich)
 */
function erstelleAnsichtSwitch(config) {
  const ansichten = config.ansichten || [
    { id: 'karten', label: 'Karten', icon: '⊞', layout: 'grid' },
    { id: 'detail', label: 'Detail', icon: '☰', layout: 'liste' },
    { id: 'vergleich', label: 'Vergleich', icon: '▥', layout: 'kompakt' }
  ];
  
  const aktiv = config.default || 'karten';
  
  const switchContainer = document.createElement('div');
  switchContainer.className = 'amorph-ansicht-switch';
  switchContainer.setAttribute('role', 'radiogroup');
  switchContainer.setAttribute('aria-label', 'Ansicht wählen');
  
  for (const ansicht of ansichten) {
    const btn = document.createElement('button');
    btn.className = 'amorph-ansicht-btn';
    btn.dataset.ansicht = ansicht.id;
    btn.dataset.layout = ansicht.layout;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', ansicht.id === aktiv ? 'true' : 'false');
    btn.setAttribute('title', ansicht.label);
    btn.textContent = ansicht.icon;
    
    if (ansicht.id === aktiv) {
      btn.classList.add('aktiv');
    }
    
    btn.addEventListener('click', () => {
      // Alle Buttons deaktivieren
      for (const b of switchContainer.querySelectorAll('button')) {
        b.classList.remove('aktiv');
        b.setAttribute('aria-checked', 'false');
      }
      // Diesen aktivieren
      btn.classList.add('aktiv');
      btn.setAttribute('aria-checked', 'true');
      
      // Layout im Container setzen
      const appContainer = document.querySelector('[data-amorph-container]');
      if (appContainer) {
        appContainer.dataset.layout = ansicht.layout;
      }
      
      debug.features('Ansicht gewechselt', { ansicht: ansicht.id, layout: ansicht.layout });
    });
    
    switchContainer.appendChild(btn);
  }
  
  // Initial Layout setzen
  setTimeout(() => {
    const appContainer = document.querySelector('[data-amorph-container]');
    const aktivAnsicht = ansichten.find(a => a.id === aktiv);
    if (appContainer && aktivAnsicht) {
      appContainer.dataset.layout = aktivAnsicht.layout;
    }
  }, 0);
  
  return switchContainer;
}

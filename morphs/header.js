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
 * Detail + Vergleich sind ausgegraut bis Items ausgewählt sind
 */
function erstelleAnsichtSwitch(config) {
  const ansichten = config.ansichten || [
    { id: 'karten', label: 'Karten', icon: '⊞', minAuswahl: 0 },
    { id: 'detail', label: 'Detail', icon: '📋', minAuswahl: 1 },
    { id: 'vergleich', label: 'Vergleich', icon: '⚖️', minAuswahl: 2 }
  ];
  
  const aktiv = config.default || 'karten';
  
  const switchContainer = document.createElement('div');
  switchContainer.className = 'amorph-ansicht-switch';
  switchContainer.setAttribute('role', 'radiogroup');
  switchContainer.setAttribute('aria-label', 'Ansicht wählen');
  
  // Auswahl-Counter
  const counter = document.createElement('span');
  counter.className = 'amorph-auswahl-counter';
  counter.textContent = '0';
  counter.style.display = 'none';
  switchContainer.appendChild(counter);
  
  for (const ansicht of ansichten) {
    const btn = document.createElement('button');
    btn.className = 'amorph-ansicht-btn';
    btn.dataset.ansicht = ansicht.id;
    btn.dataset.minAuswahl = ansicht.minAuswahl;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', ansicht.id === aktiv ? 'true' : 'false');
    btn.setAttribute('title', ansicht.label);
    btn.textContent = ansicht.icon;
    
    if (ansicht.id === aktiv) {
      btn.classList.add('aktiv');
    }
    
    // Detail + Vergleich initial disabled
    if (ansicht.minAuswahl > 0) {
      btn.disabled = true;
      btn.classList.add('disabled');
    }
    
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      
      // Alle Buttons deaktivieren
      for (const b of switchContainer.querySelectorAll('button')) {
        b.classList.remove('aktiv');
        b.setAttribute('aria-checked', 'false');
      }
      // Diesen aktivieren
      btn.classList.add('aktiv');
      btn.setAttribute('aria-checked', 'true');
      
      // Event für Ansicht-Wechsel dispatchen
      document.dispatchEvent(new CustomEvent('amorph:ansicht-wechsel', {
        detail: { ansicht: ansicht.id }
      }));
      
      debug.features('Ansicht gewechselt', { ansicht: ansicht.id });
    });
    
    switchContainer.appendChild(btn);
  }
  
  // Auf Auswahl-Änderungen reagieren
  document.addEventListener('amorph:auswahl-geaendert', (e) => {
    const anzahl = e.detail.anzahl;
    
    // Counter aktualisieren
    counter.textContent = anzahl;
    counter.style.display = anzahl > 0 ? '' : 'none';
    
    // Buttons enablen/disablen
    for (const btn of switchContainer.querySelectorAll('.amorph-ansicht-btn')) {
      const minAuswahl = parseInt(btn.dataset.minAuswahl || '0');
      if (anzahl >= minAuswahl) {
        btn.disabled = false;
        btn.classList.remove('disabled');
      } else {
        btn.disabled = true;
        btn.classList.add('disabled');
        // Wenn aktiv und nicht mehr genug Auswahl → zu Karten wechseln
        if (btn.classList.contains('aktiv')) {
          const kartenBtn = switchContainer.querySelector('[data-ansicht="karten"]');
          kartenBtn?.click();
        }
      }
    }
    
    debug.features('Auswahl geändert', { anzahl });
  });
  
  return switchContainer;
}

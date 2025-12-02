/**
 * Header Morph
 * Container für Suche + Perspektiven + Ansicht-Switch
 * Sticky am oberen Rand - Dark Glasmorphism Design
 * 
 * Layout:
 * Zeile 0: FUNGINOMI (links) ........................ Part of Bifroest (rechts)
 * Zeile 1: [🔍 Suche...] [aktive Badges]
 * Zeile 2: [Grid][Detail][Vergl] | [Perspektiven-Buttons...]
 */

import { debug } from '../observer/debug.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';

export function header(config, morphConfig = {}) {
  debug.features('Header Morph erstellt', config);
  
  const container = document.createElement('div');
  container.className = 'amorph-header';
  
  // === ZEILE 0: Branding (FUNGINOMI + Bifroest) ===
  const zeile0 = document.createElement('div');
  zeile0.className = 'amorph-header-row amorph-header-branding';
  
  // App-Titel/Logo (links)
  const titel = document.createElement('a');
  titel.className = 'amorph-header-titel';
  titel.href = '/';
  titel.innerHTML = '<span class="titel-text">FUNGINOMI</span>';
  zeile0.appendChild(titel);
  
  // Bifroest Link (rechts)
  const bifroest = document.createElement('a');
  bifroest.className = 'amorph-header-bifroest';
  bifroest.href = 'https://bifroest.io';
  bifroest.target = '_blank';
  bifroest.innerHTML = 'Part of the <span class="bifroest-name">Bifroest</span>';
  zeile0.appendChild(bifroest);
  
  container.appendChild(zeile0);
  
  // === ZEILE 1: Suche (volle Breite) ===
  const zeile1 = document.createElement('div');
  zeile1.className = 'amorph-header-row amorph-header-suche';
  
  // Suche-Container (mit Input + aktive Filter Badges)
  const sucheWrapper = document.createElement('div');
  sucheWrapper.className = 'amorph-suche-wrapper';
  
  if (config.suche) {
    const sucheContainer = document.createElement('amorph-container');
    sucheContainer.setAttribute('data-morph', 'suche');
    sucheContainer.setAttribute('data-field', 'suche');
    sucheContainer.appendChild(suche(config.suche));
    sucheWrapper.appendChild(sucheContainer);
    
    // Container für aktive Filter-Badges (werden dynamisch gefüllt)
    const aktiveBadges = document.createElement('div');
    aktiveBadges.className = 'amorph-aktive-filter';
    sucheWrapper.appendChild(aktiveBadges);
  }
  zeile1.appendChild(sucheWrapper);
  
  container.appendChild(zeile1);
  
  // === ZEILE 2: Ansichten + Perspektiven ===
  const zeile2 = document.createElement('div');
  zeile2.className = 'amorph-header-row amorph-header-nav';
  
  // Ansicht-Switch (Grid, Detail, Vergleich) - links
  if (config.ansicht !== false) {
    const ansichtSwitch = erstelleAnsichtSwitch(config.ansicht || {});
    zeile2.appendChild(ansichtSwitch);
  }
  
  // Perspektiven - rechts daneben
  if (config.perspektiven) {
    const perspektivenContainer = document.createElement('amorph-container');
    perspektivenContainer.setAttribute('data-morph', 'perspektiven');
    perspektivenContainer.setAttribute('data-field', 'perspektiven');
    perspektivenContainer.appendChild(perspektiven(config.perspektiven));
    zeile2.appendChild(perspektivenContainer);
  }
  
  container.appendChild(zeile2);
  
  return container;
}

/**
 * Erstellt den Ansicht-Switch (Karten, Detail, Vergleich)
 * Direktes Tab-Wechseln - kein Popup!
 */
function erstelleAnsichtSwitch(config) {
  const ansichten = config.ansichten || [
    { id: 'karten', label: 'Karten', icon: '⊞', minAuswahl: 0 },
    { id: 'vergleich', label: 'Vergleich', icon: '▥', minAuswahl: 1 }
  ];
  
  const aktiv = config.default || 'karten';
  
  const switchContainer = document.createElement('div');
  switchContainer.className = 'amorph-ansicht-switch';
  switchContainer.setAttribute('role', 'tablist');
  switchContainer.setAttribute('aria-label', 'Ansicht wählen');
  
  for (const ansicht of ansichten) {
    const btn = document.createElement('button');
    btn.className = 'amorph-ansicht-btn';
    btn.dataset.ansicht = ansicht.id;
    btn.dataset.minAuswahl = ansicht.minAuswahl;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', ansicht.id === aktiv ? 'true' : 'false');
    btn.setAttribute('title', ansicht.label);
    btn.textContent = ansicht.icon;
    
    if (ansicht.id === aktiv) {
      btn.classList.add('aktiv');
    }
    
    // Detail + Vergleich initial disabled bis Auswahl vorhanden
    if (ansicht.minAuswahl > 0) {
      btn.disabled = true;
      btn.classList.add('disabled');
    }
    
    // Direkter Tab-Wechsel - kein Popup!
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      
      // Alle Buttons deaktivieren
      for (const b of switchContainer.querySelectorAll('.amorph-ansicht-btn')) {
        b.classList.remove('aktiv');
        b.setAttribute('aria-selected', 'false');
      }
      // Diesen aktivieren
      btn.classList.add('aktiv');
      btn.setAttribute('aria-selected', 'true');
      
      // Callback aufrufen statt document.dispatchEvent (Morph-Purity)
      if (typeof config.onAnsichtWechsel === 'function') {
        config.onAnsichtWechsel(ansicht.id);
      }
      
      debug.features('Ansicht gewechselt', { ansicht: ansicht.id });
    });
    
    switchContainer.appendChild(btn);
  }
  
  // Update-Funktion für externe Aufrufe (statt document.addEventListener)
  switchContainer.updateAuswahl = (anzahl) => {
    // Buttons enablen/disablen basierend auf Auswahl-Anzahl
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
  };
  
  return switchContainer;
}


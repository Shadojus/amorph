/**
 * AMORPH v5
 * 
 * Formlos. Zustandslos. Transformierend.
 * 
 * DATENBANK → MORPHS → DOM
 */

import { loadConfig } from './core/config.js';
import { transform, render } from './core/pipeline.js';
import { setupObservers, stopObservers } from './observer/index.js';
import { loadFeatures, unloadFeatures } from './features/index.js';
import { createDataSource } from './util/fetch.js';
import { getSession } from './util/session.js';
import { debug } from './observer/debug.js';
import './core/container.js'; // Web Component registrieren

/**
 * AMORPH initialisieren
 * 
 * @param {Object} options
 * @param {string|HTMLElement} options.container - Container-Selektor oder Element
 * @param {string} options.config - Pfad zum Config-Ordner
 * @param {Object} options.customMorphs - Eigene Morphs
 */
export async function amorph(options = {}) {
  const {
    container: containerOption = '#app',
    config: configPath = './config/',
    customMorphs = {}
  } = options;
  
  // Container finden
  const container = typeof containerOption === 'string'
    ? document.querySelector(containerOption)
    : containerOption;
  
  if (!container) {
    throw new Error(`Container nicht gefunden: ${containerOption}`);
  }
  
  container.setAttribute('data-amorph-container', '');
  
  debug.amorph('🍄 Initialisiere...');
  
  // Konfiguration laden
  const config = await loadConfig(configPath);
  debug.config('Geladen', Object.keys(config));
  
  // Datenquelle erstellen
  const dataSource = createDataSource(config.daten);
  debug.daten('Quelle', config.daten.quelle);
  
  // Session prüfen (für Observer)
  const session = getSession();
  
  // Observer starten
  const observers = setupObservers(container, config, session);
  
  // Aktuelle Suchergebnisse speichern (für Perspektiven-Filterung)
  let currentData = [];
  let currentQuery = '';
  
  // Features laden (mit Zugriff auf search-Funktion)
  const features = await loadFeatures(container, config, dataSource, {
    onSearch: async (query) => {
      currentQuery = query;
      debug.suche('Suche ausgeführt', { query });
      currentData = await dataSource.query({ search: query });
      debug.suche('Ergebnisse', { anzahl: currentData.length });
      await render(container, currentData, config);
      
      // Highlighting anwenden nach Render
      if (query && query.trim()) {
        highlightMatches(container, query.trim());
      }
      
      return currentData;
    }
  });
  debug.features('Geladen', features.map(f => f.name));
  
  // KEINE initiale Daten laden - warten auf Suche
  debug.daten('Warte auf Sucheingabe...');
  
  // Leere Nachricht anzeigen
  showEmptyState(container);
  
  debug.render('Fertig!');
  
  // Re-Render Handler (für Suche etc.)
  container.addEventListener('amorph:request-render', async (e) => {
    const query = e.detail?.query ?? currentQuery;
    if (query || query === '') {
      currentData = await dataSource.query({ search: query });
      await render(container, currentData, config);
    }
  });
  
  // Aufräumen bei Bedarf
  return {
    destroy() {
      stopObservers(observers);
      unloadFeatures(features);
      container.innerHTML = '';
      container.removeAttribute('data-amorph-container');
    },
    
    async reload() {
      if (currentQuery) {
        currentData = await dataSource.query({ search: currentQuery });
        await render(container, currentData, config);
      }
    },
    
    async search(query) {
      currentQuery = query;
      currentData = await dataSource.query({ search: query });
      await render(container, currentData, config);
      return currentData;
    },
    
    getData() {
      return currentData;
    }
  };
}

function showEmptyState(container) {
  const emptyEl = document.createElement('div');
  emptyEl.className = 'amorph-empty-state';
  emptyEl.innerHTML = `
    <div class="amorph-empty-icon">🔍</div>
    <div class="amorph-empty-text">Gib einen Suchbegriff ein, um Pilze zu finden</div>
  `;
  container.appendChild(emptyEl);
}

function highlightMatches(container, query) {
  const q = query.toLowerCase();
  
  // Semantische Keyword-Mappings (gleiche wie in Suche)
  const semanticMappings = {
    // Essbarkeit
    'essbar': ['essbar'],
    'essen': ['essbar'],
    'kann man essen': ['essbar'],
    'speisepilz': ['essbar'],
    'genießbar': ['essbar'],
    'lecker': ['essbar'],
    'kochen': ['essbar', 'braten', 'schmoren'],
    'giftig': ['giftig', 'tödlich'],
    'gift': ['giftig', 'tödlich'],
    'gefährlich': ['giftig', 'tödlich'],
    'tödlich': ['tödlich'],
    
    // Geschmack
    'nussig': ['nussig', 'nuss'],
    'mild': ['mild', 'zart'],
    'würzig': ['würzig', 'aromatisch', 'intensiv'],
    'umami': ['umami', 'fleischig'],
    'fruchtig': ['fruchtig'],
    'pfeffrig': ['pfeffrig', 'pfeffer'],
    
    // Zubereitung
    'braten': ['braten'],
    'trocknen': ['trocknen'],
    'roh': ['roh'],
    'schmoren': ['schmoren'],
    
    // Standort
    'wald': ['wald', 'Wald'],
    'nadelwald': ['Nadelwald', 'Fichten', 'Kiefern'],
    'laubwald': ['Laubwald', 'Buche', 'Eiche'],
    'wiese': ['Wiese', 'Weide', 'Rasen'],
    
    // Saison
    'herbst': ['September', 'Oktober', 'November'],
    'frühling': ['März', 'April', 'Mai'],
    'sommer': ['Juni', 'Juli', 'August'],
    'winter': ['Dezember', 'Januar', 'Februar'],
    
    // Farben
    'rot': ['rot', 'Rot'],
    'gelb': ['gelb', 'Gelb', 'gold', 'dotter'],
    'braun': ['braun', 'Braun', 'kastanie'],
    'weiß': ['weiß', 'Weiß', 'weiss']
  };
  
  // Finde alle zu highlightenden Begriffe
  let highlightTerms = [q]; // Immer den originalen Query
  
  // Semantische Matches hinzufügen
  for (const [keyword, mappedTerms] of Object.entries(semanticMappings)) {
    if (q.includes(keyword)) {
      highlightTerms.push(...mappedTerms);
    }
  }
  
  // Auch einzelne Wörter der Query
  const queryWords = q.split(/\s+/).filter(w => w.length > 2);
  highlightTerms.push(...queryWords);
  
  // Duplikate entfernen
  highlightTerms = [...new Set(highlightTerms)];
  
  // ALLE Text-Elemente in Items durchsuchen (nicht nur bestimmte Felder)
  const items = container.querySelectorAll('.amorph-item');
  
  for (const item of items) {
    const textElements = item.querySelectorAll('.amorph-text, .amorph-tag');
    
    for (const el of textElements) {
      const originalText = el.textContent;
      let html = escapeHtml(originalText);
      let hasMatch = false;
      
      // Alle Highlight-Begriffe prüfen
      for (const term of highlightTerms) {
        const termLower = term.toLowerCase();
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        
        if (originalText.toLowerCase().includes(termLower)) {
          html = html.replace(regex, '<mark class="amorph-highlight">$1</mark>');
          hasMatch = true;
        }
      }
      
      if (hasMatch) {
        el.innerHTML = html;
      }
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Exports für modulare Nutzung
export { loadConfig } from './core/config.js';
export { transform, render } from './core/pipeline.js';
export { morphs } from './morphs/index.js';
export { createDataSource } from './util/fetch.js';
export { setupObservers } from './observer/index.js';
export { loadFeatures } from './features/index.js';

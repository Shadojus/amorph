/**
 * AMORPH v5
 * 
 * Formlos. Zustandslos. Transformierend.
 * 
 * DATENBANK → MORPHS → DOM
 * 
 * DATENGETRIEBEN: Erkennungsregeln und Farben aus Config!
 */

import { loadConfig } from './core/config.js';
import { transform, render, setErkennungConfig } from './core/pipeline.js';
import { setupObservers, stopObservers } from './observer/index.js';
import { loadFeatures, unloadFeatures } from './features/index.js';
import { createDataSource, highlightInContainer, clearHighlights } from './util/fetch.js';
import { getSession, getUrlState, setUrlState } from './util/session.js';
import { setSchema, setMorphsConfig } from './util/semantic.js';
import { debug } from './observer/debug.js';
import { setFarbenConfig, setErkennungConfig as setCompareErkennungConfig } from './morphs/compare/base.js';
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
  
  debug.amorph('🍄 Initializing...');
  
  // Load configuration
  const config = await loadConfig(configPath);
  debug.config('Loaded', Object.keys(config));
  
  // Schema für semantische Suche setzen
  if (config.schema) {
    setSchema(config.schema);
  }
  
  // Erkennungs-Config für Pipeline setzen (aus morphs.yaml)
  if (config.morphs?.erkennung) {
    setErkennungConfig(config.morphs);
    setCompareErkennungConfig(config.morphs);  // Also for Compare-Morphs!
    debug.config('Detection config loaded', Object.keys(config.morphs.erkennung));
  }
  
  // Morphs-Config für Farben und Badge-Keywords setzen (aus morphs.yaml)
  if (config.morphs) {
    setMorphsConfig(config.morphs);
    debug.config('Morphs config loaded', Object.keys(config.morphs));
  }
  
  // Farben-Config für Compare setzen (aus morphs.yaml)
  if (config.morphs?.farben) {
    setFarbenConfig(config.morphs);
    debug.config('Colors config loaded', Object.keys(config.morphs.farben));
  }
  
  // Create data source
  const dataSource = createDataSource(config.daten);
  debug.data('Source', config.daten.quelle);
  
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
      debug.search('Search executed', { query });
      
      // Alte States entfernen
      container.querySelectorAll('.amorph-empty-state, .amorph-error-state, .amorph-no-results').forEach(el => el.remove());
      
      try {
        currentData = await dataSource.query({ search: query });
        debug.search('Results', { count: currentData.length });
        
        // Keine Ergebnisse? Zeige No-Results State
        if (query && query.trim() && currentData.length === 0) {
          showNoResults(container, query);
          return currentData;
        }
        
        await render(container, currentData, config);
        
        // Highlighting anwenden nach Render
        if (query && query.trim()) {
          const matchedTerms = dataSource.getMatchedTerms ? dataSource.getMatchedTerms() : new Set();
          debug.search('Matched terms for highlighter', { count: matchedTerms.size, terms: [...matchedTerms].slice(0, 10) });
          highlightMatches(container, query.trim(), matchedTerms);
        }
        
        return currentData;
      } catch (error) {
        debug.error('Search failed', { error: error.message });
        showErrorState(container, error);
        return [];
      }
    }
  });
  debug.features('Loaded', features.map(f => f.name));
  
  // === URL STATE WIEDERHERSTELLUNG ===
  // Prüfe ob State in URL gespeichert ist
  const urlState = getUrlState();
  debug.session('URL state loaded', urlState);
  
  if (urlState.suche) {
    // Auto-Suche mit URL-Parameter auslösen
    setTimeout(() => {
      debug.session('Triggering auto-search from URL', { search: urlState.suche });
      document.dispatchEvent(new CustomEvent('amorph:auto-search', {
        detail: { query: urlState.suche }
      }));
    }, 100);
  }
  
  // Bei Suche URL updaten
  document.addEventListener('header:suche:ergebnisse', (e) => {
    const query = e.detail?.query || '';
    const current = getUrlState();
    setUrlState({ ...current, suche: query });
  });
  
  // Bei Perspektiven-Wechsel URL updaten
  document.addEventListener('perspektiven:geaendert', (e) => {
    const perspektiven = e.detail?.aktiv || [];
    const current = getUrlState();
    setUrlState({ ...current, perspektiven });
  });
  
  // Bei Ansicht-Wechsel URL updaten
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    const ansicht = e.detail?.ansicht || 'karten';
    const current = getUrlState();
    setUrlState({ ...current, ansicht });
  });
  
  // NO initial data load - wait for search
  debug.data('Waiting for search input...');
  
  // Show empty message
  showEmptyState(container);
  
  debug.render('Done!');
  
  // Navigation zu Einzelansicht (von Header-Auswahl-Badges)
  document.addEventListener('amorph:navigate-pilz', async (e) => {
    const { slug, id } = e.detail || {};
    if (!slug && !id) return;
    
    debug.amorph('Navigate to item', { slug, id });
    
    // URL ändern
    const newUrl = `/${slug || id}`;
    window.history.pushState({ route: 'einzelansicht', params: { slug: slug || id } }, '', newUrl);
    
    // Event für Einzelansicht-Feature dispatchen
    window.dispatchEvent(new CustomEvent('amorph:route-change', {
      detail: { 
        route: 'einzelansicht', 
        params: { slug: slug || id },
        query: {}
      }
    }));
  });
  
  // Re-Render Handler (für Suche etc.)
  container.addEventListener('amorph:request-render', async (e) => {
    const query = e.detail?.query ?? currentQuery;
    if (query || query === '') {
      currentData = await dataSource.query({ search: query });
      await render(container, currentData, config);
    }
  });
  
  // Feld-Auswahl per Klick auf einzelne Felder in Cards
  container.addEventListener('click', async (e) => {
    // Finde das angeklickte Feld (amorph-container mit data-field)
    const feldContainer = e.target.closest('amorph-container[data-field]');
    if (!feldContainer) return;
    
    // Finde die übergeordnete Item-Card
    const card = feldContainer.closest('amorph-container[data-morph="item"]');
    if (!card) return;
    
    // Ignoriere Klicks auf interaktive Elemente
    if (e.target.closest('a, button, input, [role="button"]')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const itemId = card.dataset.itemId;
    const feldName = feldContainer.dataset.field;
    
    if (!itemId || !feldName) {
      debug.amorph('No itemId or fieldName found', { itemId, feldName });
      return;
    }
    
    // Wert aus dem DOM holen
    const itemData = JSON.parse(card.dataset.itemData || '{}');
    const wert = itemData[feldName];
    
    // Dynamischer Import um zirkuläre Abhängigkeiten zu vermeiden
    const { toggleFeldAuswahl, istFeldAusgewaehlt } = await import('./features/ansichten/index.js');
    toggleFeldAuswahl(itemId, feldName, wert, itemData);
    
    // Feld-State updaten
    const isSelected = istFeldAusgewaehlt(itemId, feldName);
    feldContainer.classList.toggle('feld-ausgewaehlt', isSelected);
    
    debug.amorph('Field selection toggle', { itemId, fieldName: feldName, selected: isSelected });
  });
  
  // Auf Auswahl-Änderungen von außen reagieren (z.B. vom Compare-View oder Header)
  document.addEventListener('amorph:auswahl-geaendert', async (e) => {
    const { entferntesFeld, entfernterPilz, entfernteFelder } = e.detail || {};
    const { istFeldAusgewaehlt } = await import('./features/ansichten/index.js');
    
    // Wenn ein ganzer Pilz entfernt wurde, alle seine Felder im Grid deselektieren
    if (entfernterPilz) {
      const pilzCard = container.querySelector(`amorph-container[data-item-id="${entfernterPilz}"]`);
      if (pilzCard) {
        // Alle Felder dieses Pilzes deselektieren
        const alleFelder = pilzCard.querySelectorAll('amorph-container[data-field].feld-ausgewaehlt');
        alleFelder.forEach(feldContainer => {
          feldContainer.classList.remove('feld-ausgewaehlt');
        });
        debug.amorph('Pilz fields deselected', { pilzId: entfernterPilz, fieldCount: alleFelder.length });
      }
      return;
    }
    
    // Wenn ein spezifisches Feld entfernt wurde, aktualisiere nur diese
    if (entferntesFeld) {
      // Finde alle Felder mit diesem Namen im Container
      const felder = container.querySelectorAll(`amorph-container[data-field="${entferntesFeld}"]`);
      felder.forEach(feldContainer => {
        const card = feldContainer.closest('amorph-container[data-morph="item"]');
        if (!card) return;
        
        const itemId = card.dataset.itemId;
        const isSelected = istFeldAusgewaehlt(itemId, entferntesFeld);
        feldContainer.classList.toggle('feld-ausgewaehlt', isSelected);
      });
      
      debug.amorph('Field classes updated (externally)', { removedField: entferntesFeld, fieldCount: felder.length });
    }
  });
  
  // Aufräumen bei Bedarf
  return {
    destroy() {
      debug.amorph('Destroy', { query: currentQuery, dataCount: currentData.length });
      stopObservers(observers);
      unloadFeatures(features);
      container.innerHTML = '';
      container.removeAttribute('data-amorph-container');
    },
    
    async reload() {
      debug.amorph('Reload', { query: currentQuery });
      if (currentQuery) {
        currentData = await dataSource.query({ search: currentQuery });
        await render(container, currentData, config);
        debug.amorph('Reload complete', { count: currentData.length });
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
    <div class="amorph-empty-hint">Probiere "Steinpilz", "essbar" oder "Nadelwald"</div>
  `;
  container.appendChild(emptyEl);
}

function showErrorState(container, error) {
  const errorEl = document.createElement('div');
  errorEl.className = 'amorph-error-state';
  errorEl.innerHTML = `
    <div class="amorph-error-icon">⚠️</div>
    <div class="amorph-error-text">Daten konnten nicht geladen werden</div>
    <div class="amorph-error-hint">${error?.message || 'Verbindungsfehler'}</div>
  `;
  container.appendChild(errorEl);
}

function showNoResults(container, query) {
  const noResultsEl = document.createElement('div');
  noResultsEl.className = 'amorph-no-results';
  noResultsEl.innerHTML = `
    <div class="amorph-no-results-icon">🍄</div>
    <div class="amorph-no-results-text">Keine Pilze gefunden für <span class="amorph-no-results-query">"${query}"</span></div>
    <div class="amorph-no-results-hint">Versuche einen anderen Suchbegriff</div>
  `;
  container.appendChild(noResultsEl);
}

function highlightMatches(container, query, matchedTerms = new Set()) {
  // Alte Highlights entfernen
  clearHighlights(container);
  
  // Neue TreeWalker-basierte Highlight-Funktion nutzen
  // Diese findet ALLE Text-Nodes, auch in verschachtelten Elementen
  const count = highlightInContainer(container, query, matchedTerms);
  debug.render('highlight', { query, matchedTerms: matchedTerms.size, highlighted: count });
  
  // Event für Highlight-Navigation auslösen
  document.dispatchEvent(new CustomEvent('amorph:highlights-updated', {
    detail: { count, query }
  }));
}

// Exports für modulare Nutzung
export { loadConfig } from './core/config.js';
export { transform, render } from './core/pipeline.js';
export { morphs } from './morphs/index.js';
export { createDataSource } from './util/fetch.js';
export { setupObservers } from './observer/index.js';
export { loadFeatures } from './features/index.js';

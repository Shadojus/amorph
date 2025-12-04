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
import { createDataSource } from './util/fetch.js';
import { getSession } from './util/session.js';
import { setSchema, setMorphsConfig } from './util/semantic.js';
import { debug } from './observer/debug.js';
import { setFarbenConfig } from './morphs/compare/base.js';
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
  
  // Schema für semantische Suche setzen
  if (config.schema) {
    setSchema(config.schema);
  }
  
  // Erkennungs-Config für Pipeline setzen (aus morphs.yaml)
  if (config.morphs?.erkennung) {
    setErkennungConfig(config.morphs);
    debug.config('Erkennung-Config geladen', Object.keys(config.morphs.erkennung));
  }
  
  // Morphs-Config für Farben und Badge-Keywords setzen (aus morphs.yaml)
  if (config.morphs) {
    setMorphsConfig(config.morphs);
    debug.config('Morphs-Config geladen', Object.keys(config.morphs));
  }
  
  // Farben-Config für Compare setzen (aus morphs.yaml)
  if (config.morphs?.farben) {
    setFarbenConfig(config.morphs);
    debug.config('Farben-Config geladen', Object.keys(config.morphs.farben));
  }
  
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
      
      // Highlighting anwenden nach Render - nutze die gefundenen Match-Terme
      if (query && query.trim()) {
        const matchedTerms = dataSource.getMatchedTerms ? dataSource.getMatchedTerms() : new Set();
        debug.suche('Matched Terms für Highlighter', { anzahl: matchedTerms.size, terme: [...matchedTerms].slice(0, 10) });
        highlightMatches(container, query.trim(), matchedTerms);
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
      debug.amorph('Keine itemId oder feldName gefunden', { itemId, feldName });
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
    
    debug.amorph('Feld-Auswahl Toggle', { itemId, feldName, selected: isSelected });
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
        debug.amorph('Reload komplett', { anzahl: currentData.length });
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

function highlightMatches(container, query, matchedTerms = new Set()) {
  const q = query.toLowerCase();
  
  // Highlight-Begriffe: Primär die tatsächlich gematchten Terme aus der Suche verwenden
  let highlightTerms = new Set(matchedTerms);
  
  // Falls keine matchedTerms übergeben wurden, Fallback auf Query-Analyse
  if (highlightTerms.size === 0) {
    // Stopwörter die ignoriert werden (Deutsch + Englisch)
    const stopwords = new Set([
      'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einem', 'einen',
      'und', 'oder', 'aber', 'wenn', 'weil', 'dass', 'als', 'auch', 'nur', 'noch',
      'was', 'wer', 'wie', 'wo', 'wann', 'warum', 'welche', 'welcher', 'welches',
      'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden',
      'hat', 'haben', 'hatte', 'hatten', 'kann', 'können', 'konnte', 'konnten',
      'muss', 'müssen', 'musste', 'mussten', 'soll', 'sollen', 'sollte', 'sollten',
      'will', 'wollen', 'wollte', 'wollten', 'darf', 'dürfen', 'durfte', 'durften',
      'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mich', 'dich', 'sich', 'uns', 'euch',
      'mein', 'dein', 'sein', 'unser', 'euer', 'ihr',
      'von', 'zu', 'bei', 'mit', 'nach', 'aus', 'für', 'über', 'unter', 'vor', 'hinter',
      'auf', 'in', 'an', 'um', 'durch', 'gegen', 'ohne', 'bis', 'seit', 'während',
      'nicht', 'kein', 'keine', 'keiner', 'keinem', 'keinen',
      'sehr', 'mehr', 'viel', 'wenig', 'ganz', 'gar', 'schon', 'noch', 'immer', 'nie',
      'hier', 'dort', 'da', 'so', 'dann', 'also', 'denn', 'doch', 'ja', 'nein',
      'man', 'alle', 'alles', 'jeder', 'jede', 'jedes', 'jedem', 'jeden'
    ]);
    
    // Query in Wörter zerlegen und Stopwörter entfernen
    const queryWords = q
      .split(/\s+/)
      .map(w => w.replace(/[?!.,;:'"()]/g, ''))
      .filter(w => w.length > 2 && !stopwords.has(w));
    
    for (const word of queryWords) {
      highlightTerms.add(word);
    }
  }
  
  // Wenn keine Terme gefunden, abbrechen
  if (highlightTerms.size === 0) return;
  
  // Debug
  debug.render('highlight', { query: q, terms: [...highlightTerms], fromSearch: matchedTerms.size > 0 });
  
  // ALLE Text-Elemente in Items durchsuchen
  const items = container.querySelectorAll('.amorph-item');
  
  for (const item of items) {
    const textElements = item.querySelectorAll('.amorph-text, .amorph-tag');
    
    for (const el of textElements) {
      const originalText = el.textContent;
      let html = escapeHtml(originalText);
      let hasMatch = false;
      
      // Alle Highlight-Begriffe prüfen
      for (const term of highlightTerms) {
        if (term.length < 3) continue; // Mindestens 3 Zeichen
        
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        
        if (regex.test(originalText)) {
          html = html.replace(new RegExp(`(${escapeRegex(term)})`, 'gi'), '<mark class="amorph-highlight">$1</mark>');
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

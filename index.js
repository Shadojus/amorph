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
    customMorphs = {},
    autoLoad = true  // Neu: Steuert ob Daten bei Start geladen werden
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
  
  // Prüfe ob Header-Feature aktiv ist (dann kein autoLoad)
  const hatHeader = config.features?.aktiv?.includes?.('header') || 
                    (Array.isArray(config.features?.aktiv) && config.features.aktiv.includes('header'));
  const sollAutoLaden = autoLoad && !hatHeader;
  
  // Datenquelle erstellen
  const dataSource = createDataSource(config.daten);
  debug.daten('Quelle', config.daten.quelle);
  
  // Session prüfen (für Observer)
  const session = getSession();
  
  // Observer starten
  const observers = setupObservers(container, config, session);
  
  // Features laden
  const features = await loadFeatures(container, config, dataSource);
  debug.features('Geladen', features.map(f => f.name));
  
  // Initiale Daten laden nur wenn autoLoad aktiv und kein Header
  if (sollAutoLaden) {
    debug.daten('Lade Daten...');
    const daten = await dataSource.query();
    debug.daten(`${daten.length} Einträge geladen`);
    await render(container, daten, config);
    debug.render('Fertig!');
  } else {
    debug.daten('Warte auf Sucheingabe (Header-Modus)');
    // Leerer Zustand - zeige Hinweis
    container.innerHTML = '<div class="amorph-leer">Gib einen Suchbegriff ein um Ergebnisse zu sehen.</div>';
  }
  
  // Re-Render Handler (für Suche etc.) - jetzt mit optionalen Daten
  container.addEventListener('amorph:request-render', async (e) => {
    const direkteDaten = e.detail?.daten;
    
    if (direkteDaten !== undefined) {
      // Daten wurden direkt übergeben (z.B. vom Header-Feature)
      if (Array.isArray(direkteDaten) && direkteDaten.length === 0) {
        container.innerHTML = '<div class="amorph-leer">Keine Ergebnisse gefunden.</div>';
        debug.render('Leer (keine Ergebnisse)');
      } else if (direkteDaten === null || (Array.isArray(direkteDaten) && direkteDaten.length === 0)) {
        container.innerHTML = '<div class="amorph-leer">Gib einen Suchbegriff ein.</div>';
        debug.render('Leer (kein Suchbegriff)');
      } else {
        await render(container, direkteDaten, config);
        debug.render(`${direkteDaten.length} Ergebnisse gerendert`);
      }
    } else {
      // Keine Daten übergeben - aus DataSource laden
      const neueDaten = await dataSource.query();
      await render(container, neueDaten, config);
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
      const daten = await dataSource.query();
      await render(container, daten, config);
    },
    
    async search(query) {
      const daten = await dataSource.query({ search: query });
      await render(container, daten, config);
    }
  };
}

// Exports für modulare Nutzung
export { loadConfig } from './core/config.js';
export { transform, render } from './core/pipeline.js';
export { morphs } from './morphs/index.js';
export { createDataSource } from './util/fetch.js';
export { setupObservers } from './observer/index.js';
export { loadFeatures } from './features/index.js';

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
  
  console.log('%c🍄 AMORPH v5%c Initialisiere...', 'color: #f472b6; font-weight: bold; font-size: 14px', 'color: inherit');
  
  // Konfiguration laden
  const config = await loadConfig(configPath);
  console.log('%c[CONFIG]%c Geladen:', 'color: #34d399; font-weight: bold', 'color: inherit', Object.keys(config));
  
  // Datenquelle erstellen
  const dataSource = createDataSource(config.daten);
  console.log('%c[DATEN]%c Quelle:', 'color: #60a5fa; font-weight: bold', 'color: inherit', config.daten.quelle);
  
  // Session prüfen (für Observer)
  const session = getSession();
  
  // Observer starten
  const observers = setupObservers(container, config, session);
  
  // Features laden
  const features = await loadFeatures(container, config, dataSource);
  console.log('%c[FEATURES]%c Geladen:', 'color: #a78bfa; font-weight: bold', 'color: inherit', features.map(f => f.name));
  
  // Initiale Daten laden und rendern
  console.log('%c[DATEN]%c Lade Daten...', 'color: #60a5fa; font-weight: bold', 'color: inherit');
  const daten = await dataSource.query();
  console.log('%c[DATEN]%c', 'color: #60a5fa; font-weight: bold', 'color: inherit', `${daten.length} Einträge geladen`);
  
  await render(container, daten, config);
  console.log('%c[RENDER]%c Fertig!', 'color: #fbbf24; font-weight: bold', 'color: inherit');
  
  // Re-Render Handler (für Suche etc.)
  container.addEventListener('amorph:request-render', async () => {
    const neueDaten = await dataSource.query();
    await render(container, neueDaten, config);
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

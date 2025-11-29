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
  
  // Features laden
  const features = await loadFeatures(container, config, dataSource);
  debug.features('Geladen', features.map(f => f.name));
  
  // Initiale Daten laden und rendern
  debug.daten('Lade Daten...');
  const daten = await dataSource.query();
  debug.daten(`${daten.length} Einträge geladen`);
  
  await render(container, daten, config);
  debug.render('Fertig!');
  
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

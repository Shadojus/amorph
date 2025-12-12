import { debug } from '../observer/debug.js';

export function createFeatureContext(name, container, config, dataSource, callbacks = {}) {
  debug.features(`Creating context: ${name}`);
  
  const bereich = document.createElement('div');
  bereich.className = `amorph-feature amorph-feature-${name}`;
  bereich.setAttribute('data-feature', name);
  
  const eventTarget = new EventTarget();
  
  // Für Header: Zugriff auf alle Feature-Configs + Manifest (für Branding)
  const featureConfig = name === 'header' 
    ? { 
        suche: config.features?.suche || {},
        perspektiven: config.features?.perspektiven || {},
        ansicht: config.features?.ansicht || {},
        branding: config.manifest?.branding || {},    // NEU: Branding aus manifest.yaml
        appName: config.manifest?.name || 'AMORPH'    // NEU: Fallback App-Name
      }
    : (config.features?.[name] || {});
  
  debug.features(`Config for ${name}`, featureConfig);
  
  return {
    dom: bereich,
    config: Object.freeze(featureConfig),
    container, // Zugriff auf App-Container
    dataSource, // Zugriff auf DataSource (für matchedTerms etc.)
    
    on: (event, handler) => {
      debug.features(`Event registered: ${name}:${event}`);
      eventTarget.addEventListener(event, handler);
    },
    
    emit: (event, detail) => {
      debug.features(`Event emitted: ${name}:${event}`, detail);
      // Lokal auf Feature-EventTarget
      eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
      // Global auf document (mit Feature-Prefix für Cross-Feature-Kommunikation)
      document.dispatchEvent(new CustomEvent(`${name}:${event}`, { detail }));
    },
    
    // Daten abfragen
    fetch: async (query) => {
      debug.daten(`Feature ${name} fetch`, query);
      return dataSource.query(query);
    },
    
    // Suche ausführen (mit Render)
    search: async (query) => {
      debug.suche(`Feature ${name} search`, { query });
      if (callbacks.onSearch) {
        return callbacks.onSearch(query);
      }
      return dataSource.query({ search: query });
    },
    
    requestRender: (detail = {}) => {
      debug.render(`Feature ${name} requestRender`, detail);
      container.dispatchEvent(new CustomEvent('amorph:request-render', { detail }));
    },
    
    mount: (position = 'beforeend') => {
      debug.mount(`Feature ${name} mount`, { position });
      container.insertAdjacentElement(position, bereich);
    },
    
    destroy: () => {
      debug.unmount(`Feature ${name} destroy`);
      bereich.remove();
    }
  };
}

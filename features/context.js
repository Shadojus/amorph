export function createFeatureContext(name, container, config, dataSource, callbacks = {}) {
  const bereich = document.createElement('div');
  bereich.className = `amorph-feature amorph-feature-${name}`;
  bereich.setAttribute('data-feature', name);
  
  const eventTarget = new EventTarget();
  
  // Für Header: Zugriff auf alle Feature-Configs
  const featureConfig = name === 'header' 
    ? { 
        suche: config.features?.suche || {},
        perspektiven: config.features?.perspektiven || {}
      }
    : (config.features?.[name] || {});
  
  return {
    dom: bereich,
    config: Object.freeze(featureConfig),
    container, // Zugriff auf App-Container
    
    on: (event, handler) => {
      eventTarget.addEventListener(event, handler);
    },
    
    emit: (event, detail) => {
      eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
    },
    
    // Daten abfragen
    fetch: async (query) => {
      return dataSource.query(query);
    },
    
    // Suche ausführen (mit Render)
    search: async (query) => {
      if (callbacks.onSearch) {
        return callbacks.onSearch(query);
      }
      return dataSource.query({ search: query });
    },
    
    requestRender: (detail = {}) => {
      container.dispatchEvent(new CustomEvent('amorph:request-render', { detail }));
    },
    
    mount: (position = 'beforeend') => {
      container.insertAdjacentElement(position, bereich);
    },
    
    destroy: () => {
      bereich.remove();
    }
  };
}

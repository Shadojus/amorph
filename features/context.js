export function createFeatureContext(name, container, config, dataSource) {
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
    
    on: (event, handler) => {
      eventTarget.addEventListener(event, handler);
    },
    
    emit: (event, detail) => {
      eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
    },
    
    fetch: async (query) => {
      return dataSource.query(query);
    },
    
    requestRender: () => {
      container.dispatchEvent(new CustomEvent('amorph:request-render'));
    },
    
    mount: (position = 'beforeend') => {
      container.insertAdjacentElement(position, bereich);
    },
    
    destroy: () => {
      bereich.remove();
    }
  };
}

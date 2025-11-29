export function createFeatureContext(name, container, config, dataSource) {
  const bereich = document.createElement('div');
  bereich.className = `amorph-feature amorph-feature-${name}`;
  bereich.setAttribute('data-feature', name);
  
  const eventTarget = new EventTarget();
  
  return {
    dom: bereich,
    config: Object.freeze(config.features?.[name] || {}),
    
    on: (event, handler) => {
      eventTarget.addEventListener(event, handler);
    },
    
    emit: (event, detail) => {
      eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
    },
    
    fetch: async (query) => {
      return dataSource.query(query);
    },
    
    // requestRender kann optional Daten übergeben
    requestRender: (daten = null) => {
      container.dispatchEvent(new CustomEvent('amorph:request-render', { 
        detail: { daten } 
      }));
    },
    
    mount: (position = 'beforeend') => {
      container.insertAdjacentElement(position, bereich);
    },
    
    destroy: () => {
      bereich.remove();
    }
  };
}

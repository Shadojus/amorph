import { debug } from './debug.js';

export class RenderingObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = [];
    this.mutationObserver = null;
    this.renderCount = 0;
    this.mountCount = 0;
  }
  
  start() {
    debug.observer('RenderingObserver gestartet');
    
    // === MOUNT EVENTS ===
    const mountHandler = (e) => {
      this.mountCount++;
      const data = { 
        morph: e.detail?.morph, 
        feld: e.detail?.field,
        nummer: this.mountCount
      };
      debug.mount('Mount', data);
      this.target?.send({ typ: 'mount', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:mounted', mountHandler);
    this.handlers.push(['amorph:mounted', mountHandler]);
    
    // === UNMOUNT EVENTS ===
    const unmountHandler = (e) => {
      const data = { morph: e.detail?.morph, feld: e.detail?.field };
      debug.unmount('Unmount', data);
      this.target?.send({ typ: 'unmount', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:unmounted', unmountHandler);
    this.handlers.push(['amorph:unmounted', unmountHandler]);
    
    // === RENDER COMPLETE ===
    const renderHandler = (e) => {
      this.renderCount++;
      const data = { 
        anzahl: e.detail?.anzahl,
        renderNr: this.renderCount,
        totalMounts: this.mountCount
      };
      debug.render('Render komplett', data);
      this.target?.send({ typ: 'render', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:rendered', renderHandler);
    this.handlers.push(['amorph:rendered', renderHandler]);
    
    // === REQUEST RENDER ===
    const requestHandler = (e) => {
      debug.render('Render angefordert', { source: e.detail?.source });
    };
    this.container.addEventListener('amorph:request-render', requestHandler);
    this.handlers.push(['amorph:request-render', requestHandler]);
    
    // === DOM MUTATION OBSERVER ===
    this.mutationObserver = new MutationObserver((mutations) => {
      let addedNodes = 0;
      let removedNodes = 0;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          addedNodes += mutation.addedNodes.length;
          removedNodes += mutation.removedNodes.length;
        }
      }
      
      if (addedNodes > 0 || removedNodes > 0) {
        debug.render('DOM Mutation', { added: addedNodes, removed: removedNodes });
      }
    });
    
    this.mutationObserver.observe(this.container, {
      childList: true,
      subtree: true
    });
  }
  
  stop() {
    debug.observer('RenderingObserver gestoppt', { 
      totalRenders: this.renderCount, 
      totalMounts: this.mountCount 
    });
    
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers = [];
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
  
  getStats() {
    return {
      renders: this.renderCount,
      mounts: this.mountCount
    };
  }
}

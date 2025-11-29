import { debug } from './debug.js';

export class InteractionObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = new Map();
  }
  
  start() {
    debug.observer('InteractionObserver gestartet');
    
    this.addHandler('click', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      const data = {
        morph: morph.dataset.morph,
        feld: morph.dataset.field
      };
      debug.klick('Klick', data);
      this.target?.send({ typ: 'klick', ...data, zeitstempel: Date.now() });
    });
    
    let hoverTimeout;
    this.addHandler('mouseover', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        const data = {
          morph: morph.dataset.morph,
          feld: morph.dataset.field
        };
        debug.observer('Hover', data);
        this.target?.send({ typ: 'hover', ...data, zeitstempel: Date.now() });
      }, 500);
    });
    
    this.addHandler('mouseout', () => clearTimeout(hoverTimeout));
  }
  
  addHandler(event, handler) {
    this.container.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }
  
  stop() {
    debug.observer('InteractionObserver gestoppt');
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers.clear();
  }
}

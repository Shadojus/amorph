import { debug } from './debug.js';

export class RenderingObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = [];
  }
  
  start() {
    debug.observer('RenderingObserver gestartet');
    
    const mountHandler = (e) => {
      const data = { morph: e.detail?.morph, feld: e.detail?.field };
      debug.render('Mount', data);
      this.target?.send({ typ: 'mount', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:mounted', mountHandler);
    this.handlers.push(['amorph:mounted', mountHandler]);
    
    const unmountHandler = (e) => {
      const data = { morph: e.detail?.morph, feld: e.detail?.field };
      debug.render('Unmount', data);
      this.target?.send({ typ: 'unmount', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:unmounted', unmountHandler);
    this.handlers.push(['amorph:unmounted', unmountHandler]);
    
    const renderHandler = (e) => {
      const data = { anzahl: e.detail?.anzahl };
      debug.render('Render', data);
      this.target?.send({ typ: 'render', ...data, zeitstempel: Date.now() });
    };
    this.container.addEventListener('amorph:rendered', renderHandler);
    this.handlers.push(['amorph:rendered', renderHandler]);
  }
  
  stop() {
    debug.observer('RenderingObserver gestoppt');
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers = [];
  }
}

export class RenderingObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = [];
  }
  
  start() {
    this.send({ typ: 'observer_start', observer: 'RenderingObserver', zeitstempel: Date.now() });
    
    const mountHandler = (e) => {
      this.send({
        typ: 'mount',
        morph: e.detail?.morph,
        feld: e.detail?.field,
        zeitstempel: Date.now()
      });
    };
    this.container.addEventListener('amorph:mounted', mountHandler);
    this.handlers.push(['amorph:mounted', mountHandler]);
    
    const unmountHandler = (e) => {
      this.send({
        typ: 'unmount',
        morph: e.detail?.morph,
        feld: e.detail?.field,
        zeitstempel: Date.now()
      });
    };
    this.container.addEventListener('amorph:unmounted', unmountHandler);
    this.handlers.push(['amorph:unmounted', unmountHandler]);
    
    const renderHandler = (e) => {
      this.send({
        typ: 'render',
        anzahl: e.detail?.anzahl,
        zeitstempel: Date.now()
      });
    };
    this.container.addEventListener('amorph:rendered', renderHandler);
    this.handlers.push(['amorph:rendered', renderHandler]);
  }
  
  stop() {
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers = [];
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}

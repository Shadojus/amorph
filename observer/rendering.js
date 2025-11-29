export class RenderingObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
  }
  
  start() {
    this.container.addEventListener('amorph:mounted', (e) => {
      this.send({
        typ: 'mount',
        morph: e.detail.morph,
        feld: e.detail.field,
        zeitstempel: Date.now()
      });
    });
    
    this.container.addEventListener('amorph:unmounted', (e) => {
      this.send({
        typ: 'unmount',
        morph: e.detail.morph,
        feld: e.detail.field,
        zeitstempel: Date.now()
      });
    });
    
    this.container.addEventListener('amorph:rendered', (e) => {
      this.send({
        typ: 'render',
        anzahl: e.detail.anzahl,
        zeitstempel: Date.now()
      });
    });
  }
  
  stop() {}
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}

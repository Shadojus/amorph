export class InteractionObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = new Map();
  }
  
  start() {
    this.addHandler('click', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      this.send({
        typ: 'klick',
        morph: morph.dataset.morph,
        feld: morph.dataset.field,
        zeitstempel: Date.now()
      });
    });
    
    let hoverTimeout;
    this.addHandler('mouseover', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.send({
          typ: 'hover',
          morph: morph.dataset.morph,
          feld: morph.dataset.field,
          zeitstempel: Date.now()
        });
      }, 500);
    });
    
    this.addHandler('mouseout', () => clearTimeout(hoverTimeout));
  }
  
  addHandler(event, handler) {
    this.container.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }
  
  stop() {
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers.clear();
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}

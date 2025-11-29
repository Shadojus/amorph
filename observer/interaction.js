import { debug } from './debug.js';

export class InteractionObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = new Map();
    this.lastScrollTime = 0;
  }
  
  start() {
    debug.observer('InteractionObserver gestartet');
    
    // === KLICKS ===
    this.addHandler('click', (e) => {
      const morph = e.target.closest('amorph-container');
      const feature = e.target.closest('[data-feature]');
      const btn = e.target.closest('button');
      const link = e.target.closest('a');
      
      const data = {
        morph: morph?.dataset.morph,
        feld: morph?.dataset.field,
        feature: feature?.dataset.feature,
        button: btn?.textContent?.trim().substring(0, 20),
        link: link?.href,
        target: e.target.tagName.toLowerCase(),
        x: e.clientX,
        y: e.clientY
      };
      
      debug.klick('Klick', data);
      this.target?.send({ typ: 'klick', ...data, zeitstempel: Date.now() });
    });
    
    // === HOVER (verzögert) ===
    let hoverTimeout;
    let lastHoverMorph = null;
    
    this.addHandler('mouseover', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph || morph === lastHoverMorph) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        lastHoverMorph = morph;
        const data = {
          morph: morph.dataset.morph,
          feld: morph.dataset.field
        };
        debug.hover('Hover', data);
        this.target?.send({ typ: 'hover', ...data, zeitstempel: Date.now() });
      }, 500);
    });
    
    this.addHandler('mouseout', (e) => {
      const morph = e.target.closest('amorph-container');
      if (morph === lastHoverMorph) {
        lastHoverMorph = null;
      }
      clearTimeout(hoverTimeout);
    });
    
    // === INPUT (Formulareingaben) ===
    this.addHandler('input', (e) => {
      const morph = e.target.closest('amorph-container');
      const input = e.target;
      
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        const data = {
          morph: morph?.dataset.morph,
          feld: morph?.dataset.field,
          typ: input.type,
          name: input.name || input.placeholder,
          laenge: input.value?.length || 0
        };
        debug.input('Input', data);
        this.target?.send({ typ: 'input', ...data, zeitstempel: Date.now() });
      }
    });
    
    // === FOCUS/BLUR ===
    this.addHandler('focusin', (e) => {
      const morph = e.target.closest('amorph-container');
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
        debug.observer('Focus', { 
          morph: morph?.dataset.morph, 
          element: e.target.tagName.toLowerCase() 
        });
      }
    });
    
    // === SCROLL (gedrosselt) ===
    this.addHandler('scroll', (e) => {
      const now = Date.now();
      if (now - this.lastScrollTime < 500) return; // Max alle 500ms
      this.lastScrollTime = now;
      
      const data = {
        scrollTop: this.container.scrollTop || window.scrollY,
        scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      };
      debug.scroll('Scroll', data);
      this.target?.send({ typ: 'scroll', ...data, zeitstempel: now });
    }, true);
    
    // === KEYBOARD (wichtige Tasten) ===
    this.addHandler('keydown', (e) => {
      // Nur spezielle Tasten loggen
      if (['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const morph = e.target.closest('amorph-container');
        debug.observer('Taste', { 
          key: e.key, 
          morph: morph?.dataset.morph 
        });
      }
    });
  }
  
  addHandler(event, handler, useCapture = false) {
    this.container.addEventListener(event, handler, useCapture);
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

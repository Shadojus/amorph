/**
 * AmorphContainer Web Component
 * Isolierter Container für Morphs
 */

import { debug } from '../observer/debug.js';

// Morphs die inline dargestellt werden sollen
const INLINE_MORPHS = ['tag', 'badge', 'boolean', 'number'];

export class AmorphContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        contain: content;
      }
      :host([inline]) {
        display: inline-block;
        vertical-align: middle;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      :host([data-morph="item"]) {
        padding: var(--item-padding, 1rem);
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }
      :host([data-morph="item"]:last-child) {
        border-bottom: none;
      }
      ::slotted(*) {
        max-width: 100%;
      }
    `;
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(document.createElement('slot'));
  }
  
  connectedCallback() {
    // Automatisch inline Attribut setzen für kleine Morphs
    const morph = this.dataset.morph;
    if (INLINE_MORPHS.includes(morph)) {
      this.setAttribute('inline', '');
    }
    
    debug.mount('Container', { morph: this.dataset.morph, field: this.dataset.field });
    this.dispatchEvent(new CustomEvent('amorph:mounted', {
      bubbles: true,
      detail: {
        morph: this.dataset.morph,
        field: this.dataset.field
      }
    }));
  }
  
  disconnectedCallback() {
    debug.unmount('Container', { morph: this.dataset.morph, field: this.dataset.field });
    this.dispatchEvent(new CustomEvent('amorph:unmounted', {
      bubbles: true,
      detail: {
        morph: this.dataset.morph,
        field: this.dataset.field
      }
    }));
  }
}

if (!customElements.get('amorph-container')) {
  customElements.define('amorph-container', AmorphContainer);
}

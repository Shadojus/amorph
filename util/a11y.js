/**
 * AMORPH Accessibility (A11y) Utilities
 * 
 * Bietet:
 * - ARIA-Attribute-Helpers
 * - Keyboard-Navigation
 * - Focus-Management
 * - Screen-Reader-Announcements
 * - Skip-Links
 */

// ============================================================================
// ARIA Helpers
// ============================================================================

/**
 * Setzt ARIA-Attribute auf ein Element
 * @param {HTMLElement} el 
 * @param {Object} attrs - ARIA-Attribute ohne 'aria-' Präfix
 */
export function setAria(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) {
      el.removeAttribute(`aria-${key}`);
    } else if (value === true) {
      el.setAttribute(`aria-${key}`, 'true');
    } else {
      el.setAttribute(`aria-${key}`, String(value));
    }
  }
}

/**
 * Setzt role auf ein Element
 * @param {HTMLElement} el 
 * @param {string} role 
 */
export function setRole(el, role) {
  if (role) {
    el.setAttribute('role', role);
  } else {
    el.removeAttribute('role');
  }
}

/**
 * Macht ein Element zu einer beschrifteten Region
 * @param {HTMLElement} el 
 * @param {string} label 
 * @param {string} [role='region']
 */
export function labelRegion(el, label, role = 'region') {
  setRole(el, role);
  setAria(el, { label });
}

/**
 * Verbindet ein Element mit seinem Label
 * @param {HTMLElement} el 
 * @param {HTMLElement} labelEl 
 */
export function connectLabel(el, labelEl) {
  const id = labelEl.id || `label-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  labelEl.id = id;
  setAria(el, { labelledby: id });
}

/**
 * Fügt eine beschreibende Verbindung hinzu
 * @param {HTMLElement} el 
 * @param {HTMLElement} descEl 
 */
export function connectDescription(el, descEl) {
  const id = descEl.id || `desc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  descEl.id = id;
  setAria(el, { describedby: id });
}

// ============================================================================
// Live Regions (Screen Reader Announcements)
// ============================================================================

let liveRegion = null;

/**
 * Erstellt die globale Live-Region
 */
function ensureLiveRegion() {
  if (liveRegion && document.body.contains(liveRegion)) {
    return liveRegion;
  }
  
  liveRegion = document.createElement('div');
  liveRegion.id = 'amorph-live-region';
  liveRegion.className = 'amorph-sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  document.body.appendChild(liveRegion);
  
  return liveRegion;
}

/**
 * Kündigt Text für Screen Reader an
 * @param {string} message 
 * @param {'polite'|'assertive'} [priority='polite']
 */
export function announce(message, priority = 'polite') {
  const region = ensureLiveRegion();
  region.setAttribute('aria-live', priority);
  
  // Clearing and re-setting ensures screen readers announce the message
  region.textContent = '';
  
  // Small delay for screen readers to pick up the change
  setTimeout(() => {
    region.textContent = message;
  }, 50);
}

/**
 * Kündigt Ergebnis einer Aktion an
 * @param {string} action - z.B. 'Suche'
 * @param {number} count - Anzahl Ergebnisse
 */
export function announceResults(action, count) {
  const message = count === 0
    ? `${action}: Keine Ergebnisse gefunden`
    : count === 1
      ? `${action}: 1 Ergebnis gefunden`
      : `${action}: ${count} Ergebnisse gefunden`;
  
  announce(message);
}

/**
 * Kündigt Ladezustand an
 * @param {boolean} loading 
 * @param {string} [context='Daten']
 */
export function announceLoading(loading, context = 'Daten') {
  announce(loading ? `${context} werden geladen...` : `${context} geladen`, 'polite');
}

// ============================================================================
// Focus Management
// ============================================================================

const focusHistory = [];
const MAX_FOCUS_HISTORY = 10;

/**
 * Speichert aktuellen Fokus in History
 */
export function saveFocus() {
  const active = document.activeElement;
  if (active && active !== document.body) {
    focusHistory.push(active);
    if (focusHistory.length > MAX_FOCUS_HISTORY) {
      focusHistory.shift();
    }
  }
}

/**
 * Stellt vorherigen Fokus wieder her
 * @returns {boolean} - true wenn erfolgreich
 */
export function restoreFocus() {
  while (focusHistory.length > 0) {
    const el = focusHistory.pop();
    if (el && document.body.contains(el) && isFocusable(el)) {
      el.focus();
      return true;
    }
  }
  return false;
}

/**
 * Fokussiert ein Element mit optionalem Scroll
 * @param {HTMLElement} el 
 * @param {Object} options
 * @param {boolean} [options.preventScroll=false]
 * @param {boolean} [options.savePrevious=true]
 */
export function focusElement(el, { preventScroll = false, savePrevious = true } = {}) {
  if (!el) return;
  
  if (savePrevious) {
    saveFocus();
  }
  
  // Element fokussierbar machen falls nötig
  if (!isFocusable(el)) {
    el.setAttribute('tabindex', '-1');
  }
  
  el.focus({ preventScroll });
}

/**
 * Prüft ob ein Element fokussierbar ist
 * @param {Element} el 
 * @returns {boolean}
 */
export function isFocusable(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.disabled) return false;
  if (el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
  
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null) {
    return parseInt(tabindex, 10) >= -1;
  }
  
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'];
  if (focusableTags.includes(el.tagName)) {
    return el.tagName !== 'A' || el.hasAttribute('href');
  }
  
  return false;
}

/**
 * Findet alle fokussierbaren Elemente in einem Container
 * @param {Element} container 
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'summary',
    'details',
    'audio[controls]',
    'video[controls]'
  ].join(',');
  
  return Array.from(container.querySelectorAll(selector)).filter(el => {
    // Nicht versteckte Elemente
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

// ============================================================================
// Focus Trap (für Modals/Dialogs)
// ============================================================================

let activeTrap = null;

/**
 * Erstellt einen Focus-Trap für einen Container
 * @param {HTMLElement} container 
 * @returns {{ activate: () => void, deactivate: () => void }}
 */
export function createFocusTrap(container) {
  let firstFocusable = null;
  let lastFocusable = null;
  
  function updateFocusables() {
    const focusables = getFocusableElements(container);
    firstFocusable = focusables[0] || null;
    lastFocusable = focusables[focusables.length - 1] || null;
  }
  
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    
    updateFocusables();
    
    if (!firstFocusable || !lastFocusable) return;
    
    if (e.shiftKey) {
      // Shift+Tab: Wenn auf erstem Element, gehe zum letzten
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: Wenn auf letztem Element, gehe zum ersten
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  return {
    activate() {
      if (activeTrap) {
        activeTrap.deactivate();
      }
      
      saveFocus();
      updateFocusables();
      
      container.addEventListener('keydown', handleKeyDown);
      activeTrap = this;
      
      // Initial focus
      if (firstFocusable) {
        firstFocusable.focus();
      }
    },
    
    deactivate() {
      container.removeEventListener('keydown', handleKeyDown);
      restoreFocus();
      activeTrap = null;
    }
  };
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Richtet Pfeiltasten-Navigation für eine Liste ein
 * @param {HTMLElement} container 
 * @param {Object} options
 * @param {string} [options.itemSelector='[role="option"], li, [data-item]']
 * @param {boolean} [options.wrap=true] - Am Ende umbrechen?
 * @param {'vertical'|'horizontal'|'both'} [options.orientation='vertical']
 */
export function setupArrowNavigation(container, options = {}) {
  const {
    itemSelector = '[role="option"], li, [data-item-id]',
    wrap = true,
    orientation = 'vertical'
  } = options;
  
  function getItems() {
    return Array.from(container.querySelectorAll(itemSelector));
  }
  
  function handleKeyDown(e) {
    const items = getItems();
    if (items.length === 0) return;
    
    const currentIndex = items.findIndex(item => item.contains(document.activeElement) || item === document.activeElement);
    let nextIndex = currentIndex;
    
    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    
    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    // Wrapping
    if (wrap) {
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
    }
    
    if (nextIndex !== currentIndex && items[nextIndex]) {
      focusElement(items[nextIndex], { savePrevious: false });
    }
  }
  
  container.addEventListener('keydown', handleKeyDown);
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Macht Enter/Space auf einem Element klickbar
 * @param {HTMLElement} el 
 * @param {() => void} callback 
 */
export function makeClickable(el, callback) {
  // Fokussierbar machen
  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '0');
  }
  
  // Role für Screen Reader
  if (!el.hasAttribute('role')) {
    el.setAttribute('role', 'button');
  }
  
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  });
  
  el.addEventListener('click', callback);
}

// ============================================================================
// Skip Links
// ============================================================================

/**
 * Erstellt Skip-Links für bessere Navigation
 * @param {Array<{label: string, target: string}>} links 
 * @returns {HTMLElement}
 */
export function createSkipLinks(links) {
  const container = document.createElement('nav');
  container.className = 'amorph-skip-links';
  container.setAttribute('aria-label', 'Sprungmarken');
  
  for (const { label, target } of links) {
    const link = document.createElement('a');
    link.href = `#${target}`;
    link.className = 'amorph-skip-link';
    link.textContent = label;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(target);
      if (targetEl) {
        focusElement(targetEl);
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    container.appendChild(link);
  }
  
  return container;
}

// ============================================================================
// Accessibility CSS
// ============================================================================

const A11Y_STYLES = `
/* Screen-reader only content */
.amorph-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Skip Links */
.amorph-skip-links {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10000;
}

.amorph-skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  padding: 0.75rem 1rem;
  background: var(--bg-primary, #1a1a2e);
  color: var(--text-primary, #fff);
  text-decoration: none;
  border: 2px solid var(--accent, #4a90d9);
  border-radius: 4px;
  font-weight: bold;
}

.amorph-skip-link:focus {
  position: fixed;
  left: 1rem;
  top: 1rem;
  width: auto;
  height: auto;
  overflow: visible;
  outline: 3px solid var(--focus-ring, #4a90d9);
  outline-offset: 2px;
}

/* Focus Styles */
.amorph-focus-visible:focus,
[data-amorph-container] *:focus-visible {
  outline: 2px solid var(--focus-ring, #4a90d9);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .amorph-badge,
  .amorph-rating-star,
  .amorph-bar-fill {
    border: 2px solid currentColor;
  }
  
  [data-amorph-container] {
    --text-primary: #ffffff;
    --text-muted: #cccccc;
    --bg-primary: #000000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  [data-amorph-container] *,
  [data-amorph-container] *::before,
  [data-amorph-container] *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/**
 * Injiziert Accessibility-Styles
 */
export function injectA11yStyles() {
  if (document.getElementById('amorph-a11y-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'amorph-a11y-styles';
  style.textContent = A11Y_STYLES;
  document.head.appendChild(style);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialisiert Accessibility-Features
 * @param {HTMLElement} container - Hauptcontainer
 * @param {Object} options
 */
export function initAccessibility(container, options = {}) {
  injectA11yStyles();
  
  // Container als Hauptinhalt markieren
  if (!container.hasAttribute('role')) {
    container.setAttribute('role', 'main');
  }
  
  // Live-Region vorbereiten
  ensureLiveRegion();
  
  // Skip-Links hinzufügen (wenn nicht vorhanden)
  if (options.skipLinks !== false && !document.querySelector('.amorph-skip-links')) {
    const skipLinks = createSkipLinks([
      { label: 'Zum Hauptinhalt', target: container.id || 'main-content' },
      { label: 'Zur Suche', target: 'search' },
      { label: 'Zur Navigation', target: 'navigation' }
    ]);
    document.body.insertBefore(skipLinks, document.body.firstChild);
    
    // IDs setzen falls nicht vorhanden
    if (!container.id) container.id = 'main-content';
  }
  
  return {
    announce,
    announceResults,
    announceLoading,
    focusElement,
    saveFocus,
    restoreFocus
  };
}

// Auto-inject styles when module loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectA11yStyles);
  } else {
    injectA11yStyles();
  }
}

export default {
  setAria,
  setRole,
  labelRegion,
  connectLabel,
  connectDescription,
  announce,
  announceResults,
  announceLoading,
  saveFocus,
  restoreFocus,
  focusElement,
  isFocusable,
  getFocusableElements,
  createFocusTrap,
  setupArrowNavigation,
  makeClickable,
  createSkipLinks,
  initAccessibility,
  injectA11yStyles
};

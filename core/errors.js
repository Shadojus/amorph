/**
 * AMORPH Error Handling System
 * 
 * Zentrales Error-Management mit:
 * - Custom Error-Klassen
 * - Error Boundaries (Try-Catch Wrapper)
 * - Error Logging & Reporting
 * - Fallback UI
 */

import { debug } from '../observer/debug.js';

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base Error für alle AMORPH-Fehler
 */
export class AmorphError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'AmorphError';
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Fehler bei der Morph-Transformation
 */
export class MorphError extends AmorphError {
  constructor(morphName, message, context = {}) {
    super(`[${morphName}] ${message}`, context);
    this.name = 'MorphError';
    this.morphName = morphName;
  }
}

/**
 * Fehler bei der Typ-Erkennung
 */
export class DetectionError extends AmorphError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'DetectionError';
  }
}

/**
 * Fehler beim Laden von Daten
 */
export class DataError extends AmorphError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'DataError';
  }
}

/**
 * Fehler in der Konfiguration
 */
export class ConfigError extends AmorphError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'ConfigError';
  }
}

/**
 * Fehler bei Features
 */
export class FeatureError extends AmorphError {
  constructor(featureName, message, context = {}) {
    super(`[${featureName}] ${message}`, context);
    this.name = 'FeatureError';
    this.featureName = featureName;
  }
}

// ============================================================================
// Error Registry (für Tracking)
// ============================================================================

/** @type {AmorphError[]} */
const errorRegistry = [];
const MAX_ERRORS = 100;

/** @type {((error: AmorphError) => void)[]} */
const errorListeners = [];

/**
 * Registriert einen Fehler
 * @param {AmorphError} error 
 */
function registerError(error) {
  errorRegistry.push(error);
  
  // Limit errors in registry
  if (errorRegistry.length > MAX_ERRORS) {
    errorRegistry.shift();
  }
  
  // Notify listeners
  errorListeners.forEach(listener => {
    try {
      listener(error);
    } catch (e) {
      console.error('Error listener threw:', e);
    }
  });
  
  // Log to debug system
  debug.error(error.name, {
    message: error.message,
    context: error.context,
    stack: error.stack?.split('\n').slice(0, 5).join('\n')
  });
}

/**
 * Fügt einen Error-Listener hinzu
 * @param {(error: AmorphError) => void} listener 
 * @returns {() => void} Unsubscribe function
 */
export function onError(listener) {
  errorListeners.push(listener);
  return () => {
    const idx = errorListeners.indexOf(listener);
    if (idx > -1) errorListeners.splice(idx, 1);
  };
}

/**
 * Gibt alle registrierten Fehler zurück
 * @returns {AmorphError[]}
 */
export function getErrors() {
  return [...errorRegistry];
}

/**
 * Löscht alle registrierten Fehler
 */
export function clearErrors() {
  errorRegistry.length = 0;
}

// ============================================================================
// Error Boundary (Try-Catch Wrapper)
// ============================================================================

/**
 * Wrapped eine Funktion in einen Error-Boundary
 * @template T
 * @param {() => T} fn - Die auszuführende Funktion
 * @param {Object} options
 * @param {string} options.name - Name für Logging
 * @param {T} [options.fallback] - Fallback-Wert bei Fehler
 * @param {boolean} [options.rethrow=false] - Fehler erneut werfen?
 * @returns {T | undefined}
 */
export function errorBoundary(fn, { name = 'unknown', fallback = undefined, rethrow = false } = {}) {
  try {
    return fn();
  } catch (error) {
    const amorphError = error instanceof AmorphError 
      ? error 
      : new AmorphError(error.message, { originalError: error, boundary: name });
    
    registerError(amorphError);
    
    if (rethrow) throw amorphError;
    return fallback;
  }
}

/**
 * Async Error Boundary
 * @template T
 * @param {() => Promise<T>} fn
 * @param {Object} options
 * @param {string} options.name
 * @param {T} [options.fallback]
 * @param {boolean} [options.rethrow=false]
 * @returns {Promise<T | undefined>}
 */
export async function asyncErrorBoundary(fn, { name = 'unknown', fallback = undefined, rethrow = false } = {}) {
  try {
    return await fn();
  } catch (error) {
    const amorphError = error instanceof AmorphError 
      ? error 
      : new AmorphError(error.message, { originalError: error, boundary: name });
    
    registerError(amorphError);
    
    if (rethrow) throw amorphError;
    return fallback;
  }
}

/**
 * Decorator für Methoden mit Error-Boundary
 * @param {string} name 
 * @returns {MethodDecorator}
 */
export function withErrorBoundary(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      return errorBoundary(
        () => originalMethod.apply(this, args),
        { name: `${name}.${propertyKey}` }
      );
    };
    
    return descriptor;
  };
}

// ============================================================================
// Fallback UI
// ============================================================================

/**
 * Erstellt ein Fallback-Element für fehlgeschlagene Morphs
 * @param {string} morphName 
 * @param {*} value 
 * @param {Error} error 
 * @returns {HTMLElement}
 */
export function createMorphFallback(morphName, value, error) {
  const container = document.createElement('amorph-container');
  container.setAttribute('data-morph', morphName);
  container.setAttribute('data-error', 'true');
  container.className = 'amorph-error-fallback';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'amorph-fallback';
  
  // Icon
  const icon = document.createElement('span');
  icon.className = 'amorph-fallback-icon';
  icon.textContent = '⚠️';
  icon.setAttribute('aria-hidden', 'true');
  
  // Wert anzeigen (safe)
  const content = document.createElement('span');
  content.className = 'amorph-fallback-content';
  
  if (value === null || value === undefined) {
    content.textContent = '—';
  } else if (typeof value === 'object') {
    try {
      content.textContent = JSON.stringify(value).slice(0, 100);
    } catch {
      content.textContent = '[Object]';
    }
  } else {
    content.textContent = String(value).slice(0, 100);
  }
  
  wrapper.appendChild(icon);
  wrapper.appendChild(content);
  
  // Debug-Info (nur in Development)
  if (debug.isEnabled?.()) {
    const details = document.createElement('details');
    details.className = 'amorph-fallback-details';
    
    const summary = document.createElement('summary');
    summary.textContent = 'Error Details';
    
    const pre = document.createElement('pre');
    pre.textContent = `Morph: ${morphName}\nError: ${error.message}`;
    
    details.appendChild(summary);
    details.appendChild(pre);
    wrapper.appendChild(details);
  }
  
  container.appendChild(wrapper);
  return container;
}

/**
 * Erstellt eine globale Fehleranzeige
 * @param {AmorphError[]} errors 
 * @returns {HTMLElement}
 */
export function createErrorDisplay(errors) {
  const container = document.createElement('div');
  container.className = 'amorph-error-display';
  container.setAttribute('role', 'alert');
  container.setAttribute('aria-live', 'polite');
  
  const header = document.createElement('h3');
  header.textContent = `${errors.length} Fehler aufgetreten`;
  container.appendChild(header);
  
  const list = document.createElement('ul');
  list.className = 'amorph-error-list';
  
  errors.slice(0, 10).forEach(error => {
    const item = document.createElement('li');
    item.textContent = error.message;
    list.appendChild(item);
  });
  
  if (errors.length > 10) {
    const more = document.createElement('li');
    more.className = 'amorph-error-more';
    more.textContent = `... und ${errors.length - 10} weitere`;
    list.appendChild(more);
  }
  
  container.appendChild(list);
  
  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'amorph-error-clear';
  clearBtn.textContent = 'Fehler löschen';
  clearBtn.addEventListener('click', () => {
    clearErrors();
    container.remove();
  });
  container.appendChild(clearBtn);
  
  return container;
}

// ============================================================================
// Safe Morph Wrapper
// ============================================================================

/**
 * Wrapped einen Morph in einen Error-Boundary
 * @param {Function} morphFn - Original Morph-Funktion
 * @param {string} morphName - Name des Morphs
 * @returns {Function} Wrapped Morph
 */
export function safeMorph(morphFn, morphName) {
  return function(value, config, recursiveMorph) {
    return errorBoundary(
      () => morphFn(value, config, recursiveMorph),
      {
        name: `morph:${morphName}`,
        fallback: createMorphFallback(morphName, value, new Error('Morph failed'))
      }
    );
  };
}

/**
 * Wrapped alle Morphs in einem Objekt
 * @param {Record<string, Function>} morphs 
 * @returns {Record<string, Function>}
 */
export function wrapMorphs(morphs) {
  const wrapped = {};
  
  for (const [name, fn] of Object.entries(morphs)) {
    if (typeof fn === 'function') {
      wrapped[name] = safeMorph(fn, name);
    } else {
      wrapped[name] = fn;
    }
  }
  
  return wrapped;
}

// ============================================================================
// Global Error Handler
// ============================================================================

let globalHandlerInstalled = false;

/**
 * Installiert globale Error-Handler
 */
export function installGlobalErrorHandler() {
  if (globalHandlerInstalled) return;
  
  // Unhandled errors
  window.addEventListener('error', (event) => {
    const error = new AmorphError(event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'uncaught'
    });
    registerError(error);
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    const error = new AmorphError(message, {
      reason: event.reason,
      type: 'unhandledrejection'
    });
    registerError(error);
  });
  
  globalHandlerInstalled = true;
  debug.amorph('Global error handler installed');
}

// ============================================================================
// CSS für Fallbacks
// ============================================================================

const FALLBACK_STYLES = `
.amorph-fallback {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.25em 0.5em;
  background: rgba(255, 100, 100, 0.1);
  border: 1px dashed rgba(255, 100, 100, 0.3);
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--text-muted, #888);
}

.amorph-fallback-icon {
  font-size: 0.8em;
}

.amorph-fallback-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amorph-fallback-details {
  margin-top: 0.5em;
  font-size: 0.75em;
}

.amorph-fallback-details pre {
  margin: 0.25em 0;
  padding: 0.25em;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow-x: auto;
}

.amorph-error-display {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  max-width: 400px;
  padding: 1rem;
  background: rgba(40, 0, 0, 0.95);
  border: 1px solid rgba(255, 100, 100, 0.5);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85em;
  z-index: 10000;
  backdrop-filter: blur(10px);
}

.amorph-error-display h3 {
  margin: 0 0 0.5em;
  color: #ff6b6b;
}

.amorph-error-list {
  margin: 0;
  padding-left: 1.5em;
  max-height: 200px;
  overflow-y: auto;
}

.amorph-error-list li {
  margin-bottom: 0.25em;
}

.amorph-error-more {
  color: #888;
  font-style: italic;
}

.amorph-error-clear {
  margin-top: 0.75em;
  padding: 0.25em 0.75em;
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.amorph-error-clear:hover {
  background: rgba(255, 100, 100, 0.3);
}
`;

/**
 * Injiziert Fallback-Styles
 */
export function injectFallbackStyles() {
  if (document.getElementById('amorph-error-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'amorph-error-styles';
  style.textContent = FALLBACK_STYLES;
  document.head.appendChild(style);
}

// Auto-inject styles when module loads (if in browser)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFallbackStyles);
  } else {
    injectFallbackStyles();
  }
}

export default {
  AmorphError,
  MorphError,
  DetectionError,
  DataError,
  ConfigError,
  FeatureError,
  errorBoundary,
  asyncErrorBoundary,
  safeMorph,
  wrapMorphs,
  createMorphFallback,
  createErrorDisplay,
  onError,
  getErrors,
  clearErrors,
  installGlobalErrorHandler,
  injectFallbackStyles
};

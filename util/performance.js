/**
 * AMORPH Performance Utilities
 * 
 * Bietet:
 * - Lazy Loading für Morphs
 * - Virtual Scrolling
 * - Debounce/Throttle
 * - Intersection Observer Helpers
 * - Request Idle Callback Helpers
 */

// ============================================================================
// Debounce & Throttle
// ============================================================================

/**
 * Debounce - Führt Funktion erst nach Pause aus
 * @template T
 * @param {T} fn 
 * @param {number} delay - Verzögerung in ms
 * @returns {T & { cancel: () => void }}
 */
export function debounce(fn, delay = 150) {
  let timeoutId = null;
  
  const debounced = function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };
  
  return debounced;
}

/**
 * Throttle - Führt Funktion max. alle X ms aus
 * @template T
 * @param {T} fn 
 * @param {number} limit - Minimaler Abstand in ms
 * @returns {T}
 */
export function throttle(fn, limit = 100) {
  let inThrottle = false;
  let lastArgs = null;
  
  return function(...args) {
    if (inThrottle) {
      lastArgs = args;
      return;
    }
    
    fn.apply(this, args);
    inThrottle = true;
    
    setTimeout(() => {
      inThrottle = false;
      if (lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
}

// ============================================================================
// Lazy Loading
// ============================================================================

const morphCache = new Map();
const loadingPromises = new Map();

/**
 * Lädt einen Morph dynamisch
 * @param {string} morphName 
 * @returns {Promise<Function>}
 */
export async function loadMorph(morphName) {
  // Aus Cache
  if (morphCache.has(morphName)) {
    return morphCache.get(morphName);
  }
  
  // Bereits am Laden
  if (loadingPromises.has(morphName)) {
    return loadingPromises.get(morphName);
  }
  
  // Dynamisch laden
  const loadPromise = (async () => {
    try {
      // Primitive Morphs
      const module = await import(`../morphs/primitives/${morphName}/${morphName}.js`);
      const morph = module[morphName] || module.default;
      
      if (typeof morph === 'function') {
        morphCache.set(morphName, morph);
        return morph;
      }
      
      throw new Error(`Morph ${morphName} not found in module`);
    } catch (e) {
      // Fallback: Compare Morphs
      try {
        const module = await import(`../morphs/compare/primitives/${morphName}/${morphName}.js`);
        const morph = module[morphName] || module.default;
        
        if (typeof morph === 'function') {
          morphCache.set(morphName, morph);
          return morph;
        }
      } catch {
        // Nicht gefunden
      }
      
      console.warn(`Lazy load failed for morph: ${morphName}`, e);
      return null;
    } finally {
      loadingPromises.delete(morphName);
    }
  })();
  
  loadingPromises.set(morphName, loadPromise);
  return loadPromise;
}

/**
 * Vorlädt mehrere Morphs
 * @param {string[]} morphNames 
 */
export async function preloadMorphs(morphNames) {
  await Promise.all(morphNames.map(name => loadMorph(name)));
}

/**
 * Löscht den Morph-Cache
 */
export function clearMorphCache() {
  morphCache.clear();
}

// ============================================================================
// Virtual Scrolling
// ============================================================================

/**
 * Virtualisiert eine Liste für bessere Performance
 * @param {Object} options
 * @param {HTMLElement} options.container - Scroll-Container
 * @param {Array} options.items - Alle Items
 * @param {number} options.itemHeight - Höhe eines Items in px
 * @param {number} [options.overscan=5] - Extra Items oben/unten
 * @param {(item: any, index: number) => HTMLElement} options.renderItem
 * @returns {{ update: (items: Array) => void, destroy: () => void }}
 */
export function virtualList(options) {
  const {
    container,
    items: initialItems,
    itemHeight,
    overscan = 5,
    renderItem
  } = options;
  
  let items = initialItems;
  let scrollTop = 0;
  let containerHeight = 0;
  
  // Wrapper für virtuellen Bereich
  const viewport = document.createElement('div');
  viewport.className = 'amorph-virtual-viewport';
  viewport.style.cssText = 'overflow-y: auto; height: 100%;';
  
  // Spacer für Gesamthöhe
  const spacer = document.createElement('div');
  spacer.className = 'amorph-virtual-spacer';
  
  // Content-Bereich
  const content = document.createElement('div');
  content.className = 'amorph-virtual-content';
  content.style.cssText = 'position: relative;';
  
  viewport.appendChild(spacer);
  viewport.appendChild(content);
  container.appendChild(viewport);
  
  function render() {
    const totalHeight = items.length * itemHeight;
    spacer.style.height = `${totalHeight}px`;
    
    containerHeight = viewport.clientHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    // Clear content
    content.innerHTML = '';
    content.style.transform = `translateY(${startIndex * itemHeight}px)`;
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const itemEl = renderItem(items[i], i);
      itemEl.style.height = `${itemHeight}px`;
      content.appendChild(itemEl);
    }
  }
  
  const handleScroll = throttle(() => {
    scrollTop = viewport.scrollTop;
    render();
  }, 16); // ~60fps
  
  const handleResize = debounce(() => {
    containerHeight = viewport.clientHeight;
    render();
  }, 100);
  
  viewport.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  
  // Initial render
  render();
  
  return {
    update(newItems) {
      items = newItems;
      render();
    },
    
    scrollToIndex(index) {
      viewport.scrollTop = index * itemHeight;
    },
    
    destroy() {
      viewport.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      container.removeChild(viewport);
    }
  };
}

// ============================================================================
// Intersection Observer Helpers
// ============================================================================

/**
 * Führt Callback aus wenn Element sichtbar wird
 * @param {HTMLElement} element 
 * @param {(entry: IntersectionObserverEntry) => void} callback 
 * @param {Object} [options]
 * @returns {() => void} Cleanup function
 */
export function onVisible(element, callback, options = {}) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        callback(entry);
        if (options.once !== false) {
          observer.unobserve(element);
        }
      }
    }
  }, {
    threshold: options.threshold || 0,
    rootMargin: options.rootMargin || '50px'
  });
  
  observer.observe(element);
  
  return () => observer.disconnect();
}

/**
 * Lazy-lädt Bilder wenn sie sichtbar werden
 * @param {HTMLElement} container 
 * @param {string} [selector='img[data-src]']
 */
export function lazyLoadImages(container, selector = 'img[data-src]') {
  const images = container.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = /** @type {HTMLImageElement} */ (entry.target);
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    }
  }, {
    rootMargin: '100px'
  });
  
  images.forEach(img => observer.observe(img));
  
  return () => observer.disconnect();
}

// ============================================================================
// Request Idle Callback
// ============================================================================

/**
 * Führt Arbeit aus wenn Browser idle ist
 * @param {() => void} callback 
 * @param {Object} [options]
 * @param {number} [options.timeout=1000] - Max Wartezeit
 * @returns {number} - ID zum Canceln
 */
export function whenIdle(callback, options = {}) {
  const { timeout = 1000 } = options;
  
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout });
  }
  
  // Fallback für Safari
  return setTimeout(callback, 1);
}

/**
 * Führt eine Liste von Tasks im Idle aus
 * @param {Array<() => void>} tasks 
 * @param {Object} [options]
 * @param {number} [options.deadline=50] - Max ms pro Chunk
 */
export function idleQueue(tasks, options = {}) {
  const { deadline = 50 } = options;
  const queue = [...tasks];
  
  function processTasks(idleDeadline) {
    while (queue.length > 0) {
      // Check if we have time left
      const timeRemaining = 'timeRemaining' in idleDeadline 
        ? idleDeadline.timeRemaining()
        : deadline;
      
      if (timeRemaining < 1) {
        // Reschedule remaining tasks
        whenIdle(processTasks);
        return;
      }
      
      const task = queue.shift();
      task();
    }
  }
  
  whenIdle(processTasks);
}

// ============================================================================
// Render Batching
// ============================================================================

let batchQueue = [];
let batchScheduled = false;

/**
 * Batcht DOM-Updates für bessere Performance
 * @param {() => void} update 
 */
export function batchUpdate(update) {
  batchQueue.push(update);
  
  if (!batchScheduled) {
    batchScheduled = true;
    requestAnimationFrame(() => {
      const updates = batchQueue;
      batchQueue = [];
      batchScheduled = false;
      
      for (const fn of updates) {
        fn();
      }
    });
  }
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Erstellt einen Object-Pool für Wiederverwendung
 * @template T
 * @param {() => T} factory - Erstellt neues Objekt
 * @param {(obj: T) => void} [reset] - Setzt Objekt zurück
 * @param {number} [maxSize=100]
 * @returns {{ get: () => T, release: (obj: T) => void, clear: () => void }}
 */
export function createPool(factory, reset = () => {}, maxSize = 100) {
  const pool = [];
  
  return {
    get() {
      if (pool.length > 0) {
        return pool.pop();
      }
      return factory();
    },
    
    release(obj) {
      if (pool.length < maxSize) {
        reset(obj);
        pool.push(obj);
      }
    },
    
    clear() {
      pool.length = 0;
    }
  };
}

/**
 * Erstellt einen DOM-Element-Pool
 * @param {string} tagName 
 * @param {number} [maxSize=50]
 */
export function createElementPool(tagName, maxSize = 50) {
  return createPool(
    () => document.createElement(tagName),
    (el) => {
      el.className = '';
      el.removeAttribute('style');
      el.textContent = '';
      // Remove all attributes
      while (el.attributes.length > 0) {
        el.removeAttribute(el.attributes[0].name);
      }
    },
    maxSize
  );
}

// ============================================================================
// Performance Monitoring
// ============================================================================

const performanceMarks = new Map();

/**
 * Startet eine Performance-Messung
 * @param {string} name 
 */
export function perfStart(name) {
  performanceMarks.set(name, performance.now());
}

/**
 * Beendet eine Performance-Messung
 * @param {string} name 
 * @returns {number} - Dauer in ms
 */
export function perfEnd(name) {
  const start = performanceMarks.get(name);
  if (!start) return 0;
  
  const duration = performance.now() - start;
  performanceMarks.delete(name);
  
  return duration;
}

/**
 * Misst die Ausführungszeit einer Funktion
 * @template T
 * @param {string} name 
 * @param {() => T} fn 
 * @returns {T}
 */
export function measure(name, fn) {
  perfStart(name);
  try {
    return fn();
  } finally {
    const duration = perfEnd(name);
    console.debug(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Async Version von measure
 * @template T
 * @param {string} name 
 * @param {() => Promise<T>} fn 
 * @returns {Promise<T>}
 */
export async function measureAsync(name, fn) {
  perfStart(name);
  try {
    return await fn();
  } finally {
    const duration = perfEnd(name);
    console.debug(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
  }
}

// ============================================================================
// CSS
// ============================================================================

const PERF_STYLES = `
.amorph-virtual-viewport {
  position: relative;
  overflow-y: auto;
  contain: strict;
}

.amorph-virtual-spacer {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  pointer-events: none;
}

.amorph-virtual-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

/* GPU acceleration for animated elements */
.amorph-gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Contain paint for isolated components */
.amorph-contained {
  contain: content;
}
`;

/**
 * Injiziert Performance-Styles
 */
export function injectPerfStyles() {
  if (document.getElementById('amorph-perf-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'amorph-perf-styles';
  style.textContent = PERF_STYLES;
  document.head.appendChild(style);
}

// Auto-inject
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPerfStyles);
  } else {
    injectPerfStyles();
  }
}

export default {
  debounce,
  throttle,
  loadMorph,
  preloadMorphs,
  clearMorphCache,
  virtualList,
  onVisible,
  lazyLoadImages,
  whenIdle,
  idleQueue,
  batchUpdate,
  createPool,
  createElementPool,
  perfStart,
  perfEnd,
  measure,
  measureAsync,
  injectPerfStyles
};

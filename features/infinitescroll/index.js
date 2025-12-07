/**
 * Infinite Scroll Feature
 * 
 * Lädt automatisch weitere Items wenn der User ans Ende scrollt.
 * Nutzt IntersectionObserver für Performance.
 */

import { debug } from '../../observer/debug.js';
import { transform } from '../../core/pipeline.js';

// Config
const DEFAULT_BATCH_SIZE = 12;
const TRIGGER_THRESHOLD = 200; // Pixel vor Ende

export default function init(ctx) {
  debug.features('Infinite Scroll Feature Init');
  
  // State
  let currentOffset = 0;
  let isLoading = false;
  let hasMore = true;
  let currentQuery = '';
  
  // Sentinel-Element für IntersectionObserver
  const sentinel = document.createElement('div');
  sentinel.className = 'amorph-scroll-sentinel-bottom';
  sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none;';
  
  // Loading-Indicator
  const loader = document.createElement('div');
  loader.className = 'amorph-infinite-loader';
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <span class="loader-text">Lade weitere...</span>
  `;
  loader.style.display = 'none';
  
  // Container finden
  const container = document.querySelector('[data-amorph-container]');
  if (!container) {
    debug.fehler('Infinite Scroll: Container nicht gefunden');
    return;
  }
  
  container.appendChild(loader);
  container.appendChild(sentinel);
  
  // IntersectionObserver für Infinite Scroll
  const observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    
    if (entry.isIntersecting && hasMore && !isLoading) {
      await loadMore();
    }
  }, {
    root: null,
    rootMargin: `${TRIGGER_THRESHOLD}px`,
    threshold: 0
  });
  
  observer.observe(sentinel);
  
  /**
   * Weitere Items laden
   */
  async function loadMore() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    loader.style.display = 'flex';
    
    try {
      const result = await ctx.dataSource?.loadMore?.(currentOffset, DEFAULT_BATCH_SIZE);
      
      if (!result || !result.items?.length) {
        hasMore = false;
        loader.style.display = 'none';
        debug.features('Infinite Scroll: Keine weiteren Items');
        return;
      }
      
      const { items, hasMore: more } = result;
      hasMore = more;
      currentOffset += items.length;
      
      // Items rendern und anhängen
      const fragment = transform(items, ctx.config);
      
      // Vor dem Sentinel einfügen
      sentinel.parentNode.insertBefore(fragment, sentinel);
      
      debug.features('Infinite Scroll: Items geladen', { 
        neu: items.length, 
        offset: currentOffset, 
        hasMore 
      });
      
      // Event dispatchen für Highlights etc.
      container.dispatchEvent(new CustomEvent('amorph:items-loaded', {
        detail: { items, offset: currentOffset, hasMore }
      }));
      
    } catch (error) {
      debug.fehler('Infinite Scroll Fehler', error);
    } finally {
      isLoading = false;
      loader.style.display = 'none';
    }
  }
  
  /**
   * Reset bei neuer Suche
   */
  function reset(query) {
    currentOffset = DEFAULT_BATCH_SIZE; // Erste Seite wurde schon geladen
    hasMore = true;
    currentQuery = query || '';
    debug.features('Infinite Scroll: Reset', { query: currentQuery, offset: currentOffset });
  }
  
  // Bei Suche resetten
  document.addEventListener('header:suche:ergebnisse', (e) => {
    const total = ctx.dataSource?.getTotalCount?.() || 0;
    const initialBatch = DEFAULT_BATCH_SIZE;
    
    reset(e.detail?.query);
    hasMore = total > initialBatch;
    
    debug.features('Infinite Scroll: Nach Suche', { total, hasMore });
  });
  
  // Bei Ansicht-Wechsel deaktivieren (Vergleich braucht kein Infinite Scroll)
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'vergleich') {
      observer.unobserve(sentinel);
      sentinel.style.display = 'none';
    } else {
      observer.observe(sentinel);
      sentinel.style.display = '';
    }
  });
  
  // Cleanup
  ctx.on('destroy', () => {
    observer.disconnect();
    sentinel.remove();
    loader.remove();
  });
  
  return { reset, loadMore };
}

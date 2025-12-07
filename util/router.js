/**
 * Router - Einfaches Client-Side Routing
 * 
 * Unterstützt:
 * - /             → Liste (Hauptansicht)
 * - /:slug        → Einzelansicht
 * - ?suche=...    → Suchparameter
 * - ?perspektiven=... → Perspektiven-Parameter
 */

import { debug } from '../observer/debug.js';

const routes = {
  liste: /^\/$/, 
  einzelansicht: /^\/([^/?]+)\/?$/
};/**
 * Aktuellen Pfad parsen
 * @returns {{ route: string, params: Object, query: Object }}
 */
export function parseRoute() {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Query-Parameter extrahieren
  const query = {
    suche: searchParams.get('suche') || '',
    perspektiven: searchParams.get('perspektiven')?.split(',').filter(Boolean) || []
  };
  
  // Route matchen
  const einzelMatch = path.match(routes.einzelansicht);
  if (einzelMatch) {
    return {
      route: 'einzelansicht',
      params: { slug: einzelMatch[1] },
      query
    };
  }
  
  // Standard: Liste
  return {
    route: 'liste',
    params: {},
    query
  };
}

/**
 * Navigation zu Route
 * @param {string} route - 'liste' oder 'einzelansicht'
 * @param {Object} params - Route-Parameter (z.B. { slug: 'steinpilz' })
 * @param {Object} query - Query-Parameter
 */
export function navigateTo(route, params = {}, query = {}) {
  let path = '/';
  
  if (route === 'einzelansicht' && params.slug) {
    path = `/${params.slug}`;
  }
  
  // Query-String aufbauen
  const searchParams = new URLSearchParams();
  if (query.suche) searchParams.set('suche', query.suche);
  if (query.perspektiven?.length) searchParams.set('perspektiven', query.perspektiven.join(','));
  
  const queryString = searchParams.toString();
  const url = queryString ? `${path}?${queryString}` : path;
  
  debug.features('Router: Navigation', { route, params, query, url });
  
  window.history.pushState({ route, params, query }, '', url);
  window.dispatchEvent(new CustomEvent('amorph:route-change', {
    detail: { route, params, query }
  }));
}

/**
 * URL-State aktualisieren ohne Navigation
 * @param {Object} query - Query-Parameter zum Aktualisieren
 */
export function updateQueryState(query) {
  const current = parseRoute();
  const merged = { ...current.query, ...query };
  
  // Leere Werte entfernen
  Object.keys(merged).forEach(key => {
    if (!merged[key] || (Array.isArray(merged[key]) && !merged[key].length)) {
      delete merged[key];
    }
  });
  
  const searchParams = new URLSearchParams();
  if (merged.suche) searchParams.set('suche', merged.suche);
  if (merged.perspektiven?.length) searchParams.set('perspektiven', merged.perspektiven.join(','));
  
  const queryString = searchParams.toString();
  const url = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  
  window.history.replaceState(null, '', url);
  debug.features('Router: Query Update', merged);
}

/**
 * Zurück navigieren
 */
export function goBack() {
  window.history.back();
}

/**
 * Router initialisieren
 * @param {Function} onChange - Callback bei Route-Änderung
 */
export function initRouter(onChange) {
  // Initiale Route
  const initial = parseRoute();
  debug.features('Router: Init', initial);
  onChange(initial);
  
  // Browser Back/Forward
  window.addEventListener('popstate', () => {
    const current = parseRoute();
    debug.features('Router: Popstate', current);
    onChange(current);
  });
  
  // Custom Navigation Events
  window.addEventListener('amorph:route-change', (e) => {
    onChange(e.detail);
  });
}

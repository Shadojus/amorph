import { debug } from '../observer/debug.js';

// === SESSION MANAGEMENT ===

export function getSession() {
  const cookie = document.cookie
    .split('; ')
    .find(c => c.startsWith('amorph_session='));
  
  if (cookie) {
    const id = cookie.split('=')[1];
    debug.session('Session found (Cookie)', { id });
    return { id, source: 'cookie' };
  }
  
  try {
    const stored = sessionStorage.getItem('amorph_session');
    if (stored) {
      debug.session('Session found (Storage)', { id: stored });
      return { id: stored, source: 'storage' };
    }
  } catch {}
  
  debug.session('No session found');
  return null;
}

export function createSession() {
  const id = crypto.randomUUID();
  debug.session('New session created', { id });
  document.cookie = `amorph_session=${id}; path=/; SameSite=Strict; max-age=86400`;
  return { id, source: 'cookie' };
}

export function clearSession() {
  debug.session('Session deleted');
  document.cookie = 'amorph_session=; path=/; max-age=0';
  try {
    sessionStorage.removeItem('amorph_session');
  } catch {}
}

// === URL-STATE MANAGEMENT ===

const STATE_KEY = 'amorph_state';

/**
 * Liest State aus URL-Parametern
 * @returns {{ suche: string, perspektiven: string[], ansicht: string }}
 */
export function getUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    suche: params.get('suche') || '',
    perspektiven: params.get('perspektiven')?.split(',').filter(Boolean) || [],
    ansicht: params.get('ansicht') || 'karten'
  };
}

/**
 * Schreibt State in URL-Parameter (ohne Page Reload)
 * @param {Object} state - Zu speichernder State
 */
export function setUrlState(state) {
  const params = new URLSearchParams(window.location.search);
  
  // Suche
  if (state.suche) {
    params.set('suche', state.suche);
  } else {
    params.delete('suche');
  }
  
  // Perspektiven
  if (state.perspektiven?.length) {
    params.set('perspektiven', state.perspektiven.join(','));
  } else {
    params.delete('perspektiven');
  }
  
  // Ansicht
  if (state.ansicht && state.ansicht !== 'karten') {
    params.set('ansicht', state.ansicht);
  } else {
    params.delete('ansicht');
  }
  
  // URL aktualisieren ohne Reload
  const newUrl = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  
  window.history.replaceState(null, '', newUrl);
  debug.session('URL state updated', state);
}

// === LOCALSTORAGE PERSISTENCE ===

/**
 * Saves last search to LocalStorage
 * @param {string} query - Search term
 */
export function saveLastSearch(query) {
  if (!query?.trim()) return;
  
  try {
    const history = getSearchHistory();
    // Remove duplicates and insert at front
    const filtered = history.filter(q => q !== query);
    filtered.unshift(query);
    // Max 10 entries
    localStorage.setItem('amorph_search_history', JSON.stringify(filtered.slice(0, 10)));
    debug.session('Search saved', { query });
  } catch (e) {
    debug.error('LocalStorage error', e);
  }
}

/**
 * Holt Suchverlauf aus LocalStorage
 * @returns {string[]}
 */
export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('amorph_search_history') || '[]');
  } catch {
    return [];
  }
}

/**
 * Holt letzte Suche aus LocalStorage
 * @returns {string|null}
 */
export function getLastSearch() {
  const history = getSearchHistory();
  return history[0] || null;
}

/**
 * Saves active perspectives
 * @param {string[]} perspektiven - Array of perspective IDs
 */
export function savePerspektiven(perspektiven) {
  try {
    localStorage.setItem('amorph_perspektiven', JSON.stringify(perspektiven || []));
    debug.session('Perspectives saved', { perspektiven });
  } catch (e) {
    debug.error('LocalStorage error', e);
  }
}

/**
 * Holt gespeicherte Perspektiven
 * @returns {string[]}
 */
export function getSavedPerspektiven() {
  try {
    return JSON.parse(localStorage.getItem('amorph_perspektiven') || '[]');
  } catch {
    return [];
  }
}

/**
 * Saves selection (for session restore)
 * @param {Map} auswahl - Selection map from views
 */
export function saveAuswahl(auswahl) {
  try {
    const data = Array.from(auswahl.entries()).map(([key, value]) => ({
      key,
      pilzId: value.pilzId,
      feldName: value.feldName
    }));
    sessionStorage.setItem('amorph_auswahl', JSON.stringify(data));
    debug.session('Selection saved', { count: data.length });
  } catch (e) {
    debug.error('SessionStorage error', e);
  }
}

/**
 * Holt gespeicherte Auswahl
 * @returns {Array<{key: string, pilzId: string, feldName: string}>}
 */
export function getSavedAuswahl() {
  try {
    return JSON.parse(sessionStorage.getItem('amorph_auswahl') || '[]');
  } catch {
    return [];
  }
}


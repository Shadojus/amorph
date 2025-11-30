import { debug } from '../observer/debug.js';

export function getSession() {
  const cookie = document.cookie
    .split('; ')
    .find(c => c.startsWith('amorph_session='));
  
  if (cookie) {
    const id = cookie.split('=')[1];
    debug.session('Session gefunden (Cookie)', { id });
    return { id, source: 'cookie' };
  }
  
  try {
    const stored = sessionStorage.getItem('amorph_session');
    if (stored) {
      debug.session('Session gefunden (Storage)', { id: stored });
      return { id: stored, source: 'storage' };
    }
  } catch {}
  
  debug.session('Keine Session gefunden');
  return null;
}

export function createSession() {
  const id = crypto.randomUUID();
  debug.session('Neue Session erstellt', { id });
  document.cookie = `amorph_session=${id}; path=/; SameSite=Strict; max-age=86400`;
  return { id, source: 'cookie' };
}

export function clearSession() {
  debug.session('Session gelöscht');
  document.cookie = 'amorph_session=; path=/; max-age=0';
  try {
    sessionStorage.removeItem('amorph_session');
  } catch {}
}

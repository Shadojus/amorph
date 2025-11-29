export function getSession() {
  const cookie = document.cookie
    .split('; ')
    .find(c => c.startsWith('amorph_session='));
  
  if (cookie) {
    return { id: cookie.split('=')[1], source: 'cookie' };
  }
  
  try {
    const stored = sessionStorage.getItem('amorph_session');
    if (stored) {
      return { id: stored, source: 'storage' };
    }
  } catch {}
  
  return null;
}

export function createSession() {
  const id = crypto.randomUUID();
  document.cookie = `amorph_session=${id}; path=/; SameSite=Strict; max-age=86400`;
  return { id, source: 'cookie' };
}

export function clearSession() {
  document.cookie = 'amorph_session=; path=/; max-age=0';
  try {
    sessionStorage.removeItem('amorph_session');
  } catch {}
}

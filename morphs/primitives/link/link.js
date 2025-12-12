import { debug } from '../../../observer/debug.js';

export function link(wert, config = {}) {
  const el = document.createElement('a');
  el.className = 'amorph-link';
  
  const url = typeof wert === 'string' ? wert : wert?.url || wert?.href;
  const text = typeof wert === 'string' ? wert : wert?.text || wert?.label || url;
  debug.morphs('link', { url: url?.slice(0, 50) });
  
  if (url && isValidUrl(url)) {
    el.href = url;
    el.textContent = text;
    
    if (isExternal(url)) {
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  } else {
    el.textContent = text;
    el.removeAttribute('href');
    el.setAttribute('data-invalid', 'true');
  }
  
  return el;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isExternal(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}

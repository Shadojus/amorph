import { debug } from '../observer/debug.js';

export function image(wert, config = {}) {
  const el = document.createElement('figure');
  el.className = 'amorph-image';
  
  const img = document.createElement('img');
  const src = typeof wert === 'string' ? wert : wert?.url || wert?.src;
  debug.morphs('image', { src: src?.slice(0, 50) });
  
  if (src && isAllowedUrl(src, config.erlaubteDomains)) {
    img.src = src;
    img.alt = (typeof wert === 'object' ? wert.alt : null) || config.alt || '';
    img.loading = 'lazy';
  } else {
    img.alt = 'Bild nicht verfügbar';
    el.setAttribute('data-error', 'invalid-url');
  }
  
  el.appendChild(img);
  
  const caption = typeof wert === 'object' ? wert.caption : null;
  if (caption || config.caption) {
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = caption || config.caption;
    el.appendChild(figcaption);
  }
  
  return el;
}

function isAllowedUrl(url, erlaubteDomains) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (erlaubteDomains && erlaubteDomains.length > 0) {
      return erlaubteDomains.some(d => parsed.hostname.endsWith(d));
    }
    return true;
  } catch {
    return false;
  }
}

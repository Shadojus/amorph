import { debug } from '../../observer/debug.js';

export default function init(ctx) {
  debug.perspektiven('Config', ctx.config);
  
  const perspektiven = ctx.config.liste || [];
  const maxAktiv = ctx.config.maxAktiv || 4;
  let aktiv = new Set();
  
  debug.perspektiven('Liste', perspektiven);
  
  if (perspektiven.length === 0) {
    debug.warn('Keine Perspektiven konfiguriert!');
    return;
  }
  
  const nav = document.createElement('nav');
  nav.className = 'amorph-perspektiven';
  nav.setAttribute('role', 'toolbar');
  
  for (const p of perspektiven) {
    const btn = document.createElement('button');
    btn.className = 'amorph-perspektive-btn';
    btn.dataset.perspektive = p.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = `${p.symbol || ''} ${p.name}`.trim();
    
    if (p.farbe) {
      btn.style.setProperty('--p-farbe', p.farbe);
    }
    
    btn.addEventListener('click', () => toggle(p.id, btn));
    nav.appendChild(btn);
  }
  
  function toggle(id, btn) {
    if (aktiv.has(id)) {
      aktiv.delete(id);
      btn.setAttribute('aria-pressed', 'false');
      btn.classList.remove('aktiv');
    } else {
      if (aktiv.size >= maxAktiv) {
        const erste = aktiv.values().next().value;
        aktiv.delete(erste);
        nav.querySelector(`[data-perspektive="${erste}"]`)?.classList.remove('aktiv');
      }
      aktiv.add(id);
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('aktiv');
    }
    anwenden();
  }
  
  function anwenden() {
    const container = document.querySelector('[data-amorph-container]');
    if (!container) return;
    
    for (const p of perspektiven) {
      container.classList.remove(`perspektive-${p.id}`);
    }
    for (const id of aktiv) {
      container.classList.add(`perspektive-${id}`);
    }
    
    ctx.emit('geaendert', { aktiv: Array.from(aktiv) });
  }
  
  ctx.dom.appendChild(nav);
  ctx.mount('afterbegin');
}

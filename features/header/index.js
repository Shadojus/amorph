/**
 * Header Feature
 * Kombiniert Suche + Perspektiven in einem Container
 * Steuert die Interaktion zwischen beiden
 */

import { debug } from '../../observer/debug.js';
import { header as headerMorph } from '../../morphs/header.js';

export default function init(ctx) {
  debug.features('Header Feature Init');
  
  // Config aus features.suche und features.perspektiven zusammenbauen
  const headerConfig = {
    suche: ctx.config.suche || {},
    perspektiven: ctx.config.perspektiven || {}
  };
  
  debug.features('Header Config', headerConfig);
  
  // Header-Morph in amorph-container wrappen
  const container = document.createElement('amorph-container');
  container.setAttribute('data-morph', 'header');
  container.setAttribute('data-field', 'header');
  
  const headerEl = headerMorph(headerConfig);
  container.appendChild(headerEl);
  
  // Elemente finden
  const sucheForm = headerEl.querySelector('.amorph-suche');
  const input = sucheForm?.querySelector('input');
  const button = sucheForm?.querySelector('button');
  const perspektivenNav = headerEl.querySelector('.amorph-perspektiven');
  const perspektivenBtns = perspektivenNav?.querySelectorAll('.amorph-perspektive-btn');
  
  // Perspektiven State
  const maxAktiv = parseInt(perspektivenNav?.dataset.maxAktiv || '4');
  let aktivePerspektiven = new Set();
  let letzteSuchergebnisse = [];
  
  // === SUCHE LOGIK ===
  async function suchen() {
    const query = input?.value.trim() || '';
    
    sucheForm?.classList.add('ladend');
    
    try {
      debug.suche('Suche', { query });
      
      // ctx.search führt die Suche aus UND rendert die Ergebnisse
      const ergebnisse = await ctx.search(query);
      letzteSuchergebnisse = ergebnisse || [];
      
      debug.suche('Ergebnisse', { anzahl: letzteSuchergebnisse.length });
      
      // Auto-Perspektiven aktivieren basierend auf Ergebnissen
      if (letzteSuchergebnisse.length > 0) {
        autoPerspektiven(letzteSuchergebnisse);
      }
      
      // Perspektiven anwenden nach Render
      setTimeout(() => anwendenPerspektiven(), 50);
      
      ctx.emit('suche:ergebnisse', { query, ergebnisse: letzteSuchergebnisse });
      
    } catch (e) {
      debug.fehler('Suchfehler', e);
    } finally {
      sucheForm?.classList.remove('ladend');
    }
  }
  
  if (input && button) {
    button.addEventListener('click', suchen);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        suchen();
      }
      if (e.key === 'Escape') {
        input.value = '';
      }
    });
    
    // Live-Suche
    if (headerConfig.suche.live) {
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(suchen, headerConfig.suche.debounce || 300);
      });
    }
  }
  
  // === PERSPEKTIVEN LOGIK ===
  function togglePerspektive(id, btn) {
    debug.perspektiven('Toggle', { id, warAktiv: aktivePerspektiven.has(id) });
    
    if (aktivePerspektiven.has(id)) {
      aktivePerspektiven.delete(id);
      btn.setAttribute('aria-pressed', 'false');
      btn.classList.remove('aktiv');
    } else {
      // Max erreicht?
      if (aktivePerspektiven.size >= maxAktiv) {
        const erste = aktivePerspektiven.values().next().value;
        aktivePerspektiven.delete(erste);
        perspektivenNav?.querySelector(`[data-perspektive="${erste}"]`)?.classList.remove('aktiv');
        perspektivenNav?.querySelector(`[data-perspektive="${erste}"]`)?.setAttribute('aria-pressed', 'false');
      }
      
      aktivePerspektiven.add(id);
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('aktiv');
    }
    
    anwendenPerspektiven();
  }
  
  function anwendenPerspektiven() {
    const appContainer = document.querySelector('[data-amorph-container]');
    if (!appContainer) return;
    
    const liste = headerConfig.perspektiven.liste || [];
    
    // Alle Perspektiv-Klassen entfernen
    for (const p of liste) {
      appContainer.classList.remove(`perspektive-${p.id}`);
    }
    
    // Wenn keine Perspektive aktiv → Klasse entfernen (alle sichtbar)
    if (aktivePerspektiven.size === 0) {
      appContainer.classList.remove('perspektiven-aktiv');
      debug.perspektiven('Keine aktiv - alle Felder sichtbar');
    } else {
      // Perspektiven aktiv → nur relevante Felder zeigen
      appContainer.classList.add('perspektiven-aktiv');
      
      for (const id of aktivePerspektiven) {
        appContainer.classList.add(`perspektive-${id}`);
      }
      
      debug.perspektiven('Aktiv', Array.from(aktivePerspektiven));
    }
    
    ctx.emit('perspektiven:geaendert', { aktiv: Array.from(aktivePerspektiven) });
  }
  
  function setPerspektive(id, aktiv) {
    const btn = perspektivenNav?.querySelector(`[data-perspektive="${id}"]`);
    if (!btn) return;
    
    if (aktiv && !aktivePerspektiven.has(id)) {
      if (aktivePerspektiven.size >= maxAktiv) {
        const erste = aktivePerspektiven.values().next().value;
        aktivePerspektiven.delete(erste);
        const ersteBtn = perspektivenNav?.querySelector(`[data-perspektive="${erste}"]`);
        ersteBtn?.classList.remove('aktiv');
        ersteBtn?.setAttribute('aria-pressed', 'false');
      }
      aktivePerspektiven.add(id);
      btn.classList.add('aktiv');
      btn.setAttribute('aria-pressed', 'true');
    } else if (!aktiv && aktivePerspektiven.has(id)) {
      aktivePerspektiven.delete(id);
      btn.classList.remove('aktiv');
      btn.setAttribute('aria-pressed', 'false');
    }
  }
  
  // Auto-Perspektiven: Aktiviere Perspektiven die zu den Ergebnissen passen
  function autoPerspektiven(ergebnisse) {
    const liste = headerConfig.perspektiven.liste || [];
    const gefunden = new Map(); // id -> anzahl Treffer
    
    for (const p of liste) {
      const felder = p.felder || [];
      let treffer = 0;
      
      // Zähle wie viele Ergebnisse Daten für diese Perspektive haben
      for (const item of ergebnisse) {
        const hatDaten = felder.some(feld => 
          item[feld] !== undefined && item[feld] !== null && item[feld] !== ''
        );
        if (hatDaten) treffer++;
      }
      
      if (treffer > 0) {
        gefunden.set(p.id, treffer);
      }
    }
    
    debug.perspektiven('Auto-Erkennung', Object.fromEntries(gefunden));
    
    // Beste 1-2 Perspektiven automatisch aktivieren
    if (gefunden.size > 0) {
      // Nach Treffer-Anzahl sortieren
      const sortiert = [...gefunden.entries()].sort((a, b) => b[1] - a[1]);
      const beste = sortiert.slice(0, 2).map(([id]) => id);
      
      // Alle deaktivieren
      for (const id of aktivePerspektiven) {
        const btn = perspektivenNav?.querySelector(`[data-perspektive="${id}"]`);
        btn?.classList.remove('aktiv');
        btn?.setAttribute('aria-pressed', 'false');
      }
      aktivePerspektiven.clear();
      
      // Beste aktivieren
      for (const id of beste) {
        setPerspektive(id, true);
      }
      
      debug.perspektiven('Auto-aktiviert', beste);
    }
  }
  
  // Event-Listener für Perspektiven-Buttons
  if (perspektivenBtns) {
    for (const btn of perspektivenBtns) {
      btn.addEventListener('click', () => {
        togglePerspektive(btn.dataset.perspektive, btn);
      });
    }
  }
  
  ctx.dom.appendChild(container);
  ctx.mount('afterbegin');
}

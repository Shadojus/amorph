/**
 * Morph-Header Feature
 * 
 * Zentraler Header für alle AMORPH-Seiten:
 * - Suchleiste (lädt Daten erst bei Eingabe)
 * - Perspektiven-Buttons (schalten automatisch basierend auf Ergebnissen)
 */

import { debug } from '../../observer/debug.js';

export default function init(ctx) {
  debug.features('MorphHeader Init', ctx.config);
  
  const perspektiven = ctx.config.perspektiven || [];
  const suchConfig = ctx.config.suche || {};
  
  let aktivePerspektiven = new Set();
  let letzteSuche = '';
  let letzteErgebnisse = [];
  
  // === HEADER CONTAINER ===
  const header = document.createElement('header');
  header.className = 'morph-header';
  
  // === SUCHLEISTE ===
  const suchBereich = document.createElement('div');
  suchBereich.className = 'morph-header-suche';
  
  const suchIcon = document.createElement('span');
  suchIcon.className = 'morph-header-suche-icon';
  suchIcon.textContent = '🔍';
  
  const suchInput = document.createElement('input');
  suchInput.type = 'search';
  suchInput.className = 'morph-header-suche-input';
  suchInput.placeholder = suchConfig.placeholder || 'Suchen...';
  suchInput.setAttribute('aria-label', 'Suche in Morphs');
  
  const suchStatus = document.createElement('span');
  suchStatus.className = 'morph-header-suche-status';
  suchStatus.setAttribute('aria-live', 'polite');
  
  suchBereich.appendChild(suchIcon);
  suchBereich.appendChild(suchInput);
  suchBereich.appendChild(suchStatus);
  
  // === PERSPEKTIVEN BUTTONS ===
  const perspektivenBereich = document.createElement('nav');
  perspektivenBereich.className = 'morph-header-perspektiven';
  perspektivenBereich.setAttribute('role', 'toolbar');
  perspektivenBereich.setAttribute('aria-label', 'Perspektiven');
  
  const perspektivenButtons = new Map();
  
  for (const p of perspektiven) {
    const btn = document.createElement('button');
    btn.className = 'morph-header-perspektive-btn';
    btn.dataset.perspektive = p.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="symbol">${p.symbol || ''}</span>
      <span class="name">${p.name}</span>
      <span class="count" aria-hidden="true"></span>
    `;
    
    if (p.farbe) {
      btn.style.setProperty('--p-farbe', p.farbe);
    }
    
    btn.addEventListener('click', () => togglePerspektive(p.id));
    perspektivenBereich.appendChild(btn);
    perspektivenButtons.set(p.id, { btn, config: p });
  }
  
  // === HEADER ZUSAMMENBAUEN ===
  header.appendChild(suchBereich);
  header.appendChild(perspektivenBereich);
  
  // === FUNKTIONEN ===
  
  async function suchen(query) {
    if (query === letzteSuche) return;
    letzteSuche = query;
    
    debug.suche('Query', query);
    
    if (!query.trim()) {
      // Leere Suche - keine Daten anzeigen
      letzteErgebnisse = [];
      updateStatus('Gib einen Suchbegriff ein');
      clearPerspektivenHighlights();
      ctx.requestRender([]);
      return;
    }
    
    header.classList.add('ladend');
    updateStatus('Suche...');
    
    try {
      const ergebnisse = await ctx.fetch({
        search: query,
        limit: suchConfig.limit || 50
      });
      
      letzteErgebnisse = ergebnisse;
      debug.suche('Ergebnisse', { anzahl: ergebnisse.length, query });
      
      // Status aktualisieren
      if (ergebnisse.length === 0) {
        updateStatus('Keine Ergebnisse');
      } else if (ergebnisse.length === 1) {
        updateStatus('1 Ergebnis');
      } else {
        updateStatus(`${ergebnisse.length} Ergebnisse`);
      }
      
      // Perspektiven automatisch aktivieren
      autoPerspektiven(ergebnisse);
      
      // Rendern
      ctx.requestRender(ergebnisse);
      
    } catch (e) {
      debug.fehler('Suchfehler', e);
      updateStatus('Fehler bei der Suche');
    } finally {
      header.classList.remove('ladend');
    }
  }
  
  function updateStatus(text) {
    suchStatus.textContent = text;
  }
  
  function autoPerspektiven(ergebnisse) {
    if (ergebnisse.length === 0) {
      clearPerspektivenHighlights();
      return;
    }
    
    // Prüfe welche Perspektiven relevante Felder in den Ergebnissen haben
    const relevantePersp = new Set();
    
    for (const [id, { config }] of perspektivenButtons) {
      const felder = config.felder || [];
      
      // Prüfe ob mindestens ein Ergebnis ein Feld dieser Perspektive hat
      const hatRelevanteDaten = ergebnisse.some(item => 
        felder.some(feld => {
          const wert = item[feld];
          return wert !== undefined && wert !== null && wert !== '';
        })
      );
      
      if (hatRelevanteDaten) {
        relevantePersp.add(id);
      }
    }
    
    debug.perspektiven('Relevante Perspektiven', Array.from(relevantePersp));
    
    // Highlights setzen
    for (const [id, { btn }] of perspektivenButtons) {
      if (relevantePersp.has(id)) {
        btn.classList.add('hat-ergebnisse');
        // Erste relevante Perspektive automatisch aktivieren wenn keine aktiv
        if (aktivePerspektiven.size === 0) {
          aktivierePerspektive(id);
        }
      } else {
        btn.classList.remove('hat-ergebnisse');
      }
    }
  }
  
  function clearPerspektivenHighlights() {
    for (const [, { btn }] of perspektivenButtons) {
      btn.classList.remove('hat-ergebnisse');
    }
  }
  
  function togglePerspektive(id) {
    if (aktivePerspektiven.has(id)) {
      deaktivierePerspektive(id);
    } else {
      aktivierePerspektive(id);
    }
  }
  
  function aktivierePerspektive(id) {
    const { btn, config } = perspektivenButtons.get(id);
    aktivePerspektiven.add(id);
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('aktiv');
    
    // CSS-Klasse auf Container
    const container = document.querySelector('[data-amorph-container]');
    if (container) {
      container.classList.add(`perspektive-${id}`);
    }
    
    debug.perspektiven('Aktiviert', id);
    ctx.emit('perspektive:aktiviert', { id, config });
  }
  
  function deaktivierePerspektive(id) {
    const { btn } = perspektivenButtons.get(id);
    aktivePerspektiven.delete(id);
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('aktiv');
    
    // CSS-Klasse von Container entfernen
    const container = document.querySelector('[data-amorph-container]');
    if (container) {
      container.classList.remove(`perspektive-${id}`);
    }
    
    debug.perspektiven('Deaktiviert', id);
    ctx.emit('perspektive:deaktiviert', { id });
  }
  
  // === EVENT LISTENER ===
  
  let suchTimeout;
  suchInput.addEventListener('input', () => {
    clearTimeout(suchTimeout);
    const query = suchInput.value;
    
    if (suchConfig.live !== false) {
      suchTimeout = setTimeout(() => suchen(query), suchConfig.debounce || 300);
    }
  });
  
  suchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(suchTimeout);
      suchen(suchInput.value);
    }
    if (e.key === 'Escape') {
      suchInput.value = '';
      suchen('');
    }
  });
  
  // === MOUNT ===
  ctx.dom.appendChild(header);
  ctx.mount('afterbegin');
  
  // Initial: Keine Daten laden, Hinweis anzeigen
  updateStatus('Gib einen Suchbegriff ein');
  
  // API für andere Features
  ctx.api = {
    suchen,
    getPerspektiven: () => Array.from(aktivePerspektiven),
    getErgebnisse: () => letzteErgebnisse
  };
}

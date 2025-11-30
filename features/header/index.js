/**
 * Header Feature
 * Kombiniert Suche + Perspektiven in einem Container
 * Steuert die Interaktion zwischen beiden
 */

import { debug } from '../../observer/debug.js';
import { header as headerMorph } from '../../morphs/header.js';
import { getPerspektivenKeywords, getPerspektivenListe } from '../../util/semantic.js';

export default function init(ctx) {
  debug.features('Header Feature Init');
  
  // Keywords aus Schema laden (für Auto-Perspektiven)
  const schemaKeywords = getPerspektivenKeywords();
  debug.features('Schema Keywords', Object.keys(schemaKeywords));
  
  // Perspektiven-Liste aus Schema als Fallback
  const schemaListe = getPerspektivenListe();
  
  // Config aus features.suche und features.perspektiven zusammenbauen
  // Schema-Liste als Fallback wenn keine Config-Liste
  const perspektivenConfig = ctx.config.perspektiven || {};
  if (!perspektivenConfig.liste || perspektivenConfig.liste.length === 0) {
    perspektivenConfig.liste = schemaListe;
    debug.features('Perspektiven aus Schema geladen', { anzahl: schemaListe.length });
  }
  
  const headerConfig = {
    suche: ctx.config.suche || {},
    perspektiven: perspektivenConfig
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
      
      // Auto-Perspektiven aktivieren basierend auf Query und Ergebnissen
      if (letzteSuchergebnisse.length > 0 && query) {
        autoPerspektiven(letzteSuchergebnisse, query);
      } else if (!query) {
        // Leere Suche → alle Perspektiven deaktivieren + Markierungen entfernen
        for (const id of aktivePerspektiven) {
          const btn = perspektivenNav?.querySelector(`[data-perspektive="${id}"]`);
          btn?.classList.remove('aktiv');
          btn?.setAttribute('aria-pressed', 'false');
        }
        aktivePerspektiven.clear();
        // Treffer-Markierungen entfernen
        for (const btn of perspektivenBtns || []) {
          btn.classList.remove('hat-treffer');
          btn.removeAttribute('data-treffer-anzahl');
        }
        anwendenPerspektiven();
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
  
  // Markiere Perspektiven-Buttons mit Treffer-Indikator
  function markiereTreffer(ergebnisse, query = '') {
    const liste = headerConfig.perspektiven.liste || [];
    const q = query.toLowerCase();
    
    // Keywords aus Schema nutzen (Fallback auf leere Arrays)
    const perspektivenKeywords = schemaKeywords;
    
    // Erst alle Markierungen entfernen
    for (const btn of perspektivenBtns || []) {
      btn.classList.remove('hat-treffer');
      btn.removeAttribute('data-treffer-anzahl');
    }
    
    // Wenn keine Query, keine Markierungen
    if (!q || ergebnisse.length === 0) return;
    
    for (const p of liste) {
      const felder = p.felder || [];
      const keywords = perspektivenKeywords[p.id] || [];
      let trefferAnzahl = 0;
      
      // 1. Query-basierte Treffer
      for (const keyword of keywords) {
        if (q.includes(keyword)) {
          trefferAnzahl += ergebnisse.length; // Alle Ergebnisse relevant
          break;
        }
      }
      
      // 2. Feld-basierte Treffer zählen
      if (trefferAnzahl === 0) {
        for (const item of ergebnisse) {
          for (const feld of felder) {
            const wert = item[feld];
            if (wert !== undefined && wert !== null && wert !== '') {
              const textWert = JSON.stringify(wert).toLowerCase();
              const queryWords = q.split(/\s+/).filter(w => w.length > 2);
              for (const word of queryWords) {
                if (textWert.includes(word)) {
                  trefferAnzahl++;
                  break;
                }
              }
            }
          }
        }
      }
      
      // Button markieren wenn Treffer
      if (trefferAnzahl > 0) {
        const btn = perspektivenNav?.querySelector(`[data-perspektive="${p.id}"]`);
        if (btn) {
          btn.classList.add('hat-treffer');
          btn.setAttribute('data-treffer-anzahl', trefferAnzahl);
        }
      }
    }
    
    debug.perspektiven('Treffer-Markierung', { 
      buttons: [...(perspektivenBtns || [])].filter(b => b.classList.contains('hat-treffer')).map(b => b.dataset.perspektive)
    });
  }

  // Auto-Perspektiven: Aktiviere Perspektiven basierend auf Query-Kontext
  function autoPerspektiven(ergebnisse, query = '') {
    // Erst Treffer markieren
    markiereTreffer(ergebnisse, query);
    
    const liste = headerConfig.perspektiven.liste || [];
    const q = query.toLowerCase();
    
    // Keywords aus Schema nutzen
    const perspektivenKeywords = schemaKeywords;
    
    const gefunden = new Map(); // id -> score
    
    for (const p of liste) {
      const felder = p.felder || [];
      const keywords = perspektivenKeywords[p.id] || [];
      let score = 0;
      
      // 1. Query-basierte Relevanz (höchste Priorität)
      for (const keyword of keywords) {
        if (q.includes(keyword)) {
          score += 10; // Hoher Score für Query-Match
        }
      }
      
      // 2. Feld-basierte Relevanz - nur wenn Query in diesem Feld gefunden wurde
      for (const item of ergebnisse) {
        for (const feld of felder) {
          const wert = item[feld];
          if (wert !== undefined && wert !== null && wert !== '') {
            const textWert = JSON.stringify(wert).toLowerCase();
            // Prüfe ob Query-Wörter in diesem Feld vorkommen
            const queryWords = q.split(/\s+/).filter(w => w.length > 2);
            for (const word of queryWords) {
              if (textWert.includes(word)) {
                score += 2; // Mittlerer Score für Feld-Match
              }
            }
          }
        }
      }
      
      if (score > 0) {
        gefunden.set(p.id, score);
      }
    }
    
    debug.perspektiven('Auto-Erkennung', Object.fromEntries(gefunden));
    
    // Nur aktivieren wenn es deutliche Unterschiede gibt
    if (gefunden.size > 0) {
      const sortiert = [...gefunden.entries()].sort((a, b) => b[1] - a[1]);
      
      // Nur die mit höchstem Score nehmen (mindestens 50% des Maximums)
      const maxScore = sortiert[0][1];
      const beste = sortiert
        .filter(([, score]) => score >= maxScore * 0.5)
        .slice(0, 2)
        .map(([id]) => id);
      
      // Nur ändern wenn sich was geändert hat
      const aktuelleIds = [...aktivePerspektiven].sort().join(',');
      const neueIds = beste.sort().join(',');
      
      if (aktuelleIds !== neueIds) {
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
    } else {
      // Keine passende Perspektive gefunden → alle deaktivieren
      for (const id of aktivePerspektiven) {
        const btn = perspektivenNav?.querySelector(`[data-perspektive="${id}"]`);
        btn?.classList.remove('aktiv');
        btn?.setAttribute('aria-pressed', 'false');
      }
      aktivePerspektiven.clear();
      anwendenPerspektiven();
      debug.perspektiven('Keine passende Perspektive gefunden');
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

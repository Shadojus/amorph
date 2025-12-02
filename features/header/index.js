/**
 * Header Feature
 * Kombiniert Suche + Perspektiven in einem Container
 * Steuert die Interaktion zwischen beiden
 * 
 * NEU: Aktive Perspektiven werden als Badges in der Suchleiste angezeigt
 * NEU: Im Vergleich-View wird keine DB-Suche ausgeführt, nur Highlights
 */

import { debug } from '../../observer/debug.js';
import { header as headerMorph } from '../../morphs/header.js';
import { getPerspektivenKeywords, getPerspektivenListe } from '../../util/semantic.js';
import { getState as getAnsichtState } from '../ansichten/index.js';

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
    perspektiven: perspektivenConfig,
    ansicht: ctx.config.ansicht || {}
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
  const aktiveBadgesContainer = headerEl.querySelector('.amorph-aktive-filter');
  
  // Perspektiven State
  const maxAktiv = parseInt(perspektivenNav?.dataset.maxAktiv || '4');
  let aktivePerspektiven = new Set();
  let letzteSuchergebnisse = [];
  
  // === SUCHE LOGIK ===
  async function suchen() {
    const query = input?.value.trim() || '';
    
    // Prüfen ob wir im Vergleich-View sind
    const aktiveAnsicht = getAnsichtState().aktiveAnsicht;
    const imVergleichsView = aktiveAnsicht === 'vergleich';
    
    console.log('%c[HEADER-SUCHE] Ansicht-Check', 'background:#f59e0b;color:black;padding:2px 6px;border-radius:3px', {
      query,
      aktiveAnsicht,
      imVergleichsView
    });
    
    // Im Vergleich-View: NUR Highlights anwenden, KEINE DB-Suche
    if (imVergleichsView) {
      console.log('%c[HEADER-SUCHE] ⚡ Vergleich-View: Nur Highlights, keine DB-Suche!', 'background:#10b981;color:white;padding:2px 6px;border-radius:3px');
      // Event emittieren für Vergleich-View Highlights
      ctx.emit('suche:ergebnisse', { query, ergebnisse: [], matchedTerms: new Set(), nurHighlights: true });
      return;
    }
    
    sucheForm?.classList.add('ladend');
    
    try {
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
        // Badges in Suchleiste leeren
        aktualisiereAktiveBadges();
        // Treffer-Markierungen entfernen
        for (const btn of perspektivenBtns || []) {
          btn.classList.remove('hat-treffer');
          btn.removeAttribute('data-treffer-anzahl');
        }
        anwendenPerspektiven();
      }
      
      // Perspektiven anwenden nach Render
      setTimeout(() => anwendenPerspektiven(), 50);
      
      // Event mit Query und MatchedTerms für andere Views (z.B. Vergleich)
      const matchedTerms = ctx.dataSource?.getMatchedTerms ? ctx.dataSource.getMatchedTerms() : new Set();
      ctx.emit('suche:ergebnisse', { query, ergebnisse: letzteSuchergebnisse, matchedTerms });
      
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
  
  // === SCROLL DETECTION für Header-Styling ===
  function handleScroll() {
    const featureWrapper = container.closest('.amorph-feature-header') || container.parentElement;
    if (featureWrapper) {
      if (window.scrollY > 10) {
        featureWrapper.classList.add('scrolled');
      } else {
        featureWrapper.classList.remove('scrolled');
      }
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial check
  handleScroll();
  
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
    
    // Badges in Suchleiste aktualisieren
    aktualisiereAktiveBadges();
    anwendenPerspektiven();
  }
  
  // Aktive Perspektiven als Badges in der Suchleiste anzeigen
  function aktualisiereAktiveBadges() {
    if (!aktiveBadgesContainer) return;
    
    aktiveBadgesContainer.innerHTML = '';
    const liste = headerConfig.perspektiven.liste || [];
    
    for (const id of aktivePerspektiven) {
      const perspektive = liste.find(p => p.id === id);
      if (!perspektive) continue;
      
      const badge = document.createElement('button');
      badge.className = 'amorph-filter-badge';
      badge.dataset.perspektive = id;
      
      // Farbe aus Perspektive
      const farben = perspektive.farben || [perspektive.farbe || '#3b82f6'];
      badge.style.setProperty('--badge-farbe', farben[0]);
      
      // Kürzel für Badge (erste 3-4 Buchstaben)
      const kuerzel = perspektive.label?.substring(0, 4) || id.substring(0, 4);
      badge.innerHTML = `<span class="badge-icon">◆</span> ${kuerzel}`;
      badge.setAttribute('title', `${perspektive.label} entfernen`);
      
      // Klick entfernt den Filter
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = perspektivenNav?.querySelector(`[data-perspektive="${id}"]`);
        if (btn) togglePerspektive(id, btn);
      });
      
      aktiveBadgesContainer.appendChild(badge);
    }
    
    debug.perspektiven('Badges aktualisiert', { anzahl: aktivePerspektiven.size });
  }

  function anwendenPerspektiven() {
    const appContainer = document.querySelector('[data-amorph-container]');
    if (!appContainer) return;
    
    const liste = headerConfig.perspektiven.liste || [];
    
    // Alle Feld-Markierungen entfernen
    const alleFelder = appContainer.querySelectorAll('amorph-container[data-perspektive-sichtbar]');
    for (const feld of alleFelder) {
      feld.removeAttribute('data-perspektive-sichtbar');
      feld.removeAttribute('data-perspektive-multi');
      feld.style.removeProperty('--feld-perspektive-farbe');
    }
    
    // Wenn keine Perspektive aktiv → Klasse entfernen (alle sichtbar)
    if (aktivePerspektiven.size === 0) {
      appContainer.classList.remove('perspektiven-aktiv');
      debug.perspektiven('Keine aktiv - alle Felder sichtbar');
    } else {
      // Perspektiven aktiv → relevante Felder markieren
      appContainer.classList.add('perspektiven-aktiv');
      
      // Sammle alle Felder die sichtbar sein sollen mit ihrer Farbe
      const feldZuFarben = new Map();
      
      for (const id of aktivePerspektiven) {
        const perspektive = liste.find(p => p.id === id);
        if (!perspektive) continue;
        
        const felder = perspektive.felder || [];
        // Farben-Array unterstützen, Fallback auf einzelne farbe
        const farben = perspektive.farben || (perspektive.farbe ? [perspektive.farbe] : ['#3b82f6']);
        const hauptfarbe = farben[0];
        
        for (const feldname of felder) {
          if (!feldZuFarben.has(feldname)) {
            feldZuFarben.set(feldname, []);
          }
          // Speichere das komplette Farben-Array für diese Perspektive
          feldZuFarben.get(feldname).push({ hauptfarbe, farben });
        }
      }
      
      // Felder markieren mit allen zugehörigen Farben
      for (const [feldname, perspektivFarben] of feldZuFarben) {
        const feldElemente = appContainer.querySelectorAll(`amorph-container[data-field="${feldname}"]`);
        for (const feld of feldElemente) {
          feld.setAttribute('data-perspektive-sichtbar', 'true');
          
          if (perspektivFarben.length === 1) {
            // Einzelne Perspektive - alle 4 Farben setzen
            const { farben } = perspektivFarben[0];
            feld.style.setProperty('--feld-perspektive-farbe', farben[0]);
            if (farben[1]) feld.style.setProperty('--feld-p-farbe-1', farben[1]);
            if (farben[2]) feld.style.setProperty('--feld-p-farbe-2', farben[2]);
            if (farben[3]) feld.style.setProperty('--feld-p-farbe-3', farben[3]);
            feld.removeAttribute('data-perspektive-multi');
          } else {
            // Mehrere Perspektiven - Multicolor-Gradient aus allen Hauptfarben
            feld.setAttribute('data-perspektive-multi', 'true');
            feld.setAttribute('data-perspektive-count', perspektivFarben.length.toString());
            
            // Für .feld-ausgewaehlt: Erste Perspektive als Basis (Fallback)
            const ersteFarben = perspektivFarben[0].farben;
            feld.style.setProperty('--feld-perspektive-farbe', ersteFarben[0]);
            
            // Alle Perspektiven-Hauptfarben für Multi-Gradient setzen
            perspektivFarben.forEach(({ hauptfarbe, farben }, i) => {
              feld.style.setProperty(`--p-farbe-${i}`, hauptfarbe);
              // Auch sekundäre Farben für reichere Gradients
              if (farben[1]) feld.style.setProperty(`--p-farbe-${i}-1`, farben[1]);
            });
            feld.style.setProperty('--p-farben-anzahl', perspektivFarben.length.toString());
            
            // Multi-Gradient für Balken: Alle Hauptfarben vertikal
            const gradientStops = perspektivFarben.map(({ hauptfarbe }, i) => {
              const start = (i / perspektivFarben.length) * 100;
              const end = ((i + 1) / perspektivFarben.length) * 100;
              return `${hauptfarbe} ${start}%, ${hauptfarbe} ${end}%`;
            }).join(', ');
            feld.style.setProperty('--feld-gradient', `linear-gradient(180deg, ${gradientStops})`);
            
            // Für Hintergrund: Diagonaler Gradient aus allen Farben
            const bgStops = perspektivFarben.map(({ hauptfarbe }, i) => {
              const pos = (i / (perspektivFarben.length - 1 || 1)) * 100;
              return `color-mix(in srgb, ${hauptfarbe} 12%, transparent) ${pos}%`;
            }).join(', ');
            feld.style.setProperty('--feld-bg-gradient', `linear-gradient(135deg, ${bgStops})`);
          }
        }
      }
      
      debug.perspektiven('Aktiv', { 
        perspektiven: Array.from(aktivePerspektiven),
        felder: [...feldZuFarben.keys()]
      });
    }
    
    // Event emittieren - sowohl ctx-intern als auch document-weit
    const eventData = { aktiv: Array.from(aktivePerspektiven) };
    console.log('%c[HEADER] Perspektiven-Event wird gesendet', 'background:#e8b04a;color:black;padding:4px 8px;border-radius:3px;font-weight:bold', eventData);
    ctx.emit('perspektiven:geaendert', eventData);
    document.dispatchEvent(new CustomEvent('perspektiven:geaendert', { 
      detail: eventData
    }));
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
        
        // Badges in Suchleiste aktualisieren
        aktualisiereAktiveBadges();
        
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
      aktualisiereAktiveBadges();
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
  
  // Header direkt in body einfügen (für position: fixed über volle Breite)
  // Nicht in #app Container, sonst wird er durch max-width begrenzt
  document.body.insertAdjacentElement('afterbegin', ctx.dom);
  debug.mount('Header in body eingefügt');
}

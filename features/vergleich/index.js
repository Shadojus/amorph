/**
 * Vergleich Feature - SAMMEL-DIAGRAMM
 * 
 * Vereinigt alle ausgewählten Daten in passenden Diagrammen:
 * - Gleiche Felder werden zusammengefasst
 * - Bar-Charts für numerische Werte (Rating, Progress, Range)
 * - Tag-Vergleich für Kategorien (Essbarkeit)
 * - Bild-Galerie für Bilder
 * - Radar/Pie für komplexe Daten
 * 
 * NEU: Perspektiven-basierte Morph-Auswahl
 * - Jede Perspektive kann spezielle Morph-Konfigurationen definieren
 * - Aktive Perspektiven beeinflussen die Darstellung
 * 
 * NEU: Lokale Suche mit Fuzzy-Matching
 * - Durchsucht die bereits geladenen Daten
 * - Highlights wie im Grid-View
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  getState 
} from '../ansichten/index.js';
import { getFeldConfig, getPerspektivenMorphConfig, getPerspektivenListe, getAllePerspektivenFarben } from '../../util/semantic.js';
import { 
  compareMorph,
  erstelleFarben
} from '../../morphs/compare.js';
import { highlightInContainer, clearHighlights } from '../../util/fetch.js';

export default function init(ctx) {
  debug.features('Vergleich/Sammel-Diagramm Feature Init');
  
  // Aktive Perspektiven tracken
  let aktivePerspektiven = [];
  // Suche State (kommt vom Header-Feature)
  let aktuelleQuery = '';
  let aktuelleMatchedTerms = new Set();
  
  const container = document.createElement('div');
  container.className = 'amorph-sammeldiagramm';
  container.innerHTML = `
    <div class="amorph-sammel-toolbar">
      <span class="sammel-anzahl">0 Felder</span>
      <span class="sammel-perspektiven"></span>
    </div>
    <div class="amorph-sammel-content">
      <div class="amorph-sammel-diagramme"></div>
      <div class="amorph-sammel-legende"></div>
    </div>
    <div class="amorph-sammel-leer">
      <div class="icon">📊</div>
      <div class="text">Wähle Felder zum Vergleichen</div>
      <div class="hint">Gleiche Felder werden zusammengefasst</div>
    </div>
  `;
  
  const diagramme = container.querySelector('.amorph-sammel-diagramme');
  const legende = container.querySelector('.amorph-sammel-legende');
  const leerAnzeige = container.querySelector('.amorph-sammel-leer');
  const anzahlSpan = container.querySelector('.sammel-anzahl');
  const perspektivenSpan = container.querySelector('.sammel-perspektiven');
  
  /**
   * Hauptrender - Nutzt neue Compare-Morphs
   */
  function render() {
    const nachFeld = getAuswahlNachFeld();
    const nachPilz = getAuswahlNachPilz();
    const auswahl = getState().auswahl;
    
    if (auswahl.size === 0) {
      diagramme.innerHTML = '';
      legende.innerHTML = '';
      leerAnzeige.style.display = 'flex';
      anzahlSpan.textContent = '0 Felder';
      return;
    }
    
    leerAnzeige.style.display = 'none';
    anzahlSpan.textContent = `${auswahl.size} Felder · ${nachPilz.size} Pilze`;
    diagramme.innerHTML = '';
    
    // Pilz-Farben erstellen (konsistent über alle Diagramme)
    const pilzIds = Array.from(nachPilz.keys());
    const pilzFarben = erstelleFarben(pilzIds);
    
    // Pro Feld ein Diagramm mit Compare-Morphs
    for (const [feldName, rawItems] of nachFeld) {
      if (!rawItems.length) continue;
      
      // Name überspringen - macht keinen Sinn zu vergleichen
      if (feldName === 'name') continue;
      
      const cfg = getFeldConfig(feldName);
      const typ = cfg?.typ || 'text';
      
      // DEBUG
      debug.features('Vergleich rawItems', { 
        feldName, 
        typ,
        items: rawItems.map(i => ({
          pilzId: i.pilzId,
          hatPilzDaten: !!i.pilzDaten,
          pilzName: i.pilzDaten?.name,
          wert: typeof i.wert
        }))
      });
      
      // Items für Compare-Morphs transformieren
      // Von: {pilzId, pilzDaten, wert, feldName}
      // Zu:  {pilzId, pilzName, wert, farbe}
      const items = rawItems.map(item => {
        const normalizedId = String(item.pilzId);
        return {
          pilzId: normalizedId,
          pilzName: item.pilzDaten?.name || normalizedId,
          wert: item.wert,
          farbe: pilzFarben.get(normalizedId) || '#888'
        };
      });
      
      // Perspektiven-spezifische Morph-Config holen (falls vorhanden)
      const perspMorphConfig = getPerspektivenMorphConfig(feldName, aktivePerspektiven);
      
      console.log('%c[VERGLEICH] Morph-Config für Feld', 'background:#14b8a6;color:white;padding:2px 6px;border-radius:3px', {
        feldName,
        aktivePerspektiven,
        perspMorphConfig,
        hatOverride: !!perspMorphConfig
      });
      
      // Config zusammenbauen: 
      // - Schema-Farben (cfg.farben) = Tag-Farben für Werte (essbar: grün, giftig: rot)
      // - Perspektiven-Farben (perspMorphConfig.farben) = 4-Farben-Grid für Glow-Effekt
      const morphConfig = { 
        label: perspMorphConfig?.label || cfg?.label || feldName,
        einheit: cfg?.einheit,
        max: cfg?.max || cfg?.maxStars,
        farben: cfg?.farben,  // Schema Tag-Farben (essbar, giftig, etc.)
        perspektiveFarben: perspMorphConfig?.farben,  // 4-Farben-Grid für Glow
        perspektive: perspMorphConfig?.perspektive
      };
      
      console.log('%c[VERGLEICH] 🎨 Farben-Setup', 'background:#a855f7;color:white;padding:2px 6px;border-radius:3px', {
        feldName,
        schemaFarben: cfg?.farben,
        perspektiveFarben: perspMorphConfig?.farben,
        label: morphConfig.label
      });
      
      // Typ: Perspektiven-Config kann den Morph-Typ überschreiben
      const morphTyp = perspMorphConfig?.typ || typ;
      
      console.log('%c[VERGLEICH] Morph-Typ Entscheidung', 'background:#e8b04a;color:black;padding:2px 6px;border-radius:3px', {
        feldName,
        schemaTyp: typ,
        perspektivenTyp: perspMorphConfig?.typ,
        finalerTyp: morphTyp,
        perspektive: perspMorphConfig?.perspektive || 'keine'
      });
      
      debug.features('Morph-Auswahl', { 
        feldName, 
        standardTyp: typ, 
        morphTyp,
        perspektive: perspMorphConfig?.perspektive || 'keine'
      });
      
      // Compare-Morph erstellt das komplette Diagramm
      const morphEl = compareMorph(feldName, morphTyp, items, morphConfig);
      
      if (morphEl) {
        // MULTI-PERSPEKTIVEN: Hole ALLE Perspektiven-Farben für dieses Feld
        const alleFarben = getAllePerspektivenFarben(feldName, aktivePerspektiven);
        
        if (alleFarben.perspektiven.length > 0) {
          morphEl.classList.add('perspektive-aktiv');
          
          if (alleFarben.isMulti) {
            // MULTI-PERSPEKTIVEN: Mehrere Perspektiven → Multi-Color Gradient
            // Gleiche CSS-Variablen wie im Grid-View (perspektiven.css)
            morphEl.setAttribute('data-perspektive-multi', 'true');
            morphEl.setAttribute('data-perspektive-count', alleFarben.perspektiven.length.toString());
            
            // Setze alle Perspektiven-Hauptfarben (wie Grid-View)
            alleFarben.perspektiven.forEach((persp, i) => {
              morphEl.style.setProperty(`--p-farbe-${i}`, persp.hauptfarbe);
            });
            
            // Vertikaler Gradient für Glow-Stripe (wie Grid-View: --feld-gradient)
            const gradientStops = alleFarben.perspektiven.map((persp, i) => {
              const pos = (i / (alleFarben.perspektiven.length - 1 || 1)) * 100;
              return `${persp.hauptfarbe} ${pos}%`;
            }).join(', ');
            morphEl.style.setProperty('--feld-gradient', `linear-gradient(180deg, ${gradientStops})`);
            
            // Diagonaler BG-Gradient (wie Grid-View: --feld-bg-gradient)
            const bgStops = alleFarben.perspektiven.map((persp, i) => {
              const pos = (i / (alleFarben.perspektiven.length - 1 || 1)) * 100;
              return `color-mix(in srgb, ${persp.hauptfarbe} 8%, transparent) ${pos}%`;
            }).join(', ');
            morphEl.style.setProperty('--feld-bg-gradient', `linear-gradient(135deg, ${bgStops})`);
            
            console.log('%c[VERGLEICH] 🌈 MULTI-Perspektiven Glow!', 'background:linear-gradient(90deg,#e8b04a,#60c090,#5aa0d8,#a855f7);color:white;padding:2px 8px;border-radius:3px;font-weight:bold', {
              feldName,
              anzahl: alleFarben.perspektiven.length,
              perspektiven: alleFarben.perspektiven.map(p => p.id)
            });
          } else {
            // EINZEL-PERSPEKTIVE: Nur eine Perspektive → 4-Farben-Grid
            // Gleiche CSS-Variablen wie im Grid-View (perspektiven.css)
            const persp = alleFarben.perspektiven[0];
            
            // Hauptfarbe (wie Grid-View: --feld-perspektive-farbe)
            morphEl.style.setProperty('--feld-perspektive-farbe', persp.farben[0] || persp.hauptfarbe);
            
            // Sekundärfarben (wie Grid-View: --feld-p-farbe-1, -2, -3)
            if (persp.farben[1]) morphEl.style.setProperty('--feld-p-farbe-1', persp.farben[1]);
            if (persp.farben[2]) morphEl.style.setProperty('--feld-p-farbe-2', persp.farben[2]);
            if (persp.farben[3]) morphEl.style.setProperty('--feld-p-farbe-3', persp.farben[3]);
            
            console.log('%c[VERGLEICH] 🎨 Single-Perspektive Glow', 'background:#5aa0d8;color:white;padding:2px 8px;border-radius:3px', {
              feldName,
              perspektive: persp.id,
              farben: persp.farben
            });
          }
        }
        diagramme.appendChild(morphEl);
      }
    }
    
    // Legende
    renderLegende(nachPilz, pilzFarben);
    debug.features('Sammel-Diagramm gerendert', { felder: nachFeld.size, pilze: nachPilz.size });
  }

  /**
   * Legende
   */
  function renderLegende(nachPilz, farben) {
    legende.innerHTML = '<div class="legende-titel">Pilze</div>';
    for (const [id, data] of nachPilz) {
      const el = document.createElement('div');
      el.className = 'legende-item';
      el.innerHTML = `
        <span class="legende-farbe" style="background:${farben.get(id)}"></span>
        <span>${data.pilzDaten?.name || id}</span>
      `;
      legende.appendChild(el);
    }
  }
  
  /**
   * Highlights anwenden basierend auf Header-Suche
   * Nutzt die gleiche Logik wie im Grid-View
   */
  function applyHighlights(query, matchedTerms) {
    aktuelleQuery = query?.trim() || '';
    aktuelleMatchedTerms = matchedTerms || new Set();
    
    if (!aktuelleQuery) {
      // Leere Suche: Highlights entfernen
      clearHighlights(diagramme);
      clearHighlights(legende);
      debug.suche('Vergleich: Highlights entfernt');
      return;
    }
    
    // Highlights anwenden auf Diagramme und Legende
    clearHighlights(diagramme);
    clearHighlights(legende);
    const anzahl = highlightInContainer(diagramme, aktuelleQuery, aktuelleMatchedTerms);
    highlightInContainer(legende, aktuelleQuery, aktuelleMatchedTerms);
    
    debug.suche('Vergleich: Highlights angewendet', { query: aktuelleQuery, anzahl });
  }
  
  // Auf Header-Suche Event hören
  document.addEventListener('header:suche:ergebnisse', (e) => {
    const { query, matchedTerms } = e.detail || {};
    debug.suche('Vergleich: Suche-Event empfangen', { query, matchedTerms: matchedTerms?.size });
    
    // Highlights anwenden wenn Vergleich sichtbar
    if (ctx.dom.offsetParent !== null) {
      setTimeout(() => applyHighlights(query, matchedTerms), 100);
    }
  });
  
  // Events
  document.addEventListener('amorph:auswahl-geaendert', () => {
    if (ctx.dom.offsetParent !== null) {
      render();
      // Highlights neu anwenden nach Render
      if (aktuelleQuery) {
        setTimeout(() => applyHighlights(aktuelleQuery, aktuelleMatchedTerms), 50);
      }
    }
  });
  
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'vergleich') {
      ctx.dom.style.display = 'block';
      setTimeout(() => {
        render();
        // Highlights anwenden wenn Query vorhanden
        if (aktuelleQuery) {
          applyHighlights(aktuelleQuery, aktuelleMatchedTerms);
        }
      }, 50);
    } else {
      ctx.dom.style.display = 'none';
    }
  });
  
  // Perspektiven-Änderungen beachten
  document.addEventListener('perspektiven:geaendert', (e) => {
    aktivePerspektiven = e.detail?.aktiv || [];
    console.log('%c[VERGLEICH] Perspektiven Event empfangen', 'background:#a855f7;color:white;padding:2px 6px;border-radius:3px', {
      aktiv: aktivePerspektiven,
      detail: e.detail
    });
    
    // Toolbar aktualisieren
    if (aktivePerspektiven.length > 0) {
      const liste = getPerspektivenListe();
      const names = aktivePerspektiven.map(id => {
        const p = liste.find(l => l.id === id);
        return p ? `${p.symbol} ${p.name}` : id;
      }).join(' · ');
      perspektivenSpan.textContent = names;
      perspektivenSpan.style.display = 'inline';
    } else {
      perspektivenSpan.textContent = '';
      perspektivenSpan.style.display = 'none';
    }
    
    // Neu rendern wenn sichtbar
    if (ctx.dom.offsetParent !== null) {
      render();
      // Highlights nach Perspektiven-Wechsel neu anwenden
      if (aktuelleQuery) {
        setTimeout(() => applyHighlights(aktuelleQuery, aktuelleMatchedTerms), 100);
      }
    }
  });
  
  ctx.dom.appendChild(container);
  ctx.dom.style.display = 'none';
  ctx.mount();
  
  debug.features('Vergleich/Sammel-Diagramm bereit');
}

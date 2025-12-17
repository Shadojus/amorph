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
 * DATENGETRIEBEN: Nutzt smartCompare aus morphs/compare/composites
 * - Automatische Typ-Erkennung aus Datenstruktur
 * - Automatische Gruppierung nach Kategorie
 * - Perspektiven-Filter aus Schema
 * 
 * NEU: Lokale Suche mit Fuzzy-Matching
 * - Durchsucht die bereits geladenen Daten
 * - Highlights wie im Grid-View
 * 
 * DATENGETRIEBEN: Item-Namen aus schema.meta.nameField
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  getState,
  removeFeldAuswahl
} from '../ansichten/index.js';
import { getFeldConfig, getPerspektivenMorphConfig, getPerspektivenListe, getAllePerspektivenFarben, getItemName, getPerspektive } from '../../util/semantic.js';
import { 
  compareMorph,
  erstelleFarben,
  detectType,
  compareByType,
  createSection,
  setAktivePerspektivenFarben
} from '../../morphs/index.js';
import { smartCompare } from '../../morphs/compare/composites/index.js';
import { createLegende } from '../../morphs/compare/base.js';
import { highlightInContainer, clearHighlights } from '../../util/fetch.js';

export default async function init(ctx) {
  debug.features('Compare/Collection diagram feature init');
  
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
  
  // Click-Handler für Abwahl-Buttons
  diagramme.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.compare-section-remove');
    if (!removeBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const feldName = removeBtn.dataset.feldName;
    if (!feldName) return;
    
    debug.compare('Deselecting field via button', { feldName });
    
    // Alle Felder dieses Typs aus der Auswahl entfernen
    const entfernt = removeFeldAuswahl(feldName);
    
    if (entfernt > 0) {
      // UI will be automatically updated via amorph:auswahl-geaendert event
      debug.compare('Fields removed', { feldName, removed: entfernt });
    }
  });
  
  /**
   * Hauptrender - Nutzt Theme Compare-Morphs wenn Perspektiven aktiv
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
    
    // =====================================================================
    // PERSPEKTIVEN-FARBEN SETZEN (bevor Pilz-Farben erstellt werden!)
    // =====================================================================
    // Sammle alle Hauptfarben der aktiven Perspektiven
    const perspektivenFarben = aktivePerspektiven.map(perspId => {
      const perspektive = getPerspektive(perspId);
      return perspektive?.farben?.[0] || null;
    }).filter(Boolean);
    
    // Setze die aktiven Perspektiven-Farben für die Farbfilterung
    setAktivePerspektivenFarben(perspektivenFarben);
    debug.compare('Perspective colors set for filtering', { 
      perspectives: aktivePerspektiven,
      colors: perspektivenFarben 
    });
    
    // Pilz-Farben erstellen (konsistent über alle Diagramme)
    // Diese werden jetzt automatisch gefiltert basierend auf den Perspektiven-Farben
    // Rückgabe: Map mit {farbIndex, farbKlasse, fill, text, line, bg, glow}
    const pilzIds = Array.from(nachPilz.keys());
    const pilzFarben = erstelleFarben(pilzIds);
    
    // Items für Compare-Morphs vorbereiten (alle Pilze mit vollständigen Daten)
    // CSS-basiertes Farb-System: farbKlasse für CSS Custom Properties
    const compareItems = Array.from(nachPilz.entries()).map(([id, data]) => {
      const farbObj = pilzFarben.get(String(id)) || { 
        farbKlasse: 'pilz-farbe-0', 
        fill: '#888', 
        text: '#888',
        line: '#888',
        bg: '#444',
        glow: '#666'
      };
      
      // Robuste Name-Extraktion
      const extractedName = getItemName(data.pilzDaten);
      let itemName = '';
      if (extractedName && extractedName !== 'undefined' && extractedName.trim() !== '') {
        itemName = extractedName;
      } else if (data.pilzDaten?.name && data.pilzDaten.name !== 'undefined') {
        itemName = data.pilzDaten.name;
      } else {
        itemName = `Pilz ${id}`;
      }
      
      return {
        id: String(id),
        name: itemName,
        data: data.pilzDaten || {},
        // CSS-Klasse für Custom Properties
        farbKlasse: farbObj.farbKlasse,
        // Legacy: Inline-Styles (für Übergang)
        farbe: farbObj.fill,
        textFarbe: farbObj.text,
        lineFarbe: farbObj.line,
        bgFarbe: farbObj.bg,
        glowFarbe: farbObj.glow
      };
    });
    
    // =====================================================================
    // PERSPEKTIVEN-MODUS: smartCompare mit Feld-Filterung pro Perspektive
    // =====================================================================
    if (aktivePerspektiven.length > 0) {
      debug.compare('Perspectives mode active (smartCompare)', { 
        perspectives: aktivePerspektiven
      });
      
      // Pro aktiver Perspektive einen Compare-Block rendern
      for (const perspId of aktivePerspektiven) {
        // Perspektive aus Schema holen
        const perspektive = getPerspektive(perspId);
        if (!perspektive) {
          debug.compare('Perspective not in schema', { perspId });
          continue;
        }
        
        try {
          // Perspektiven-Container erstellen
          const perspContainer = document.createElement('div');
          perspContainer.className = `compare-perspektive compare-${perspId}`;
          perspContainer.setAttribute('data-perspektive', perspId);
          
          // Header
          const header = document.createElement('div');
          header.className = 'compare-perspektive-header';
          header.innerHTML = `
            <span class="perspektive-symbol">${perspektive.symbol || '📊'}</span>
            <span class="perspektive-name">${perspektive.name || perspId}</span>
            <span class="perspektive-count">${compareItems.length} Items</span>
          `;
          perspContainer.appendChild(header);
          
          // Legende
          perspContainer.appendChild(createLegende(compareItems));
          
          // smartCompare mit Feld-Filter aus Perspektive
          const perspectiveFields = perspektive.felder || perspektive.fields || null;
          const compareConfig = perspectiveFields 
            ? { includeOnly: perspectiveFields }
            : {};
          
          const compareEl = smartCompare(compareItems, compareConfig);
          perspContainer.appendChild(compareEl);
          
          // Perspektiven-Farben als CSS-Variablen setzen
          // --p-farbe ist die Hauptfarbe für die linke Leuchtlinie
          // --p-gradient für multi-color Gradients
          if (perspektive.farben && perspektive.farben.length > 0) {
            // Hauptfarbe setzen (erste Farbe)
            perspContainer.style.setProperty('--p-farbe', perspektive.farben[0]);
            // Gradient für multi-color
            if (perspektive.farben.length > 1) {
              const gradientStops = perspektive.farben.map((f, i) => {
                const percent = (i / (perspektive.farben.length - 1)) * 100;
                return `${f} ${percent}%`;
              }).join(', ');
              perspContainer.style.setProperty('--p-gradient', `linear-gradient(180deg, ${gradientStops})`);
            }
            // Auch einzelne Farben für komplexere Effekte
            perspektive.farben.forEach((farbe, i) => {
              perspContainer.style.setProperty(`--p-farbe-${i}`, farbe);
            });
          }
          
          diagramme.appendChild(perspContainer);
          debug.compare('smartCompare rendered for perspective', { perspId, items: compareItems.length });
          
        } catch (err) {
          debug.compare('Error in smartCompare', { perspId, error: err.message });
          console.error('[COMPARE] smartCompare error:', err);
        }
      }
      
      // Legende
      renderLegende(nachPilz, pilzFarben);
      debug.features('Perspectives compare rendered', { 
        perspectives: aktivePerspektiven.length, 
        items: nachPilz.size 
      });
      return;
    }
    
    // =====================================================================
    // FALLBACK MODE: Field-by-field with generic compare-morphs
    // =====================================================================
    debug.compare('Fallback mode (no perspectives active)');
    
    // Pro Feld ein Diagramm mit Compare-Morphs
    for (const [feldName, rawItems] of nachFeld) {
      if (!rawItems.length) continue;
      
      // Name überspringen - macht keinen Sinn zu vergleichen
      if (feldName === 'name') continue;
      
      const cfg = getFeldConfig(feldName);
      // DATENGETRIEBEN: Typ aus Schema ODER aus Datenstruktur erkennen
      const firstWert = rawItems[0]?.wert;
      const typ = cfg?.typ || detectType(firstWert) || 'text';
      
      // DEBUG
      debug.features('Compare rawItems', { 
        feldName, 
        typ,
        items: rawItems.map(i => ({
          itemId: i.pilzId,
          hasItemData: !!i.pilzDaten,
          itemName: getItemName(i.pilzDaten),
          valueType: typeof i.wert
        }))
      });
      
      // Items für Compare-Morphs transformieren
      // Von: {pilzId, pilzDaten, wert, feldName}
      // Zu:  {id, name, wert, farbe, textFarbe, lineFarbe, bgFarbe, glowFarbe, farbKlasse}
      const items = rawItems.map(item => {
        const normalizedId = String(item.pilzId);
        const farbObj = pilzFarben.get(normalizedId) || {
          farbKlasse: '',
          fill: '#888',
          text: '#888',
          line: '#888',
          bg: '#444',
          glow: '#666'
        };
        
        // Name extrahieren - mit robustem Fallback
        const extractedName = getItemName(item.pilzDaten);
        // WICHTIG: Prüfe auf undefined, 'undefined' string, und leere Strings
        let itemName = '';
        if (extractedName && extractedName !== 'undefined' && extractedName.trim() !== '') {
          itemName = extractedName;
        } else if (item.pilzDaten?.name && item.pilzDaten.name !== 'undefined') {
          itemName = item.pilzDaten.name;
        } else if (item.pilzDaten?.titel && item.pilzDaten.titel !== 'undefined') {
          itemName = item.pilzDaten.titel;
        } else {
          itemName = `Pilz ${normalizedId}`;
        }
        
        debug.compare('Item name extraction', {
          itemId: normalizedId,
          hasItemData: !!item.pilzDaten,
          itemDataName: item.pilzDaten?.name,
          extractedName: extractedName,
          finalName: itemName
        });
        
        return {
          id: normalizedId,
          name: itemName,
          wert: item.wert,
          // CSS-Klasse für Custom Properties
          farbKlasse: farbObj.farbKlasse,
          // Inline-Styles
          farbe: farbObj.fill,
          textFarbe: farbObj.text,
          lineFarbe: farbObj.line,
          bgFarbe: farbObj.bg,
          glowFarbe: farbObj.glow
        };
      });
      
      // Perspektiven-spezifische Morph-Config holen (falls vorhanden)
      const perspMorphConfig = getPerspektivenMorphConfig(feldName, aktivePerspektiven);
      
      debug.compare('Morph config for field', {
        feldName,
        activePerspectives: aktivePerspektiven,
        perspMorphConfig,
        hasOverride: !!perspMorphConfig
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
      
      debug.compare('Colors setup', {
        feldName,
        schemaColors: cfg?.farben,
        perspectiveColors: perspMorphConfig?.farben,
        label: morphConfig.label
      });
      
      // Typ: Perspektiven-Config kann den Morph-Typ überschreiben
      const morphTyp = perspMorphConfig?.typ || typ;
      
      debug.compare('Morph type decision', {
        feldName,
        schemaType: typ,
        perspectiveType: perspMorphConfig?.typ,
        finalType: morphTyp,
        perspective: perspMorphConfig?.perspektive || 'none'
      });
      
      debug.features('Morph selection', { 
        feldName, 
        defaultType: typ, 
        morphType: morphTyp,
        perspective: perspMorphConfig?.perspektive || 'none'
      });
      
      // DEBUG: Finales items Array DIREKT vor Übergabe
      console.log(`[VERGLEICH] Items für ${feldName}:`, JSON.stringify(items.map(i => ({ id: i.id, name: i.name }))));
      
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
            
            debug.compare('MULTI perspectives glow', {
              feldName,
              count: alleFarben.perspektiven.length,
              perspectives: alleFarben.perspektiven.map(p => p.id)
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
            
            debug.compare('Single perspective glow', {
              feldName,
              perspective: persp.id,
              colors: persp.farben
            });
          }
        }
        diagramme.appendChild(morphEl);
      } else {
        debug.compare(`morphEl is NULL for ${feldName}`);
      }
    }
    
    // Legende
    renderLegende(nachPilz, pilzFarben);
    debug.features('Collection diagram rendered', { fields: nachFeld.size, items: nachPilz.size });
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
      debug.search('Compare: Highlights removed');
      return;
    }
    
    // Highlights anwenden auf Diagramme und Legende
    clearHighlights(diagramme);
    clearHighlights(legende);
    const anzahl = highlightInContainer(diagramme, aktuelleQuery, aktuelleMatchedTerms);
    highlightInContainer(legende, aktuelleQuery, aktuelleMatchedTerms);
    
    debug.search('Compare: Highlights applied', { query: aktuelleQuery, count: anzahl });
  }
  
  // Auf Header-Suche Event hören
  document.addEventListener('header:suche:ergebnisse', (e) => {
    const { query, matchedTerms } = e.detail || {};
    debug.search('Compare: Search event received', { query, matchedTerms: matchedTerms?.size });
    
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
    debug.compare('Perspectives event received', {
      active: aktivePerspektiven,
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
  
  debug.features('Compare/Collection diagram ready');
}

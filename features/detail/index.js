/**
 * Detail Feature - PINBOARD
 * 
 * Zeigt NUR die ausgewählten Felder als mobile-first Pins
 * Verwendet MORPHS für korrekte Darstellung basierend auf Schema-Typ
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz, 
  getAuswahlNachFeld,
  getState,
  clearAuswahl 
} from '../ansichten/index.js';
import { getFeldConfig, getPerspektivenListe } from '../../util/semantic.js';
import { morphs } from '../../morphs/index.js';

// State
const state = {
  gruppierung: 'pilz' // 'pilz' | 'feld'
};

export default function init(ctx) {
  debug.features('Detail/Pinboard Feature Init');
  
  const pinboard = document.createElement('div');
  pinboard.className = 'amorph-pinboard';
  pinboard.innerHTML = `
    <div class="amorph-pinboard-toolbar">
      <div class="amorph-pinboard-gruppierung">
        <button data-gruppierung="pilz" class="aktiv">🍄 Pilz</button>
        <button data-gruppierung="feld">📋 Feld</button>
      </div>
      <span class="amorph-pinboard-anzahl"></span>
      <button class="amorph-pinboard-clear">✕ Leeren</button>
    </div>
    <div class="amorph-pinboard-content"></div>
    <div class="amorph-pinboard-leer">
      <div class="icon">📌</div>
      <div class="text">Keine Felder ausgewählt</div>
      <div class="hint">Klicke auf Felder in den Karten</div>
    </div>
  `;
  
  const content = pinboard.querySelector('.amorph-pinboard-content');
  const leerAnzeige = pinboard.querySelector('.amorph-pinboard-leer');
  const anzahlEl = pinboard.querySelector('.amorph-pinboard-anzahl');
  
  // Gruppierung
  pinboard.querySelectorAll('[data-gruppierung]').forEach(btn => {
    btn.addEventListener('click', () => {
      pinboard.querySelectorAll('[data-gruppierung]').forEach(b => b.classList.remove('aktiv'));
      btn.classList.add('aktiv');
      state.gruppierung = btn.dataset.gruppierung;
      render();
    });
  });
  
  // Clear
  pinboard.querySelector('.amorph-pinboard-clear').addEventListener('click', clearAuswahl);
  
  /**
   * Render - Zeigt nur ausgewählte Felder mit korrekten Morphs
   */
  function render() {
    const auswahl = getState().auswahl;
    
    if (auswahl.size === 0) {
      content.innerHTML = '';
      leerAnzeige.style.display = 'flex';
      anzahlEl.textContent = '';
      return;
    }
    
    leerAnzeige.style.display = 'none';
    content.innerHTML = '';
    anzahlEl.textContent = `${auswahl.size} Felder`;
    
    if (state.gruppierung === 'pilz') {
      renderNachPilz();
    } else {
      renderNachFeld();
    }
  }
  
  /**
   * Gruppiert nach Pilz - kompakte Karten
   */
  function renderNachPilz() {
    const nachPilz = getAuswahlNachPilz();
    
    for (const [pilzId, data] of nachPilz) {
      const karte = document.createElement('div');
      karte.className = 'amorph-detail-karte';
      
      // Header mit Pilzname
      const header = document.createElement('div');
      header.className = 'amorph-detail-header';
      header.textContent = data.pilzDaten?.name || pilzId;
      karte.appendChild(header);
      
      // Felder als Mini-Morphs
      const felder = document.createElement('div');
      felder.className = 'amorph-detail-felder';
      
      for (const feld of data.felder) {
        const feldEl = erstelleFeldMorph(feld.feldName, feld.wert, data.pilzDaten);
        if (feldEl) felder.appendChild(feldEl);
      }
      
      karte.appendChild(felder);
      content.appendChild(karte);
    }
  }
  
  /**
   * Gruppiert nach Feld - Vergleich über Pilze
   */
  function renderNachFeld() {
    const nachFeld = getAuswahlNachFeld();
    
    for (const [feldName, items] of nachFeld) {
      const cfg = getFeldConfig(feldName);
      const gruppe = document.createElement('div');
      gruppe.className = 'amorph-detail-gruppe';
      
      // Header mit Feldname
      const header = document.createElement('div');
      header.className = 'amorph-detail-header';
      header.textContent = cfg?.label || feldName;
      gruppe.appendChild(header);
      
      // Alle Pilze mit diesem Feld
      const liste = document.createElement('div');
      liste.className = 'amorph-detail-liste';
      
      for (const item of items) {
        const zeile = document.createElement('div');
        zeile.className = 'amorph-detail-zeile';
        
        const pilzName = document.createElement('span');
        pilzName.className = 'amorph-detail-pilz';
        pilzName.textContent = item.pilzDaten?.name || item.pilzId;
        zeile.appendChild(pilzName);
        
        const wertEl = erstelleFeldMorph(feldName, item.wert, item.pilzDaten, true);
        if (wertEl) {
          wertEl.classList.add('amorph-detail-wert');
          zeile.appendChild(wertEl);
        }
        
        liste.appendChild(zeile);
      }
      
      gruppe.appendChild(liste);
      content.appendChild(gruppe);
    }
  }
  
  /**
   * Erstellt Mini-Morph basierend auf Schema-Typ
   */
  function erstelleFeldMorph(feldName, wert, pilzDaten, kompakt = false) {
    if (wert === null || wert === undefined) return null;
    
    const cfg = getFeldConfig(feldName);
    const typ = cfg?.typ || erkennTyp(wert);
    const container = document.createElement('div');
    container.className = `amorph-detail-feld amorph-detail-${typ}`;
    
    // Label (nur bei nicht-kompakt)
    if (!kompakt) {
      const label = document.createElement('div');
      label.className = 'amorph-detail-label';
      label.textContent = cfg?.label || feldName;
      container.appendChild(label);
    }
    
    // Wert mit passendem Morph
    const wertEl = document.createElement('div');
    wertEl.className = 'amorph-detail-inhalt';
    
    try {
      // Spezialisierte Morph-Auswahl für Mobile-First
      switch (typ) {
        case 'image':
          const img = document.createElement('img');
          img.src = wert;
          img.alt = pilzDaten?.name || '';
          img.className = 'amorph-mini-image';
          wertEl.appendChild(img);
          break;
          
        case 'rating':
          wertEl.innerHTML = renderMiniRating(wert, cfg?.maxStars || 5);
          break;
          
        case 'progress':
          wertEl.innerHTML = renderMiniProgress(wert, cfg?.einheit);
          break;
          
        case 'tag':
        case 'badge':
          const tagEl = document.createElement('span');
          tagEl.className = 'amorph-mini-tag';
          tagEl.textContent = wert;
          if (cfg?.farben?.[wert?.toLowerCase?.()]) {
            tagEl.style.backgroundColor = cfg.farben[wert.toLowerCase()];
          }
          wertEl.appendChild(tagEl);
          break;
          
        case 'range':
          wertEl.textContent = typeof wert === 'object' && 'min' in wert 
            ? `${wert.min}–${wert.max}${cfg?.einheit || ''}`
            : `${wert}${cfg?.einheit || ''}`;
          break;
          
        case 'list':
          if (Array.isArray(wert)) {
            wertEl.innerHTML = wert.slice(0, 3).map(v => 
              `<span class="amorph-mini-list-item">${v}</span>`
            ).join('') + (wert.length > 3 ? `<span class="amorph-mini-more">+${wert.length - 3}</span>` : '');
          } else {
            wertEl.textContent = String(wert);
          }
          break;
          
        case 'pie':
        case 'radar':
        case 'bar':
        case 'stats':
          // Komplexe Morphs: Nur Key-Value Zusammenfassung für Mobile
          if (typeof wert === 'object' && wert !== null) {
            const entries = Array.isArray(wert) ? wert : Object.entries(wert);
            const items = (Array.isArray(wert) ? wert : entries.slice(0, 3).map(([k,v]) => ({axis: k, value: v})));
            wertEl.innerHTML = items.slice(0, 3).map(item => {
              if (item.axis !== undefined) {
                return `<span class="amorph-mini-stat">${item.axis}: ${item.value}</span>`;
              } else if (item.label !== undefined) {
                return `<span class="amorph-mini-stat">${item.label}: ${item.value}</span>`;
              } else if (typeof item === 'object') {
                const [k, v] = Object.entries(item)[0] || ['', ''];
                return `<span class="amorph-mini-stat">${k}: ${v}</span>`;
              }
              return `<span class="amorph-mini-stat">${item}</span>`;
            }).join('');
          } else {
            wertEl.textContent = String(wert);
          }
          break;
          
        case 'timeline':
          if (Array.isArray(wert)) {
            wertEl.innerHTML = wert.slice(0, 2).map(e => 
              `<span class="amorph-mini-event">${e.event || e.phase || e.label || e.date || e}</span>`
            ).join(' → ');
          }
          break;
          
        default:
          wertEl.textContent = String(wert);
      }
    } catch (err) {
      debug.features('Morph-Fehler', { feldName, typ, err: err.message });
      wertEl.textContent = String(wert);
    }
    
    container.appendChild(wertEl);
    return container;
  }
  
  function erkennTyp(wert) {
    if (Array.isArray(wert)) return 'list';
    if (typeof wert === 'object' && wert !== null) {
      if ('min' in wert && 'max' in wert) return 'range';
      return 'object';
    }
    if (typeof wert === 'number') return 'number';
    if (typeof wert === 'boolean') return 'boolean';
    return 'text';
  }
  
  function renderMiniRating(wert, max) {
    const filled = Math.round(wert);
    return Array(max).fill(0).map((_, i) => 
      `<span class="amorph-mini-star ${i < filled ? 'filled' : ''}">${i < filled ? '★' : '☆'}</span>`
    ).join('');
  }
  
  function renderMiniProgress(wert, einheit) {
    const pct = Math.min(100, Math.max(0, Number(wert) || 0));
    return `<div class="amorph-mini-progress">
      <div class="amorph-mini-progress-fill" style="width:${pct}%"></div>
      <span class="amorph-mini-progress-text">${pct}${einheit || '%'}</span>
    </div>`;
  }
  
  // Events
  document.addEventListener('amorph:auswahl-geaendert', () => {
    if (ctx.dom.offsetParent !== null) render();
  });
  
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'detail') {
      ctx.dom.style.display = 'block';
      render();
    } else {
      ctx.dom.style.display = 'none';
    }
  });
  
  ctx.dom.appendChild(pinboard);
  ctx.dom.style.display = 'none';
  ctx.mount();
  
  debug.features('Detail/Pinboard bereit');
}

/**
 * Vergleich Feature - SAMMEL-DIAGRAMM
 * 
 * Vereinigt alle ausgewählten Daten in passenden Diagrammen:
 * - Gleiche Felder werden zusammengefasst
 * - Bar-Charts für numerische Werte (Rating, Progress, Range)
 * - Tag-Vergleich für Kategorien (Essbarkeit)
 * - Bild-Galerie für Bilder
 * - Radar/Pie für komplexe Daten
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  getState 
} from '../ansichten/index.js';
import { getFeldConfig } from '../../util/semantic.js';
import { 
  compareMorph,
  erstelleFarben
} from '../../morphs/compare.js';

export default function init(ctx) {
  debug.features('Vergleich/Sammel-Diagramm Feature Init');
  
  const container = document.createElement('div');
  container.className = 'amorph-sammeldiagramm';
  container.innerHTML = `
    <div class="amorph-sammel-toolbar">
      <span class="sammel-anzahl">0 Felder</span>
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
      
      // Compare-Morph erstellt das komplette Diagramm
      const morphEl = compareMorph(feldName, typ, items, { 
        label: cfg?.label || feldName,
        einheit: cfg?.einheit,
        max: cfg?.max || cfg?.maxStars,
        farben: cfg?.farben
      });
      
      if (morphEl) {
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
  
  // Events
  document.addEventListener('amorph:auswahl-geaendert', () => {
    if (ctx.dom.offsetParent !== null) render();
  });
  
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'vergleich') {
      ctx.dom.style.display = 'block';
      setTimeout(render, 50);
    } else {
      ctx.dom.style.display = 'none';
    }
  });
  
  ctx.dom.appendChild(container);
  ctx.dom.style.display = 'none';
  ctx.mount();
  
  debug.features('Vergleich/Sammel-Diagramm bereit');
}

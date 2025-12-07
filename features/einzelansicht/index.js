/**
 * Einzelansicht Feature
 * 
 * Zeigt einen einzelnen Pilz als vollständige Page.
 * SEO-freundlich mit /:slug URL.
 */

import { debug } from '../../observer/debug.js';
import { navigateTo } from '../../util/router.js';
import { transform } from '../../core/pipeline.js';
import { getFeldConfig, getSchema } from '../../util/semantic.js';

export default function init(ctx) {
  debug.features('Einzelansicht Feature Init');
  
  // Container für Einzelansicht
  const einzelansicht = document.createElement('div');
  einzelansicht.className = 'amorph-einzelansicht';
  einzelansicht.style.display = 'none';
  
  ctx.dom.appendChild(einzelansicht);
  ctx.mount('beforeend');
  
  /**
   * Einzelansicht rendern
   * @param {Object} pilz - Pilz-Daten
   */
  async function render(pilz) {
    if (!pilz) {
      einzelansicht.innerHTML = `
        <div class="amorph-error-state">
          <div class="amorph-error-icon">🍄</div>
          <div class="amorph-error-text">Pilz nicht gefunden</div>
          <button class="amorph-back-btn" data-action="back">← Zurück zur Übersicht</button>
        </div>
      `;
      return;
    }
    
    debug.features('Einzelansicht rendern', { name: pilz.name, slug: pilz.slug });
    
    // Header mit Zurück-Button
    const header = `
      <div class="einzelansicht-header">
        <button class="amorph-back-btn" data-action="back">
          <span class="back-icon">←</span>
          <span class="back-text">Übersicht</span>
        </button>
        <h1 class="einzelansicht-titel">${pilz.name}</h1>
        ${pilz.wissenschaftlich ? `<span class="einzelansicht-wissenschaftlich">${pilz.wissenschaftlich}</span>` : ''}
      </div>
    `;
    
    // Bild groß - Pfad absolut machen
    const bildSrc = pilz.bild?.startsWith('/') || pilz.bild?.startsWith('http') 
      ? pilz.bild 
      : `/${pilz.bild}`;
    const bildSection = pilz.bild ? `
      <div class="einzelansicht-bild">
        <img src="${bildSrc}" alt="${pilz.name}" loading="lazy">
      </div>
    ` : '';
    
    // Beschreibung
    const beschreibung = pilz.beschreibung ? `
      <div class="einzelansicht-beschreibung">
        <p>${pilz.beschreibung}</p>
      </div>
    ` : '';
    
    // Alle Felder als Sections - datengetrieben
    const schema = getSchema();
    const versteckt = ['id', 'slug', 'name', 'wissenschaftlich', 'bild', 'beschreibung'];
    
    let felderHTML = '<div class="einzelansicht-felder">';
    
    for (const [key, value] of Object.entries(pilz)) {
      if (versteckt.includes(key) || value === null || value === undefined) continue;
      
      const config = getFeldConfig(key);
      const label = config?.label || key;
      
      felderHTML += `
        <div class="einzelansicht-feld" data-field="${key}">
          <div class="einzelansicht-feld-label">${label}</div>
          <div class="einzelansicht-feld-content" data-morph-target="${key}"></div>
        </div>
      `;
    }
    
    felderHTML += '</div>';
    
    einzelansicht.innerHTML = header + bildSection + beschreibung + felderHTML;
    
    // Morphs für jedes Feld rendern
    for (const [key, value] of Object.entries(pilz)) {
      if (versteckt.includes(key) || value === null || value === undefined) continue;
      
      const target = einzelansicht.querySelector(`[data-morph-target="${key}"]`);
      if (!target) continue;
      
      try {
        // Einzelnes Feld durch Pipeline jagen
        const transformed = transform({ [key]: value }, ctx.config);
        if (transformed.firstElementChild) {
          target.appendChild(transformed.firstElementChild.cloneNode(true));
        }
      } catch (err) {
        debug.fehler('Morph-Fehler', { key, error: err.message });
        target.textContent = String(value);
      }
    }
  }
  
  /**
   * Einzelansicht anzeigen
   */
  function show(pilz) {
    einzelansicht.style.display = 'block';
    render(pilz);
    
    // Grid ausblenden
    const container = document.querySelector('[data-amorph-container]');
    container?.querySelectorAll(':scope > amorph-container[data-morph="item"]').forEach(el => {
      el.style.display = 'none';
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Einzelansicht ausblenden
   */
  function hide() {
    einzelansicht.style.display = 'none';
    einzelansicht.innerHTML = '';
    
    // Grid wieder einblenden
    const container = document.querySelector('[data-amorph-container]');
    container?.querySelectorAll(':scope > amorph-container[data-morph="item"]').forEach(el => {
      el.style.display = '';
    });
  }
  
  // Event: Route Change
  window.addEventListener('amorph:route-change', async (e) => {
    const { route, params } = e.detail;
    
    if (route === 'einzelansicht' && params.slug) {
      // Pilz laden
      const pilz = await ctx.dataSource?.getBySlug?.(params.slug);
      show(pilz);
    } else {
      hide();
    }
  });
  
  // Event: Zurück-Button
  einzelansicht.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="back"]')) {
      navigateTo('liste');
    }
  });
  
  // Export für direkten Aufruf
  return { show, hide, render };
}

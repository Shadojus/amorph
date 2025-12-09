/**
 * KULTUR - Compare-Morph für kulturelle Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. ETHNOMYKOLOGIE
 * 2. GESCHICHTE
 * 3. KUNST & LITERATUR
 * 4. MODERNE KULTUR
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareRange,
  compareText, compareObject, compareTimeline
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareKultur(items, perspektive, config = {}) {
  debug.morphs('compareKultur', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-kultur';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(180, 140, 100, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🎭'}</span>
    <span class="perspektive-name">${perspektive.name || 'Kultur'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: ETHNOMYKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🌿 Ethnomykologie', 'ethno');
  
  // Ethnomykologie
  addSection(sections, items, 'ethnomykologie', 'Ethnomykologie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Indigene Namen
  addSection(sections, items, 'indigene_namen', 'Indigene Namen',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Traditionen Namen
  addSection(sections, items, 'traditionen_namen', 'Traditionelle Namen',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Kulturelle Bedeutung
  addSection(sections, items, 'kulturelle_bedeutung', 'Kulturelle Bedeutung',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Wissenssystem
  addSection(sections, items, 'wissenssystem', 'Wissenssystem',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Spirituelle Bedeutung
  addSection(sections, items, 'spirituelle_bedeutung', 'Spirituelle Bedeutung',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Rituale
  addSection(sections, items, 'rituale', 'Rituale',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Tabus
  addSection(sections, items, 'tabus', 'Tabus',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Mythologie
  addSection(sections, items, 'mythologie', 'Mythologie',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: GESCHICHTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasHistory = items.some(i => 
    i.data.historische_referenzen?.length > 0 || i.data.artefakte
  );
  
  if (hasHistory) {
    addGroupHeader(sections, '📜 Geschichte', 'history');
    
    // Historische Referenzen
    addSection(sections, items, 'historische_referenzen', 'Historische Referenzen',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Zeitperiode
    addSection(sections, items, 'zeitperiode', 'Zeitperiode',
      perspektive.farben?.[1], skipFelder, compareRange);
    
    // Artefakte
    addSection(sections, items, 'artefakte', 'Artefakte',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Texte
    addSection(sections, items, 'texte', 'Historische Texte',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: KUNST & LITERATUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasArt = items.some(i => 
    i.data.kunst_referenzen?.length > 0 || i.data.literatur?.length > 0
  );
  
  if (hasArt) {
    addGroupHeader(sections, '🎨 Kunst & Literatur', 'arts');
    
    // Kunst-Referenzen
    addSection(sections, items, 'kunst_referenzen', 'Kunst-Referenzen',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Literatur
    addSection(sections, items, 'literatur', 'Literatur',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Film
    addSection(sections, items, 'film', 'Film',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Musik
    addSection(sections, items, 'musik', 'Musik',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: MODERNE KULTUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasModern = items.some(i => 
    i.data.popkultur || i.data.tourismus || i.data.festivals?.length > 0
  );
  
  if (hasModern) {
    addGroupHeader(sections, '🌐 Moderne Kultur', 'modern');
    
    // Popkultur
    addSection(sections, items, 'popkultur', 'Popkultur',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Bewegungen
    addSection(sections, items, 'bewegungen', 'Bewegungen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Tourismus
    addSection(sections, items, 'tourismus', 'Tourismus',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Festivals
    addSection(sections, items, 'festivals', 'Festivals',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Traditionen Gerichte
    addSection(sections, items, 'traditionen_gerichte', 'Traditionelle Gerichte',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNKTIONEN
// ═══════════════════════════════════════════════════════════════════════════

function addGroupHeader(container, title, id) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.id = `group-${id}`;
  header.innerHTML = `<h3>${title}</h3>`;
  container.appendChild(header);
}

function addSection(container, items, feld, label, farbe, skipFelder, renderFn) {
  if (skipFelder?.has(feld)) return;
  
  const hasData = items.some(i => {
    const val = i.data[feld];
    if (val === undefined || val === null) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && Object.keys(val).length === 0) return false;
    return true;
  });
  
  if (!hasData) return;
  
  const section = document.createElement('div');
  section.className = 'compare-section';
  section.dataset.feld = feld;
  
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'compare-section-header';
  sectionHeader.innerHTML = `<span class="section-label">${label}</span>`;
  section.appendChild(sectionHeader);
  
  const mapped = items.map(item => ({
    id: item.id,
    name: item.name,
    wert: item.data[feld],
    farbe: item.farbe || farbe
  }));
  
  const content = renderFn(mapped, { label, farbe });
  if (content) {
    section.appendChild(content);
    container.appendChild(section);
  }
}

export default compareKultur;

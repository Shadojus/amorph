/**
 * VISUAL - Compare-Morph für visuelle Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. BILDERGALERIE
 * 2. 360° & 3D
 * 3. FARBDATEN
 * 4. VISUAL SIGNATURE
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar,
  compareText, compareObject, compareImage
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareVisual(items, perspektive, config = {}) {
  debug.morphs('compareVisual', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-visual';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(200, 150, 200, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '📸'}</span>
    <span class="perspektive-name">${perspektive.name || 'Visual'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: BILDERGALERIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🖼️ Bildergalerie', 'gallery');
  
  // Primärbild
  addSection(sections, items, 'primaerbild', 'Primärbild',
    perspektive.farben?.[0], skipFelder, compareImage);
  
  // Bild (falls vorhanden)
  addSection(sections, items, 'bild', 'Bild',
    perspektive.farben?.[0], skipFelder, compareImage);
  
  // Bildergalerie
  addSection(sections, items, 'bildergalerie', 'Bildergalerie',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Bilder-Typen
  addSection(sections, items, 'bilder_typen', 'Bilder-Typen',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Entwicklungsstadien-Bilder
  addSection(sections, items, 'entwicklungsstadien_bilder', 'Entwicklungsstadien-Bilder',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Mikroskopie-Bilder
  addSection(sections, items, 'mikroskopie_bilder', 'Mikroskopie-Bilder',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: 360° & 3D
  // ═══════════════════════════════════════════════════════════════════════════
  
  const has360 = items.some(i => 
    i.data.view_360 || i.data.modell_3d
  );
  
  if (has360) {
    addGroupHeader(sections, '🔄 360° & 3D', '360');
    
    // 360°-Ansicht
    addSection(sections, items, 'view_360', '360°-Ansicht',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Frames
    addSection(sections, items, 'frames', 'Frames',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Rotation
    addSection(sections, items, 'rotation', 'Rotation',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // 3D-Modell
    addSection(sections, items, 'modell_3d', '3D-Modell',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: FARBDATEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasColor = items.some(i => 
    i.data.farbdaten || i.data.rgb_palette?.length > 0
  );
  
  if (hasColor) {
    addGroupHeader(sections, '🎨 Farbdaten', 'color');
    
    // Farbdaten
    addSection(sections, items, 'farbdaten', 'Farbdaten',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Munsell-Farben
    addSection(sections, items, 'munsell_farben', 'Munsell-Farben',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // RGB-Palette
    addSection(sections, items, 'rgb_palette', 'RGB-Palette',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Chemische Reaktionen Farbe
    addSection(sections, items, 'chemische_reaktionen_farbe', 'Chemische Reaktionen',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: VISUAL SIGNATURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSignature = items.some(i => 
    i.data.visual_signature || i.data.erkennungsmerkmale?.length > 0
  );
  
  if (hasSignature) {
    addGroupHeader(sections, '🔍 Visual Signature', 'signature');
    
    // Visual Signature
    addSection(sections, items, 'visual_signature', 'Visual Signature',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Form-Vektor
    addSection(sections, items, 'form_vektor', 'Form-Vektor',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Textur-Vektor
    addSection(sections, items, 'textur_vektor', 'Textur-Vektor',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Farb-Vektor
    addSection(sections, items, 'farb_vektor', 'Farb-Vektor',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Muster-Vektor
    addSection(sections, items, 'muster_vektor', 'Muster-Vektor',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Einzigartigkeit
    addSection(sections, items, 'einzigartigkeit', 'Einzigartigkeit',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    // Verwechslungs-Arten
    addSection(sections, items, 'verwechslungs_arten', 'Verwechslungs-Arten',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // Erkennungsmerkmale
    addSection(sections, items, 'erkennungsmerkmale', 'Erkennungsmerkmale',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // Unterscheidungsmerkmale
    addSection(sections, items, 'unterscheidungsmerkmale', 'Unterscheidungsmerkmale',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // Bestimmungsschema
    addSection(sections, items, 'bestimmungsschema', 'Bestimmungsschema',
      perspektive.farben?.[3], skipFelder, compareObject);
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

export default compareVisual;

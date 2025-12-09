/**
 * ÖKOLOGIE - Compare-Morph für ökologische Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. ÖKOLOGISCHE ROLLE
 * 2. TROPHISCHE STRATEGIE
 * 3. HABITAT
 * 4. INTERAKTIONEN
 * 5. ÖKOSYSTEMFUNKTIONEN
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareText, compareObject, compareRange
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareOekologie(items, perspektive, config = {}) {
  debug.morphs('compareOekologie', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-oekologie';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 200, 140, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🌳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Ökologie'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: ÖKOLOGISCHE ROLLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🔄 Ökologische Rolle', 'role');
  
  // Ökologische Rolle
  addSection(sections, items, 'oekologische_rolle', 'Ökologische Rolle',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Ökologie (falls vorhanden)
  addSection(sections, items, 'oekologie', 'Ökologie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Nährstoffkreislauf
  addSection(sections, items, 'naehrstoffkreislauf', 'Nährstoffkreislauf',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Waldgesundheit
  addSection(sections, items, 'waldgesundheit', 'Waldgesundheit',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Sukzessionsstadium
  addSection(sections, items, 'sukzessionsstadium', 'Sukzessionsstadium',
    perspektive.farben?.[2], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: TROPHISCHE STRATEGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🍽️ Trophische Strategie', 'trophic');
  
  // Trophische Strategie
  addSection(sections, items, 'trophische_strategie', 'Trophische Strategie',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Saprobiont Details
  addSection(sections, items, 'saprobiont_details', 'Saprobiont-Details',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Mykorrhiza Details
  addSection(sections, items, 'mykorrhiza_details', 'Mykorrhiza-Details',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Parasit Details
  addSection(sections, items, 'parasit_details', 'Parasit-Details',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: HABITAT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏞️ Habitat & Standort', 'habitat');
  
  // Habitat
  addSection(sections, items, 'habitat', 'Habitat',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Primärhabitat
  addSection(sections, items, 'primaerhabitat', 'Primärhabitat',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Habitatspezifität
  addSection(sections, items, 'habitatspezifitaet', 'Habitatspezifität',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
  
  // Standort
  addSection(sections, items, 'standort', 'Standort',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Boden-Anforderungen
  addSection(sections, items, 'boden_anforderungen', 'Boden-Anforderungen',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Höhenlage
  addSection(sections, items, 'hoehenlage', 'Höhenlage',
    perspektive.farben?.[2], skipFelder, compareRange);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: INTERAKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasInteractions = items.some(i => 
    i.data.symbionten?.length > 0 || i.data.konkurrenten?.length > 0
  );
  
  if (hasInteractions) {
    addGroupHeader(sections, '🤝 Interaktionen', 'interactions');
    
    // Symbionten
    addSection(sections, items, 'symbionten', 'Symbionten',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Konkurrenten
    addSection(sections, items, 'konkurrenten', 'Konkurrenten',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Konsumenten
    addSection(sections, items, 'konsumenten', 'Konsumenten',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Facilitatoren
    addSection(sections, items, 'facilitatoren', 'Facilitatoren',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: ÖKOSYSTEMFUNKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEcosystem = items.some(i => 
    i.data.oekosystem_services || i.data.kohlenstoff_dynamik
  );
  
  if (hasEcosystem) {
    addGroupHeader(sections, '🌍 Ökosystemfunktionen', 'ecosystem');
    
    // Ökosystem-Services
    addSection(sections, items, 'oekosystem_services', 'Ökosystem-Services',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Kohlenstoff-Dynamik
    addSection(sections, items, 'kohlenstoff_dynamik', 'Kohlenstoff-Dynamik',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Boden-Prozesse
    addSection(sections, items, 'boden_prozesse', 'Boden-Prozesse',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Ausbreitung
    addSection(sections, items, 'ausbreitung', 'Ausbreitung',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Reproduktion
    addSection(sections, items, 'reproduktion', 'Reproduktion',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Metapopulation
    addSection(sections, items, 'metapopulation', 'Metapopulation',
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

export default compareOekologie;

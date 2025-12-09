/**
 * NATURSCHUTZ - Compare-Morph für Naturschutz-Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. SCHUTZSTATUS
 * 2. BEDROHUNGEN
 * 3. SCHUTZMASSNAHMEN
 * 4. POPULATION
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar,
  compareText, compareObject
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareNaturschutz(items, perspektive, config = {}) {
  debug.morphs('compareNaturschutz', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-naturschutz';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(220, 100, 100, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🛡️'}</span>
    <span class="perspektive-name">${perspektive.name || 'Naturschutz'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: SCHUTZSTATUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📋 Schutzstatus', 'status');
  
  // Schutzstatus
  addSection(sections, items, 'schutzstatus', 'Schutzstatus',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // IUCN Status
  addSection(sections, items, 'iucn_status', 'IUCN-Status',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // IUCN Kategorie
  addSection(sections, items, 'iucn_kategorie', 'IUCN-Kategorie',
    perspektive.farben?.[1], skipFelder, compareText);
  
  // IUCN Kriterien
  addSection(sections, items, 'iucn_kriterien', 'IUCN-Kriterien',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // IUCN Trend
  addSection(sections, items, 'iucn_trend', 'IUCN-Trend',
    perspektive.farben?.[2], skipFelder, compareTag);
  
  // Nationale Status
  addSection(sections, items, 'nationale_status', 'Nationale Status',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // CITES Status
  addSection(sections, items, 'cites_status', 'CITES-Status',
    perspektive.farben?.[3], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: BEDROHUNGEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasThreats = items.some(i => 
    i.data.bedrohungen?.length > 0 || i.data.bedrohungs_kategorie
  );
  
  if (hasThreats) {
    addGroupHeader(sections, '⚠️ Bedrohungen', 'threats');
    
    // Bedrohungen
    addSection(sections, items, 'bedrohungen', 'Bedrohungen',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Bedrohungs-Kategorie
    addSection(sections, items, 'bedrohungs_kategorie', 'Bedrohungs-Kategorie',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Bedrohungs-Schwere
    addSection(sections, items, 'bedrohungs_schwere', 'Bedrohungs-Schwere',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 10 }));
    
    // Bedrohungs-Umfang
    addSection(sections, items, 'bedrohungs_umfang', 'Bedrohungs-Umfang',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: SCHUTZMASSNAHMEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🛡️ Schutzmaßnahmen', 'actions');
  
  // Schutzmaßnahmen
  addSection(sections, items, 'schutzmassnahmen', 'Schutzmaßnahmen',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // In-situ Schutz
  addSection(sections, items, 'in_situ_schutz', 'In-situ Schutz',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Ex-situ Schutz
  addSection(sections, items, 'ex_situ_schutz', 'Ex-situ Schutz',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Forschungsbedarf
  addSection(sections, items, 'forschungsbedarf', 'Forschungsbedarf',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Empfehlungen
  addSection(sections, items, 'empfehlungen', 'Empfehlungen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: POPULATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPopulation = items.some(i => 
    i.data.population_trend || i.data.population_groesse
  );
  
  if (hasPopulation) {
    addGroupHeader(sections, '📈 Population', 'population');
    
    // Population Trend
    addSection(sections, items, 'population_trend', 'Population-Trend',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Population Größe
    addSection(sections, items, 'population_groesse', 'Population-Größe',
      perspektive.farben?.[1], skipFelder, compareBar);
    
    // Fragmentierung
    addSection(sections, items, 'fragmentierung', 'Fragmentierung',
      perspektive.farben?.[2], skipFelder, compareObject);
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

export default compareNaturschutz;

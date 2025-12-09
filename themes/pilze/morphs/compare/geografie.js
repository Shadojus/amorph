/**
 * GEOGRAFIE - Compare-Morph für geografische Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. NATIVE VERBREITUNG
 * 2. EINGEFÜHRTE VERBREITUNG
 * 3. FUNDORTE & STATISTIK
 * 4. KLIMAHÜLLE
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRange,
  compareText, compareObject, compareImage
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareGeografie(items, perspektive, config = {}) {
  debug.morphs('compareGeografie', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-geografie';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(100, 160, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🗺️'}</span>
    <span class="perspektive-name">${perspektive.name || 'Geografie'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: NATIVE VERBREITUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🌍 Native Verbreitung', 'native');
  
  // Native Verbreitung
  addSection(sections, items, 'native_verbreitung', 'Native Verbreitung',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Biogeografie
  addSection(sections, items, 'biogeografie', 'Biogeografie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Kontinente
  addSection(sections, items, 'kontinente', 'Kontinente',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Länder
  addSection(sections, items, 'laender', 'Länder',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Biogeografische Regionen
  addSection(sections, items, 'biogeografische_regionen', 'Biogeografische Regionen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Ökoregionen
  addSection(sections, items, 'oekoregionen', 'Ökoregionen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: EINGEFÜHRTE VERBREITUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasIntroduced = items.some(i => 
    i.data.eingefuehrte_verbreitung || i.data.invasivitaet
  );
  
  if (hasIntroduced) {
    addGroupHeader(sections, '🚢 Eingeführte Verbreitung', 'introduced');
    
    // Eingeführte Verbreitung
    addSection(sections, items, 'eingefuehrte_verbreitung', 'Eingeführte Gebiete',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Invasivität
    addSection(sections, items, 'invasivitaet', 'Invasivität',
      perspektive.farben?.[1], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: FUNDORTE & STATISTIK
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📍 Fundorte & Statistik', 'occurrences');
  
  // Fundorte
  addSection(sections, items, 'fundorte', 'Fundorte',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Fundstatistik
  addSection(sections, items, 'fundstatistik', 'Fundstatistik',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Datenquellen
  addSection(sections, items, 'datenquellen', 'Datenquellen',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Räumliche Statistik
  addSection(sections, items, 'raeumliche_statistik', 'Räumliche Statistik',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Regionale Häufigkeit
  addSection(sections, items, 'regionale_haeufigkeit', 'Regionale Häufigkeit',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Verbreitungskarte
  addSection(sections, items, 'verbreitungskarte', 'Verbreitungskarte',
    perspektive.farben?.[2], skipFelder, compareImage);
  
  // Heatmap Funde
  addSection(sections, items, 'heatmap_funde', 'Heatmap Funde',
    perspektive.farben?.[3], skipFelder, compareImage);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: KLIMAHÜLLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasClimate = items.some(i => 
    i.data.klimahuelle || i.data.temperatur_bereich
  );
  
  if (hasClimate) {
    addGroupHeader(sections, '🌡️ Klimahülle', 'climate');
    
    // Klimahülle
    addSection(sections, items, 'klimahuelle', 'Klimahülle',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Temperatur-Bereich
    addSection(sections, items, 'temperatur_bereich', 'Temperatur-Bereich',
      perspektive.farben?.[1], skipFelder, compareRange);
    
    // Niederschlag-Bereich
    addSection(sections, items, 'niederschlag_bereich', 'Niederschlag-Bereich',
      perspektive.farben?.[1], skipFelder, compareRange);
    
    // Köppen-Zonen
    addSection(sections, items, 'koeppen_zonen', 'Köppen-Zonen',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // BioClim-Variablen
    addSection(sections, items, 'bioclim_variablen', 'BioClim-Variablen',
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

export default compareGeografie;

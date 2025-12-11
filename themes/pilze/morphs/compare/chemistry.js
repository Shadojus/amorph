/**
 * chemistry - Compare-Morph für chemische Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. PRIMÄRE METABOLITE (Nährstoffe)
 * 2. SEKUNDÄRE METABOLITE (Bioaktive)
 * 3. VOLATILOM (Aromastoffe)
 * 4. ENZYME
 * 5. PIGMENTE & REAKTIONEN
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareText, compareObject
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function comparechemistry(items, perspektive, config = {}) {
  debug.morphs('comparechemistry', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-chemistry';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(180, 140, 255, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⚗️'}</span>
    <span class="perspektive-name">${perspektive.name || 'chemistry'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: PRIMÄRE METABOLITE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🧪 Primäre Metabolite', 'primary');
  
  // Makronährstoffe
  addSection(sections, items, 'makronaehrstoffe', 'Makronährstoffe',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Nährwerte (Zusammenfassung)
  addSection(sections, items, 'naehrwerte', 'Nährwerte',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Aminosäuren
  addSection(sections, items, 'aminosaeuren', 'Aminosäuren',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Fettsäuren
  addSection(sections, items, 'fettsaeuren', 'Fettsäuren',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Kohlenhydrate
  addSection(sections, items, 'kohlenhydrate', 'Kohlenhydrate',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Vitamine
  addSection(sections, items, 'vitamine', 'Vitamine',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Mineralstoffe
  addSection(sections, items, 'mineralstoffe', 'Mineralstoffe',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: SEKUNDÄRE METABOLITE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSecondary = items.some(i => 
    i.data.sekundaermetabolite || i.data.verbindungsklassen?.length > 0
  );
  
  if (hasSecondary) {
    addGroupHeader(sections, '🔬 Sekundäre Metabolite', 'secondary');
    
    // Übersicht
    addSection(sections, items, 'sekundaermetabolite', 'Sekundärmetabolite',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Verbindungsklassen
    addSection(sections, items, 'verbindungsklassen', 'Verbindungsklassen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Bioaktive Verbindungen
    addSection(sections, items, 'bioaktive_verbindungen', 'Bioaktive Verbindungen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Biosynthese-Pfade
    addSection(sections, items, 'biosynthese_pfade', 'Biosynthese-Pfade',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Chemotyp
    addSection(sections, items, 'chemotyp', 'Chemotyp',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: VOLATILOM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasVolatile = items.some(i => 
    i.data.volatilom || i.data.aromastoffe?.length > 0
  );
  
  if (hasVolatile) {
    addGroupHeader(sections, '💨 Volatilom & Aroma', 'volatile');
    
    // Volatilom
    addSection(sections, items, 'volatilom', 'Volatilom',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Aromastoffe
    addSection(sections, items, 'aromastoffe', 'Aromastoffe',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Geruchsprofil (Radar)
    addSection(sections, items, 'geruchsprofil', 'Geruchsprofil',
      perspektive.farben?.[1], skipFelder, compareRadar);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: ENZYME
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEnzymes = items.some(i => 
    i.data.enzyme || i.data.ligninolytische_enzyme?.length > 0
  );
  
  if (hasEnzymes) {
    addGroupHeader(sections, '⚙️ Enzyme', 'enzymes');
    
    // Enzyme Übersicht
    addSection(sections, items, 'enzyme', 'Enzyme',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Ligninolytische Enzyme
    addSection(sections, items, 'ligninolytische_enzyme', 'Ligninolytische Enzyme',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Industrielle Enzyme
    addSection(sections, items, 'industrielle_enzyme', 'Industrielle Enzyme',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: PIGMENTE & REAKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPigments = items.some(i => 
    i.data.pigmente?.length > 0 || i.data.chemische_reaktionen
  );
  
  if (hasPigments) {
    addGroupHeader(sections, '🎨 Pigmente & Reaktionen', 'pigments');
    
    // Pigmente
    addSection(sections, items, 'pigmente', 'Pigmente',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Chemische Reaktionen
    addSection(sections, items, 'chemische_reaktionen', 'Chemische Reaktionen',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Wirkstoffe
    addSection(sections, items, 'wirkstoffe', 'Wirkstoffe',
      perspektive.farben?.[2], skipFelder, compareBar);
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
  // Skip wenn in skipFelder
  if (skipFelder?.has(feld)) return;
  
  // Prüfe ob mindestens ein Item Daten hat
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
  
  // Map items für Renderer
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

export default comparechemistry;

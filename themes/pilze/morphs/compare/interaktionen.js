/**
 * INTERAKTIONEN - Compare-Morph für Interaktions-Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. MULTI-SPECIES INTERAKTIONEN
 * 2. CHEMISCHE ÖKOLOGIE
 * 3. MIKROBIOM
 * 4. NETZWERK
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
export function compareInteraktionen(items, perspektive, config = {}) {
  debug.morphs('compareInteraktionen', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-interaktionen';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(220, 120, 180, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔗'}</span>
    <span class="perspektive-name">${perspektive.name || 'Interaktionen'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: MULTI-SPECIES INTERAKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🤝 Multi-Species Interaktionen', 'multispecies');
  
  // Multispecies Interaktionen
  addSection(sections, items, 'multispecies_interaktionen', 'Multispecies-Interaktionen',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Netzwerk-Position
  addSection(sections, items, 'netzwerk_position', 'Netzwerk-Position',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Interaktions-Stabilität
  addSection(sections, items, 'interaktions_stabilitaet', 'Interaktions-Stabilität',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
  
  // Symbionten
  addSection(sections, items, 'symbionten', 'Symbionten',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Konkurrenten
  addSection(sections, items, 'konkurrenten', 'Konkurrenten',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Wirt-Interaktionen
  addSection(sections, items, 'wirt_interaktionen', 'Wirt-Interaktionen',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // Parasiten
  addSection(sections, items, 'parasiten', 'Parasiten',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: CHEMISCHE ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasChemEcol = items.some(i => 
    i.data.chemische_oekologie || i.data.allelopathie
  );
  
  if (hasChemEcol) {
    addGroupHeader(sections, '⚗️ Chemische Ökologie', 'chemical');
    
    // Chemische Ökologie
    addSection(sections, items, 'chemische_oekologie', 'Chemische Ökologie',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Allelopathie
    addSection(sections, items, 'allelopathie', 'Allelopathie',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Chemische Kommunikation
    addSection(sections, items, 'chemische_kommunikation', 'Chemische Kommunikation',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Abwehrstoffe
    addSection(sections, items, 'abwehrstoffe', 'Abwehrstoffe',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: MIKROBIOM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMicrobiome = items.some(i => 
    i.data.mikrobiom || i.data.assoziierte_bakterien?.length > 0
  );
  
  if (hasMicrobiome) {
    addGroupHeader(sections, '🦠 Mikrobiom', 'microbiome');
    
    // Mikrobiom
    addSection(sections, items, 'mikrobiom', 'Mikrobiom',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Assoziierte Bakterien
    addSection(sections, items, 'assoziierte_bakterien', 'Assoziierte Bakterien',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Assoziierte Pilze
    addSection(sections, items, 'assoziierte_pilze', 'Assoziierte Pilze',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Community-Struktur
    addSection(sections, items, 'community_struktur', 'Community-Struktur',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: NETZWERK
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNetwork = items.some(i => 
    i.data.mykorrhiza_netzwerk || i.data.naehrstoff_transfer
  );
  
  if (hasNetwork) {
    addGroupHeader(sections, '🌐 Mykorrhiza-Netzwerk', 'network');
    
    // Mykorrhiza-Netzwerk
    addSection(sections, items, 'mykorrhiza_netzwerk', 'Mykorrhiza-Netzwerk',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Nährstoff-Transfer
    addSection(sections, items, 'naehrstoff_transfer', 'Nährstoff-Transfer',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Signal-Transfer
    addSection(sections, items, 'signal_transfer', 'Signal-Transfer',
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

export default compareInteraktionen;

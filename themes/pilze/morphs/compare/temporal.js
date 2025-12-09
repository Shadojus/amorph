/**
 * TEMPORAL - Compare-Morph für zeitliche Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. LEBENSZYKLUS
 * 2. PHÄNOLOGIE (Saison)
 * 3. CIRCADIAN (Tagesrhythmus)
 * 4. GESCHICHTE
 * 5. PROJEKTIONEN (Zukunft)
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareTimeline,
  compareText, compareObject
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareTemporal(items, perspektive, config = {}) {
  debug.morphs('compareTemporal', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-temporal';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 120, 200, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⏳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Temporal'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: LEBENSZYKLUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🔄 Lebenszyklus', 'lifecycle');
  
  // Lebenszyklus
  addSection(sections, items, 'lebenszyklus', 'Lebenszyklus',
    perspektive.farben?.[0], skipFelder, compareTimeline);
  
  // Entwicklungsstadien
  addSection(sections, items, 'entwicklungsstadien', 'Entwicklungsstadien',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Generationszeit
  addSection(sections, items, 'generationszeit', 'Generationszeit',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
  
  // Stadien-Dauer
  addSection(sections, items, 'stadien_dauer', 'Stadien-Dauer',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: PHÄNOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📅 Phänologie & Saison', 'phenology');
  
  // Phänologie
  addSection(sections, items, 'phenologie', 'Phänologie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Saisonalität
  addSection(sections, items, 'saisonalitaet', 'Saisonalität',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Saisonale Verteilung
  addSection(sections, items, 'saisonale_verteilung', 'Saisonale Verteilung',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Monatliche Aktivität
  addSection(sections, items, 'monatliche_aktivitaet', 'Monatliche Aktivität',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // Peak-Perioden
  addSection(sections, items, 'peak_perioden', 'Peak-Perioden',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Geografische Variation
  addSection(sections, items, 'geografische_variation', 'Geografische Variation',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: CIRCADIAN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCircadian = items.some(i => 
    i.data.circadian || i.data.sporenfreisetzung_zeit
  );
  
  if (hasCircadian) {
    addGroupHeader(sections, '🌅 Tagesrhythmus', 'circadian');
    
    // Circadian
    addSection(sections, items, 'circadian', 'Circadian',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Sporenfreisetzung-Zeit
    addSection(sections, items, 'sporenfreisetzung_zeit', 'Sporenfreisetzung',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Wachstumsrate-Zeit
    addSection(sections, items, 'wachstumsrate_zeit', 'Wachstumsrate',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Metabolischer Rhythmus
    addSection(sections, items, 'metabolischer_rhythmus', 'Metabolischer Rhythmus',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Lichtreaktion
    addSection(sections, items, 'lichtreaktion', 'Lichtreaktion',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: GESCHICHTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasHistory = items.some(i => 
    i.data.entdeckung || i.data.erstbeschreibung || i.data.meilensteine
  );
  
  if (hasHistory) {
    addGroupHeader(sections, '📜 Geschichte', 'history');
    
    // Entdeckung
    addSection(sections, items, 'entdeckung', 'Entdeckung',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Erstbeschreibung
    addSection(sections, items, 'erstbeschreibung', 'Erstbeschreibung',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Meilensteine
    addSection(sections, items, 'meilensteine', 'Meilensteine',
      perspektive.farben?.[1], skipFelder, compareTimeline);
    
    // Kultivierungs-Timeline
    addSection(sections, items, 'kultivierungs_timeline', 'Kultivierungs-Timeline',
      perspektive.farben?.[2], skipFelder, compareTimeline);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: PROJEKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasProjections = items.some(i => 
    i.data.klima_projektionen || i.data.zukunfts_szenarien
  );
  
  if (hasProjections) {
    addGroupHeader(sections, '🔮 Zukunft & Projektionen', 'projections');
    
    // Klima-Projektionen
    addSection(sections, items, 'klima_projektionen', 'Klima-Projektionen',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Naturschutz-Prognose
    addSection(sections, items, 'naturschutz_prognose', 'Naturschutz-Prognose',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Zukunfts-Szenarien
    addSection(sections, items, 'zukunfts_szenarien', 'Zukunfts-Szenarien',
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

export default compareTemporal;

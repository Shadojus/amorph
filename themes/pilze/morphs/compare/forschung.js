/**
 * FORSCHUNG - Compare-Morph für Forschungs-Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. FORSCHUNGSAKTIVITÄT
 * 2. PATENTE
 * 3. BIOTECHNOLOGIE
 * 4. ZUKUNFTSPOTENTIAL
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
export function compareForschung(items, perspektive, config = {}) {
  debug.morphs('compareForschung', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-forschung';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(80, 200, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔎'}</span>
    <span class="perspektive-name">${perspektive.name || 'Forschung'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: FORSCHUNGSAKTIVITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📊 Forschungsaktivität', 'activity');
  
  // Forschungs-Aktivität
  addSection(sections, items, 'forschungs_aktivitaet', 'Forschungs-Aktivität',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Forschung (Prozent)
  addSection(sections, items, 'forschung', 'Forschung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100, einheit: '%' }));
  
  // Publikationen Anzahl
  addSection(sections, items, 'publikationen_anzahl', 'Publikationen',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // Publikationen Trend
  addSection(sections, items, 'publikationen_trend', 'Publikationen-Trend',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Forschungsgruppen
  addSection(sections, items, 'forschungsgruppen', 'Forschungsgruppen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Aktuelle Themen
  addSection(sections, items, 'aktuelle_themen', 'Aktuelle Themen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Klinische Studien
  addSection(sections, items, 'klinische_studien', 'Klinische Studien',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Schlüssel-Publikationen
  addSection(sections, items, 'schluessel_publikationen', 'Schlüssel-Publikationen',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Forschung Referenzen
  addSection(sections, items, 'forschung_referenzen', 'Forschung-Referenzen',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: PATENTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPatents = items.some(i => 
    i.data.patente?.length > 0 || i.data.patent_nummer
  );
  
  if (hasPatents) {
    addGroupHeader(sections, '📜 Patente', 'patents');
    
    // Patente
    addSection(sections, items, 'patente', 'Patente',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Patent-Nummer
    addSection(sections, items, 'patent_nummer', 'Patent-Nummer',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Erfinder
    addSection(sections, items, 'erfinder', 'Erfinder',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Anwendungen
    addSection(sections, items, 'anwendungen', 'Anwendungen',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: BIOTECHNOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBiotech = items.some(i => 
    i.data.biotechnologie || i.data.gentechnik
  );
  
  if (hasBiotech) {
    addGroupHeader(sections, '🧬 Biotechnologie', 'biotech');
    
    // Biotechnologie
    addSection(sections, items, 'biotechnologie', 'Biotechnologie',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Biotech-Anwendungen
    addSection(sections, items, 'anwendungen_biotech', 'Biotech-Anwendungen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Gentechnik
    addSection(sections, items, 'gentechnik', 'Gentechnik',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Synthetische Biologie
    addSection(sections, items, 'synthetische_biologie', 'Synthetische Biologie',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: ZUKUNFTSPOTENTIAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFuture = items.some(i => 
    i.data.zukunftspotential || i.data.emerging_applications?.length > 0
  );
  
  if (hasFuture) {
    addGroupHeader(sections, '🚀 Zukunftspotential', 'future');
    
    // Zukunftspotential
    addSection(sections, items, 'zukunftspotential', 'Zukunftspotential',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Emerging Applications
    addSection(sections, items, 'emerging_applications', 'Emerging Applications',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Forschungslücken
    addSection(sections, items, 'forschungsluecken', 'Forschungslücken',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Investitionsmöglichkeiten
    addSection(sections, items, 'investitionsmoeglichkeiten', 'Investitionsmöglichkeiten',
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

export default compareForschung;

/**
 * WIRTSCHAFT - Compare-Morph für wirtschaftliche Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. MARKTSTATUS
 * 2. PRODUKTION
 * 3. PREISE
 * 4. HANDEL
 * 5. WERTSCHÖPFUNG
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
export function compareWirtschaft(items, perspektive, config = {}) {
  debug.morphs('compareWirtschaft', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-wirtschaft';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 215, 100, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '💰'}</span>
    <span class="perspektive-name">${perspektive.name || 'Wirtschaft'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: MARKTSTATUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📊 Marktstatus', 'market');
  
  // Marktstatus
  addSection(sections, items, 'marktstatus', 'Marktstatus',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Handelsart
  addSection(sections, items, 'handelsart', 'Handelsart',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Verfügbarkeit
  addSection(sections, items, 'verfuegbarkeit', 'Verfügbarkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: PRODUKTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏭 Produktion', 'production');
  
  // Produktion
  addSection(sections, items, 'produktion', 'Produktion',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Globale Produktion
  addSection(sections, items, 'globale_produktion', 'Globale Produktion',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' t/Jahr' }));
  
  // Hauptproduzenten
  addSection(sections, items, 'hauptproduzenten', 'Hauptproduzenten',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Produktionstrend
  addSection(sections, items, 'produktionstrend', 'Produktionstrend',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: PREISE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '💵 Preise', 'pricing');
  
  // Preise
  addSection(sections, items, 'preise', 'Preise',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Einzelhandel
  addSection(sections, items, 'einzelhandel', 'Einzelhandel',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' €/kg' }));
  
  // Großhandel
  addSection(sections, items, 'grosshandel', 'Großhandel',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' €/kg' }));
  
  // Preisvolatilität
  addSection(sections, items, 'preisvolatilitaet', 'Preisvolatilität',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Saisonale Preise
  addSection(sections, items, 'saisonale_preise', 'Saisonale Preise',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: HANDEL
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTrade = items.some(i => 
    i.data.handel || i.data.exporte || i.data.importe
  );
  
  if (hasTrade) {
    addGroupHeader(sections, '🌐 Handel', 'trade');
    
    // Handel
    addSection(sections, items, 'handel', 'Handel',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Exporte
    addSection(sections, items, 'exporte', 'Exporte',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Importe
    addSection(sections, items, 'importe', 'Importe',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Handelsregulierungen
    addSection(sections, items, 'handelsregulierungen', 'Handelsregulierungen',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: WERTSCHÖPFUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasValue = items.some(i => 
    i.data.wertschoepfungskette || i.data.wirtschaftliche_bedeutung
  );
  
  if (hasValue) {
    addGroupHeader(sections, '💎 Wertschöpfung', 'value');
    
    // Wertschöpfungskette
    addSection(sections, items, 'wertschoepfungskette', 'Wertschöpfungskette',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Stufen
    addSection(sections, items, 'stufen', 'Stufen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Endprodukte
    addSection(sections, items, 'endprodukte', 'Endprodukte',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Wirtschaftliche Bedeutung
    addSection(sections, items, 'wirtschaftliche_bedeutung', 'Wirtschaftliche Bedeutung',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Direkter Wert
    addSection(sections, items, 'direkter_wert', 'Direkter Wert',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' €' }));
    
    // Indirekter Wert
    addSection(sections, items, 'indirekter_wert', 'Indirekter Wert',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' €' }));
    
    // Beschäftigung
    addSection(sections, items, 'beschaeftigung', 'Beschäftigung',
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

export default compareWirtschaft;

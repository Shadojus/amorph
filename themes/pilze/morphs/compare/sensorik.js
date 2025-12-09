/**
 * SENSORIK - Compare-Morph für sensorische Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. AROMA (Olfaktorisch)
 * 2. GESCHMACK (Gustatorisch)
 * 3. TEXTUR (Taktil)
 * 4. ERSCHEINUNG (Visuell)
 * 5. KLANG (Auditiv)
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareText, compareObject, compareRating
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareSensorik(items, perspektive, config = {}) {
  debug.morphs('compareSensorik', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-sensorik';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 180, 120, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '👃'}</span>
    <span class="perspektive-name">${perspektive.name || 'Sensorik'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: AROMA (Olfaktorisch)
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '👃 Aroma & Geruch', 'aroma');
  
  // Sensorik Profil (Radar)
  addSection(sections, items, 'sensorik', 'Sensorisches Profil',
    perspektive.farben?.[0], skipFelder, compareRadar);
  
  // Aroma
  addSection(sections, items, 'aroma', 'Aroma',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Aroma Profil
  addSection(sections, items, 'aroma_profil', 'Aroma-Profil',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Aroma Intensität
  addSection(sections, items, 'aroma_intensitaet', 'Aroma-Intensität',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 10 }));
  
  // Aroma Rad
  addSection(sections, items, 'aroma_rad', 'Aroma-Rad',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // Aroma Evolution
  addSection(sections, items, 'aroma_evolution', 'Aroma-Evolution',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Geruchsstoffe
  addSection(sections, items, 'geruchsstoffe', 'Geruchsstoffe',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: GESCHMACK (Gustatorisch)
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '👅 Geschmack', 'taste');
  
  // Geschmack Primär
  addSection(sections, items, 'geschmack_primaer', 'Primärgeschmack',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Geschmack Sekundär
  addSection(sections, items, 'geschmack_sekundaer', 'Sekundärgeschmack',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Geschmack Objekt
  addSection(sections, items, 'geschmack', 'Geschmack',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Grundgeschmack (Radar: Süß, Sauer, Salzig, Bitter, Umami)
  addSection(sections, items, 'grundgeschmack', 'Grundgeschmack',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // Umami Komponenten
  addSection(sections, items, 'umami_komponenten', 'Umami-Komponenten',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Geschmacksverbindungen
  addSection(sections, items, 'geschmacksverbindungen', 'Geschmacksverbindungen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Geschmacks-Timeline
  addSection(sections, items, 'geschmacks_timeline', 'Geschmacks-Timeline',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Nachgeschmack
  addSection(sections, items, 'nachgeschmack', 'Nachgeschmack',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: TEXTUR (Taktil)
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '✋ Textur & Mundgefühl', 'texture');
  
  // Textur Roh
  addSection(sections, items, 'textur_roh', 'Textur (Roh)',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Textur Gegart
  addSection(sections, items, 'textur_gegart', 'Textur (Gegart)',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Textur Objekt
  addSection(sections, items, 'textur', 'Textur',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Mechanische Eigenschaften
  addSection(sections, items, 'mechanische_eigenschaften', 'Mechanische Eigenschaften',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: ERSCHEINUNG (Visuell)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasVisual = items.some(i => 
    i.data.erscheinung || i.data.farbstabilitaet || i.data.oberflaeche
  );
  
  if (hasVisual) {
    addGroupHeader(sections, '👁️ Erscheinung', 'appearance');
    
    // Erscheinung
    addSection(sections, items, 'erscheinung', 'Erscheinung',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Farbstabilität
    addSection(sections, items, 'farbstabilitaet', 'Farbstabilität',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Oberfläche
    addSection(sections, items, 'oberflaeche', 'Oberfläche',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: KLANG (Auditiv)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSound = items.some(i => 
    i.data.klang || i.data.bruchgeraeusch || i.data.schnittgeraeusch
  );
  
  if (hasSound) {
    addGroupHeader(sections, '🔊 Klang', 'sound');
    
    // Klang
    addSection(sections, items, 'klang', 'Klang',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Bruchgeräusch
    addSection(sections, items, 'bruchgeraeusch', 'Bruchgeräusch',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Schnittgeräusch
    addSection(sections, items, 'schnittgeraeusch', 'Schnittgeräusch',
      perspektive.farben?.[2], skipFelder, compareText);
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

export default compareSensorik;

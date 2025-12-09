/**
 * KULINARISCH - Compare-Morph für kulinarische Perspektive
 * 
 * Übersichtlich gruppiert in 4 Hauptbereiche:
 * 1. SICHERHEIT & BEWERTUNG
 * 2. GESCHMACK & TEXTUR  
 * 3. ZUBEREITUNG & PAIRINGS
 * 4. LAGERUNG & NÄHRWERT
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, comparePie, 
  compareRating, compareRange
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareKulinarisch(items, perspektive, config = {}) {
  debug.morphs('compareKulinarisch', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-kulinarisch';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 200, 120, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🍳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Kulinarisch'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: SICHERHEIT & BEWERTUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🛡️ Sicherheit & Bewertung', 'safety');
  
  // Essbarkeit Status + Rating in einer Zeile
  addSection(sections, items, 'essbarkeit_status', 'Essbarkeit', 
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'essbarkeit_rating', 'Qualitätsbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  
  // Warnungen (wichtig!)
  addSection(sections, items, 'essbarkeit_warnungen', 'Warnhinweise',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Legacy Bewertung
  addSection(sections, items, 'bewertung', 'Gesamtbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 5 }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: GESCHMACK & TEXTUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '👅 Geschmack & Textur', 'taste');
  
  // Sensorik Radar (Hauptvisualisierung)
  addSection(sections, items, 'sensorik', 'Sensorisches Profil',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // Geschmack als kompakte Tags
  addSection(sections, items, 'geschmack_primaer', 'Hauptgeschmack',
    perspektive.farben?.[1], skipFelder, compareList);
  
  addSection(sections, items, 'geschmack_sekundaer', 'Nebennoten',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Texturen
  addSection(sections, items, 'textur_roh', 'Textur (roh)',
    perspektive.farben?.[1], skipFelder, compareList);
  
  addSection(sections, items, 'textur_gegart', 'Textur (gegart)',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Legacy Profil
  addSection(sections, items, 'profil', 'Geschmacksprofil',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: ZUBEREITUNG & PAIRINGS
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🍳 Zubereitung & Pairings', 'cooking');
  
  // Methoden als Tags
  addSection(sections, items, 'zubereitung_methoden', 'Zubereitungsarten',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Optimale Zubereitung als Balken (spezielle Behandlung für {label, value} Arrays)
  addObjectArraySection(sections, items, 'zubereitung_optimal', 'Beste Methoden',
    perspektive.farben?.[2], skipFelder);
  
  // Fehler vermeiden
  addSection(sections, items, 'zubereitung_fehler', 'Fehler vermeiden',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Pairings
  addObjectArraySection(sections, items, 'pairings_klassisch', 'Klassische Pairings',
    perspektive.farben?.[3], skipFelder);
  
  addSection(sections, items, 'pairings_modern', 'Moderne Pairings',
    perspektive.farben?.[3], skipFelder, compareList);
  
  addSection(sections, items, 'pairings_getraenke', 'Getränke',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Synergien
  addSection(sections, items, 'synergien', 'Geschmacks-Synergien',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: LAGERUNG & NÄHRWERT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📦 Lagerung & Nährwert', 'storage');
  
  // Lagerung
  addSection(sections, items, 'lagerung_temperatur', 'Lagertemperatur',
    perspektive.farben?.[0], skipFelder, compareRange);
  
  addSection(sections, items, 'lagerung_haltbarkeit_tage', 'Haltbarkeit (Tage)',
    perspektive.farben?.[0], skipFelder, compareBar);
  
  addSection(sections, items, 'lagerung_indikatoren', 'Frische-Check',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Konservierung
  addObjectArraySection(sections, items, 'konservierung', 'Konservierung',
    perspektive.farben?.[0], skipFelder);
  
  // Nährwerte
  addSection(sections, items, 'naehrwerte', 'Makronährstoffe',
    perspektive.farben?.[1], skipFelder, comparePie);
  
  // Nährwert-Highlights & Bioaktive als spezielle Tabelle
  addNutrientHighlights(sections, items, 'naehrwert_highlights', 'Nährwert-Highlights',
    perspektive.farben?.[1], skipFelder);
  
  addNutrientHighlights(sections, items, 'bioaktive_substanzen', 'Bioaktive Stoffe',
    perspektive.farben?.[1], skipFelder);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: TRADITION & KULTUR (optional)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Nur anzeigen wenn Daten vorhanden
  const hasTradition = items.some(i => 
    i.data.traditionen_namen?.length || i.data.traditionen_gerichte?.length
  );
  
  if (hasTradition) {
    addGroupHeader(sections, '🌍 Tradition & Kultur', 'culture');
    
    addSection(sections, items, 'traditionen_namen', 'Regionale Namen',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'traditionen_gerichte', 'Klassische Gerichte',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'saisonalitaet', 'Saison',
      perspektive.farben?.[2], skipFelder, compareTag);
  }
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fügt einen Gruppen-Header hinzu
 */
function addGroupHeader(sections, title, groupId) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.dataset.group = groupId;
  header.innerHTML = `<span class="group-title">${title}</span>`;
  sections.appendChild(header);
}

/**
 * Standard-Section hinzufügen
 */
function addSection(sections, items, feldName, label, farbe, skipFelder, compareFn) {
  const filteredItems = items.filter(i => {
    const wert = i.data[feldName];
    return wert !== undefined && wert !== null && 
           (Array.isArray(wert) ? wert.length > 0 : true);
  });
  
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const mapped = filteredItems.map(i => ({
    id: i.id,
    name: i.name,
    wert: i.data[feldName],
    farbe: i.farbe,
    textFarbe: i.textFarbe,
    farbKlasse: i.farbKlasse
  }));
  
  const content = compareFn(mapped, { label: null });
  
  // Nur appendChild wenn gültiger DOM-Node
  if (content && content instanceof Node) {
    section.addContent(content);
    sections.appendChild(section);
  }
}

/**
 * Spezielle Section für Arrays von {label, value} Objekten
 * Rendert als übersichtliche Balken-Gruppe
 */
function addObjectArraySection(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => {
    const wert = i.data[feldName];
    return Array.isArray(wert) && wert.length > 0 && typeof wert[0] === 'object';
  });
  
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-object-array';
  
  // Sammle alle Labels aus allen Items
  const allLabels = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(obj => {
      if (obj.label) allLabels.add(obj.label);
    });
  });
  
  // Tabellen-Layout
  const table = document.createElement('div');
  table.className = 'compare-matrix';
  
  // Header mit Item-Namen
  const headerRow = document.createElement('div');
  headerRow.className = 'matrix-header';
  headerRow.innerHTML = `<div class="matrix-cell matrix-label"></div>`;
  filteredItems.forEach(item => {
    const cell = document.createElement('div');
    cell.className = `matrix-cell matrix-item ${item.farbKlasse || ''}`;
    cell.style.color = item.textFarbe || '';
    cell.textContent = item.name;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);
  
  // Zeilen für jeden Label
  const maxValue = 100; // Annahme: Werte sind 0-100
  
  allLabels.forEach(labelText => {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    
    // Label
    const labelCell = document.createElement('div');
    labelCell.className = 'matrix-cell matrix-label';
    labelCell.textContent = labelText;
    row.appendChild(labelCell);
    
    // Werte für jedes Item
    filteredItems.forEach(item => {
      const obj = (item.data[feldName] || []).find(o => o.label === labelText);
      const value = obj?.value || 0;
      const pct = Math.min(100, (value / maxValue) * 100);
      
      const cell = document.createElement('div');
      cell.className = 'matrix-cell matrix-value';
      
      const inner = document.createElement('div');
      inner.innerHTML = `
        <div class="matrix-bar">
          <div class="matrix-bar-fill" style="width:${pct}%;background:${item.farbe || 'rgba(100,100,100,0.5)'}"></div>
        </div>
        <span class="matrix-val">${value}</span>
      `;
      cell.appendChild(inner);
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Spezielle Section für Nährwert-Highlights mit Units
 */
function addNutrientHighlights(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => {
    const wert = i.data[feldName];
    return Array.isArray(wert) && wert.length > 0;
  });
  
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-nutrients';
  
  // Sammle alle Labels
  const allLabels = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(obj => {
      if (obj.label) allLabels.add(obj.label);
    });
  });
  
  // Kompakte Darstellung
  const table = document.createElement('div');
  table.className = 'nutrient-table';
  
  allLabels.forEach(labelText => {
    const row = document.createElement('div');
    row.className = 'nutrient-row';
    
    const labelCell = document.createElement('span');
    labelCell.className = 'nutrient-label';
    labelCell.textContent = labelText;
    row.appendChild(labelCell);
    
    const values = document.createElement('span');
    values.className = 'nutrient-values';
    
    filteredItems.forEach(item => {
      const obj = (item.data[feldName] || []).find(o => o.label === labelText);
      if (obj) {
        const chip = document.createElement('span');
        chip.className = `nutrient-chip ${item.farbKlasse || ''}`;
        chip.style.borderColor = item.farbe || '';
        chip.innerHTML = `<b>${obj.value}</b>${obj.unit || ''}`;
        values.appendChild(chip);
      } else {
        const chip = document.createElement('span');
        chip.className = 'nutrient-chip empty';
        chip.textContent = '–';
        values.appendChild(chip);
      }
    });
    
    row.appendChild(values);
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

export default {
  id: 'kulinarisch',
  render: compareKulinarisch
};

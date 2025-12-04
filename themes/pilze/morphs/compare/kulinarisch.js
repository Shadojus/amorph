/**
 * KULINARISCH - Compare-Morph für kulinarische Perspektive
 * 
 * Zeigt: Essbarkeit, Geschmack, Nährwerte, Bewertung, Profil
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { detectType, createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, comparePie, compareRating 
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareKulinarisch(items, perspektive, config = {}) {
  debug.morphs('compareKulinarisch', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-kulinarisch';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || '#e8b04a');
  
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
  
  // Sections basierend auf verfügbaren Daten
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Essbarkeit (Tag)
  const essbarkeitItems = items.filter(i => i.data.essbarkeit);
  if (essbarkeitItems.length > 0) {
    const section = createSectionIfNew('essbarkeit', 'Essbarkeit', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = essbarkeitItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.essbarkeit, farbe: i.farbe
      }));
      section.addContent(compareTag(mapped, { label: null }));
      sections.appendChild(section);
    }
  }
  
  // 2. Geschmack (List)
  const geschmackItems = items.filter(i => i.data.geschmack);
  if (geschmackItems.length > 0) {
    const section = createSectionIfNew('geschmack', 'Geschmack', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = geschmackItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.geschmack, farbe: i.farbe
      }));
      section.addContent(compareList(mapped, { label: null }));
      sections.appendChild(section);
    }
  }
  
  // 3. Profil (Radar)
  const profilItems = items.filter(i => i.data.profil);
  if (profilItems.length > 0) {
    const section = createSectionIfNew('profil', 'Geschmacksprofil', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = profilItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.profil, farbe: i.farbe
      }));
      section.addContent(compareRadar(mapped, { label: null }));
      sections.appendChild(section);
    }
  }
  
  // 4. Nährwerte (Pie)
  const naehrwerteItems = items.filter(i => i.data.naehrwerte);
  if (naehrwerteItems.length > 0) {
    const section = createSectionIfNew('naehrwerte', 'Nährwerte', perspektive.farben?.[3], skipFelder);
    if (section) {
      const mapped = naehrwerteItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.naehrwerte, farbe: i.farbe
      }));
      section.addContent(comparePie(mapped, { label: null }));
      sections.appendChild(section);
    }
  }
  
  // 5. Bewertung (Bar/Rating)
  const bewertungItems = items.filter(i => i.data.bewertung !== undefined);
  if (bewertungItems.length > 0) {
    const section = createSectionIfNew('bewertung', 'Bewertung', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = bewertungItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.bewertung, farbe: i.farbe
      }));
      section.addContent(compareRating(mapped, { label: null, max: 5 }));
      sections.appendChild(section);
    }
  }
  
  // 6. Zubereitung (Text/List)
  const zubereitungItems = items.filter(i => i.data.zubereitung);
  if (zubereitungItems.length > 0) {
    const section = createSectionIfNew('zubereitung', 'Zubereitung', perspektive.farben?.[1], skipFelder);
    if (section) {
      section.addContent(createTextCompare(zubereitungItems, 'zubereitung'));
      sections.appendChild(section);
    }
  }
  
  container.appendChild(sections);
  return container;
}

function createTextCompare(items, feldName) {
  const el = document.createElement('div');
  el.className = 'compare-text-simple';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'text-row';
    row.innerHTML = `
      <span class="text-name" style="color:${item.farbe}">${item.name}</span>
      <span class="text-wert">${item.data[feldName] || '–'}</span>
    `;
    el.appendChild(row);
  });
  
  return el;
}

export default {
  id: 'kulinarisch',
  render: compareKulinarisch
};

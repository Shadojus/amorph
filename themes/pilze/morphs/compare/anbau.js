/**
 * ANBAU - Compare-Morph für Anbau-Perspektive
 * 
 * Zeigt: Standort, Saison, Temperatur, Lebenszyklus, Ernte-Stats
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 */

import { debug } from '../../../../observer/debug.js';
import { createSection, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareList, compareTag, compareRange, compareTimeline, compareBar 
} from '../../../../morphs/compare/morphs.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} schema - {felder, ...}
 */
export function compareAnbau(items, perspektive, schema) {
  debug.morphs('compareAnbau', { items: items.length });
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-anbau';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || '#5cc98a');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🌱'}</span>
    <span class="perspektive-name">${perspektive.name || 'Anbau'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Standort (List mit Overlap)
  const standortItems = items.filter(i => i.data.standort?.length > 0);
  if (standortItems.length > 0) {
    const section = createSection('Fundorte', perspektive.farben?.[0]);
    const mapped = standortItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.standort, farbe: i.farbe
    }));
    section.addContent(compareList(mapped, {}));
    sections.appendChild(section);
  }
  
  // 2. Saison (Tag)
  const saisonItems = items.filter(i => i.data.saison);
  if (saisonItems.length > 0) {
    const section = createSection('Saison', perspektive.farben?.[1]);
    const mapped = saisonItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.saison, farbe: i.farbe
    }));
    section.addContent(compareTag(mapped, {}));
    sections.appendChild(section);
  }
  
  // 3. Temperatur (Range)
  const tempItems = items.filter(i => i.data.temperatur);
  if (tempItems.length > 0) {
    const section = createSection('Temperatur', perspektive.farben?.[2]);
    const mapped = tempItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.temperatur, farbe: i.farbe
    }));
    section.addContent(compareRange(mapped, { einheit: '°C' }));
    sections.appendChild(section);
  }
  
  // 4. Lebenszyklus (Timeline)
  const lebenszyklusItems = items.filter(i => i.data.lebenszyklus?.length > 0);
  if (lebenszyklusItems.length > 0) {
    const section = createSection('Lebenszyklus', perspektive.farben?.[3]);
    const mapped = lebenszyklusItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.lebenszyklus, farbe: i.farbe
    }));
    section.addContent(compareTimeline(mapped, {}));
    sections.appendChild(section);
  }
  
  // 5. Ernte-Stats (Bar)
  const ernteItems = items.filter(i => i.data.ernte_stats);
  if (ernteItems.length > 0) {
    const section = createSection('Ernte-Statistik', perspektive.farben?.[0]);
    const mapped = ernteItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.ernte_stats.avg || 0, farbe: i.farbe
    }));
    section.addContent(compareBar(mapped, { einheit: 'g' }));
    sections.appendChild(section);
  }
  
  container.appendChild(sections);
  return container;
}

export default {
  id: 'anbau',
  render: compareAnbau
};

/**
 * SICHERHEIT - Compare-Morph für Sicherheits-Perspektive
 * 
 * Zeigt: Essbarkeit, Toxizität, Verwechslung, Symptome
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareText 
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareSicherheit(items, perspektive, config = {}) {
  debug.morphs('compareSicherheit', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-sicherheit';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 140, 160, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⚠️'}</span>
    <span class="perspektive-name">${perspektive.name || 'Sicherheit'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Essbarkeit (Tag) - Wichtigste Info!
  const essbarkeitItems = items.filter(i => i.data.essbarkeit);
  if (essbarkeitItems.length > 0) {
    const section = createSectionIfNew('essbarkeit', '⚠️ Essbarkeit', perspektive.farben?.[0], skipFelder);
    if (section) {
      section.classList.add('section-primary');
      const mapped = essbarkeitItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.essbarkeit, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 2. Toxizität (Progress/Bar)
  const toxizitaetItems = items.filter(i => i.data.toxizitaet !== undefined);
  if (toxizitaetItems.length > 0) {
    const section = createSectionIfNew('toxizitaet', 'Toxizitätsgrad', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = toxizitaetItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.toxizitaet, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareBar(mapped, { max: 100, einheit: '%' }));
      sections.appendChild(section);
    }
  }
  
  // 3. Verwechslung (List) - mit Overlap-Anzeige
  const verwechslungItems = items.filter(i => i.data.verwechslung?.length > 0);
  if (verwechslungItems.length > 0) {
    const section = createSectionIfNew('verwechslung', 'Verwechslungsgefahr', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = verwechslungItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.verwechslung, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 4. Symptome (nur bei giftigen)
  const symptomeItems = items.filter(i => i.data.symptome);
  if (symptomeItems.length > 0) {
    const section = createSectionIfNew('symptome', 'Symptome bei Verzehr', perspektive.farben?.[3], skipFelder);
    if (section) {
      section.classList.add('section-danger');
      const mapped = symptomeItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.symptome, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareText(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 5. Verfügbarkeit/Status (Badge)
  const statusItems = items.filter(i => i.data.verfuegbarkeit);
  if (statusItems.length > 0) {
    const section = createSectionIfNew('verfuegbarkeit', 'Status', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = statusItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.verfuegbarkeit, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  container.appendChild(sections);
  return container;
}

export default {
  id: 'sicherheit',
  render: compareSicherheit
};

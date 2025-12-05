/**
 * STATISTIK - Compare-Morph für Statistik-Perspektive
 * 
 * Zeigt: Bewertung, Beliebtheit, Ernte-Stats, Nährwerte, Wirkstoffe, Profil
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareBar, compareRating, comparePie, compareRadar, compareStats 
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareStatistik(items, perspektive, config = {}) {
  debug.morphs('compareStatistik', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-statistik';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 255, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '📊'}</span>
    <span class="perspektive-name">${perspektive.name || 'Statistik'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Bewertung (Rating)
  const bewertungItems = items.filter(i => i.data.bewertung !== undefined);
  if (bewertungItems.length > 0) {
    const section = createSectionIfNew('bewertung', 'Bewertung', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = bewertungItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.bewertung, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareRating(mapped, { max: 5 }));
      sections.appendChild(section);
    }
  }
  
  // 2. Beliebtheit (Bar)
  const beliebtheitItems = items.filter(i => i.data.beliebtheit !== undefined);
  if (beliebtheitItems.length > 0) {
    const section = createSectionIfNew('beliebtheit', 'Beliebtheit', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = beliebtheitItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.beliebtheit, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareBar(mapped, { max: 100, einheit: '%' }));
      sections.appendChild(section);
    }
  }
  
  // 3. Ernte-Statistik (Stats -> Bar für avg)
  const ernteItems = items.filter(i => i.data.ernte_stats);
  if (ernteItems.length > 0) {
    const section = createSectionIfNew('ernte_stats', 'Ernte-Statistik', perspektive.farben?.[2], skipFelder);
    if (section) {
      section.addContent(createErnteSummary(ernteItems));
      sections.appendChild(section);
    }
  }
  
  // 4. Nährwerte (Pie)
  const naehrwerteItems = items.filter(i => i.data.naehrwerte);
  if (naehrwerteItems.length > 0) {
    const section = createSectionIfNew('naehrwerte', 'Nährwert-Verteilung', perspektive.farben?.[3], skipFelder);
    if (section) {
      const mapped = naehrwerteItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.naehrwerte, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(comparePie(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 5. Profil (Radar)
  const profilItems = items.filter(i => i.data.profil);
  if (profilItems.length > 0) {
    const section = createSectionIfNew('profil', 'Eigenschaften-Radar', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = profilItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.profil, farbe: i.farbe, textFarbe: i.textFarbe
      }));
      section.addContent(compareRadar(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  container.appendChild(sections);
  return container;
}

/**
 * Erstellt Ernte-Stats Vergleich
 */
function createErnteSummary(items) {
  const el = document.createElement('div');
  el.className = 'compare-ernte-stats';
  
  // Zeilen für min, avg, max
  ['min', 'avg', 'max'].forEach(key => {
    const row = document.createElement('div');
    row.className = 'ernte-row';
    
    const label = document.createElement('span');
    label.className = 'ernte-label';
    label.textContent = key === 'avg' ? '⌀ Durchschnitt' : key === 'min' ? '↓ Minimum' : '↑ Maximum';
    row.appendChild(label);
    
    const bars = document.createElement('div');
    bars.className = 'ernte-bars';
    
    const maxVal = Math.max(...items.map(i => i.data.ernte_stats?.[key] || 0), 1);
    
    items.forEach(item => {
      const val = item.data.ernte_stats?.[key] || 0;
      const pct = Math.min(100, (val / maxVal) * 100);
      bars.innerHTML += `
        <div class="ernte-bar">
          <span class="bar-name" style="color:${item.farbe}">${item.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%;background:${item.farbe}"></div>
          </div>
          <span class="bar-value">${val}g</span>
        </div>
      `;
    });
    
    row.appendChild(bars);
    el.appendChild(row);
  });
  
  return el;
}

export default {
  id: 'statistik',
  render: compareStatistik
};

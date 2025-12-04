/**
 * WISSENSCHAFT - Compare-Morph für Wissenschafts-Perspektive
 * 
 * Zeigt: Wissenschaftlicher Name, Wirkstoffe, Nährwerte, Profil
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 */

import { debug } from '../../../../observer/debug.js';
import { createSection, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareText, compareBar, comparePie, compareRadar 
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} schema - {felder, ...}
 */
export function compareWissenschaft(items, perspektive, schema) {
  debug.morphs('compareWissenschaft', { items: items.length });
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-wissenschaft';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || '#5aa0d8');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔬'}</span>
    <span class="perspektive-name">${perspektive.name || 'Wissenschaft'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Wissenschaftlicher Name (Text)
  const wissNameItems = items.filter(i => i.data.wissenschaftlich);
  if (wissNameItems.length > 0) {
    const section = createSection('Taxonomie', perspektive.farben?.[0]);
    const mapped = wissNameItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.wissenschaftlich, farbe: i.farbe
    }));
    section.addContent(compareText(mapped, {}));
    sections.appendChild(section);
  }
  
  // 2. Wirkstoffe (Bar) - gruppiert nach Wirkstoff
  const wirkstoffItems = items.filter(i => i.data.wirkstoffe?.length > 0);
  if (wirkstoffItems.length > 0) {
    const section = createSection('Wirkstoffe', perspektive.farben?.[1]);
    section.addContent(createWirkstoffVergleich(wirkstoffItems));
    sections.appendChild(section);
  }
  
  // 3. Nährwerte (Pie)
  const naehrwerteItems = items.filter(i => i.data.naehrwerte);
  if (naehrwerteItems.length > 0) {
    const section = createSection('Zusammensetzung', perspektive.farben?.[2]);
    const mapped = naehrwerteItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.naehrwerte, farbe: i.farbe
    }));
    section.addContent(comparePie(mapped, {}));
    sections.appendChild(section);
  }
  
  // 4. Profil (Radar)
  const profilItems = items.filter(i => i.data.profil);
  if (profilItems.length > 0) {
    const section = createSection('Eigenschaften-Profil', perspektive.farben?.[3]);
    const mapped = profilItems.map(i => ({
      id: i.id, name: i.name, wert: i.data.profil, farbe: i.farbe
    }));
    section.addContent(compareRadar(mapped, {}));
    sections.appendChild(section);
  }
  
  container.appendChild(sections);
  return container;
}

/**
 * Erstellt Wirkstoff-Vergleich: Gruppiert nach Wirkstoff
 */
function createWirkstoffVergleich(items) {
  const el = document.createElement('div');
  el.className = 'compare-wirkstoffe';
  
  // Alle Wirkstoffe sammeln
  const alleWirkstoffe = new Map();
  items.forEach(item => {
    if (!Array.isArray(item.data.wirkstoffe)) return;
    item.data.wirkstoffe.forEach(w => {
      const key = w.label || w.name;
      if (!alleWirkstoffe.has(key)) {
        alleWirkstoffe.set(key, { label: key, unit: w.unit || '', werte: [] });
      }
      alleWirkstoffe.get(key).werte.push({
        name: item.name,
        farbe: item.farbe,
        value: w.value
      });
    });
  });
  
  alleWirkstoffe.forEach(({ label, unit, werte }) => {
    const row = document.createElement('div');
    row.className = 'wirkstoffe-row';
    
    const labelEl = document.createElement('span');
    labelEl.className = 'wirkstoffe-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);
    
    const barContainer = document.createElement('div');
    barContainer.className = 'wirkstoffe-bars';
    
    const maxVal = Math.max(...werte.map(w => Number(w.value) || 0), 1);
    
    werte.forEach(({ name, farbe, value }) => {
      const pct = Math.min(100, (Number(value) / maxVal) * 100);
      const bar = document.createElement('div');
      bar.className = 'wirkstoffe-bar';
      bar.innerHTML = `
        <div class="bar-fill" style="width:${pct}%;background:${farbe}" title="${name}"></div>
        <span class="bar-value">${value}${unit}</span>
      `;
      barContainer.appendChild(bar);
    });
    
    row.appendChild(barContainer);
    el.appendChild(row);
  });
  
  return el;
}

export default {
  id: 'wissenschaft',
  render: compareWissenschaft
};

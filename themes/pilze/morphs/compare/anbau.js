/**
 * ANBAU - Compare-Morph für Anbau-Perspektive
 * 
 * Zeigt: Standort, Saison, Temperatur, Lebenszyklus, Ernte-Stats
 * Plus: Cultivation-Daten (Status, Schwierigkeit, Parameter, Substrate, Timeline, Strains, Probleme)
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareList, compareTag, compareRange, compareTimeline, compareBar, compareObject, compareProgress, compareText
} from '../../../../morphs/compare/primitives/index.js';

// ============== HELPER FUNCTIONS ==============

/**
 * Rendert Cultivation-Difficulty als kompaktes Visual
 */
function renderCultivationDifficulty(items, skipFelder) {
  const validItems = items.filter(i => i.data.cultivation_difficulty);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-cultivation-difficulty';
  
  for (const item of validItems) {
    const diff = item.data.cultivation_difficulty;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'difficulty-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    // Overall Score als großer Progress
    const overall = diff.overall || 5;
    const successRate = diff.success_rate;
    
    itemDiv.innerHTML = `
      <div class="difficulty-header">
        <span class="difficulty-name" style="color: ${item.farbe}">${item.name}</span>
        <span class="difficulty-score">${overall}/10</span>
      </div>
      <div class="difficulty-bar">
        <div class="difficulty-fill" style="width: ${overall * 10}%; background: ${item.farbe}"></div>
      </div>
      ${successRate !== undefined ? `<div class="difficulty-success">Erfolgsrate: ${successRate}%</div>` : ''}
      ${diff.factors?.length > 0 ? `
        <div class="difficulty-factors">
          ${diff.factors.slice(0, 3).map(f => `
            <div class="factor">
              <span class="factor-name">${f.factor}</span>
              <span class="factor-score">${f.difficulty}/10</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Substrate-Vergleich
 */
function renderSubstratesComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.cultivation_substrates?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-substrates';
  
  // Sammle alle Substrate-Typen
  const allSubstrates = new Map();
  for (const item of validItems) {
    for (const sub of item.data.cultivation_substrates) {
      if (!allSubstrates.has(sub.type)) {
        allSubstrates.set(sub.type, []);
      }
      allSubstrates.get(sub.type).push({
        itemName: item.name,
        itemFarbe: item.farbe,
        ...sub
      });
    }
  }
  
  // Pro Substrat-Typ eine Zeile
  for (const [type, substrates] of allSubstrates) {
    const row = document.createElement('div');
    row.className = 'substrate-row';
    
    // Beste Performance finden
    const bestEfficiency = Math.max(...substrates.map(s => s.performance?.biological_efficiency || 0));
    
    row.innerHTML = `
      <div class="substrate-type">${type}</div>
      <div class="substrate-items">
        ${substrates.map(s => `
          <div class="substrate-item" style="--item-farbe: ${s.itemFarbe}">
            <span class="substrate-name">${s.itemName}</span>
            <span class="substrate-efficiency ${s.performance?.biological_efficiency === bestEfficiency ? 'best' : ''}">
              BE: ${s.performance?.biological_efficiency || '?'}%
            </span>
            <span class="substrate-yield">${s.performance?.yield_g_per_kg?.total || '?'}g/kg</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(row);
  }
  
  return container;
}

/**
 * Rendert Production Timeline als Gantt-ähnliche Ansicht
 */
function renderProductionTimeline(items, skipFelder) {
  const validItems = items.filter(i => i.data.production_timeline?.phases?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-production-timeline';
  
  for (const item of validItems) {
    const timeline = item.data.production_timeline;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'timeline-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    // Header mit Gesamtdauer
    const totalDays = timeline.total_cycle_days?.typical || 
      timeline.phases.reduce((sum, p) => sum + (p.duration_days?.typical || 0), 0);
    
    itemDiv.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-name" style="color: ${item.farbe}">${item.name}</span>
        <span class="timeline-total">${totalDays} Tage Gesamtzyklus</span>
      </div>
      <div class="timeline-phases">
        ${timeline.phases.map((p, i) => {
          const width = ((p.duration_days?.typical || 0) / totalDays * 100).toFixed(1);
          return `
            <div class="phase" style="width: ${width}%; background: color-mix(in srgb, ${item.farbe} ${70 - i * 15}%, transparent)">
              <span class="phase-name">${p.phase}</span>
              <span class="phase-days">${p.duration_days?.typical || '?'}d</span>
            </div>
          `;
        }).join('')}
      </div>
      ${timeline.flushes ? `
        <div class="timeline-flushes">
          <span>Flushes: ${timeline.flushes.number?.typical || '?'}</span>
          <span>Intervall: ${timeline.flushes.interval_days || '?'} Tage</span>
        </div>
      ` : ''}
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Strains/Varietäten Vergleich
 */
function renderStrainsComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.cultivation_strains?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-strains';
  
  for (const item of validItems) {
    const strains = item.data.cultivation_strains;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'strains-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    itemDiv.innerHTML = `
      <div class="strains-header" style="color: ${item.farbe}">${item.name} - ${strains.length} Stämme</div>
      <div class="strains-list">
        ${strains.slice(0, 5).map(s => `
          <div class="strain">
            <span class="strain-name">${s.name}${s.code ? ` (${s.code})` : ''}</span>
            <div class="strain-stats">
              <span title="Vigor">💪 ${s.characteristics?.vigor || '?'}</span>
              <span title="Ertrag">📊 ${s.characteristics?.yield || '?'}</span>
              <span title="Zuverlässigkeit">🎯 ${s.characteristics?.fruiting_reliability || '?'}</span>
            </div>
            ${s.availability?.commercial ? '<span class="strain-commercial">🛒</span>' : ''}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Cultivation Problems
 */
function renderCultivationProblems(items, skipFelder) {
  const validItems = items.filter(i => i.data.cultivation_problems);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-problems';
  
  // Sammle alle Kontaminanten über alle Items
  const allContaminants = new Map();
  
  for (const item of validItems) {
    const problems = item.data.cultivation_problems;
    if (problems.contaminants) {
      for (const c of problems.contaminants) {
        if (!allContaminants.has(c.organism)) {
          allContaminants.set(c.organism, { organism: c.organism, type: c.type, items: [] });
        }
        allContaminants.get(c.organism).items.push({
          name: item.name,
          farbe: item.farbe,
          rate: c.occurrence_rate
        });
      }
    }
  }
  
  if (allContaminants.size > 0) {
    const contaminantsDiv = document.createElement('div');
    contaminantsDiv.className = 'problems-contaminants';
    contaminantsDiv.innerHTML = `<div class="problems-title">⚠️ Häufige Kontaminanten</div>`;
    
    for (const [, data] of allContaminants) {
      const row = document.createElement('div');
      row.className = 'contaminant-row';
      row.innerHTML = `
        <span class="contaminant-name">${data.organism} (${data.type})</span>
        <div class="contaminant-rates">
          ${data.items.map(i => `
            <span style="color: ${i.farbe}">${i.name}: ${i.rate}%</span>
          `).join(' | ')}
        </div>
      `;
      contaminantsDiv.appendChild(row);
    }
    container.appendChild(contaminantsDiv);
  }
  
  return container;
}

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareAnbau(items, perspektive, config = {}) {
  debug.morphs('compareAnbau', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-anbau';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(180, 255, 200, 0.65)');
  
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
    const section = createSectionIfNew('standort', 'Fundorte', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = standortItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.standort, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 2. Saison (Tag)
  const saisonItems = items.filter(i => i.data.saison);
  if (saisonItems.length > 0) {
    const section = createSectionIfNew('saison', 'Saison', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = saisonItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.saison, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 3. Temperatur (Range)
  const tempItems = items.filter(i => i.data.temperatur);
  if (tempItems.length > 0) {
    const section = createSectionIfNew('temperatur', 'Temperatur', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = tempItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.temperatur, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareRange(mapped, { einheit: '°C' }));
      sections.appendChild(section);
    }
  }
  
  // 4. Lebenszyklus (Timeline)
  const lebenszyklusItems = items.filter(i => i.data.lebenszyklus?.length > 0);
  if (lebenszyklusItems.length > 0) {
    const section = createSectionIfNew('lebenszyklus', 'Lebenszyklus', perspektive.farben?.[3], skipFelder);
    if (section) {
      const mapped = lebenszyklusItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.lebenszyklus, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareTimeline(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 5. Ernte-Stats (Bar)
  const ernteItems = items.filter(i => i.data.ernte_stats);
  if (ernteItems.length > 0) {
    const section = createSectionIfNew('ernte_stats', 'Ernte-Statistik', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = ernteItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.ernte_stats.avg || 0, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareBar(mapped, { einheit: 'g' }));
      sections.appendChild(section);
    }
  }
  
  // ============== CULTIVATION SECTIONS ==============
  
  // 6. Cultivation Status (Tag/Badge)
  const statusItems = items.filter(i => i.data.cultivation_status);
  if (statusItems.length > 0) {
    const section = createSectionIfNew('cultivation_status', 'Kultivierungsstatus', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = statusItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.cultivation_status, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 7. Cultivation Difficulty
  const difficultySection = createSectionIfNew('cultivation_difficulty', 'Schwierigkeitsgrad', perspektive.farben?.[2], skipFelder);
  if (difficultySection) {
    const content = renderCultivationDifficulty(items, skipFelder);
    if (content) {
      difficultySection.addContent(content);
      sections.appendChild(difficultySection);
    }
  }
  
  // 8. Substrates
  const substratesSection = createSectionIfNew('cultivation_substrates', 'Substrate', perspektive.farben?.[3], skipFelder);
  if (substratesSection) {
    const content = renderSubstratesComparison(items, skipFelder);
    if (content) {
      substratesSection.addContent(content);
      sections.appendChild(substratesSection);
    }
  }
  
  // 9. Production Timeline
  const timelineSection = createSectionIfNew('production_timeline', 'Produktionszyklus', perspektive.farben?.[0], skipFelder);
  if (timelineSection) {
    const content = renderProductionTimeline(items, skipFelder);
    if (content) {
      timelineSection.addContent(content);
      sections.appendChild(timelineSection);
    }
  }
  
  // 10. Strains
  const strainsSection = createSectionIfNew('cultivation_strains', 'Stämme/Varietäten', perspektive.farben?.[1], skipFelder);
  if (strainsSection) {
    const content = renderStrainsComparison(items, skipFelder);
    if (content) {
      strainsSection.addContent(content);
      sections.appendChild(strainsSection);
    }
  }
  
  // 11. Cultivation Problems
  const problemsSection = createSectionIfNew('cultivation_problems', 'Anbauprobleme', perspektive.farben?.[2], skipFelder);
  if (problemsSection) {
    const content = renderCultivationProblems(items, skipFelder);
    if (content) {
      problemsSection.addContent(content);
      sections.appendChild(problemsSection);
    }
  }
  
  container.appendChild(sections);
  return container;
}

export default {
  id: 'anbau',
  render: compareAnbau
};

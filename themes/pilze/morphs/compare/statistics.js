/**
 * statistics - Compare-Morph für statistics-Perspektive
 * 
 * Zeigt: Bewertung, Beliebtheit, Ernte-Stats, Fundstatistics, Trends, Nährwerte, Profil
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareBar, compareRating, comparePie, compareRadar, compareStats, compareObject
} from '../../../../morphs/compare/primitives/index.js';

// ============== HELPER FUNCTIONS ==============

/**
 * Rendert Fundstatistics als kompakte Übersicht
 */
function renderFundstatistics(items, skipFelder) {
  const validItems = items.filter(i => i.data.fundstatistics);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'fundstatistics-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'fundstatistics-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'fundstatistics-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const fund = item.data.fundstatistics;
    const content = document.createElement('div');
    content.className = 'fundstatistics-content';
    
    if (fund.gesamt) {
      content.innerHTML += `<div class="fund-item"><span class="fund-label">Gesamt Funde</span><span class="fund-value">${fund.gesamt.toLocaleString()}</span></div>`;
    }
    if (fund.jahr) {
      content.innerHTML += `<div class="fund-item"><span class="fund-label">Dieses Jahr</span><span class="fund-value">${fund.jahr.toLocaleString()}</span></div>`;
    }
    if (fund.regionen) {
      content.innerHTML += `<div class="fund-item"><span class="fund-label">Fundregionen</span><span class="fund-value">${fund.regionen}</span></div>`;
    }
    if (fund.erste_meldung) {
      content.innerHTML += `<div class="fund-item"><span class="fund-label">Erste Meldung</span><span class="fund-value">${fund.erste_meldung}</span></div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Popularitätstrend als Mini-Chart
 */
function renderPopularitaetTrend(items, skipFelder) {
  const validItems = items.filter(i => i.data.popularitaet_trend);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'popularitaet-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'trend-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'trend-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const trend = item.data.popularitaet_trend;
    
    // Mini-Sparkline
    if (trend.werte && Array.isArray(trend.werte)) {
      const sparkline = document.createElement('div');
      sparkline.className = 'trend-sparkline';
      
      const maxVal = Math.max(...trend.werte, 1);
      trend.werte.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'spark-bar';
        bar.style.height = `${(val / maxVal) * 100}%`;
        bar.title = trend.labels?.[idx] || `${idx + 1}`;
        sparkline.appendChild(bar);
      });
      
      card.appendChild(sparkline);
    }
    
    // Trend-Indikator
    if (trend.richtung) {
      const indicator = document.createElement('div');
      indicator.className = `trend-indicator trend-${trend.richtung}`;
      indicator.innerHTML = trend.richtung === 'steigend' ? '📈 Steigend' : 
                           trend.richtung === 'fallend' ? '📉 Fallend' : '➡️ Stabil';
      if (trend.prozent) {
        indicator.innerHTML += ` (${trend.prozent > 0 ? '+' : ''}${trend.prozent}%)`;
      }
      card.appendChild(indicator);
    }
    
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert saisonale Verteilung als Balkendiagramm
 */
function renderSaisonaleVerteilung(items, skipFelder) {
  const validItems = items.filter(i => i.data.saisonale_verteilung);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'saisonal-comparison';
  
  const monate = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  
  // Header mit Monaten
  const headerRow = document.createElement('div');
  headerRow.className = 'saisonal-header';
  monate.forEach(m => {
    headerRow.innerHTML += `<span class="monat-label">${m}</span>`;
  });
  container.appendChild(headerRow);
  
  validItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'saisonal-row';
    row.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const label = document.createElement('span');
    label.className = 'saisonal-name';
    label.innerHTML = `<span class="pilz-dot small" style="background:${item.farbe}"></span> ${item.name}`;
    row.appendChild(label);
    
    const bars = document.createElement('div');
    bars.className = 'saisonal-bars';
    
    const saison = item.data.saisonale_verteilung;
    const maxVal = Math.max(...Object.values(saison), 1);
    
    monate.forEach((m, idx) => {
      const val = saison[m.toLowerCase()] || saison[idx + 1] || saison[monate[idx]] || 0;
      const bar = document.createElement('div');
      bar.className = 'saisonal-bar';
      bar.style.height = `${(val / maxVal) * 100}%`;
      bar.title = `${m}: ${val}`;
      bars.appendChild(bar);
    });
    
    row.appendChild(bars);
    container.appendChild(row);
  });
  
  return container;
}

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function comparestatistics(items, perspektive, config = {}) {
  debug.morphs('comparestatistics', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-statistics';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 255, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '📊'}</span>
    <span class="perspektive-name">${perspektive.name || 'statistics'}</span>
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
    const section = createSectionIfNew('bewertung', '⭐ Bewertung', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = bewertungItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.bewertung, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareRating(mapped, { max: 5 }));
      sections.appendChild(section);
    }
  }
  
  // 2. Beliebtheit (Bar)
  const beliebtheitItems = items.filter(i => i.data.beliebtheit !== undefined);
  if (beliebtheitItems.length > 0) {
    const section = createSectionIfNew('beliebtheit', '💖 Beliebtheit', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = beliebtheitItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.beliebtheit, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareBar(mapped, { max: 100, einheit: '%' }));
      sections.appendChild(section);
    }
  }
  
  // 3. Ernte-statistics (Stats -> Bar für avg)
  const ernteItems = items.filter(i => i.data.ernte_stats);
  if (ernteItems.length > 0) {
    const section = createSectionIfNew('ernte_stats', '🌾 Ernte-statistics', perspektive.farben?.[2], skipFelder);
    if (section) {
      section.addContent(createErnteSummary(ernteItems));
      sections.appendChild(section);
    }
  }
  
  // 4. Fundstatistics
  const fundSection = createSectionIfNew('fundstatistics', '🗺️ Fund-statistics', perspektive.farben?.[3], skipFelder);
  if (fundSection) {
    const content = renderFundstatistics(items, skipFelder);
    if (content) {
      fundSection.addContent(content);
      sections.appendChild(fundSection);
    }
  }
  
  // 5. Popularitätstrend
  const trendSection = createSectionIfNew('popularitaet_trend', '📈 Popularitätstrend', perspektive.farben?.[0], skipFelder);
  if (trendSection) {
    const content = renderPopularitaetTrend(items, skipFelder);
    if (content) {
      trendSection.addContent(content);
      sections.appendChild(trendSection);
    }
  }
  
  // 6. Saisonale Verteilung
  const saisonSection = createSectionIfNew('saisonale_verteilung', '📅 Saisonale Verteilung', perspektive.farben?.[1], skipFelder);
  if (saisonSection) {
    const content = renderSaisonaleVerteilung(items, skipFelder);
    if (content) {
      saisonSection.addContent(content);
      sections.appendChild(saisonSection);
    }
  }
  
  // 7. Nährwerte (Pie)
  const naehrwerteItems = items.filter(i => i.data.naehrwerte);
  if (naehrwerteItems.length > 0) {
    const section = createSectionIfNew('naehrwerte', '🥧 Nährwert-Verteilung', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = naehrwerteItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.naehrwerte, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(comparePie(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 8. Profil (Radar)
  const profilItems = items.filter(i => i.data.profil);
  if (profilItems.length > 0) {
    const section = createSectionIfNew('profil', '📊 Eigenschaften-Radar', perspektive.farben?.[3], skipFelder);
    if (section) {
      const mapped = profilItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.profil, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
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
        <div class="ernte-bar ${item.farbKlasse || ''}">
          <span class="bar-name">${item.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%"></div>
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
  id: 'statistics',
  render: comparestatistics
};

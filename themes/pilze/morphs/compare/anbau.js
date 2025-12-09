/**
 * ANBAU - Compare-Morph für Anbau-Perspektive v2.0
 * 
 * Vollständiges Kultivierungs-Datenmodell mit:
 * - Natürliches Vorkommen (Standort, Saison, Temperatur)
 * - Kultivierungsstatus & Schwierigkeit
 * - Wachstumsparameter (Spawn Run, Primordia, Fruiting)
 * - Substrate
 * - Stämme/Varietäten
 * - Produktionszyklus
 * - Probleme & Troubleshooting
 * - Ernte
 * - Ausrüstung
 * - Wirtschaftlichkeit
 * - Lieferanten
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareList, compareTag, compareRange, compareTimeline, compareBar, 
  compareObject, compareProgress, compareText, compareBoolean
} from '../../../../morphs/compare/primitives/index.js';

// ============== HELPER: Group Header ==============

function addGroupHeader(container, icon, title, id) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.id = `group-${id}`;
  header.innerHTML = `<h3>${icon} ${title}</h3>`;
  container.appendChild(header);
}

// ============== HELPER: Generic Section Adder ==============

function addSection(container, items, feld, label, farbe, skipFelder, renderFn, options = {}) {
  if (skipFelder?.has(feld)) return;
  
  const hasData = items.some(i => {
    const val = i.data[feld];
    if (val === undefined || val === null) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;
    return true;
  });
  
  if (!hasData) return;
  
  const section = createSectionIfNew(feld, label, farbe, skipFelder);
  if (!section) return;
  
  const mapped = items.map(item => ({
    id: item.id,
    name: item.name,
    wert: item.data[feld],
    farbe: item.farbe,
    textFarbe: item.textFarbe,
    farbKlasse: item.farbKlasse
  }));
  
  const content = renderFn(mapped, options);
  if (content) {
    section.addContent(content);
    container.appendChild(section);
  }
}

// ============== HELPER FUNCTIONS ==============

/**
 * Rendert Wachstumsparameter für eine Phase als Vergleichstabelle
 */
function renderPhaseParameters(items, phase, phaseName, phaseIcon) {
  const prefix = `param_${phase}_`;
  
  // Prüfe ob mindestens ein Item Parameter für diese Phase hat
  const hasData = items.some(i => 
    i.data[`${prefix}temp_optimal`] !== undefined ||
    i.data[`${prefix}humidity_optimal`] !== undefined
  );
  
  if (!hasData) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-phase-params';
  
  container.innerHTML = `
    <div class="phase-params-header">
      <span class="phase-icon">${phaseIcon}</span>
      <span class="phase-name">${phaseName}</span>
    </div>
  `;
  
  const table = document.createElement('div');
  table.className = 'phase-params-table';
  
  // Parameter-Zeilen definieren
  const paramRows = [
    { key: 'temp', label: '🌡️ Temperatur', unit: '°C', fields: ['min', 'optimal', 'max'] },
    { key: 'humidity', label: '💧 Feuchte', unit: '%', fields: ['min', 'optimal', 'max'] },
    { key: 'co2', label: '💨 CO₂', unit: 'ppm', fields: ['ppm'] },
    { key: 'light', label: '💡 Licht', unit: '', fields: ['lux', 'hours', 'required'] },
    { key: 'fae', label: '🌬️ FAE', unit: '/h', fields: ['per_hour'] },
    { key: 'duration', label: '⏱️ Dauer', unit: 'Tage', fields: ['days'] },
    { key: 'ph', label: '⚗️ pH', unit: '', fields: ['optimal'] }
  ];
  
  for (const row of paramRows) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'param-row';
    
    let hasRowData = false;
    const values = items.map(item => {
      const vals = {};
      for (const field of row.fields) {
        const fullKey = `${prefix}${row.key}_${field}`;
        const val = item.data[fullKey];
        if (val !== undefined && val !== null) {
          vals[field] = val;
          hasRowData = true;
        }
      }
      return { name: item.name, farbe: item.farbe, vals };
    });
    
    if (!hasRowData) continue;
    
    rowDiv.innerHTML = `
      <div class="param-label">${row.label}</div>
      <div class="param-values">
        ${values.map(v => {
          if (Object.keys(v.vals).length === 0) return `<span class="param-value empty">-</span>`;
          
          let display = '';
          if (v.vals.min !== undefined && v.vals.max !== undefined) {
            display = `${v.vals.min}-${v.vals.max}${row.unit}`;
            if (v.vals.optimal !== undefined) {
              display += ` (opt: ${v.vals.optimal})`;
            }
          } else if (v.vals.optimal !== undefined) {
            display = `${v.vals.optimal}${row.unit}`;
          } else if (v.vals.ppm !== undefined) {
            display = `≤${v.vals.ppm}${row.unit}`;
          } else if (v.vals.lux !== undefined) {
            display = `${v.vals.lux} lux`;
            if (v.vals.hours !== undefined) display += ` / ${v.vals.hours}h`;
          } else if (v.vals.required !== undefined) {
            display = v.vals.required ? '✓ Ja' : '✗ Nein';
          } else if (v.vals.per_hour !== undefined) {
            display = `${v.vals.per_hour}${row.unit}`;
          } else if (v.vals.days !== undefined) {
            const d = v.vals.days;
            display = typeof d === 'object' ? `${d.min || '?'}-${d.max || '?'}` : `${d}`;
            display += ' Tage';
          } else {
            display = Object.values(v.vals).join(', ');
          }
          
          return `<span class="param-value" style="--item-farbe: ${v.farbe}">${display}</span>`;
        }).join('')}
      </div>
    `;
    table.appendChild(rowDiv);
  }
  
  container.appendChild(table);
  return container;
}

/**
 * Rendert Ausrüstungsbedarf
 */
function renderEquipmentRequirements(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.equipment_minimum?.length > 0 ||
    i.data.equipment_recommended?.length > 0 ||
    i.data.equipment_requirements
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-equipment';
  
  for (const item of validItems) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'equipment-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    const minimum = item.data.equipment_minimum || item.data.equipment_requirements?.minimum || [];
    const recommended = item.data.equipment_recommended || item.data.equipment_requirements?.recommended || [];
    
    itemDiv.innerHTML = `
      <div class="equipment-header" style="color: ${item.farbe}">${item.name}</div>
      ${minimum.length > 0 ? `
        <div class="equipment-section">
          <span class="equipment-label">⚡ Minimum:</span>
          <span class="equipment-list">${minimum.slice(0, 5).join(', ')}</span>
        </div>
      ` : ''}
      ${recommended.length > 0 ? `
        <div class="equipment-section">
          <span class="equipment-label">✨ Empfohlen:</span>
          <span class="equipment-list">${recommended.slice(0, 5).join(', ')}</span>
        </div>
      ` : ''}
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Wirtschaftlichkeits-Vergleich
 */
function renderEconomicsComparison(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.economics_market_price_avg !== undefined ||
    i.data.economics_profit_margin !== undefined ||
    i.data.economics
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-economics';
  
  // Marktpreis-Vergleich
  const priceData = validItems.filter(i => 
    i.data.economics_market_price_avg || i.data.economics?.market_price_avg_eur_kg
  );
  
  if (priceData.length > 0) {
    const priceDiv = document.createElement('div');
    priceDiv.className = 'economics-prices';
    priceDiv.innerHTML = `
      <div class="economics-title">💰 Marktpreise (€/kg)</div>
      <div class="economics-bars">
        ${priceData.map(item => {
          const price = item.data.economics_market_price_avg || item.data.economics?.market_price_avg_eur_kg || 0;
          const maxPrice = Math.max(...priceData.map(i => 
            i.data.economics_market_price_avg || i.data.economics?.market_price_avg_eur_kg || 0
          ));
          const width = maxPrice > 0 ? (price / maxPrice * 100) : 0;
          return `
            <div class="price-bar-row">
              <span class="price-name" style="color: ${item.farbe}">${item.name}</span>
              <div class="price-bar">
                <div class="price-fill" style="width: ${width}%; background: ${item.farbe}"></div>
              </div>
              <span class="price-value">${price.toFixed(2)}€</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(priceDiv);
  }
  
  // Profit & Nachfrage
  const trendData = validItems.filter(i => 
    i.data.economics_demand_level || i.data.economics_market_trend
  );
  
  if (trendData.length > 0) {
    const trendDiv = document.createElement('div');
    trendDiv.className = 'economics-trends';
    trendDiv.innerHTML = `
      <div class="economics-title">📈 Markt & Nachfrage</div>
      <div class="trend-items">
        ${trendData.map(item => `
          <div class="trend-item" style="--item-farbe: ${item.farbe}">
            <span class="trend-name">${item.name}</span>
            ${item.data.economics_demand_level ? `<span class="trend-badge demand">${item.data.economics_demand_level}</span>` : ''}
            ${item.data.economics_market_trend ? `<span class="trend-badge trend">${item.data.economics_market_trend}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(trendDiv);
  }
  
  return container;
}

/**
 * Rendert Lieferanten-Übersicht
 */
function renderSuppliersOverview(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.suppliers?.length > 0 ||
    i.data.supplier_cultures?.length > 0 ||
    i.data.strain_suppliers?.length > 0
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-suppliers';
  
  for (const item of validItems) {
    const suppliers = item.data.suppliers || [];
    const cultures = item.data.supplier_cultures || [];
    const strainSuppliers = item.data.strain_suppliers || [];
    
    const allSuppliers = [...new Set([...suppliers, ...cultures, ...strainSuppliers])];
    if (allSuppliers.length === 0) continue;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'suppliers-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    itemDiv.innerHTML = `
      <div class="suppliers-header" style="color: ${item.farbe}">${item.name}</div>
      <div class="suppliers-list">
        ${allSuppliers.slice(0, 6).map(s => `<span class="supplier-tag">${typeof s === 'object' ? s.name : s}</span>`).join('')}
        ${allSuppliers.length > 6 ? `<span class="supplier-more">+${allSuppliers.length - 6}</span>` : ''}
      </div>
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Cultivation-Difficulty als kompaktes Visual
 * Unterstützt sowohl Object-Format als auch flache Felder
 */
function renderCultivationDifficulty(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.cultivation_difficulty || 
    i.data.cultivation_difficulty_overall ||
    i.data.cultivation_success_rate
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-cultivation-difficulty';
  
  for (const item of validItems) {
    const diff = item.data.cultivation_difficulty || {};
    const itemDiv = document.createElement('div');
    itemDiv.className = 'difficulty-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    // Overall Score - aus Object oder flachem Feld
    const overallRaw = item.data.cultivation_difficulty_overall || diff.overall;
    // Konvertiere Text-Level zu Zahl
    const levelMap = { 'beginner': 2, 'intermediate': 5, 'advanced': 7, 'expert': 9 };
    const overall = typeof overallRaw === 'string' ? levelMap[overallRaw] || 5 : (overallRaw || 5);
    
    const successRate = item.data.cultivation_success_rate || diff.success_rate;
    const factors = item.data.cultivation_difficulty_factors || diff.factors || [];
    const timeInvestment = item.data.cultivation_time_investment || diff.time_investment;
    
    itemDiv.innerHTML = `
      <div class="difficulty-header">
        <span class="difficulty-name" style="color: ${item.farbe}">${item.name}</span>
        <span class="difficulty-score">${typeof overallRaw === 'string' ? overallRaw : overall + '/10'}</span>
      </div>
      <div class="difficulty-bar">
        <div class="difficulty-fill" style="width: ${overall * 10}%; background: ${item.farbe}"></div>
      </div>
      ${successRate !== undefined ? `<div class="difficulty-success">✓ Erfolgsrate: ${successRate}%</div>` : ''}
      ${timeInvestment ? `<div class="difficulty-time">⏱️ Zeitaufwand: ${timeInvestment}</div>` : ''}
      ${factors.length > 0 ? `
        <div class="difficulty-factors">
          ${(Array.isArray(factors) ? factors : []).slice(0, 3).map(f => `
            <div class="factor">
              <span class="factor-name">${typeof f === 'object' ? f.factor : f}</span>
              ${typeof f === 'object' && f.difficulty ? `<span class="factor-score">${f.difficulty}/10</span>` : ''}
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
 * Unterstützt sowohl Array-Format als auch flache Felder
 */
function renderSubstratesComparison(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.cultivation_substrates?.length > 0 ||
    i.data.substrate_primary ||
    i.data.substrate_category
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-substrates';
  
  // Sammle alle Substrate-Typen
  const allSubstrates = new Map();
  for (const item of validItems) {
    // Verarbeite Array-Format
    if (item.data.cultivation_substrates?.length > 0) {
      for (const sub of item.data.cultivation_substrates) {
        const type = sub.type || sub.name || 'Unbekannt';
        if (!allSubstrates.has(type)) {
          allSubstrates.set(type, []);
        }
        allSubstrates.get(type).push({
          itemName: item.name,
          itemFarbe: item.farbe,
          ...sub
        });
      }
    }
    // Verarbeite flache Felder
    else if (item.data.substrate_primary || item.data.substrate_category) {
      const type = item.data.substrate_primary || item.data.substrate_category || 'Unbekannt';
      if (!allSubstrates.has(type)) {
        allSubstrates.set(type, []);
      }
      allSubstrates.get(type).push({
        itemName: item.name,
        itemFarbe: item.farbe,
        type: type,
        category: item.data.substrate_category,
        performance: {
          biological_efficiency: item.data.substrate_biological_efficiency
        },
        rating: item.data.substrate_rating,
        colonization_days: item.data.substrate_colonization_days,
        contamination_rate: item.data.substrate_contamination_rate
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
            ${s.colonization_days ? `<span class="substrate-days">${s.colonization_days}d</span>` : ''}
            ${s.rating ? `<span class="substrate-rating">★${s.rating}</span>` : ''}
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
 * Unterstützt sowohl Object-Format als auch flache Felder
 */
function renderProductionTimeline(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.production_timeline?.phases?.length > 0 ||
    i.data.production_total_cycle_days ||
    i.data.production_phases?.length > 0
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-production-timeline';
  
  for (const item of validItems) {
    const timeline = item.data.production_timeline || {};
    const itemDiv = document.createElement('div');
    itemDiv.className = 'timeline-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    // Daten aus Object oder flachen Feldern
    const phases = timeline.phases || item.data.production_phases || [];
    const totalFlushes = item.data.production_total_flushes || timeline.flushes?.number?.typical;
    const expectedYield = item.data.production_expected_yield_kg || timeline.expected_yield_kg;
    const successRate = item.data.production_success_rate || timeline.success_rate_percent;
    
    // Gesamtdauer berechnen
    let totalDays = item.data.production_total_cycle_days || timeline.total_cycle_days?.typical;
    if (!totalDays && phases.length > 0) {
      totalDays = phases.reduce((sum, p) => {
        const dur = p.duration_days;
        return sum + (typeof dur === 'object' ? (dur.typical || dur.max || 0) : (dur || 0));
      }, 0);
    }
    totalDays = totalDays || 60; // Fallback
    
    itemDiv.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-name" style="color: ${item.farbe}">${item.name}</span>
        <span class="timeline-total">${totalDays} Tage Gesamtzyklus</span>
      </div>
      ${phases.length > 0 ? `
        <div class="timeline-phases">
          ${phases.map((p, i) => {
            const dur = p.duration_days;
            const days = typeof dur === 'object' ? (dur.typical || dur.max || 0) : (dur || 0);
            const width = totalDays > 0 ? ((days / totalDays) * 100).toFixed(1) : 0;
            const phaseName = p.phase || p.name || `Phase ${i + 1}`;
            return `
              <div class="phase" style="width: ${width}%; background: color-mix(in srgb, ${item.farbe} ${70 - i * 15}%, transparent)">
                <span class="phase-name">${phaseName}</span>
                <span class="phase-days">${days}d</span>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
      <div class="timeline-meta">
        ${totalFlushes ? `<span>🌊 ${totalFlushes} Flushes</span>` : ''}
        ${expectedYield ? `<span>📦 ${expectedYield}kg</span>` : ''}
        ${successRate ? `<span>✓ ${successRate}%</span>` : ''}
      </div>
    `;
    container.appendChild(itemDiv);
  }
  
  return container;
}

/**
 * Rendert Strains/Varietäten Vergleich
 * Unterstützt sowohl Array-Format als auch flache Felder
 */
function renderStrainsComparison(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.cultivation_strains?.length > 0 ||
    i.data.strain_name
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-strains';
  
  for (const item of validItems) {
    const strains = item.data.cultivation_strains || [];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'strains-item';
    itemDiv.style.setProperty('--item-farbe', item.farbe);
    
    // Falls nur flache Felder vorhanden, baue ein virtuelles Strain-Array
    const displayStrains = strains.length > 0 ? strains : (item.data.strain_name ? [{
      name: item.data.strain_name,
      code: item.data.strain_code,
      characteristics: {
        growth_speed: item.data.strain_growth_speed,
        yield_potential: item.data.strain_yield_potential,
        contamination_resistance: item.data.strain_contamination_resistance
      },
      commercial_viability: item.data.strain_commercial_viability
    }] : []);
    
    if (displayStrains.length === 0) continue;
    
    itemDiv.innerHTML = `
      <div class="strains-header" style="color: ${item.farbe}">${item.name} - ${displayStrains.length} Stämme</div>
      <div class="strains-list">
        ${displayStrains.slice(0, 5).map(s => `
          <div class="strain">
            <span class="strain-name">${s.name}${s.code ? ` (${s.code})` : ''}</span>
            <div class="strain-stats">
              <span title="Geschwindigkeit">🚀 ${s.characteristics?.growth_speed || s.characteristics?.vigor || '?'}</span>
              <span title="Ertrag">📊 ${s.characteristics?.yield_potential || s.characteristics?.yield || '?'}</span>
              <span title="Resistenz">🛡️ ${s.characteristics?.contamination_resistance || s.characteristics?.fruiting_reliability || '?'}</span>
            </div>
            ${s.commercial_viability || s.availability?.commercial ? '<span class="strain-commercial">🛒</span>' : ''}
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
 * Unterstützt sowohl Object-Format als auch flache Felder
 */
function renderCultivationProblems(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.cultivation_problems ||
    i.data.problem_contaminants?.length > 0 ||
    i.data.problem_pests?.length > 0
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'compare-problems';
  
  // Sammle alle Kontaminanten über alle Items
  const allContaminants = new Map();
  const allPests = new Map();
  
  for (const item of validItems) {
    const problems = item.data.cultivation_problems || {};
    
    // Kontaminanten aus Object oder flachen Feldern
    const contaminants = problems.contaminants || item.data.problem_contaminants || [];
    for (const c of contaminants) {
      const organism = c.organism || c.name || c;
      if (!organism) continue;
      if (!allContaminants.has(organism)) {
        allContaminants.set(organism, { organism, type: c.type || 'unknown', items: [] });
      }
      allContaminants.get(organism).items.push({
        name: item.name,
        farbe: item.farbe,
        rate: c.occurrence_rate || c.rate || '?'
      });
    }
    
    // Pests aus Object oder flachen Feldern
    const pests = problems.pests || item.data.problem_pests || [];
    for (const p of pests) {
      const organism = p.organism || p.name || p;
      if (!organism) continue;
      if (!allPests.has(organism)) {
        allPests.set(organism, { organism, damage_type: p.damage_type || 'unbekannt', items: [] });
      }
      allPests.get(organism).items.push({
        name: item.name,
        farbe: item.farbe,
        severity: p.severity || '?'
      });
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
            <span style="color: ${i.farbe}">${i.name}: ${i.rate}${typeof i.rate === 'number' ? '%' : ''}</span>
          `).join(' | ')}
        </div>
      `;
      contaminantsDiv.appendChild(row);
    }
    container.appendChild(contaminantsDiv);
  }
  
  if (allPests.size > 0) {
    const pestsDiv = document.createElement('div');
    pestsDiv.className = 'problems-pests';
    pestsDiv.innerHTML = `<div class="problems-title">🐛 Schädlinge</div>`;
    
    for (const [, data] of allPests) {
      const row = document.createElement('div');
      row.className = 'pest-row';
      row.innerHTML = `
        <span class="pest-name">${data.organism} (${data.damage_type})</span>
        <div class="pest-severity">
          ${data.items.map(i => `
            <span style="color: ${i.farbe}">${i.name}: ${i.severity}</span>
          `).join(' | ')}
        </div>
      `;
      pestsDiv.appendChild(row);
    }
    container.appendChild(pestsDiv);
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
  
  // ============== NEW WACHSTUMSPARAMETER SECTIONS ==============
  
  // 12. Spawn Run Parameters
  const spawnParams = ['param_spawn_temp_min', 'param_spawn_temp_max', 'param_spawn_humidity_min', 'param_spawn_humidity_max', 'param_spawn_co2_max', 'param_spawn_light', 'param_spawn_duration_days'];
  const spawnSection = createSectionIfNew('param_spawn', 'Spawn Run Parameter', perspektive.farben?.[3], skipFelder);
  if (spawnSection) {
    const content = renderPhaseParameters(items, 'spawn', spawnParams);
    if (content) {
      spawnSection.addContent(content);
      sections.appendChild(spawnSection);
    }
  }
  
  // 13. Primordia Initiation Parameters
  const primordiaParams = ['param_primordia_temp_min', 'param_primordia_temp_max', 'param_primordia_humidity_min', 'param_primordia_humidity_max', 'param_primordia_co2_max', 'param_primordia_light', 'param_primordia_duration_days', 'param_primordia_trigger'];
  const primordiaSection = createSectionIfNew('param_primordia', 'Primordia Initiation', perspektive.farben?.[0], skipFelder);
  if (primordiaSection) {
    const content = renderPhaseParameters(items, 'primordia', primordiaParams);
    if (content) {
      primordiaSection.addContent(content);
      sections.appendChild(primordiaSection);
    }
  }
  
  // 14. Fruiting Parameters
  const fruitingParams = ['param_fruiting_temp_min', 'param_fruiting_temp_max', 'param_fruiting_humidity_min', 'param_fruiting_humidity_max', 'param_fruiting_co2_max', 'param_fruiting_light', 'param_fruiting_duration_days', 'param_fruiting_fae'];
  const fruitingSection = createSectionIfNew('param_fruiting', 'Fruiting Parameter', perspektive.farben?.[1], skipFelder);
  if (fruitingSection) {
    const content = renderPhaseParameters(items, 'fruiting', fruitingParams);
    if (content) {
      fruitingSection.addContent(content);
      sections.appendChild(fruitingSection);
    }
  }
  
  // ============== EQUIPMENT, ECONOMICS, SUPPLIERS ==============
  
  // 15. Equipment Requirements
  const equipmentSection = createSectionIfNew('equipment', 'Ausrüstung', perspektive.farben?.[2], skipFelder);
  if (equipmentSection) {
    const content = renderEquipmentRequirements(items);
    if (content) {
      equipmentSection.addContent(content);
      sections.appendChild(equipmentSection);
    }
  }
  
  // 16. Economics
  const economicsSection = createSectionIfNew('economics', 'Wirtschaftlichkeit', perspektive.farben?.[3], skipFelder);
  if (economicsSection) {
    const content = renderEconomicsComparison(items);
    if (content) {
      economicsSection.addContent(content);
      sections.appendChild(economicsSection);
    }
  }
  
  // 17. Suppliers Overview
  const suppliersSection = createSectionIfNew('suppliers', 'Lieferanten', perspektive.farben?.[0], skipFelder);
  if (suppliersSection) {
    const content = renderSuppliersOverview(items);
    if (content) {
      suppliersSection.addContent(content);
      sections.appendChild(suppliersSection);
    }
  }
  
  container.appendChild(sections);
  return container;
}

export default {
  id: 'anbau',
  render: compareAnbau
};

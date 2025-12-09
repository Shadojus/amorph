/**
 * MEDIZIN - Compare-Morph für medizinische Perspektive
 * 
 * Übersichtlich gruppiert in 5 Hauptbereiche:
 * 1. ÜBERSICHT & BEWERTUNG
 * 2. TRADITIONELLE MEDIZIN
 * 3. THERAPEUTISCHE WIRKUNG
 * 4. SICHERHEIT & NEBENWIRKUNGEN
 * 5. DOSIERUNG & ANWENDUNG
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareRating, compareText
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareMedizin(items, perspektive, config = {}) {
  debug.morphs('compareMedizin', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-medizin';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(200, 160, 255, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '💊'}</span>
    <span class="perspektive-name">${perspektive.name || 'Medizin'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: ÜBERSICHT & BEWERTUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🔬 Übersicht & Bewertung', 'overview');
  
  // Medizinischer Wert (Hauptindikator)
  addSection(sections, items, 'medizinisch', 'Medizinischer Wert',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100, einheit: '%' }));
  
  // Sicherheit Score
  addSection(sections, items, 'sicherheit_score', 'Sicherheitsbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  
  // Evidenz Level
  addSection(sections, items, 'evidenz_level', 'Evidenz-Level',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Wissenschaftlicher Name
  addSection(sections, items, 'wissenschaftlich', 'Wissenschaftlicher Name',
    perspektive.farben?.[1], skipFelder, compareText);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: TRADITIONELLE MEDIZIN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTradition = items.some(i => i.data.traditionelle_medizin?.length > 0);
  
  if (hasTradition) {
    addGroupHeader(sections, '📜 Traditionelle Medizin', 'traditional');
    
    // Traditionelle Medizin-Systeme
    addTraditionelleSysteme(sections, items, 'traditionelle_medizin', 'Medizinsysteme',
      perspektive.farben?.[1], skipFelder);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: THERAPEUTISCHE WIRKUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚗️ Therapeutische Wirkung', 'therapeutic');
  
  // Wirkungsprofil (Radar)
  addSection(sections, items, 'wirkungsprofil', 'Wirkungsprofil',
    perspektive.farben?.[2], skipFelder, compareRadar);
  
  // Legacy Profil
  addSection(sections, items, 'profil', 'Wirkungsprofil (Legacy)',
    perspektive.farben?.[2], skipFelder, compareRadar);
  
  // Therapeutische Kategorien
  addTherapeutischeKategorien(sections, items, 'therapeutische_kategorien', 'Therapeutische Kategorien',
    perspektive.farben?.[2], skipFelder);
  
  // Wirkstoffe
  addWirkstoffTabelle(sections, items, 'wirkstoffe', 'Bioaktive Wirkstoffe',
    perspektive.farben?.[2], skipFelder);
  
  // Klinische Studien
  addKlinischeStudien(sections, items, 'klinische_studien', 'Klinische Studien',
    perspektive.farben?.[2], skipFelder);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: SICHERHEIT & NEBENWIRKUNGEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚠️ Sicherheit & Risiken', 'safety');
  
  // Nebenwirkungen
  addNebenwirkungen(sections, items, 'nebenwirkungen', 'Nebenwirkungen',
    perspektive.farben?.[3], skipFelder);
  
  // Wechselwirkungen
  addWechselwirkungen(sections, items, 'wechselwirkungen', 'Arzneimittel-Wechselwirkungen',
    perspektive.farben?.[3], skipFelder);
  
  // Kontraindikationen
  addSection(sections, items, 'kontraindikationen', 'Kontraindikationen',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Spezielle Populationen
  addSpeziellePopulationen(sections, items, 'spezielle_populationen', 'Besondere Patientengruppen',
    perspektive.farben?.[3], skipFelder);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: DOSIERUNG & ANWENDUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '💊 Dosierung & Anwendung', 'dosing');
  
  // Zubereitungsformen
  addSection(sections, items, 'zubereitungsformen', 'Zubereitungsformen',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Dosierung
  addDosierung(sections, items, 'dosierung', 'Dosierungsempfehlungen',
    perspektive.farben?.[0], skipFelder);
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function addGroupHeader(sections, title, groupId) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.dataset.group = groupId;
  header.innerHTML = `<span class="group-title">${title}</span>`;
  sections.appendChild(header);
}

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
 * Traditionelle Medizin-Systeme (komplexe Darstellung)
 */
function addTraditionelleSysteme(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-tradition-systeme';
  
  filteredItems.forEach(item => {
    const itemBlock = document.createElement('div');
    itemBlock.className = `tradition-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'tradition-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    itemBlock.appendChild(header);
    
    const systeme = item.data[feldName] || [];
    systeme.forEach(sys => {
      const sysEl = document.createElement('div');
      sysEl.className = 'tradition-system';
      
      // System-Name mit Bedeutung-Score
      const sysHeader = document.createElement('div');
      sysHeader.className = 'tradition-system-header';
      sysHeader.innerHTML = `
        <span class="system-name">${sys.system}</span>
        ${sys.kulturelle_bedeutung ? `<span class="system-score">${sys.kulturelle_bedeutung}/10</span>` : ''}
      `;
      sysEl.appendChild(sysHeader);
      
      // Verwendungen
      if (sys.verwendungen?.length) {
        const uses = document.createElement('div');
        uses.className = 'tradition-uses';
        sys.verwendungen.forEach(use => {
          const useEl = document.createElement('div');
          useEl.className = 'tradition-use';
          useEl.innerHTML = `<b>${use.anwendung}:</b> ${use.zubereitung}`;
          uses.appendChild(useEl);
        });
        sysEl.appendChild(uses);
      }
      
      itemBlock.appendChild(sysEl);
    });
    
    content.appendChild(itemBlock);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Therapeutische Kategorien als Matrix
 */
function addTherapeutischeKategorien(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-therapeutic';
  
  // Sammle alle Kategorien
  const allKategorien = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(kat => {
      if (kat.kategorie) allKategorien.add(kat.kategorie);
    });
  });
  
  // Matrix-Darstellung
  const table = document.createElement('div');
  table.className = 'compare-matrix';
  
  // Header
  const headerRow = document.createElement('div');
  headerRow.className = 'matrix-header';
  headerRow.innerHTML = `<div class="matrix-cell matrix-label">Kategorie</div>`;
  filteredItems.forEach(item => {
    const cell = document.createElement('div');
    cell.className = `matrix-cell matrix-item ${item.farbKlasse || ''}`;
    cell.style.color = item.textFarbe || '';
    cell.textContent = item.name;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);
  
  // Zeilen pro Kategorie
  allKategorien.forEach(katName => {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    
    const labelCell = document.createElement('div');
    labelCell.className = 'matrix-cell matrix-label';
    labelCell.textContent = katName;
    row.appendChild(labelCell);
    
    filteredItems.forEach(item => {
      const kat = (item.data[feldName] || []).find(k => k.kategorie === katName);
      const score = kat?.wirksamkeit_score || 0;
      const pct = score * 10;
      
      const cell = document.createElement('div');
      cell.className = 'matrix-cell matrix-value';
      
      const inner = document.createElement('div');
      if (kat) {
        inner.innerHTML = `
          <div class="matrix-bar">
            <div class="matrix-bar-fill" style="width:${pct}%;background:${item.farbe || 'rgba(100,100,100,0.5)'}"></div>
          </div>
          <span class="matrix-val">${score}/10</span>
        `;
      } else {
        inner.innerHTML = `<span class="matrix-val empty">–</span>`;
      }
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
 * Wirkstoffe als Vergleichstabelle
 */
function addWirkstoffTabelle(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-nutrients';
  
  // Sammle alle Wirkstoffe
  const allWirkstoffe = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(w => {
      if (w.label) allWirkstoffe.add(w.label);
    });
  });
  
  const table = document.createElement('div');
  table.className = 'nutrient-table';
  
  allWirkstoffe.forEach(wirkstoff => {
    const row = document.createElement('div');
    row.className = 'nutrient-row';
    
    const labelCell = document.createElement('span');
    labelCell.className = 'nutrient-label';
    labelCell.textContent = wirkstoff;
    row.appendChild(labelCell);
    
    const values = document.createElement('span');
    values.className = 'nutrient-values';
    
    filteredItems.forEach(item => {
      const w = (item.data[feldName] || []).find(x => x.label === wirkstoff);
      const chip = document.createElement('span');
      chip.className = `nutrient-chip ${item.farbKlasse || ''}`;
      chip.style.borderColor = item.farbe || '';
      
      if (w) {
        chip.innerHTML = `<b>${w.value}</b>${w.unit || ''}`;
      } else {
        chip.className += ' empty';
        chip.textContent = '–';
      }
      values.appendChild(chip);
    });
    
    row.appendChild(values);
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Klinische Studien
 */
function addKlinischeStudien(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-studies';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `study-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'study-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const studien = item.data[feldName] || [];
    studien.slice(0, 3).forEach(studie => {
      const studyEl = document.createElement('div');
      studyEl.className = 'study-entry';
      studyEl.innerHTML = `
        <div class="study-title">${studie.titel}</div>
        <div class="study-meta">
          <span class="study-year">${studie.jahr}</span>
          <span class="study-design">${studie.design?.typ || '–'}</span>
          ${studie.qualitaet ? `<span class="study-quality">Q: ${studie.qualitaet}/5</span>` : ''}
        </div>
        <div class="study-result">${studie.ergebnisse}</div>
      `;
      block.appendChild(studyEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Nebenwirkungen als Tabelle
 */
function addNebenwirkungen(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-side-effects';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `side-effect-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'side-effect-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const effects = item.data[feldName] || [];
    effects.forEach(eff => {
      const effEl = document.createElement('div');
      effEl.className = `side-effect-entry severity-${eff.schwere || 'mild'}`;
      effEl.innerHTML = `
        <span class="effect-name">${eff.effekt}</span>
        <span class="effect-freq">${eff.haeufigkeit}</span>
        <span class="effect-severity">${eff.schwere}</span>
      `;
      block.appendChild(effEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Wechselwirkungen
 */
function addWechselwirkungen(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-interactions';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `interaction-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'interaction-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const interactions = item.data[feldName] || [];
    interactions.forEach(int => {
      const intEl = document.createElement('div');
      intEl.className = `interaction-entry severity-${int.schwere || 'mild'}`;
      intEl.innerHTML = `
        <div class="interaction-drug">${int.medikament}</div>
        <div class="interaction-type">${int.typ}</div>
        <div class="interaction-management">${int.management}</div>
      `;
      block.appendChild(intEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Spezielle Populationen
 */
function addSpeziellePopulationen(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-populations';
  
  const kategorien = ['schwangerschaft', 'stillzeit', 'kinder', 'aeltere'];
  const labels = { 
    schwangerschaft: '🤰 Schwangerschaft', 
    stillzeit: '🤱 Stillzeit', 
    kinder: '👶 Kinder', 
    aeltere: '👴 Ältere' 
  };
  
  const table = document.createElement('div');
  table.className = 'population-table';
  
  kategorien.forEach(kat => {
    const row = document.createElement('div');
    row.className = 'population-row';
    
    const labelCell = document.createElement('span');
    labelCell.className = 'population-label';
    labelCell.textContent = labels[kat];
    row.appendChild(labelCell);
    
    const values = document.createElement('span');
    values.className = 'population-values';
    
    filteredItems.forEach(item => {
      const pop = item.data[feldName];
      const val = pop?.[kat] || '–';
      
      const chip = document.createElement('span');
      chip.className = `population-chip ${item.farbKlasse || ''}`;
      chip.style.borderColor = item.farbe || '';
      chip.textContent = val;
      values.appendChild(chip);
    });
    
    row.appendChild(values);
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Dosierung
 */
function addDosierung(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-dosing';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `dosing-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'dosing-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const dosierungen = item.data[feldName] || [];
    dosierungen.forEach(dos => {
      const dosEl = document.createElement('div');
      dosEl.className = 'dosing-entry';
      
      const dosis = dos.dosis || {};
      const dosisStr = dosis.min !== undefined 
        ? `${dosis.min}–${dosis.max} ${dosis.unit || ''}`
        : '–';
      
      dosEl.innerHTML = `
        <div class="dosing-indication">${dos.indikation}</div>
        <div class="dosing-details">
          <span class="dosing-prep">${dos.zubereitung}</span>
          <span class="dosing-amount">${dosisStr}</span>
          <span class="dosing-route">${dos.route}</span>
        </div>
      `;
      block.appendChild(dosEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

export default {
  id: 'medizin',
  render: compareMedizin
};

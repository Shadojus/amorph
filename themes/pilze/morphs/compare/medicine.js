/**
 * medicine v2.0 - Compare-Morph für medicineische Perspektive
 * 
 * Übersichtlich gruppiert in 10 Hauptbereiche:
 * 1. ÜBERSICHT & BEWERTUNG
 * 2. TRADITIONELLE medicine
 * 3. PHARMAKOLOGIE & WIRKSTOFFE
 * 4. PHARMAKOKINETIK (ADME)
 * 5. KLINISCHE EVIDENZ
 * 6. safety & TOXIKOLOGIE
 * 7. SPEZIELLE POPULATIONEN
 * 8. DOSIERUNG & ANWENDUNG
 * 9. QUALITÄTSKONTROLLE & REGULATORIK
 * 10. BESCHAFFUNG & RESSOURCEN
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareRating, compareText, compareObject, compareBoolean
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function comparemedicine(items, perspektive, config = {}) {
  debug.morphs('comparemedicine v2.0', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-medicine';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(200, 160, 255, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '💊'}</span>
    <span class="perspektive-name">${perspektive.name || 'medicine'}</span>
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
  
  // medicineischer Wert (Hauptindikator)
  addSection(sections, items, 'medicineisch', 'medicineischer Wert',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100, einheit: '%' }));
  
  // safety Score
  addSection(sections, items, 'safety_score', 'safetysbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  
  // Evidenz Level
  addSection(sections, items, 'evidenz_level', 'Evidenz-Level',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Pharmakopöe-Namen
  addSection(sections, items, 'pharmakopoe_namen', 'Pharmakopöe-Namen',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: TRADITIONELLE medicine
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTradition = items.some(i => i.data.traditionelle_medicine?.length > 0);
  
  if (hasTradition) {
    addGroupHeader(sections, '📜 Traditionelle medicine', 'traditional');
    
    // Traditionelle medicine-Systeme
    addTraditionelleSysteme(sections, items, 'traditionelle_medicine', 'medicinesysteme',
      perspektive.farben?.[1], skipFelder);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: PHARMAKOLOGIE & WIRKSTOFFE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚗️ Pharmakologie & Wirkstoffe', 'pharmacology');
  
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
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: PHARMAKOKINETIK (ADME)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPharmakokinetik = items.some(i => 
    i.data.pharmakokinetik_absorption || 
    i.data.pharmakokinetik_distribution || 
    i.data.pharmakokinetik_metabolismus || 
    i.data.pharmakokinetik_elimination
  );
  
  if (hasPharmakokinetik) {
    addGroupHeader(sections, '💉 Pharmakokinetik (ADME)', 'pharmacokinetics');
    
    // Absorption
    addPharmakokinetikSection(sections, items, 'pharmakokinetik_absorption', 'Absorption',
      perspektive.farben?.[1], skipFelder);
    
    // Distribution
    addPharmakokinetikSection(sections, items, 'pharmakokinetik_distribution', 'Distribution',
      perspektive.farben?.[1], skipFelder);
    
    // Metabolismus
    addPharmakokinetikSection(sections, items, 'pharmakokinetik_metabolismus', 'Metabolismus',
      perspektive.farben?.[1], skipFelder);
    
    // Elimination
    addPharmakokinetikSection(sections, items, 'pharmakokinetik_elimination', 'Elimination',
      perspektive.farben?.[1], skipFelder);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: KLINISCHE EVIDENZ
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEvidenz = items.some(i => i.data.klinische_studien?.length > 0 || i.data.meta_analysen?.length > 0);
  
  if (hasEvidenz) {
    addGroupHeader(sections, '📚 Klinische Evidenz', 'evidence');
    
    // Klinische Studien
    addKlinischeStudien(sections, items, 'klinische_studien', 'Klinische Studien',
      perspektive.farben?.[2], skipFelder);
    
    // Meta-Analysen
    addMetaAnalysen(sections, items, 'meta_analysen', 'Meta-Analysen & Reviews',
      perspektive.farben?.[2], skipFelder);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: safety & TOXIKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚠️ safety & Toxikologie', 'safety');
  
  // Toxikologie-Daten
  addToxikologieSection(sections, items, perspektive.farben?.[3], skipFelder);
  
  // Nebenwirkungen
  addNebenwirkungen(sections, items, 'nebenwirkungen', 'Nebenwirkungen',
    perspektive.farben?.[3], skipFelder);
  
  // Wechselwirkungen
  addWechselwirkungen(sections, items, 'wechselwirkungen', 'Arzneimittel-Wechselwirkungen',
    perspektive.farben?.[3], skipFelder);
  
  // Kontraindikationen
  addSection(sections, items, 'kontraindikationen', 'Kontraindikationen',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Überdosierung
  addSection(sections, items, 'ueberdosierung', 'Überdosierung',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: SPEZIELLE POPULATIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPopulationen = items.some(i => 
    i.data.spezielle_populationen || 
    i.data.spezielle_populationen_schwangerschaft ||
    i.data.spezielle_populationen_kinder
  );
  
  if (hasPopulationen) {
    addGroupHeader(sections, '👥 Spezielle Populationen', 'populations');
    
    // Legacy Spezielle Populationen
    addSpeziellePopulationen(sections, items, 'spezielle_populationen', 'Besondere Patientengruppen',
      perspektive.farben?.[3], skipFelder);
    
    // Neue flache Felder
    addSection(sections, items, 'spezielle_populationen_schwangerschaft', 'Schwangerschaft',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'spezielle_populationen_stillzeit', 'Stillzeit',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'spezielle_populationen_kinder', 'Kinder',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'spezielle_populationen_aeltere', 'Ältere Patienten',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'spezielle_populationen_niereninsuffizienz', 'Niereninsuffizienz',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'spezielle_populationen_leberinsuffizienz', 'Leberinsuffizienz',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: DOSIERUNG & ANWENDUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '💊 Dosierung & Anwendung', 'dosing');
  
  // Dosierungshinweise
  addSection(sections, items, 'dosierung_hinweise', 'Allgemeine Hinweise',
    perspektive.farben?.[0], skipFelder, compareText);
  
  // Zubereitungsformen
  addSection(sections, items, 'zubereitungsformen', 'Zubereitungsformen',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Dosierung (Legacy)
  addDosierung(sections, items, 'dosierung', 'Dosierungsempfehlungen',
    perspektive.farben?.[0], skipFelder);
  
  // Dosierungsschemata (Neu)
  addDosierungsschemata(sections, items, 'dosierungsschemata', 'Dosierungsschemata',
    perspektive.farben?.[0], skipFelder);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: QUALITÄTSKONTROLLE & REGULATORIK
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasQualitaet = items.some(i => 
    i.data.monographien?.length > 0 || 
    i.data.zertifizierungen?.length > 0 ||
    i.data.status_nach_region?.length > 0
  );
  
  if (hasQualitaet) {
    addGroupHeader(sections, '🏛️ Qualität & Regulatorik', 'quality');
    
    // Monographien
    addSection(sections, items, 'monographien', 'Monographien',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Zertifizierungen
    addSection(sections, items, 'zertifizierungen', 'Zertifizierungen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Reinheitsprüfung
    addReinheitspruefung(sections, items, perspektive.farben?.[1], skipFelder);
    
    // Regulatorischer Status
    addStatusNachRegion(sections, items, 'status_nach_region', 'Rechtsstatus nach Region',
      perspektive.farben?.[1], skipFelder);
    
    // Novel Food
    addSection(sections, items, 'novel_food', 'Novel Food Status (EU)',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Arzneimittelzulassungen
    addSection(sections, items, 'arzneimittelzulassungen', 'Arzneimittelzulassungen',
      perspektive.farben?.[1], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: BESCHAFFUNG & RESSOURCEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBeschaffung = items.some(i => 
    i.data.herkunft_wildsammlung || 
    i.data.herkunft_kultivierung ||
    i.data.patienteninformation ||
    i.data.weiterfuehrende_literatur?.length > 0
  );
  
  if (hasBeschaffung) {
    addGroupHeader(sections, '🌍 Beschaffung & Ressourcen', 'sourcing');
    
    // Herkunft
    addSection(sections, items, 'herkunft_wildsammlung', 'Wildsammlung',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'herkunft_kultivierung', 'Kultivierung',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'qualitaetsunterschiede', 'Qualitätsunterschiede',
      perspektive.farben?.[2], skipFelder, compareText);
    
    addSection(sections, items, 'lieferkette', 'Lieferkette',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Ressourcen
    addSection(sections, items, 'patienteninformation', 'Patienteninformation',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'fuer_aerzte', 'Für Ärzte',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'weiterfuehrende_literatur', 'Weiterführende Literatur',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
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
           (Array.isArray(wert) ? wert.length > 0 : true) &&
           (typeof wert === 'object' && !Array.isArray(wert) ? Object.keys(wert).length > 0 : true);
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
 * Traditionelle medicine-Systeme (komplexe Darstellung)
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
        ${sys.cultureelle_bedeutung ? `<span class="system-score">${sys.cultureelle_bedeutung}/10</span>` : ''}
      `;
      sysEl.appendChild(sysHeader);
      
      // Traditioneller Name
      if (sys.traditioneller_name) {
        const tradName = document.createElement('div');
        tradName.className = 'tradition-name';
        tradName.textContent = sys.traditioneller_name;
        sysEl.appendChild(tradName);
      }
      
      // Verwendungen
      if (sys.verwendungen?.length) {
        const uses = document.createElement('div');
        uses.className = 'tradition-uses';
        sys.verwendungen.forEach(use => {
          const useEl = document.createElement('div');
          useEl.className = 'tradition-use';
          if (use.indikation) {
            useEl.innerHTML = `<b>${use.indikation}:</b> ${use.beschreibung || ''}`;
          } else if (use.anwendung) {
            useEl.innerHTML = `<b>${use.anwendung}:</b> ${use.zubereitung || ''}`;
          }
          uses.appendChild(useEl);
        });
        sysEl.appendChild(uses);
      }
      
      // Erhaltungsgrad
      if (sys.erhaltungsgrad) {
        const erhaltung = document.createElement('div');
        erhaltung.className = `tradition-erhaltung erhaltung-${sys.erhaltungsgrad}`;
        erhaltung.textContent = `Wissenserhaltung: ${sys.erhaltungsgrad}`;
        sysEl.appendChild(erhaltung);
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
      const wirkstoffName = w.label || w.name;
      if (wirkstoffName) allWirkstoffe.add(wirkstoffName);
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
      const w = (item.data[feldName] || []).find(x => (x.label || x.name) === wirkstoff);
      const chip = document.createElement('span');
      chip.className = `nutrient-chip ${item.farbKlasse || ''}`;
      chip.style.borderColor = item.farbe || '';
      
      if (w) {
        const val = w.value || w.gehalt?.wert || '✓';
        const unit = w.unit || w.gehalt?.einheit || '';
        chip.innerHTML = `<b>${val}</b>${unit}`;
        
        // Wirkstoffklasse als Tooltip
        if (w.klasse) {
          chip.title = `Klasse: ${w.klasse}`;
        }
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
 * Pharmakokinetik Section (ADME)
 */
function addPharmakokinetikSection(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-pharmacokinetics';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `pk-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'pk-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const pk = item.data[feldName] || {};
    const details = document.createElement('div');
    details.className = 'pk-details';
    
    Object.entries(pk).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const row = document.createElement('div');
        row.className = 'pk-row';
        
        // Label formatieren
        const labelFormatted = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        let displayValue = value;
        if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        } else if (typeof value === 'number') {
          displayValue = `${value}${pk[key + '_einheit'] || ''}`;
        }
        
        row.innerHTML = `
          <span class="pk-label">${labelFormatted}</span>
          <span class="pk-value">${displayValue}</span>
        `;
        details.appendChild(row);
      }
    });
    
    block.appendChild(details);
    content.appendChild(block);
  });
  
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
    studien.slice(0, 5).forEach(studie => {
      const studyEl = document.createElement('div');
      studyEl.className = 'study-entry';
      
      const design = studie.design?.typ || studie.design || '–';
      const qualitaet = studie.qualitaet?.jadad_score || studie.qualitaet;
      
      studyEl.innerHTML = `
        <div class="study-title">${studie.titel}</div>
        <div class="study-meta">
          <span class="study-year">${studie.jahr || '–'}</span>
          <span class="study-design">${design}</span>
          ${qualitaet ? `<span class="study-quality">Jadad: ${qualitaet}/5</span>` : ''}
          ${studie.pubmed_id ? `<span class="study-pubmed">PMID: ${studie.pubmed_id}</span>` : ''}
        </div>
        ${studie.ergebnisse?.zusammenfassung || studie.ergebnisse ? 
          `<div class="study-result">${studie.ergebnisse?.zusammenfassung || studie.ergebnisse}</div>` : ''}
      `;
      block.appendChild(studyEl);
    });
    
    if (studien.length > 5) {
      const more = document.createElement('div');
      more.className = 'study-more';
      more.textContent = `+${studien.length - 5} weitere Studien`;
      block.appendChild(more);
    }
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Meta-Analysen
 */
function addMetaAnalysen(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-meta-analyses';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `meta-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'meta-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const analysen = item.data[feldName] || [];
    analysen.forEach(ma => {
      const maEl = document.createElement('div');
      maEl.className = 'meta-entry';
      maEl.innerHTML = `
        <div class="meta-title">${ma.titel}</div>
        <div class="meta-stats">
          ${ma.cochrane ? '<span class="meta-cochrane">Cochrane</span>' : ''}
          <span class="meta-studies">${ma.eingeschlossene_studien || '?'} Studien</span>
          <span class="meta-n">n=${ma.gesamtstichprobe || '?'}</span>
          ${ma.grade_bewertung ? `<span class="meta-grade grade-${ma.grade_bewertung}">GRADE: ${ma.grade_bewertung}</span>` : ''}
        </div>
        ${ma.gepoolter_effekt ? `<div class="meta-effect">Effekt: ${ma.gepoolter_effekt}</div>` : ''}
        ${ma.schlussfolgerung ? `<div class="meta-conclusion">${ma.schlussfolgerung}</div>` : ''}
      `;
      block.appendChild(maEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Toxikologie-Daten zusammenfassen
 */
function addToxikologieSection(sections, items, farbe, skipFelder) {
  const toxFelder = [
    'toxikologie_ld50_oral',
    'toxikologie_ld50_ip', 
    'toxikologie_noael',
    'toxikologie_therapeutischer_index',
    'toxikologie_genotoxizitaet',
    'toxikologie_kanzerogenitaet',
    'toxikologie_teratogenitaet'
  ];
  
  const hasTox = items.some(i => toxFelder.some(f => i.data[f]));
  if (!hasTox) return;
  
  const section = createSectionIfNew('toxikologie', 'Toxikologisches Profil', farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-toxicology';
  
  const table = document.createElement('div');
  table.className = 'tox-table';
  
  // Header
  const headerRow = document.createElement('div');
  headerRow.className = 'tox-header';
  headerRow.innerHTML = `<div class="tox-cell tox-label">Parameter</div>`;
  items.forEach(item => {
    const cell = document.createElement('div');
    cell.className = `tox-cell tox-item ${item.farbKlasse || ''}`;
    cell.style.color = item.textFarbe || '';
    cell.textContent = item.name;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);
  
  // Zeilen
  const labels = {
    'toxikologie_ld50_oral': 'LD50 (oral)',
    'toxikologie_ld50_ip': 'LD50 (i.p.)',
    'toxikologie_noael': 'NOAEL',
    'toxikologie_therapeutischer_index': 'Therap. Index',
    'toxikologie_genotoxizitaet': 'Genotoxizität',
    'toxikologie_kanzerogenitaet': 'Kanzerogenität',
    'toxikologie_teratogenitaet': 'Teratogenität'
  };
  
  toxFelder.forEach(feld => {
    const hasData = items.some(i => i.data[feld]);
    if (!hasData) return;
    
    const row = document.createElement('div');
    row.className = 'tox-row';
    
    const labelCell = document.createElement('div');
    labelCell.className = 'tox-cell tox-label';
    labelCell.textContent = labels[feld];
    row.appendChild(labelCell);
    
    items.forEach(item => {
      const val = item.data[feld];
      const cell = document.createElement('div');
      cell.className = 'tox-cell tox-value';
      
      if (val) {
        if (typeof val === 'object') {
          if (val.wert) {
            cell.textContent = `${val.wert} ${val.einheit || ''}`;
          } else if (val.ames_test) {
            cell.textContent = `Ames: ${val.ames_test}`;
          } else {
            cell.textContent = JSON.stringify(val);
          }
        } else {
          cell.textContent = val;
        }
      } else {
        cell.textContent = '–';
        cell.className += ' empty';
      }
      
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });
  
  content.appendChild(table);
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
      const severity = eff.schwere || 'leicht';
      effEl.className = `side-effect-entry severity-${severity}`;
      effEl.innerHTML = `
        <span class="effect-name">${eff.effekt}</span>
        <span class="effect-freq">${eff.haeufigkeit || '–'}</span>
        <span class="effect-severity">${severity}</span>
        ${eff.reversibel !== undefined ? `<span class="effect-reversible">${eff.reversibel ? '↺' : '!'}</span>` : ''}
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
      const severity = int.schwere || 'gering';
      intEl.className = `interaction-entry severity-${severity}`;
      intEl.innerHTML = `
        <div class="interaction-drug">${int.medikament}</div>
        <div class="interaction-meta">
          <span class="interaction-type">${int.typ || '–'}</span>
          <span class="interaction-severity severity-badge-${severity}">${severity}</span>
          ${int.evidenz ? `<span class="interaction-evidence">${int.evidenz}</span>` : ''}
        </div>
        ${int.mechanismus ? `<div class="interaction-mechanism">${int.mechanismus}</div>` : ''}
        ${int.management ? `<div class="interaction-management">📋 ${int.management}</div>` : ''}
      `;
      block.appendChild(intEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Spezielle Populationen (Legacy)
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
    const hasData = filteredItems.some(i => i.data[feldName]?.[kat]);
    if (!hasData) return;
    
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
      chip.textContent = typeof val === 'object' ? JSON.stringify(val) : val;
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
 * Dosierung (Legacy)
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
        ? `${dosis.min}–${dosis.max || dosis.min} ${dosis.einheit || dosis.unit || ''}`
        : (dosis.optimal ? `${dosis.optimal} ${dosis.einheit || ''}` : '–');
      
      dosEl.innerHTML = `
        <div class="dosing-indication">${dos.indikation}</div>
        <div class="dosing-details">
          <span class="dosing-prep">${dos.zubereitung}</span>
          <span class="dosing-amount">${dosisStr}</span>
          <span class="dosing-route">${dos.route || ''}</span>
        </div>
      `;
      block.appendChild(dosEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Dosierungsschemata (Neu v2.0)
 */
function addDosierungsschemata(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-dosing-schemas';
  
  filteredItems.forEach(item => {
    const block = document.createElement('div');
    block.className = `schema-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'schema-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    const schemata = item.data[feldName] || [];
    schemata.forEach(schema => {
      const schemaEl = document.createElement('div');
      schemaEl.className = 'schema-entry';
      
      const dosis = schema.dosis || {};
      const dosisStr = dosis.minimum !== undefined 
        ? `${dosis.minimum}–${dosis.maximum} ${dosis.einheit || ''} (optimal: ${dosis.optimal || '–'})`
        : '–';
      
      schemaEl.innerHTML = `
        <div class="schema-indication">${schema.indikation}</div>
        <div class="schema-prep">${schema.zubereitung}</div>
        ${schema.standardisierung ? 
          `<div class="schema-standard">Standardisiert auf: ${schema.standardisierung.marker || ''} ${schema.standardisierung.gehalt || ''}</div>` : ''}
        <div class="schema-dose">${dosisStr}</div>
        <div class="schema-meta">
          <span class="schema-freq">${schema.frequenz || ''}</span>
          <span class="schema-route">${schema.route || ''}</span>
          ${schema.evidenz ? `<span class="schema-evidence">${schema.evidenz}</span>` : ''}
        </div>
        ${schema.dauer ? 
          `<div class="schema-duration">Dauer: ${schema.dauer.empfohlen || schema.dauer}</div>` : ''}
      `;
      block.appendChild(schemaEl);
    });
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Reinheitsprüfung zusammenfassen
 */
function addReinheitspruefung(sections, items, farbe, skipFelder) {
  const reinFelder = [
    'reinheitspruefung_schwermetalle',
    'reinheitspruefung_pestizide',
    'reinheitspruefung_mykotoxine',
    'reinheitspruefung_mikrobiell',
    'reinheitspruefung_radioaktivitaet'
  ];
  
  const hasRein = items.some(i => reinFelder.some(f => i.data[f]));
  if (!hasRein) return;
  
  const section = createSectionIfNew('reinheitspruefung', 'Reinheitsprüfung', farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-purity';
  
  items.forEach(item => {
    const hasData = reinFelder.some(f => item.data[f]);
    if (!hasData) return;
    
    const block = document.createElement('div');
    block.className = `purity-item ${item.farbKlasse || ''}`;
    
    const header = document.createElement('div');
    header.className = 'purity-item-header';
    header.style.color = item.textFarbe || '';
    header.textContent = item.name;
    block.appendChild(header);
    
    // Schwermetalle
    if (item.data.reinheitspruefung_schwermetalle) {
      const sm = item.data.reinheitspruefung_schwermetalle;
      const smEl = document.createElement('div');
      smEl.className = 'purity-section';
      smEl.innerHTML = `<strong>Schwermetalle:</strong> 
        Pb: ${sm.blei?.grenzwert || '–'}, 
        Cd: ${sm.cadmium?.grenzwert || '–'}, 
        Hg: ${sm.quecksilber?.grenzwert || '–'}, 
        As: ${sm.arsen?.grenzwert || '–'}`;
      block.appendChild(smEl);
    }
    
    // Mikrobiell
    if (item.data.reinheitspruefung_mikrobiell) {
      const mb = item.data.reinheitspruefung_mikrobiell;
      const mbEl = document.createElement('div');
      mbEl.className = 'purity-section';
      mbEl.innerHTML = `<strong>Mikrobielle Reinheit:</strong> 
        GKZ: ${mb.gesamtkeimzahl || '–'}, 
        H/S: ${mb.hefen_schimmel || '–'}`;
      block.appendChild(mbEl);
    }
    
    content.appendChild(block);
  });
  
  section.addContent(content);
  sections.appendChild(section);
}

/**
 * Status nach Region
 */
function addStatusNachRegion(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => i.data[feldName]?.length > 0);
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-regulatory';
  
  // Sammle alle Regionen
  const allRegions = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(s => {
      if (s.region) allRegions.add(s.region);
    });
  });
  
  const table = document.createElement('div');
  table.className = 'regulatory-table';
  
  // Header
  const headerRow = document.createElement('div');
  headerRow.className = 'regulatory-header';
  headerRow.innerHTML = `<div class="regulatory-cell regulatory-label">Region</div>`;
  filteredItems.forEach(item => {
    const cell = document.createElement('div');
    cell.className = `regulatory-cell regulatory-item ${item.farbKlasse || ''}`;
    cell.style.color = item.textFarbe || '';
    cell.textContent = item.name;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);
  
  // Zeilen pro Region
  allRegions.forEach(region => {
    const row = document.createElement('div');
    row.className = 'regulatory-row';
    
    const labelCell = document.createElement('div');
    labelCell.className = 'regulatory-cell regulatory-label';
    labelCell.textContent = region;
    row.appendChild(labelCell);
    
    filteredItems.forEach(item => {
      const status = (item.data[feldName] || []).find(s => s.region === region);
      const cell = document.createElement('div');
      cell.className = 'regulatory-cell regulatory-value';
      
      if (status) {
        cell.innerHTML = `
          <span class="reg-class">${status.klassifikation || '–'}</span>
          ${status.zulassungsstatus ? `<span class="reg-status">${status.zulassungsstatus}</span>` : ''}
        `;
      } else {
        cell.textContent = '–';
        cell.className += ' empty';
      }
      
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

export default {
  id: 'medicine',
  render: comparemedicine
};

/**
 * FORSCHUNG - Compare-Morph für Forschungs-Perspektive (v2.0)
 * 
 * VOLLSTÄNDIG ÜBERARBEITET - Alle Felder sind FLACH
 * 
 * Übersichtlich gruppiert in 8 Hauptbereiche:
 * 1. FORSCHUNGSAKTIVITÄT
 * 2. PUBLIKATIONSTREND
 * 3. FORSCHUNGSGRUPPEN & THEMEN  
 * 4. PATENTE
 * 5. BIOTECHNOLOGIE
 * 6. GENTECHNIK & SYNTHETISCHE BIOLOGIE
 * 7. ZUKUNFTSPOTENTIAL
 * 8. WISSENSCHAFTLICHE REFERENZEN & KOLLABORATION
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar,
  compareText, compareObject, compareBoolean,
  compareRating
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareForschung(items, perspektive, config = {}) {
  debug.morphs('compareForschung v2.0', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-forschung';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(80, 200, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔎'}</span>
    <span class="perspektive-name">${perspektive.name || 'Forschung'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: FORSCHUNGSAKTIVITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📊 Forschungsaktivität', 'activity');
  
  // Forschungs-Aktivität (Enum)
  addSection(sections, items, 'forschungs_aktivitaet', 'Aktivitäts-Level',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Aktivitäts-Label
  addSection(sections, items, 'forschungs_aktivitaet_label', 'Aktivitäts-Label',
    perspektive.farben?.[0], skipFelder, compareText);
  
  // Publikationen Gesamt
  addSection(sections, items, 'publikationen_anzahl', 'Publikationen Gesamt',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => 
      compareBar(mapped, { ...cfg, einheit: '' }));
  
  // Publikationen/Jahr
  addSection(sections, items, 'publikationen_pro_jahr', 'Publikationen/Jahr',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: PUBLIKATIONSTREND
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTrend = items.some(i => 
    i.data.publikationen_trend_richtung || i.data.publikationen_jahr_2024
  );
  
  if (hasTrend) {
    addGroupHeader(sections, '📈 Publikationstrend', 'trend');
    
    addSection(sections, items, 'publikationen_trend_richtung', 'Trend-Richtung',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'publikationen_trend_prozent', 'Änderung %',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, einheit: '%', showSign: true }));
    
    addSection(sections, items, 'publikationen_trend_zeitraum', 'Zeitraum',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Jahres-Balken
    addSection(sections, items, 'publikationen_jahr_2020', '2020',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'publikationen_jahr_2021', '2021',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'publikationen_jahr_2022', '2022',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'publikationen_jahr_2023', '2023',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'publikationen_jahr_2024', '2024',
      perspektive.farben?.[2], skipFelder, compareBar);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: FORSCHUNGSGRUPPEN & THEMEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasGroups = items.some(i => 
    i.data.forschungsgruppe_1_name || i.data.thema_1_name
  );
  
  if (hasGroups) {
    addGroupHeader(sections, '🔬 Forschungsgruppen & Themen', 'groups');
    
    // Gruppe 1
    addSection(sections, items, 'forschungsgruppe_1_name', 'Gruppe 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'forschungsgruppe_1_institution', 'Institution 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'forschungsgruppe_1_land', 'Land 1',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'forschungsgruppe_1_schwerpunkt', 'Schwerpunkt 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'forschungsgruppe_1_publikationen', 'Publikationen Gr.1',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'forschungsgruppe_1_h_index', 'H-Index Gr.1',
      perspektive.farben?.[1], skipFelder, compareBar);
    
    // Gruppe 2+3 (Kurzform)
    addSection(sections, items, 'forschungsgruppe_2_name', 'Gruppe 2',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'forschungsgruppe_2_land', 'Land 2',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'forschungsgruppe_3_name', 'Gruppe 3',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Aktuelle Themen
    addSection(sections, items, 'thema_1_name', 'Thema 1',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'thema_1_aktivitaet', 'Aktivität Th.1',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'thema_1_relevanz_score', 'Relevanz Th.1',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'thema_1_keywords', 'Keywords Th.1',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'thema_2_name', 'Thema 2',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'thema_2_aktivitaet', 'Aktivität Th.2',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'thema_2_relevanz_score', 'Relevanz Th.2',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    
    addSection(sections, items, 'thema_3_name', 'Thema 3',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: PATENTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPatents = items.some(i => 
    i.data.patente_gesamt > 0 || i.data.patent_1_nummer
  );
  
  if (hasPatents) {
    addGroupHeader(sections, '📜 Patente', 'patents');
    
    // Übersicht
    addSection(sections, items, 'patente_gesamt', 'Patente Gesamt',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'patente_aktiv', 'Patente Aktiv',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'patente_angemeldet', 'Angemeldet',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'patente_jurisdiktionen', 'Jurisdiktionen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Patent 1 (wichtigstes)
    addSection(sections, items, 'patent_1_nummer', 'Patent 1 Nr.',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'patent_1_titel', 'Patent 1 Titel',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'patent_1_anmelder', 'Patent 1 Anmelder',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'patent_1_status', 'Patent 1 Status',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'patent_1_anwendungen', 'Patent 1 Anwendungen',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'patent_1_zitationen', 'Patent 1 Zitationen',
      perspektive.farben?.[2], skipFelder, compareBar);
    
    // Patent 2-3 (Kurzform)
    addSection(sections, items, 'patent_2_nummer', 'Patent 2 Nr.',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'patent_2_status', 'Patent 2 Status',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'patent_3_nummer', 'Patent 3 Nr.',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: BIOTECHNOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBiotech = items.some(i => 
    i.data.biotechnologie_relevanz || i.data.biotech_anwendung_1_name
  );
  
  if (hasBiotech) {
    addGroupHeader(sections, '🧬 Biotechnologie', 'biotech');
    
    // Übersicht
    addSection(sections, items, 'biotechnologie_relevanz', 'Biotech-Relevanz',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'biotechnologie_score', 'Biotech-Score',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'biotechnologie_bereiche', 'Bereiche',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Anwendung 1
    addSection(sections, items, 'biotech_anwendung_1_bereich', 'Anw.1 Bereich',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'biotech_anwendung_1_name', 'Anw.1 Name',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'biotech_anwendung_1_reife_grad', 'Anw.1 Reifegrad',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'biotech_anwendung_1_marktpotential', 'Anw.1 Marktpotential',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'biotech_anwendung_1_unternehmen', 'Anw.1 Unternehmen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Anwendung 2-3 (Kurzform)
    addSection(sections, items, 'biotech_anwendung_2_name', 'Anw.2 Name',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'biotech_anwendung_2_reife_grad', 'Anw.2 Reifegrad',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'biotech_anwendung_3_name', 'Anw.3 Name',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: GENTECHNIK & SYNTHETISCHE BIOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasGentech = items.some(i => 
    i.data.genom_sequenziert !== undefined || i.data.crispr_etabliert !== undefined
  );
  
  if (hasGentech) {
    addGroupHeader(sections, '🧪 Gentechnik & SynBio', 'gentech');
    
    // Genom
    addSection(sections, items, 'genom_sequenziert', 'Genom Sequenziert',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'genom_groesse_mb', 'Genom-Größe (Mb)',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'genom_gen_anzahl', 'Gen-Anzahl',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'genom_genbank_accession', 'GenBank Accession',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'genom_assembly_level', 'Assembly Level',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Transformation
    addSection(sections, items, 'transformation_methoden', 'Transformationsmethoden',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'transformation_agrobacterium', 'Agrobacterium',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    addSection(sections, items, 'transformation_peg', 'PEG',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    addSection(sections, items, 'transformation_elektroporation', 'Elektroporation',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    
    // CRISPR
    addSection(sections, items, 'crispr_etabliert', 'CRISPR Etabliert',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'crispr_erfolgsrate', 'CRISPR Erfolgsrate %',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 100, einheit: '%' }));
    addSection(sections, items, 'crispr_targets', 'CRISPR Targets',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'knockout_bibliothek_vorhanden', 'Knockout-Bibliothek',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'rnai_etabliert', 'RNAi Etabliert',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    
    // Synthetische Biologie
    addSection(sections, items, 'synbio_chassis_organismus', 'Chassis-Organismus',
      perspektive.farben?.[3], skipFelder, compareBoolean);
    addSection(sections, items, 'synbio_chassis_eignung_score', 'Chassis-Eignung',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'synbio_heterologe_expression', 'Heterologe Expression',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'synbio_produkt_1_name', 'SynBio Produkt 1',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'synbio_produkt_1_status', 'Produkt 1 Status',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'synbio_promotoren', 'Promotoren',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'synbio_regulatorische_toolbox', 'Reg. Toolbox',
      perspektive.farben?.[3], skipFelder, compareBoolean);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: ZUKUNFTSPOTENTIAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFuture = items.some(i => 
    i.data.zukunftspotential_score !== undefined || i.data.emerging_app_1_name
  );
  
  if (hasFuture) {
    addGroupHeader(sections, '🚀 Zukunftspotential', 'future');
    
    // Scores
    addSection(sections, items, 'zukunftspotential_score', 'Gesamt-Score',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'zukunftspotential_innovation_index', 'Innovation Index',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'zukunftspotential_markt_attraktivitaet', 'Markt-Attraktivität',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'zukunftspotential_forschungs_momentum', 'Forschungs-Momentum',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'zukunftspotential_kommerzialisierbarkeit', 'Kommerzialisierbarkeit',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => 
        compareBar(mapped, { ...cfg, max: 10 }));
    addSection(sections, items, 'zukunftspotential_begruendung', 'Begründung',
      perspektive.farben?.[0], skipFelder, compareText);
    
    // Emerging Applications
    addSection(sections, items, 'emerging_app_1_name', 'Emerging App 1',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'emerging_app_1_zeithorizont', 'Zeithorizont 1',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'emerging_app_1_wahrscheinlichkeit', 'Wahrscheinlichkeit 1',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'emerging_app_1_treiber', 'Treiber 1',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'emerging_app_1_hindernisse', 'Hindernisse 1',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'emerging_app_2_name', 'Emerging App 2',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'emerging_app_2_zeithorizont', 'Zeithorizont 2',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'emerging_app_3_name', 'Emerging App 3',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Forschungslücken
    addSection(sections, items, 'forschungsluecke_1_bereich', 'Lücke 1 Bereich',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'forschungsluecke_1_prioritaet', 'Lücke 1 Priorität',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'forschungsluecke_1_aufwand', 'Lücke 1 Aufwand',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'forschungsluecke_2_bereich', 'Lücke 2 Bereich',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Investitionen
    addSection(sections, items, 'invest_1_titel', 'Investment 1',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'invest_1_roi_potential', 'ROI Potential 1',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'invest_1_risiko', 'Risiko 1',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'invest_1_typ', 'Typ 1',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: WISSENSCHAFTLICHE REFERENZEN & KOLLABORATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasRefs = items.some(i => 
    i.data.publikation_1_titel || i.data.klinische_studie_1_nct || i.data.ncbi_taxonomy_id
  );
  
  if (hasRefs) {
    addGroupHeader(sections, '📚 Referenzen & Kollaboration', 'references');
    
    // Publikation 1
    addSection(sections, items, 'publikation_1_titel', 'Publikation 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'publikation_1_journal', 'Journal 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'publikation_1_jahr', 'Jahr 1',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'publikation_1_zitationen', 'Zitationen 1',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'publikation_1_bedeutung', 'Bedeutung 1',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'publikation_1_doi', 'DOI 1',
      perspektive.farben?.[0], skipFelder, compareText);
    
    // Publikation 2-3
    addSection(sections, items, 'publikation_2_titel', 'Publikation 2',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'publikation_2_bedeutung', 'Bedeutung 2',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'publikation_3_titel', 'Publikation 3',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Klinische Studien
    addSection(sections, items, 'klinische_studien_anzahl', 'Klin. Studien Anzahl',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'klinische_studien_aktiv', 'Klin. Studien Aktiv',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'klinische_studie_1_nct', 'Studie 1 NCT',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'klinische_studie_1_status', 'Studie 1 Status',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'klinische_studie_1_phase', 'Studie 1 Phase',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'klinische_studie_1_indikation', 'Studie 1 Indikation',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Datenbank-IDs
    addSection(sections, items, 'ncbi_taxonomy_id', 'NCBI Taxonomy ID',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'mycobank_id', 'MycoBank ID',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'kegg_organism_code', 'KEGG Code',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'jgi_genome_id', 'JGI Genome ID',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Kollaboration
    addSection(sections, items, 'zentrum_1_land', 'Zentrum 1 Land',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'zentrum_1_institutionen', 'Zentrum 1 Institutionen',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'projekt_1_name', 'Projekt 1',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'konferenz_1_name', 'Konferenz 1',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNKTIONEN
// ═══════════════════════════════════════════════════════════════════════════

function addGroupHeader(container, title, id) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.id = `group-${id}`;
  header.innerHTML = `<h3>${title}</h3>`;
  container.appendChild(header);
}

function addSection(container, items, feld, label, farbe, skipFelder, renderFn) {
  if (skipFelder?.has(feld)) return;
  
  const hasData = items.some(i => {
    const val = i.data[feld];
    if (val === undefined || val === null) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && Object.keys(val).length === 0) return false;
    return true;
  });
  
  if (!hasData) return;
  
  const section = document.createElement('div');
  section.className = 'compare-section';
  section.dataset.feld = feld;
  
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'compare-section-header';
  sectionHeader.innerHTML = `<span class="section-label">${label}</span>`;
  section.appendChild(sectionHeader);
  
  const mapped = items.map(item => ({
    id: item.id,
    name: item.name,
    wert: item.data[feld],
    farbe: item.farbe || farbe
  }));
  
  const content = renderFn(mapped, { label, farbe });
  if (content) {
    section.appendChild(content);
    container.appendChild(section);
  }
}

export default compareForschung;

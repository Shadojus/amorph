/**
 * ÖKOLOGIE - Compare-Morph für ökologische Perspektive v2.0
 * 
 * Übersichtlich gruppiert in 20 Hauptbereiche:
 * 1. ÖKOLOGISCHE ROLLE (Legacy)
 * 2. TROPHISCHE STRATEGIE (Legacy)
 * 3. HABITAT (Legacy)
 * 4. interactions (Legacy)
 * 5. ÖKOSYSTEMFUNKTIONEN (Legacy)
 * 6. TROPHIK & ZERSETZER (Neu)
 * 7. ENZYMAKTIVITÄTEN
 * 8. KOHLENSTOFF & NÄHRSTOFFE
 * 9. BODEN-ÖKOLOGIE
 * 10. ÖKOSYSTEM & MIKROHABITAT
 * 11. TOLERANZEN
 * 12. BIOINDIKATOREN
 * 13. SYMBIOSEN
 * 14. KONKURRENZ & CO-EXISTENZ
 * 15. NAHRUNGSNETZ
 * 16. conservation
 * 17. BIODIVERSITÄT
 * 18. PHÄNOLOGIE
 * 19. RÄUMLICHE ÖKOLOGIE
 * 20. MONITORING & DATENQUALITÄT
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, 
  compareText, compareObject, compareRange
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareecology(items, perspektive, config = {}) {
  debug.morphs('compareecology', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-ecology';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 200, 140, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🌳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Ökologie'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: ÖKOLOGISCHE ROLLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🔄 Ökologische Rolle', 'role');
  
  // Ökologische Rolle
  addSection(sections, items, 'oekologische_rolle', 'Ökologische Rolle',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Ökologie (falls vorhanden)
  addSection(sections, items, 'ecology', 'Ökologie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Nährstoffkreislauf
  addSection(sections, items, 'naehrstoffkreislauf', 'Nährstoffkreislauf',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Waldgesundheit
  addSection(sections, items, 'waldgesundheit', 'Waldgesundheit',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Sukzessionsstadium
  addSection(sections, items, 'sukzessionsstadium', 'Sukzessionsstadium',
    perspektive.farben?.[2], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: TROPHISCHE STRATEGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🍽️ Trophische Strategie', 'trophic');
  
  // Trophische Strategie
  addSection(sections, items, 'trophische_strategie', 'Trophische Strategie',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Saprobiont Details
  addSection(sections, items, 'saprobiont_details', 'Saprobiont-Details',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Mykorrhiza Details
  addSection(sections, items, 'mykorrhiza_details', 'Mykorrhiza-Details',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Parasit Details
  addSection(sections, items, 'parasit_details', 'Parasit-Details',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: HABITAT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏞️ Habitat & Standort', 'habitat');
  
  // Habitat
  addSection(sections, items, 'habitat', 'Habitat',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Primärhabitat
  addSection(sections, items, 'primaerhabitat', 'Primärhabitat',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Habitatspezifität
  addSection(sections, items, 'habitatspezifitaet', 'Habitatspezifität',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
  
  // Standort
  addSection(sections, items, 'standort', 'Standort',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // Boden-Anforderungen
  addSection(sections, items, 'boden_anforderungen', 'Boden-Anforderungen',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Höhenlage
  addSection(sections, items, 'hoehenlage', 'Höhenlage',
    perspektive.farben?.[2], skipFelder, compareRange);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: interactions
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasInteractions = items.some(i => 
    i.data.symbionten?.length > 0 || i.data.konkurrenten?.length > 0
  );
  
  if (hasInteractions) {
    addGroupHeader(sections, '🤝 interactions', 'interactions');
    
    // Symbionten
    addSection(sections, items, 'symbionten', 'Symbionten',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Konkurrenten
    addSection(sections, items, 'konkurrenten', 'Konkurrenten',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Konsumenten
    addSection(sections, items, 'konsumenten', 'Konsumenten',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Facilitatoren
    addSection(sections, items, 'facilitatoren', 'Facilitatoren',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: ÖKOSYSTEMFUNKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEcosystem = items.some(i => 
    i.data.oekosystem_services || i.data.kohlenstoff_dynamik
  );
  
  if (hasEcosystem) {
    addGroupHeader(sections, '🌍 Ökosystemfunktionen', 'ecosystem');
    
    // Ökosystem-Services
    addSection(sections, items, 'oekosystem_services', 'Ökosystem-Services',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Kohlenstoff-Dynamik
    addSection(sections, items, 'kohlenstoff_dynamik', 'Kohlenstoff-Dynamik',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Boden-Prozesse
    addSection(sections, items, 'boden_prozesse', 'Boden-Prozesse',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Ausbreitung
    addSection(sections, items, 'ausbreitung', 'Ausbreitung',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Reproduktion
    addSection(sections, items, 'reproduktion', 'Reproduktion',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Metapopulation
    addSection(sections, items, 'metapopulation', 'Metapopulation',
      perspektive.farben?.[3], skipFelder, compareObject);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: TROPHIK & ZERSETZER (NEU)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTrophic = items.some(i => 
    i.data.trophic_mode_primary || i.data.decomposer_type || i.data.ecological_guild
  );

  if (hasTrophic) {
    addGroupHeader(sections, '🍂 Trophik & Zersetzer', 'trophic-new');
    
    addSection(sections, items, 'trophic_mode_primary', 'Primärer Trophiemodus',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'trophic_mode_secondary', 'Sekundärer Trophiemodus',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'trophic_flexibility', 'Trophische Flexibilität',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'decomposer_type', 'Zersetzertyp',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'decomposition_rate', 'Zersetzungsrate',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'lignin_degradation_capability', 'Lignin-Abbau',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'ecological_guild', 'Ökologische Gilde',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'guild_confidence', 'Gilden-safety',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: ENZYMAKTIVITÄTEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEnzymes = items.some(i => 
    i.data.enzyme_laccase_activity || i.data.enzyme_peroxidase_activity
  );

  if (hasEnzymes) {
    addGroupHeader(sections, '⚗️ Enzymaktivitäten', 'enzymes');
    
    addSection(sections, items, 'enzyme_laccase_activity', 'Laccase',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'enzyme_peroxidase_activity', 'Peroxidase',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'enzyme_cellulase_activity', 'Cellulase',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'enzyme_xylanase_activity', 'Xylanase',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'enzyme_chitinase_activity', 'Chitinase',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'enzyme_protease_activity', 'Protease',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: KOHLENSTOFF & NÄHRSTOFFE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCarbon = items.some(i => 
    i.data.carbon_flux_role || i.data.n_fixation || i.data.phosphorus_mobilization
  );

  if (hasCarbon) {
    addGroupHeader(sections, '🔄 Kohlenstoff & Nährstoffe', 'carbon');
    
    addSection(sections, items, 'primary_ecosystem_function', 'Primäre Ökosystemfunktion',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'carbon_flux_role', 'Kohlenstoff-Fluss',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'carbon_storage_capacity', 'C-Speicherkapazität',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'n_fixation', 'Stickstofffixierung',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'n_transfer_to_plants', 'N-Transfer zu Pflanzen',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'phosphorus_mobilization', 'P-Mobilisierung',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: BODEN-ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSoil = items.some(i => 
    i.data.soil_aggregation_effect || i.data.hyphal_network_extent
  );

  if (hasSoil) {
    addGroupHeader(sections, '🌱 Boden-Ökologie', 'soil');
    
    addSection(sections, items, 'soil_aggregation_effect', 'Aggregationswirkung',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'glomalin_production', 'Glomalin-Produktion',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'hyphal_network_extent', 'Hyphen-Netzwerk',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'soil_depth_typical_cm', 'Typische Bodentiefe',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: HABITAT (NEU)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNewHabitat = items.some(i => 
    i.data.ecosystem_type || i.data.microhabitat_primary
  );

  if (hasNewHabitat) {
    addGroupHeader(sections, '🌲 Ökosystem & Mikrohabitat', 'habitat-new');
    
    addSection(sections, items, 'ecosystem_type', 'Ökosystemtyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'ecosystem_subtype', 'Ökosystem-Subtyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'microhabitat_primary', 'Primäres Mikrohabitat',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'substrate_type_primary', 'Primäres Substrat',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'wood_decay_stage_preference', 'Holzzersetzungsstadium',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 11: TOLERANZEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTolerances = items.some(i => 
    i.data.temperature_optimal_c !== undefined || i.data.ph_optimal !== undefined
  );

  if (hasTolerances) {
    addGroupHeader(sections, '🌡️ Toleranzen', 'tolerances');
    
    addSection(sections, items, 'temperature_optimal_c', 'Optimale Temperatur (°C)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 40 }));
    addSection(sections, items, 'humidity_optimal_percent', 'Optimale Feuchtigkeit (%)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
    addSection(sections, items, 'ph_optimal', 'Optimaler pH',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 14 }));
    addSection(sections, items, 'drought_tolerance', 'Trockentoleranz',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'frost_tolerance', 'Frosttoleranz',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'shade_tolerance', 'Schattentoleranz',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 12: BIOINDIKATOREN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBioindicator = items.some(i => 
    i.data.bioindicator_is_indicator || i.data.old_growth_indicator
  );

  if (hasBioindicator) {
    addGroupHeader(sections, '📊 Bioindikatoren', 'bioindicator');
    
    addSection(sections, items, 'bioindicator_is_indicator', 'Ist Bioindikator',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bioindicator_type', 'Indikatortyp',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'indicator_of_succession_stage', 'Sukzessionsstadium-Indikator',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'old_growth_indicator', 'Altwald-Indikator',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'naturalness_score', 'Natürlichkeits-Score',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 10 }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 13: SYMBIOSEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSymbiosis = items.some(i => 
    i.data.mycorrhiza_type || i.data.lichenized || i.data.parasite_type
  );

  if (hasSymbiosis) {
    addGroupHeader(sections, '🤝 Symbiosen', 'symbiosis');
    
    addSection(sections, items, 'mycorrhiza_type', 'Mykorrhiza-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'mycorrhiza_host_specificity', 'Wirtspezifit',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'mycorrhiza_benefit_to_plant', 'Nutzen für Pflanze',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'lichenized', 'Flechte',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'parasite_type', 'Parasit-Typ',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'parasite_virulence', 'Virulenz',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 14: interactions (NEU)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNewInteractions = items.some(i => 
    i.data.competitor_species || i.data.competitive_ability
  );

  if (hasNewInteractions) {
    addGroupHeader(sections, '⚔️ Konkurrenz & Co-Existenz', 'competition');
    
    addSection(sections, items, 'competitor_species', 'Konkurrenten',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'competition_type', 'Konkurrenztyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'competitive_ability', 'Konkurrenzkraft',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'cooccurrence_positive', 'Positive Co-Existenz',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'cooccurrence_negative', 'Negative Co-Existenz',
      perspektive.farben?.[2], skipFelder, compareList);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 15: NAHRUNGSNETZ
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFoodWeb = items.some(i => 
    i.data.fungivore_insects || i.data.spore_disperser_primary
  );

  if (hasFoodWeb) {
    addGroupHeader(sections, '🦌 Nahrungsnetz', 'foodweb');
    
    addSection(sections, items, 'fungivore_insects', 'Insekten-Fungivoren',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'fungivore_mammals', 'Säugetier-Fungivoren',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'mycophagy_intensity', 'Mycophagie-Intensität',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'spore_disperser_primary', 'Primärer Sporenverbreiter',
      perspektive.farben?.[1], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 16: conservation
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasConservation = items.some(i => 
    i.data.iucn_status || i.data.population_trend
  );

  if (hasConservation) {
    addGroupHeader(sections, '🛡️ conservation', 'conservation');
    
    addSection(sections, items, 'iucn_status', 'IUCN-Status',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'regional_red_list_status', 'Regionale Rote Liste',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'population_trend', 'Populationstrend',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'threat_habitat_loss', 'Bedrohung: Habitatverlust',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'threat_climate_change', 'Bedrohung: Klimawandel',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'conservation_actions_needed', 'Schutzmaßnahmen nötig',
      perspektive.farben?.[3], skipFelder, compareList);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 17: BIODIVERSITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBiodiversity = items.some(i => 
    i.data.keystone_species || i.data.endemic
  );

  if (hasBiodiversity) {
    addGroupHeader(sections, '🌍 Biodiversität', 'biodiversity');
    
    addSection(sections, items, 'keystone_species', 'Schlüsselart',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'endemic', 'Endemisch',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'endemic_region', 'Endemie-Region',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'invasive_potential', 'Invasivpotential',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'range_shift_observed', 'Beobachtete Arealverschiebung',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 18: PHÄNOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPhenology = items.some(i => 
    i.data.fruiting_season_start_month || i.data.fruiting_pattern
  );

  if (hasPhenology) {
    addGroupHeader(sections, '📅 Phänologie', 'phenology');
    
    addSection(sections, items, 'fruiting_season_start_month', 'Fruchtungsbeginn (Monat)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 12 }));
    addSection(sections, items, 'fruiting_peak_month', 'Fruchtungs-Peak (Monat)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 12 }));
    addSection(sections, items, 'fruiting_duration_weeks', 'Fruchtungsdauer (Wochen)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 20 }));
    addSection(sections, items, 'fruiting_pattern', 'Fruchtungsmuster',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'fruiting_trigger_temperature', 'Temperatur-Auslöser',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'fruiting_trigger_precipitation', 'Niederschlags-Auslöser',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 19: RÄUMLICHE ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSpatial = items.some(i => 
    i.data.distribution_pattern || i.data.dispersal_vector_primary
  );

  if (hasSpatial) {
    addGroupHeader(sections, '🗺️ Räumliche Ökologie', 'spatial');
    
    addSection(sections, items, 'distribution_pattern', 'Verteilungsmuster',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'patch_size_typical_m2', 'Typische Patchgröße (m²)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1000 }));
    addSection(sections, items, 'dispersal_vector_primary', 'Primärer Ausbreitungsvektor',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'dispersal_distance_typical_m', 'Typische Ausbreitung (m)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1000 }));
    addSection(sections, items, 'minimum_habitat_area_ha', 'Mindest-Habitatgröße (ha)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
    addSection(sections, items, 'edge_sensitivity', 'Randsensitivität',
      perspektive.farben?.[2], skipFelder, compareTag);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 20: MONITORING & DATENQUALITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMonitoring = items.some(i => 
    i.data.monitoring_suitable || i.data.data_quality_ecological
  );

  if (hasMonitoring) {
    addGroupHeader(sections, '📈 Monitoring', 'monitoring');
    
    addSection(sections, items, 'monitoring_suitable', 'Für Monitoring geeignet',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'monitoring_method_recommended', 'Empfohlene Methode',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'detection_difficulty', 'Nachweisschwierigkeit',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'citizen_science_suitability', 'Citizen-Science-Eignung',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'data_quality_ecological', 'Datenqualität',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'research_priority', 'researchspriorität',
      perspektive.farben?.[2], skipFelder, compareTag);
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

export default compareecology;

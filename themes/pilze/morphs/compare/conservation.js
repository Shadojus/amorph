/**
 * conservation - Compare-Morph für conservation-Perspektive (v2.0)
 * 
 * FLACHE DATENSTRUKTUR mit ~200 Feldern
 * Übersichtlich gruppiert in 15 Hauptbereiche:
 * 
 * 1. IDENTIFIKATION & IDs
 * 2. IUCN RED LIST
 * 3. CITES
 * 4. ROTE LISTE DEUTSCHLAND
 * 5. ROTE LISTEN BUNDESLÄNDER
 * 6. GESETZLICHER SCHUTZ (BNatSchG, BArtSchV, FFH)
 * 7. BEDROHUNGEN
 * 8. POPULATION (Global, Deutschland, Trend, Fragmentierung)
 * 9. VERBREITUNG (Global, Deutschland, Areal)
 * 10. HABITAT & MIKROHABITAT
 * 11. ÖKOLOGIE (Ernährung, Mykorrhiza, Wirte, Zeigerwerte)
 * 12. SCHUTZMAßNAHMEN (In-Situ, Ex-Situ, Aktionspläne, Schutzgebiete)
 * 13. research & MONITORING
 * 14. HANDLUNGSEMPFEHLUNGEN
 * 15. DOKUMENTATION (Literatur, Datenquellen, Kontakte)
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRange,
  compareText, compareObject, compareBoolean, compareRating
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareconservation(items, perspektive, config = {}) {
  debug.morphs('compareconservation', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-conservation';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(220, 100, 100, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🛡️'}</span>
    <span class="perspektive-name">${perspektive.name || 'conservation'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: IDENTIFIKATION & EXTERNE IDs
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasIds = items.some(i => 
    i.data.autor || i.data.synonyme || i.data.externe_ids_gbif
  );
  
  if (hasIds) {
    addGroupHeader(sections, '🔖 Identifikation & IDs', 'identifikation');
    
    addSection(sections, items, 'autor', 'Autor',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'synonyme', 'Synonyme',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'externe_ids_gbif', 'GBIF Key',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'externe_ids_ncbi', 'NCBI TaxID',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'externe_ids_mycobank', 'MycoBank ID',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'externe_ids_wikidata', 'Wikidata QID',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'externe_ids_inaturalist', 'iNaturalist Taxon',
      perspektive.farben?.[2], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: IUCN RED LIST
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasIucn = items.some(i => 
    i.data.iucn_kategorie || i.data.iucn_trend
  );
  
  if (hasIucn) {
    addGroupHeader(sections, '🌍 IUCN Red List', 'iucn');
    
    addSection(sections, items, 'iucn_kategorie', 'IUCN Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'iucn_kategorie_label', 'IUCN Label',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'iucn_kriterien', 'IUCN Kriterien',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'iucn_kriterien_erklaerung', 'Kriterien Erklärung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'iucn_trend', 'Populationstrend',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'iucn_trend_symbol', 'Trend Symbol',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'iucn_bewertungsjahr', 'Bewertungsjahr',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'iucn_assessor', 'Assessor',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'iucn_begruendung', 'Begründung',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'iucn_aenderung_jahr', 'Änderungsjahr',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'iucn_aenderung_von', 'Änderung von',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'iucn_aenderung_zu', 'Änderung zu',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'iucn_aenderung_grund', 'Änderungsgrund',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: CITES
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCites = items.some(i => 
    i.data.cites_anhang || i.data.cites_listing_land
  );
  
  if (hasCites) {
    addGroupHeader(sections, '📜 CITES', 'cites');
    
    addSection(sections, items, 'cites_anhang', 'CITES Anhang',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'cites_listing_land', 'Listing Land',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'cites_aufnahmedatum', 'Aufnahmedatum',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'cites_annotation', 'Annotation',
      perspektive.farben?.[1], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: ROTE LISTE DEUTSCHLAND
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasRlDe = items.some(i => 
    i.data.rl_de_kategorie || i.data.rl_de_trend_kurz
  );
  
  if (hasRlDe) {
    addGroupHeader(sections, '🇩🇪 Rote Liste Deutschland', 'rote-liste-de');
    
    addSection(sections, items, 'rl_de_kategorie', 'RL Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'rl_de_kategorie_label', 'RL Label',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'rl_de_neobiota_status', 'Neobiota Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'rl_de_trend_kurz', 'Kurzfristiger Trend',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'rl_de_trend_lang', 'Langfristiger Trend',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'rl_de_risikofaktoren', 'Risikofaktoren',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'rl_de_verantwortlichkeit', 'Verantwortlichkeit DE',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'rl_de_version', 'RL Version',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'rl_de_band', 'RL Band',
      perspektive.farben?.[2], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: ROTE LISTEN BUNDESLÄNDER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasRlLand = items.some(i => 
    i.data.rl_bundesland || i.data.rl_bundesland_kategorie
  );
  
  if (hasRlLand) {
    addGroupHeader(sections, '🏛️ Rote Listen Bundesländer', 'rote-liste-laender');
    
    addSection(sections, items, 'rl_bundesland', 'Bundesland',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'rl_bundesland_kuerzel', 'Kürzel',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'rl_bundesland_kategorie', 'RL Kategorie',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'rl_bundesland_version', 'Version',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'rl_bundesland_bemerkung', 'Bemerkung',
      perspektive.farben?.[1], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: GESETZLICHER SCHUTZ
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasGesetz = items.some(i => 
    i.data.bnatschg_besonders_geschuetzt !== undefined || 
    i.data.ffh_anhang_ii !== undefined ||
    i.data.bartschv_anlage
  );
  
  if (hasGesetz) {
    addGroupHeader(sections, '⚖️ Gesetzlicher Schutz', 'gesetzlich');
    
    // BNatSchG
    addSection(sections, items, 'bnatschg_besonders_geschuetzt', 'Besonders geschützt (BNatSchG)',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'bnatschg_streng_geschuetzt', 'Streng geschützt (BNatSchG)',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'bnatschg_rechtsgrundlage', 'Rechtsgrundlage',
      perspektive.farben?.[0], skipFelder, compareText);
    
    // BArtSchV
    addSection(sections, items, 'bartschv_anlage', 'BArtSchV Anlage',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'bartschv_spalte', 'BArtSchV Spalte',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // FFH-Richtlinie
    addSection(sections, items, 'ffh_anhang_ii', 'FFH Anhang II',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ffh_anhang_iv', 'FFH Anhang IV',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ffh_anhang_v', 'FFH Anhang V',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ffh_prioritaer', 'FFH Prioritär',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ffh_erhaltungszustand_de', 'FFH Erhaltungszustand DE',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'ffh_erhaltungszustand_trend', 'FFH Erhaltungszustand Trend',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Landesrecht
    addSection(sections, items, 'landesrecht_bundesland', 'Landesrecht Bundesland',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'landesrecht_gesetz', 'Landesrecht Gesetz',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'landesrecht_paragraph', 'Landesrecht Paragraph',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'landesrecht_schutzstatus', 'Landesrecht Schutzstatus',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: BEDROHUNGEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBedrohung = items.some(i => 
    i.data.bedrohung_kategorie || i.data.bedrohung_iucn_code
  );
  
  if (hasBedrohung) {
    addGroupHeader(sections, '⚠️ Bedrohungen', 'bedrohungen');
    
    addSection(sections, items, 'bedrohung_iucn_code', 'IUCN Threat Code',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_kategorie', 'Bedrohungs-Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_unterkategorie', 'Unterkategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_beschreibung', 'Beschreibung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'bedrohung_schwere', 'Schwere',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_umfang', 'Umfang',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_zeitrahmen', 'Zeitrahmen',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_reversibilitaet', 'Reversibilität',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'bedrohung_stressoren', 'Stressoren',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: POPULATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPopulation = items.some(i => 
    i.data.pop_global_best || i.data.pop_de_fundorte_anzahl || i.data.pop_trend
  );
  
  if (hasPopulation) {
    addGroupHeader(sections, '📊 Population', 'population');
    
    // Global
    addSection(sections, items, 'pop_global_min', 'Population Global Min',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'pop_global_max', 'Population Global Max',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'pop_global_best', 'Population Global Best',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'pop_global_einheit', 'Einheit',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'pop_global_jahr', 'Erfassungsjahr',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'pop_global_quelle', 'Quelle',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'pop_global_konfidenz', 'Konfidenz',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Deutschland
    addSection(sections, items, 'pop_de_min', 'Population DE Min',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'pop_de_max', 'Population DE Max',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'pop_de_anteil_global', 'Anteil Global (%)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'pop_de_fundorte_anzahl', 'Fundorte Anzahl',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'pop_de_fundorte_trend', 'Fundorte Trend',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Trend
    addSection(sections, items, 'pop_trend', 'Populationstrend',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'pop_trend_prozent_jahr', 'Trend %/Jahr',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'pop_trend_von_jahr', 'Trend von Jahr',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'pop_trend_bis_jahr', 'Trend bis Jahr',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'pop_trend_methode', 'Trend Methode',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Fragmentierung
    addSection(sections, items, 'fragmentierung_grad', 'Fragmentierungsgrad',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'fragmentierung_teilpopulationen', 'Teilpopulationen',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'fragmentierung_isolation', 'Isolation',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'fragmentierung_genaustausch', 'Genaustausch',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Generationszeit & Reproduktion
    addSection(sections, items, 'generationszeit_jahre', 'Generationszeit (Jahre)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'generationszeit_quelle', 'Generationszeit Quelle',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'reproduktion_strategie', 'Reproduktionsstrategie',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'reproduktion_fruchtbarkeit', 'Fruchtbarkeit',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'reproduktion_rekrutierungsrate', 'Rekrutierungsrate',
      perspektive.farben?.[3], skipFelder, compareTag);
  }

  // Fortsetzung in Teil 2...
  renderGruppe9bis15(sections, items, perspektive, skipFelder);
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: GRUPPEN 9-15
// ═══════════════════════════════════════════════════════════════════════════

function renderGruppe9bis15(sections, items, perspektive, skipFelder) {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: VERBREITUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasVerbreitung = items.some(i => 
    i.data.verbr_regionen || i.data.verbr_de_bundesland || i.data.areal_eoo_km2
  );
  
  if (hasVerbreitung) {
    addGroupHeader(sections, '🗺️ Verbreitung', 'verbreitung');
    
    // Global
    addSection(sections, items, 'verbr_regionen', 'Regionen',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'verbr_laender', 'Länder',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'verbr_typ', 'Verbreitungstyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'verbr_endemisch_in', 'Endemisch in',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Deutschland
    addSection(sections, items, 'verbr_de_bundesland', 'Bundesland',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'verbr_de_status', 'Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'verbr_de_haeufigkeit', 'Häufigkeit',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'verbr_de_naturraeume', 'Naturräume',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'verbr_de_hoehe_min', 'Höhe Min (m)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'verbr_de_hoehe_max', 'Höhe Max (m)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'verbr_de_hoehe_optimal_min', 'Optimale Höhe Min',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'verbr_de_hoehe_optimal_max', 'Optimale Höhe Max',
      perspektive.farben?.[3], skipFelder, compareBar);
    
    // Areal
    addSection(sections, items, 'areal_eoo_km2', 'EOO (km²)',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'areal_aoo_km2', 'AOO (km²)',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'areal_trend', 'Arealtrend',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'areal_karte_url', 'Karte URL',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'areal_karte_aktualisierung', 'Karte Aktualisierung',
      perspektive.farben?.[1], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: HABITAT & MIKROHABITAT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasHabitat = items.some(i => 
    i.data.habitat_eunis_code || i.data.mikrohabitat_substrat
  );
  
  if (hasHabitat) {
    addGroupHeader(sections, '🌳 Habitat & Mikrohabitat', 'habitat');
    
    // Habitat
    addSection(sections, items, 'habitat_eunis_code', 'EUNIS Code',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'habitat_ffh_code', 'FFH-LRT Code',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'habitat_name_de', 'Habitat (DE)',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'habitat_name_en', 'Habitat (EN)',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'habitat_eignung', 'Eignung',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'habitat_nutzung', 'Nutzung',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Mikrohabitat
    addSection(sections, items, 'mikrohabitat_substrat', 'Substrat',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'mikrohabitat_exposition', 'Exposition',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'mikrohabitat_bodentyp', 'Bodentyp',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'mikrohabitat_ph_min', 'pH Min',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'mikrohabitat_ph_max', 'pH Max',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'mikrohabitat_feuchtigkeit', 'Feuchtigkeit',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'mikrohabitat_licht', 'Licht',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'mikrohabitat_beschreibung', 'Beschreibung',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Strukturelemente
    addSection(sections, items, 'strukturelemente', 'Strukturelemente',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'habitat_schluesselindikatoren', 'Schlüsselindikatoren',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'habitat_minimum_ha', 'Minimum Fläche (ha)',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'habitat_konnektivitaet', 'Konnektivität',
      perspektive.farben?.[1], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 11: ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasecology = items.some(i => 
    i.data.ernaehrungstyp || i.data.mykorrhiza_partner || i.data.zeigerwert_licht
  );
  
  if (hasecology) {
    addGroupHeader(sections, '🔬 Ökologie', 'ecology');
    
    addSection(sections, items, 'ernaehrungstyp', 'Ernährungstyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Mykorrhiza
    addSection(sections, items, 'mykorrhiza_partner', 'Mykorrhiza-Partner',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'mykorrhiza_partner_beziehung', 'Beziehungstyp',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Wirte
    addSection(sections, items, 'wirte', 'Wirte',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'wirte_spezifitaet', 'Wirtsspezifität',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Symbionten
    addSection(sections, items, 'symbionten', 'Symbionten',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'symbionten_typ', 'Symbionten-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'oekosystemfunktion', 'Ökosystemfunktion',
      perspektive.farben?.[0], skipFelder, compareList);
    
    // Zeigerwerte
    addSection(sections, items, 'zeigerwert_licht', 'Zeigerwert Licht',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'zeigerwert_temperatur', 'Zeigerwert Temperatur',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'zeigerwert_kontinentalitaet', 'Zeigerwert Kontinentalität',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'zeigerwert_feuchtigkeit', 'Zeigerwert Feuchtigkeit',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'zeigerwert_reaktion', 'Zeigerwert Reaktion',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'zeigerwert_stickstoff', 'Zeigerwert Stickstoff',
      perspektive.farben?.[3], skipFelder, compareBar);
    addSection(sections, items, 'indikator_fuer', 'Indikator für',
      perspektive.farben?.[0], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 12: SCHUTZMAßNAHMEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSchutz = items.some(i => 
    i.data.massnahme_insitu_titel || i.data.massnahme_exsitu_einrichtung ||
    i.data.aktionsplan_titel || i.data.schutzgebiet_name
  );
  
  if (hasSchutz) {
    addGroupHeader(sections, '🛡️ Schutzmaßnahmen', 'schutzmassnahmen');
    
    // In-Situ
    addSection(sections, items, 'massnahme_insitu_kategorie', 'In-Situ Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_insitu_titel', 'In-Situ Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'massnahme_insitu_beschreibung', 'In-Situ Beschreibung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'massnahme_insitu_prioritaet', 'In-Situ Priorität',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_insitu_status', 'In-Situ Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_insitu_wirksamkeit', 'In-Situ Wirksamkeit',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_insitu_zeitrahmen', 'In-Situ Zeitrahmen',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'massnahme_insitu_kosten', 'In-Situ Kosten',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'massnahme_insitu_verantwortlich', 'In-Situ Verantwortlich',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Ex-Situ
    addSection(sections, items, 'massnahme_exsitu_kategorie', 'Ex-Situ Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_exsitu_einrichtung', 'Ex-Situ Einrichtung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'massnahme_exsitu_land', 'Ex-Situ Land',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_exsitu_material', 'Ex-Situ Material',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_exsitu_menge', 'Ex-Situ Menge',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'massnahme_exsitu_vitalitaet', 'Ex-Situ Vitalität',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'massnahme_exsitu_pruefung', 'Ex-Situ Prüfung',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Aktionspläne
    addSection(sections, items, 'aktionsplan_titel', 'Aktionsplan Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'aktionsplan_ebene', 'Aktionsplan Ebene',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'aktionsplan_status', 'Aktionsplan Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'aktionsplan_gueltig_von', 'Gültig von',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'aktionsplan_gueltig_bis', 'Gültig bis',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'aktionsplan_url', 'Aktionsplan URL',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'aktionsplan_herausgeber', 'Herausgeber',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Schutzgebiete
    addSection(sections, items, 'schutzgebiet_id', 'Schutzgebiet ID',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'schutzgebiet_name', 'Schutzgebiet Name',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'schutzgebiet_typ', 'Schutzgebiet Typ',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'schutzgebiet_flaeche_ha', 'Fläche (ha)',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'schutzgebiet_anteil_population', 'Anteil Population (%)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'schutzgebiet_managementplan', 'Managementplan',
      perspektive.farben?.[2], skipFelder, compareBoolean);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 13: research & MONITORING
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasresearch = items.some(i => 
    i.data.research_bereich || i.data.monitoring_name || i.data.erfassung_methode
  );
  
  if (hasresearch) {
    addGroupHeader(sections, '🔬 research & Monitoring', 'research');
    
    // researchsbedarf
    addSection(sections, items, 'research_bereich', 'researchsbereich',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'research_beschreibung', 'researchsbeschreibung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'research_prioritaet', 'researchspriorität',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'research_status', 'researchsstatus',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Monitoring
    addSection(sections, items, 'monitoring_name', 'Monitoring Programm',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'monitoring_traeger', 'Träger',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'monitoring_methode', 'Methode',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'monitoring_frequenz', 'Frequenz',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'monitoring_umfang', 'Umfang',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'monitoring_zeitraum_von', 'Zeitraum von',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'monitoring_zeitraum_bis', 'Zeitraum bis',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'monitoring_kontakt', 'Kontakt',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'monitoring_daten_verfuegbar', 'Daten verfügbar',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'monitoring_url', 'Monitoring URL',
      perspektive.farben?.[0], skipFelder, compareText);
    
    // Letztes Monitoring
    addSection(sections, items, 'letztes_monitoring_datum', 'Letztes Monitoring',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'letztes_monitoring_ergebnis', 'Letztes Ergebnis',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'naechstes_monitoring_geplant', 'Nächstes geplant',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Erfassung
    addSection(sections, items, 'erfassung_methode', 'Erfassungsmethode',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'erfassung_beschreibung', 'Erfassungsbeschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'erfassung_zeitraum', 'Erfassungszeitraum',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'erfassung_aufwand', 'Erfassungsaufwand',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'erfassung_expertise', 'Erfassungsexpertise',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 14: HANDLUNGSEMPFEHLUNGEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEmpfehlungen = items.some(i => 
    i.data.empfehlung_sofort_massnahme || i.data.ziel_langfristig || i.data.empfehlung_behoerden
  );
  
  if (hasEmpfehlungen) {
    addGroupHeader(sections, '📋 Handlungsempfehlungen', 'empfehlungen');
    
    // Sofortmaßnahmen
    addSection(sections, items, 'empfehlung_sofort_massnahme', 'Sofortmaßnahme',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'empfehlung_sofort_begruendung', 'Begründung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'empfehlung_sofort_verantwortlich', 'Verantwortlich',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'empfehlung_sofort_zeitrahmen', 'Zeitrahmen',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Langfristige Ziele
    addSection(sections, items, 'ziel_langfristig', 'Langfristiges Ziel',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'ziel_indikator', 'Zielindikator',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'ziel_wert', 'Zielwert',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'ziel_jahr', 'Zieljahr',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Zielgruppen
    addSection(sections, items, 'empfehlung_behoerden', 'Empfehlung Behörden',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'empfehlung_landnutzer', 'Empfehlung Landnutzer',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'empfehlung_oeffentlichkeit', 'Empfehlung Öffentlichkeit',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'empfehlung_vermeiden', 'Zu vermeiden',
      perspektive.farben?.[1], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 15: DOKUMENTATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasDoku = items.some(i => 
    i.data.literatur_zitation || i.data.datenquelle_name || i.data.kontakt_name
  );
  
  if (hasDoku) {
    addGroupHeader(sections, '📚 Dokumentation', 'dokumentation');
    
    // Literatur
    addSection(sections, items, 'literatur_zitation', 'Literatur Zitation',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'literatur_doi', 'DOI',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'literatur_url', 'Literatur URL',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'literatur_typ', 'Literatur Typ',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'literatur_relevanz', 'Relevanz',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Datenquellen
    addSection(sections, items, 'datenquelle_name', 'Datenquelle',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'datenquelle_url', 'Datenquelle URL',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'datenquelle_zugriff', 'Zugriff',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'datenquelle_lizenz', 'Lizenz',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Gutachten
    addSection(sections, items, 'gutachten_titel', 'Gutachten Titel',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'gutachten_autor', 'Gutachten Autor',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'gutachten_jahr', 'Gutachten Jahr',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'gutachten_auftraggeber', 'Auftraggeber',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'gutachten_verfuegbarkeit', 'Verfügbarkeit',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Weblinks
    addSection(sections, items, 'weblink_titel', 'Weblink Titel',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'weblink_url', 'Weblink URL',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'weblink_beschreibung', 'Weblink Beschreibung',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Kontakte
    addSection(sections, items, 'kontakt_name', 'Kontakt Name',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'kontakt_institution', 'Institution',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'kontakt_funktion', 'Funktion',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'kontakt_email', 'E-Mail',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'kontakt_telefon', 'Telefon',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'kontakt_expertise', 'Expertise',
      perspektive.farben?.[3], skipFelder, compareList);
  }
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

export default compareconservation;

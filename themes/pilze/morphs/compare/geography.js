/**
 * geography v2.0 - Compare-Morph für geografische Perspektive
 * 
 * Vollständiges Schema für:
 * 1. NATIVE VERBREITUNG (Arealtyp, Kontinente, Länder, Regionen)
 * 2. EINGEFÜHRTE VERBREITUNG (Einführung, Etablierung, Invasivität)
 * 3. FUNDORTE & statistics (Fundstatistics, Datenquellen, Räumliche Analyse)
 * 4. KLIMAHÜLLE (Temperatur, Niederschlag, Köppen, BioClim)
 * 5. VISUALISIERUNG (Karten, Heatmaps)
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRange,
  compareText, compareObject, compareImage, compareBoolean
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function comparegeography(items, perspektive, config = {}) {
  debug.morphs('comparegeography v2.0', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-geography';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(100, 160, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🗺️'}</span>
    <span class="perspektive-name">${perspektive.name || 'geography'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: NATIVE VERBREITUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🌍 Native Verbreitung', 'native');
  
  // Beschreibung
  addSection(sections, items, 'native_beschreibung', 'Verbreitungsbeschreibung',
    perspektive.farben?.[0], skipFelder, compareText);
  
  // Arealtyp & Status
  addSection(sections, items, 'native_areal_typ', 'Arealtyp',
    perspektive.farben?.[0], skipFelder, compareTag);
  addSection(sections, items, 'native_areal_groesse_km2', 'Arealgröße (km²)',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'native_verbreitungsstatus', 'Verbreitungsstatus',
    perspektive.farben?.[0], skipFelder, compareTag);
  addSection(sections, items, 'native_quellenangabe', 'Quellen',
    perspektive.farben?.[0], skipFelder, compareList);
    
  // Legacy
  addSection(sections, items, 'native_verbreitung', 'Native Verbreitung',
    perspektive.farben?.[0], skipFelder, compareObject);
  addSection(sections, items, 'biogeography', 'Biogeography',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: KONTINENTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🌐 Kontinente', 'kontinente');
  
  // Kontinente-Liste
  addSection(sections, items, 'kontinente', 'Kontinente',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Europa
  addSection(sections, items, 'kontinent_eu_status', '🇪🇺 Europa Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_eu_haeufigkeit', '🇪🇺 Europa Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
    
  // Asien
  addSection(sections, items, 'kontinent_as_status', '🌏 Asien Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_as_haeufigkeit', '🌏 Asien Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
    
  // Nordamerika
  addSection(sections, items, 'kontinent_na_status', '🌎 Nordamerika Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_na_haeufigkeit', '🌎 Nordamerika Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
    
  // Südamerika
  addSection(sections, items, 'kontinent_sa_status', '🌎 Südamerika Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_sa_haeufigkeit', '🌎 Südamerika Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
    
  // Afrika
  addSection(sections, items, 'kontinent_af_status', '🌍 Afrika Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_af_haeufigkeit', '🌍 Afrika Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
    
  // Ozeanien
  addSection(sections, items, 'kontinent_oc_status', '🌏 Ozeanien Status',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'kontinent_oc_haeufigkeit', '🌏 Ozeanien Häufigkeit',
    perspektive.farben?.[1], skipFelder, compareTag);

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: LÄNDER & REGIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏳️ Länder & Regionen', 'laender');
  
  // Länder
  addSection(sections, items, 'laender', 'Länder',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'laender_anzahl', 'Länderanzahl',
    perspektive.farben?.[2], skipFelder, compareBar);
  addSection(sections, items, 'laender_nativ', 'Native Länder',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'laender_eingefuehrt', 'Eingeführt in',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'laender_hauptvorkommen', 'Hauptvorkommen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Biogeografische Regionen
  addSection(sections, items, 'biogeografische_regionen', 'Biogeografische Regionen',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'biogeo_realm', 'Biogeografische Reiche',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'biogeo_biome', 'Biome',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Ökoregionen
  addSection(sections, items, 'oekoregionen', 'Ökoregionen',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'oeko_codes', 'Ökoregion-Codes',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'oeko_area_km2', 'Ökoregion-Fläche (km²)',
    perspektive.farben?.[2], skipFelder, compareBar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: EINGEFÜHRTE VERBREITUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasIntroduced = items.some(i => 
    i.data.eingefuehrte_regionen || i.data.einfuehrungsart || 
    i.data.etablierungsstatus || i.data.eingefuehrte_verbreitung
  );
  
  if (hasIntroduced) {
    addGroupHeader(sections, '🚢 Eingeführte Verbreitung', 'introduced');
    
    addSection(sections, items, 'eingefuehrte_regionen', 'Eingeführte Regionen',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'einfuehrungsjahr_erst', 'Ersteinführung',
      perspektive.farben?.[1], skipFelder, compareBar);
    addSection(sections, items, 'einfuehrungsart', 'Einführungsart',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'einfuehrungsvektor', 'Einführungsvektor',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'etablierungsstatus', 'Etablierungsstatus',
      perspektive.farben?.[1], skipFelder, compareTag);
      
    // Legacy
    addSection(sections, items, 'eingefuehrte_verbreitung', 'Eingeführte Gebiete',
      perspektive.farben?.[1], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: INVASIVITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasInvasive = items.some(i => 
    i.data.ist_invasiv !== undefined || i.data.invasivitaetsstufe || i.data.invasivitaet
  );
  
  if (hasInvasive) {
    addGroupHeader(sections, '⚠️ Invasivität', 'invasiv');
    
    addSection(sections, items, 'ist_invasiv', 'Invasiv?',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareBoolean);
    addSection(sections, items, 'invasivitaetsstufe', 'Invasivitätsstufe',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareTag);
    addSection(sections, items, 'invasiv_auswirkungen_oeko', 'Ökologische Auswirkungen',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareTag);
    addSection(sections, items, 'invasiv_auswirkungen_oekonomisch', 'Ökonomische Auswirkungen',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareTag);
    addSection(sections, items, 'invasiv_auswirkungen_gesundheit', 'Gesundheitsauswirkungen',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareTag);
    addSection(sections, items, 'invasiv_betroffene_arten', 'Betroffene Arten',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareList);
    addSection(sections, items, 'invasiv_betroffene_lebensraeume', 'Betroffene Lebensräume',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareList);
    addSection(sections, items, 'invasiv_management', 'Management-Empfehlungen',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareText);
    addSection(sections, items, 'invasiv_regulatorisch', 'Regulatorischer Status',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareList);
      
    // Legacy
    addSection(sections, items, 'invasivitaet', 'Invasivität',
      'rgba(220, 100, 100, 0.65)', skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: FUNDORTE & statistics
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📍 Fundorte & statistics', 'occurrences');
  
  // Fundstatistics
  addSection(sections, items, 'fundorte_gesamt', 'Gesamtfunde',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'fundorte_validiert', 'Validierte Funde',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'fundorte_laender_anzahl', 'Länder mit Funden',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'fund_erster_jahr', 'Erster Fund',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'fund_letzter_jahr', 'Letzter Fund',
    perspektive.farben?.[0], skipFelder, compareBar);
  
  // Habitate & Substrate
  addSection(sections, items, 'fund_haeufigste_habitate', 'Häufigste Habitate',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'fund_haeufigste_substrate', 'Häufigste Substrate',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Höhenverteilung
  addSection(sections, items, 'fund_hoehenverteilung_min', 'Min. Höhe (m)',
    perspektive.farben?.[1], skipFelder, compareBar);
  addSection(sections, items, 'fund_hoehenverteilung_max', 'Max. Höhe (m)',
    perspektive.farben?.[1], skipFelder, compareBar);
  addSection(sections, items, 'fund_hoehenverteilung_median', 'Median Höhe (m)',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // Zeitliche Verteilung
  addSection(sections, items, 'funde_nach_jahrzehnt', 'Funde pro Jahrzehnt',
    perspektive.farben?.[2], skipFelder, compareObject);
  addSection(sections, items, 'funde_nach_monat', 'Saisonale Verteilung',
    perspektive.farben?.[2], skipFelder, compareObject);
  addSection(sections, items, 'funde_top_beobachter', 'Top Beobachter',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Legacy
  addSection(sections, items, 'fundorte', 'Fundorte',
    perspektive.farben?.[0], skipFelder, compareList);
  addSection(sections, items, 'fundstatistics', 'Fundstatistics',
    perspektive.farben?.[0], skipFelder, compareObject);
  addSection(sections, items, 'regionale_haeufigkeit', 'Regionale Häufigkeit',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: DATENQUELLEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📚 Datenquellen', 'sources');
  
  addSection(sections, items, 'datenquellen', 'Datenquellen',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'datenquellen_primaer', 'Primärquelle',
    perspektive.farben?.[1], skipFelder, compareText);
  addSection(sections, items, 'datenquellen_anzahl', 'Quellenanzahl',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: RÄUMLICHE statistics
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSpatial = items.some(i => 
    i.data.centroid_lat !== undefined || i.data.areal_extent_km2 || i.data.raeumliche_statistics
  );
  
  if (hasSpatial) {
    addGroupHeader(sections, '📐 Räumliche statistics', 'spatial');
    
    addSection(sections, items, 'centroid_lat', 'Centroid Breitengrad',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'centroid_lng', 'Centroid Längengrad',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'areal_extent_km2', 'Areal Ausdehnung (km²)',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'fundpunkt_dichte', 'Fundpunktdichte',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'nearest_neighbor_index', 'Nearest Neighbor Index',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'latitude_range_min', 'Breitengrad Min',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'latitude_range_max', 'Breitengrad Max',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'longitude_range_min', 'Längengrad Min',
      perspektive.farben?.[2], skipFelder, compareBar);
    addSection(sections, items, 'longitude_range_max', 'Längengrad Max',
      perspektive.farben?.[2], skipFelder, compareBar);
      
    // Legacy
    addSection(sections, items, 'raeumliche_statistics', 'Räumliche statistics',
      perspektive.farben?.[2], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: KLIMAHÜLLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasClimate = items.some(i => 
    i.data.klima_beschreibung || i.data.temp_jahres_mittel_min !== undefined || 
    i.data.klimahuelle || i.data.temperatur_bereich
  );
  
  if (hasClimate) {
    addGroupHeader(sections, '🌡️ Klimahülle', 'climate');
    
    // Methodik
    addSection(sections, items, 'klima_berechnungsmethode', 'Berechnungsmethode',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareTag);
    addSection(sections, items, 'klima_stichprobengroesse', 'Stichprobengröße',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'klima_daten_quelle', 'Klimadaten-Quelle',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareText);
    addSection(sections, items, 'klima_referenzperiode', 'Referenzperiode',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareText);
    addSection(sections, items, 'klima_beschreibung', 'Klimanische',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareText);
    
    // Legacy
    addSection(sections, items, 'klimahuelle', 'Klimahülle',
      'rgba(100, 180, 160, 0.65)', skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: TEMPERATUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTemp = items.some(i => 
    i.data.temp_jahres_mittel_min !== undefined || i.data.temperatur_bereich
  );
  
  if (hasTemp) {
    addGroupHeader(sections, '🌡️ Temperatur', 'temperature');
    
    addSection(sections, items, 'temp_jahres_mittel_min', 'Jahresmittel Min (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_jahres_mittel_max', 'Jahresmittel Max (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_jahres_mittel_optimal_min', 'Optimum Min (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_jahres_mittel_optimal_max', 'Optimum Max (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_waermstes_monat_min', 'Wärmster Monat Min (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_waermstes_monat_max', 'Wärmster Monat Max (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_kaeltestes_monat_min', 'Kältester Monat Min (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_kaeltestes_monat_max', 'Kältester Monat Max (°C)',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_saisonalitaet_min', 'Saisonalität Min',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'temp_saisonalitaet_max', 'Saisonalität Max',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareBar);
    
    // Legacy
    addSection(sections, items, 'temperatur_bereich', 'Temperatur-Bereich',
      'rgba(220, 140, 80, 0.65)', skipFelder, compareRange);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 11: NIEDERSCHLAG
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPrecip = items.some(i => 
    i.data.niederschlag_jahres_min !== undefined || i.data.niederschlag_bereich
  );
  
  if (hasPrecip) {
    addGroupHeader(sections, '💧 Niederschlag', 'precipitation');
    
    addSection(sections, items, 'niederschlag_jahres_min', 'Jahresniederschlag Min (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_jahres_max', 'Jahresniederschlag Max (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_jahres_optimal_min', 'Optimum Min (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_jahres_optimal_max', 'Optimum Max (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_feuchtester_min', 'Feuchtester Monat Min (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_feuchtester_max', 'Feuchtester Monat Max (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_trockenster_min', 'Trockenster Monat Min (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_trockenster_max', 'Trockenster Monat Max (mm)',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_saisonalitaet_min', 'Saisonalität Min',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    addSection(sections, items, 'niederschlag_saisonalitaet_max', 'Saisonalität Max',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareBar);
    
    // Legacy
    addSection(sections, items, 'niederschlag_bereich', 'Niederschlag-Bereich',
      'rgba(80, 140, 200, 0.65)', skipFelder, compareRange);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 12: KÖPPEN & BIOCLIM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasKoeppen = items.some(i => 
    i.data.koeppen_zonen || i.data.koeppen_primaer || i.data.bioclim_temp_jahresmittel
  );
  
  if (hasKoeppen) {
    addGroupHeader(sections, '🌐 Köppen & BioClim', 'koeppen');
    
    // Köppen
    addSection(sections, items, 'koeppen_zonen', 'Köppen-Zonen',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'koeppen_primaer', 'Primäre Köppen-Zone',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'koeppen_hauptklassen', 'Köppen Hauptklassen',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // BioClim
    addSection(sections, items, 'bioclim_temp_jahresmittel', 'BIO1 Jahresmitteltemp.',
      perspektive.farben?.[3], skipFelder, compareRange);
    addSection(sections, items, 'bioclim_temp_amplitude', 'BIO7 Temp. Amplitude',
      perspektive.farben?.[3], skipFelder, compareRange);
    addSection(sections, items, 'bioclim_niederschlag_jahr', 'BIO12 Jahresniederschlag',
      perspektive.farben?.[3], skipFelder, compareRange);
    addSection(sections, items, 'bioclim_niederschlag_saisonalitaet', 'BIO15 Niederschl. Saisonalität',
      perspektive.farben?.[3], skipFelder, compareRange);
    
    // Legacy
    addSection(sections, items, 'bioclim_variablen', 'BioClim-Variablen',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 13: KARTEN & VISUALISIERUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🗺️ Karten & Visualisierung', 'maps');
  
  // Karten-Metadaten
  addSection(sections, items, 'karte_typ', 'Kartentyp',
    perspektive.farben?.[0], skipFelder, compareTag);
  addSection(sections, items, 'karte_titel', 'Kartentitel',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'karte_beschreibung', 'Kartenbeschreibung',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'karte_center_lat', 'Karte Zentrum Lat',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'karte_center_lng', 'Karte Zentrum Lng',
    perspektive.farben?.[0], skipFelder, compareBar);
  addSection(sections, items, 'karte_zoom', 'Karte Zoom',
    perspektive.farben?.[0], skipFelder, compareBar);
  
  // Karten-Bilder
  addSection(sections, items, 'karte_url', 'Statische Karte',
    perspektive.farben?.[0], skipFelder, compareImage);
  addSection(sections, items, 'verbreitungskarte', 'Verbreitungskarte',
    perspektive.farben?.[0], skipFelder, compareImage);
  
  // Heatmap
  addSection(sections, items, 'heatmap_aktiv', 'Heatmap aktiv',
    'rgba(200, 100, 80, 0.65)', skipFelder, compareBoolean);
  addSection(sections, items, 'heatmap_radius', 'Heatmap Radius',
    'rgba(200, 100, 80, 0.65)', skipFelder, compareBar);
  addSection(sections, items, 'heatmap_max_zoom', 'Heatmap Max Zoom',
    'rgba(200, 100, 80, 0.65)', skipFelder, compareBar);
  addSection(sections, items, 'heatmap_funde', 'Heatmap Funde',
    'rgba(200, 100, 80, 0.65)', skipFelder, compareImage);
  
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

export default comparegeography;

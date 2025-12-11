/**
 * interactions v2.0 - Compare-Morph für Interaktions-Perspektive
 * 
 * Biological Interaction Networks - Comprehensive schema for biological 
 * interaction networks including multi-species relationships, chemical ecology,
 * microbiome associations, and mycorrhizal network dynamics.
 * 
 * Übersichtlich gruppiert in 6 Hauptbereiche:
 * 1. NETZWERK-POSITION & STABILITÄT
 * 2. MULTI-SPECIES interactions
 * 3. CHEMISCHE ÖKOLOGIE
 * 4. MIKROBIOM
 * 5. WIRT-interactions
 * 6. MYKORRHIZA-NETZWERK
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar,
  compareText, compareObject, compareBoolean,
  compareNumber
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareinteractions(items, perspektive, config = {}) {
  debug.morphs('compareinteractions v2.0', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-interactions';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(220, 120, 180, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔗'}</span>
    <span class="perspektive-name">${perspektive.name || 'interactions'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: NETZWERK-POSITION & STABILITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNetworkPos = items.some(i => 
    i.data.netzwerk_position || i.data.netzwerk_degree_zentralitaet !== undefined ||
    i.data.interaktions_stabilitaet || i.data.interaktions_keystone_index !== undefined
  );
  
  if (hasNetworkPos) {
    addGroupHeader(sections, '📍 Netzwerk-Position & Stabilität', 'network-position');
    
    // Netzwerk-Position (Objekt)
    addSection(sections, items, 'netzwerk_position', 'Netzwerk-Position',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // Zentralitäts-Metriken
    addSection(sections, items, 'netzwerk_degree_zentralitaet', 'Degree-Zentralität',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_betweenness_zentralitaet', 'Betweenness-Zentralität',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_closeness_zentralitaet', 'Closeness-Zentralität',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_eigenvector_zentralitaet', 'Eigenvector-Zentralität',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_hub_score', 'Hub-Score',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_clustering_koeffizient', 'Clustering-Koeffizient',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_community_id', 'Community-ID',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Interaktions-Stabilität
    addSection(sections, items, 'interaktions_stabilitaet', 'Interaktions-Stabilität',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'interaktions_robustheit_score', 'Robustheit-Score',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 10 }));
    
    addSection(sections, items, 'interaktions_redundanz_grad', 'Redundanz-Grad',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'interaktions_keystone_index', 'Keystone-Index',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'interaktions_temporale_persistenz', 'Temporale Persistenz',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_stoerungsanfaelligkeit', 'Störungsanfälligkeit',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: MULTI-SPECIES interactions
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMultiSpecies = items.some(i => 
    i.data.multispecies_interactions?.length > 0 || i.data.interaktions_typ
  );
  
  if (hasMultiSpecies) {
    addGroupHeader(sections, '🤝 Multi-Species interactions', 'multispecies');
    
    addSection(sections, items, 'multispecies_interactions', 'Multi-Species interactions',
      perspektive.farben?.[0], skipFelder, compareList);
    
    addSection(sections, items, 'interaktions_typ', 'Interaktions-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_subtyp', 'Interaktions-Subtyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_direktionalitaet', 'Direktionalität',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_staerke', 'Interaktions-Stärke',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'interaktions_obligat_fakultativ', 'Obligat/Fakultativ',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'interaktions_spezifitaet', 'Spezifität',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_raeumliche_skala', 'Räumliche Skala',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_kontakt_art', 'Kontakt-Art',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_temporales_muster', 'Temporales Muster',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'interaktions_saisonalitaet', 'Saisonalität',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'interaktions_frequenz', 'Frequenz',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_habitat_kontext', 'Habitat-Kontext',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'interaktions_fitness_effekt', 'Fitness-Effekt',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'interaktions_evidenz_level', 'Evidenz-Level',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'interaktions_konfidenz', 'Konfidenz',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: CHEMISCHE ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasChemEcol = items.some(i => 
    i.data.chemische_ecology?.length > 0 || i.data.allelopathie ||
    i.data.chemische_kommunikation || i.data.abwehrstoffe?.length > 0
  );
  
  if (hasChemEcol) {
    addGroupHeader(sections, '⚗️ Chemische Ökologie', 'chemical');
    
    // Chemische Stoffe
    addSection(sections, items, 'chemische_ecology', 'Chemische Ökologie',
      perspektive.farben?.[0], skipFelder, compareList);
    
    addSection(sections, items, 'chem_stoff_name', 'Stoffname',
      perspektive.farben?.[0], skipFelder, compareText);
    
    addSection(sections, items, 'chem_stoffklasse', 'Stoffklasse',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'chem_cas_nummer', 'CAS-Nummer',
      perspektive.farben?.[1], skipFelder, compareText);
    
    addSection(sections, items, 'chem_summenformel', 'Summenformel',
      perspektive.farben?.[1], skipFelder, compareText);
    
    addSection(sections, items, 'chem_freisetzungs_mechanismus', 'Freisetzungs-Mechanismus',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Allelopathie
    addSection(sections, items, 'allelopathie', 'Allelopathie',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'allelopathie_aktiv', 'Allelopathie Aktiv',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    
    addSection(sections, items, 'allelopathie_effekt_typ', 'Allelopathie Effekt-Typ',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'allelopathie_ziel_organismen', 'Ziel-Organismen',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'allelopathie_betroffene_prozesse', 'Betroffene Prozesse',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Chemische Kommunikation
    addSection(sections, items, 'chemische_kommunikation', 'Chemische Kommunikation',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'chem_signal_typ', 'Signal-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'chem_signal_funktion', 'Signal-Funktion',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'chem_signal_reichweite_meter', 'Signal-Reichweite',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    // Abwehrstoffe
    addSection(sections, items, 'abwehrstoffe', 'Abwehrstoffe',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'abwehr_typ', 'Abwehr-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'abwehr_toxisch_fuer', 'Toxisch für',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: MIKROBIOM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMicrobiome = items.some(i => 
    i.data.mikrobiom || i.data.assoziierte_bakterien?.length > 0 ||
    i.data.assoziierte_pilze?.length > 0 || i.data.mikrobiom_richness !== undefined
  );
  
  if (hasMicrobiome) {
    addGroupHeader(sections, '🦠 Mikrobiom', 'microbiome');
    
    addSection(sections, items, 'mikrobiom', 'Mikrobiom',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'mikrobiom_kompartiment', 'Kompartiment',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'mikrobiom_diversitaet_shannon', 'Shannon-Diversität',
      perspektive.farben?.[0], skipFelder, compareNumber);
    
    addSection(sections, items, 'mikrobiom_diversitaet_simpson', 'Simpson-Diversität',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'mikrobiom_richness', 'Richness',
      perspektive.farben?.[1], skipFelder, compareNumber);
    
    addSection(sections, items, 'mikrobiom_evenness', 'Evenness',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'mikrobiom_dominante_phyla', 'Dominante Phyla',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'mikrobiom_core_anteil', 'Core-Mikrobiom Anteil',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    // Assoziierte Bakterien
    addSection(sections, items, 'assoziierte_bakterien', 'Assoziierte Bakterien',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'bakterien_funktionelle_gruppe', 'Bakterien Funktionelle Gruppe',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Assoziierte Pilze
    addSection(sections, items, 'assoziierte_pilze', 'Assoziierte Pilze',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'pilze_funktionelle_gruppe', 'Pilze Funktionelle Gruppe',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // Funktionelles Profil
    addSection(sections, items, 'funktionelles_profil', 'Funktionelles Profil',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'metabolische_pfade', 'Metabolische Pfade',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'gesamt_metabolisches_potential', 'Metabolisches Potential',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Mikrobiom-Stabilität
    addSection(sections, items, 'mikrobiom_resilienz', 'Mikrobiom Resilienz',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'mikrobiom_temporal_variabilitaet', 'Temporale Variabilität',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'community_struktur', 'Community-Struktur',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: WIRT-interactions
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasWirtInteraktion = items.some(i => 
    i.data.wirt_interactions?.length > 0 || i.data.symbionten?.length > 0 ||
    i.data.parasiten?.length > 0 || i.data.konkurrenten?.length > 0
  );
  
  if (hasWirtInteraktion) {
    addGroupHeader(sections, '🔄 Wirt-interactions', 'host-interactions');
    
    addSection(sections, items, 'wirt_interactions', 'Wirt-interactions',
      perspektive.farben?.[0], skipFelder, compareList);
    
    addSection(sections, items, 'wirt_beziehungs_kategorie', 'Beziehungs-Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Symbionten
    addSection(sections, items, 'symbionten', 'Symbionten',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'symbiose_typ', 'Symbiose-Typ',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    addSection(sections, items, 'symbiose_wirt_nutzen', 'Wirt-Nutzen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'symbiose_partner_nutzen', 'Partner-Nutzen',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'symbiose_zeit_bis_funktionell', 'Zeit bis funktionell (Tage)',
      perspektive.farben?.[1], skipFelder, compareNumber);
    
    // Parasiten
    addSection(sections, items, 'parasiten', 'Parasiten',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'parasitismus_typ', 'Parasitismus-Typ',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'parasit_befallene_organe', 'Befallene Organe',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'parasit_symptome', 'Symptome',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'parasit_schweregrad', 'Schweregrad',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'parasit_pathogenitaet', 'Pathogenität',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'parasit_uebertragungsweg', 'Übertragungsweg',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Konkurrenten
    addSection(sections, items, 'konkurrenten', 'Konkurrenten',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'konkurrenz_typ', 'Konkurrenz-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'konkurrenz_umkaempfte_ressourcen', 'Umkämpfte Ressourcen',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'konkurrenz_intensitaet', 'Konkurrenz-Intensität',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'konkurrenz_koexistenz_mechanismen', 'Koexistenz-Mechanismen',
      perspektive.farben?.[3], skipFelder, compareList);
    
    // Quantifizierung
    addSection(sections, items, 'wirt_praevelenz', 'Prävalenz',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: MYKORRHIZA-NETZWERK (Wood Wide Web)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNetwork = items.some(i => 
    i.data.mykorrhiza_netzwerk || i.data.naehrstoff_transfer?.length > 0 ||
    i.data.signal_transfer?.length > 0 || i.data.netzwerk_snapshot
  );
  
  if (hasNetwork) {
    addGroupHeader(sections, '🌐 Mykorrhiza-Netzwerk', 'mycorrhizal-network');
    
    addSection(sections, items, 'mykorrhiza_netzwerk', 'Mykorrhiza-Netzwerk',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'mykorrhiza_netzwerk_id', 'Netzwerk-ID',
      perspektive.farben?.[0], skipFelder, compareText);
    
    addSection(sections, items, 'mykorrhiza_verbindungs_typ', 'Verbindungs-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'mykorrhiza_verbindungs_staerke', 'Verbindungs-Stärke',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'mykorrhiza_hyphen_dichte', 'Hyphen-Dichte',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'mykorrhiza_alter_verbindung', 'Alter der Verbindung (Monate)',
      perspektive.farben?.[1], skipFelder, compareNumber);
    
    // Nährstoff-Transfer
    addSection(sections, items, 'naehrstoff_transfer', 'Nährstoff-Transfer',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'naehrstoff_typ', 'Nährstoff-Typ',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'naehrstoff_richtung', 'Transfer-Richtung',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    addSection(sections, items, 'naehrstoff_anteil_bedarf_gedeckt', 'Anteil Bedarf gedeckt',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    // Signal-Transfer
    addSection(sections, items, 'signal_transfer', 'Signal-Transfer',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'signal_typ', 'Signal-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'signal_biologischer_effekt', 'Biologischer Effekt',
      perspektive.farben?.[3], skipFelder, compareText);
    
    addSection(sections, items, 'signal_effizienz', 'Signal-Effizienz',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    // Ökologische Bedeutung
    addSection(sections, items, 'mykorrhiza_facilitation_effekt', 'Facilitation-Effekt',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'mykorrhiza_resilienz_beitrag', 'Resilienz-Beitrag',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'mykorrhiza_carbon_sink_potential', 'Carbon-Sink Potential',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Netzwerk-Snapshot Metriken
    addSection(sections, items, 'netzwerk_snapshot', 'Netzwerk-Snapshot',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'netzwerk_knoten_anzahl', 'Knoten-Anzahl',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    addSection(sections, items, 'netzwerk_kanten_anzahl', 'Kanten-Anzahl',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    addSection(sections, items, 'netzwerk_dichte', 'Netzwerk-Dichte',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_modularitaet', 'Modularität',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    addSection(sections, items, 'netzwerk_nestedness', 'Nestedness',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    // Netzwerk-Stabilität
    addSection(sections, items, 'netzwerk_robustheit_zufaellig', 'Robustheit (zufällig)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_robustheit_gezielt', 'Robustheit (gezielt)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'netzwerk_fragmentierungs_risiko', 'Fragmentierungs-Risiko',
      perspektive.farben?.[3], skipFelder, compareTag);
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

export default compareinteractions;

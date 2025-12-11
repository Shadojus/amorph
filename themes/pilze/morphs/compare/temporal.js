/**
 * TEMPORAL v2.0 - Compare-Morph für zeitliche Perspektive
 * 
 * Comprehensive temporal dynamics covering:
 * 1. TEMPORAL PROFILE - Core classification
 * 2. LEBENSZYKLUS - Lifecycle & Development Stages
 * 3. PHÄNOLOGIE - Phenology & Seasonality
 * 4. CIRCADIAN - Daily rhythms & patterns
 * 5. GESCHICHTE - Historical discovery & milestones
 * 6. KULTIVIERUNG - Cultivation timeline
 * 7. PROJEKTIONEN - Future projections & scenarios
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareTimeline,
  compareText, compareObject, compareBoolean, compareNumber
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareTemporal(items, perspektive, config = {}) {
  debug.morphs('compareTemporal v2.0', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-temporal';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(120, 120, 200, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⏳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Temporal'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: TEMPORAL PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⏳ Temporal-Profil', 'profile');
  
  addSection(sections, items, 'temporal_strategie', 'Temporal-Strategie',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'langlebigkeits_klasse', 'Langlebigkeits-Klasse',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'generationszeit_tage', 'Generationszeit',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
  
  addSection(sections, items, 'beobachtungen_anzahl', 'Beobachtungen',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: LEBENSZYKLUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🔄 Lebenszyklus', 'lifecycle');
  
  addSection(sections, items, 'lebenszyklus_typ', 'Lebenszyklus-Typ',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'reproduktionsmodus', 'Reproduktionsmodus',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'paarungssystem', 'Paarungssystem',
    perspektive.farben?.[1], skipFelder, compareTag);
  
  addSection(sections, items, 'ploidie_zyklus', 'Ploidie-Zyklus',
    perspektive.farben?.[1], skipFelder, compareText);
  
  addSection(sections, items, 'zyklus_dauer_tage_gesamt', 'Zyklus-Dauer (Tage)',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
  
  addSection(sections, items, 'generationen_pro_jahr', 'Generationen/Jahr',
    perspektive.farben?.[1], skipFelder, compareBar);
  
  addSection(sections, items, 'modellorganismus_status', 'Modellorganismus',
    perspektive.farben?.[2], skipFelder, compareBoolean);
  
  addSection(sections, items, 'genom_sequenziert', 'Genom sequenziert',
    perspektive.farben?.[2], skipFelder, compareBoolean);
  
  // Fruchtungstrigger
  addSection(sections, items, 'fruchtungs_trigger', 'Fruchtungstrigger',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: ENTWICKLUNGSSTADIEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasStages = items.some(i => 
    i.data.entwicklungsstadien || i.data.stadien_anzahl || i.data.stadium_1_name
  );
  
  if (hasStages) {
    addGroupHeader(sections, '🌱 Entwicklungsstadien', 'stages');
    
    addSection(sections, items, 'entwicklungsstadien', 'Stadien-Übersicht',
      perspektive.farben?.[0], skipFelder, compareList);
    
    addSection(sections, items, 'stadien_anzahl', 'Anzahl Stadien',
      perspektive.farben?.[0], skipFelder, compareBar);
    
    // Stadien 1-8 kompakt
    for (let i = 1; i <= 8; i++) {
      const stageData = items.some(item => item.data[`stadium_${i}_name`]);
      if (stageData) {
        addSection(sections, items, `stadium_${i}_name`, `Stadium ${i}`,
          perspektive.farben?.[i % 4], skipFelder, compareText);
        
        addSection(sections, items, `stadium_${i}_dauer_h_optimal`, `Stadium ${i} Dauer (h)`,
          perspektive.farben?.[i % 4], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' h' }));
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: PHÄNOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📅 Phänologie & Saison', 'phenology');
  
  addSection(sections, items, 'phenologie', 'Phänologie',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  addSection(sections, items, 'saisonalitaet_typ', 'Saisonalität',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'primaere_saison', 'Primäre Saison',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'sekundaere_saison', 'Sekundäre Saison',
    perspektive.farben?.[1], skipFelder, compareTag);
  
  addSection(sections, items, 'monatliche_aktivitaet', 'Monatliche Aktivität',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  addSection(sections, items, 'peak_perioden', 'Peak-Perioden',
    perspektive.farben?.[2], skipFelder, compareList);
  
  addSection(sections, items, 'saison_laenge_tage', 'Saison-Länge',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
  
  // Umwelt-Korrelationen
  addSection(sections, items, 'frost_empfindlichkeit', 'Frost-Empfindlichkeit',
    perspektive.farben?.[1], skipFelder, compareTag);
  
  addSection(sections, items, 'trockenheits_reaktion', 'Trockenheits-Reaktion',
    perspektive.farben?.[1], skipFelder, compareTag);
  
  // Phenologie-Verschiebung
  addSection(sections, items, 'phenologie_verschiebung_erkannt', 'Phänologie-Verschiebung',
    perspektive.farben?.[2], skipFelder, compareBoolean);
  
  addSection(sections, items, 'verschiebung_groesse_tage', 'Verschiebung (Tage)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: CIRCADIAN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCircadian = items.some(i => 
    i.data.circadian || i.data.rhythmus_typ || i.data.sporenfreisetzung
  );
  
  if (hasCircadian) {
    addGroupHeader(sections, '🌅 Tagesrhythmus', 'circadian');
    
    addSection(sections, items, 'circadian', 'Circadian',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'rhythmus_typ', 'Rhythmus-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'rhythmus_periode_stunden', 'Periode (Stunden)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' h' }));
    
    addSection(sections, items, 'sporenfreisetzung', 'Sporenfreisetzung',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'sporenfreisetzung_peak_zeit_utc', 'Sporen-Peak (UTC)',
      perspektive.farben?.[1], skipFelder, compareText);
    
    addSection(sections, items, 'wachstumsrate_muster', 'Wachstumsrate-Muster',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'metabolischer_rhythmus', 'Metabolischer Rhythmus',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'lichtreaktion', 'Lichtreaktion',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Biolumineszenz
    addSection(sections, items, 'biolumineszenz_vorhanden', 'Biolumineszenz',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    
    addSection(sections, items, 'biolumineszenz_farbe', 'Biolumineszenz-Farbe',
      perspektive.farben?.[0], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: GESCHICHTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasHistory = items.some(i => 
    i.data.entdeckung || i.data.entdeckung_jahr || i.data.erstbeschreibung || i.data.meilensteine
  );
  
  if (hasHistory) {
    addGroupHeader(sections, '📜 Geschichte', 'history');
    
    addSection(sections, items, 'entdeckung', 'Entdeckung',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'entdeckung_jahr', 'Entdeckungsjahr',
      perspektive.farben?.[0], skipFelder, compareBar);
    
    addSection(sections, items, 'entdecker_name', 'Entdecker',
      perspektive.farben?.[0], skipFelder, compareText);
    
    addSection(sections, items, 'erstbeschreibung', 'Erstbeschreibung',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'original_name', 'Original-Name',
      perspektive.farben?.[1], skipFelder, compareText);
    
    addSection(sections, items, 'etymologie', 'Etymologie',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'indigenes_wissen', 'Indigenes Wissen',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'meilensteine', 'Meilensteine',
      perspektive.farben?.[1], skipFelder, compareTimeline);
    
    addSection(sections, items, 'synonyme_historie', 'Synonyme-Historie',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: KULTIVIERUNGS-TIMELINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCultivation = items.some(i => 
    i.data.kultivierungs_timeline || i.data.kultivierungs_status || i.data.erste_kultivierung_jahr
  );
  
  if (hasCultivation) {
    addGroupHeader(sections, '🌾 Kultivierungs-Historie', 'cultivation');
    
    addSection(sections, items, 'kultivierungs_timeline', 'Kultivierungs-Timeline',
      perspektive.farben?.[0], skipFelder, compareTimeline);
    
    addSection(sections, items, 'kultivierungs_status', 'Kultivierungs-Status',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'domestizierungs_level', 'Domestizierungs-Level',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    addSection(sections, items, 'erste_kultivierung_jahr', 'Erste Kultivierung',
      perspektive.farben?.[1], skipFelder, compareBar);
    
    addSection(sections, items, 'kultivierungs_pioniere', 'Pioniere',
      perspektive.farben?.[1], skipFelder, compareList);
    
    addSection(sections, items, 'methoden_evolution', 'Methoden-Evolution',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'aktuelle_globale_produktion_tonnen', 'Globale Produktion',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' t' }));
    
    addSection(sections, items, 'aktueller_marktwert_usd', 'Marktwert',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: ZUKUNFTSPROJEKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasProjections = items.some(i => 
    i.data.klima_projektionen || i.data.naturschutz_prognose || i.data.zukunfts_szenarien
  );
  
  if (hasProjections) {
    addGroupHeader(sections, '🔮 Zukunft & Projektionen', 'projections');
    
    addSection(sections, items, 'klima_projektionen', 'Klima-Projektionen',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'klima_projektion_szenario', 'Klima-Szenario',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Areal-Verschiebungen
    addSection(sections, items, 'areal_verschiebung_richtung', 'Areal-Verschiebung',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    addSection(sections, items, 'areal_verschiebung_distanz_km_dekade', 'Verschiebung km/Dekade',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' km' }));
    
    addSection(sections, items, 'areal_projektion_2050', 'Areal 2050',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'areal_projektion_2100', 'Areal 2100',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Phenologie-Projektionen
    addSection(sections, items, 'phenologie_projektion_frueheres_erscheinen_tage', 'Früheres Erscheinen (Tage)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Tage' }));
    
    addSection(sections, items, 'mismatch_risiko', 'Mismatch-Risiko',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Naturschutz-Prognose
    addSection(sections, items, 'naturschutz_prognose', 'Naturschutz-Prognose',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    addSection(sections, items, 'naturschutz_prognose_projizierter_status', 'Projizierter Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    addSection(sections, items, 'aussterbe_risiko', 'Aussterbe-Risiko',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    addSection(sections, items, 'aussterbe_wahrscheinlichkeit_2050', 'Aussterbe-Wsk. 2050',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    addSection(sections, items, 'aussterbe_wahrscheinlichkeit_2100', 'Aussterbe-Wsk. 2100',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Anpassungspotenzial
    addSection(sections, items, 'anpassungspotenzial', 'Anpassungspotenzial',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    addSection(sections, items, 'anpassungspotenzial_overall_score', 'Anpassungs-Score',
      perspektive.farben?.[0], skipFelder, compareBar);
    
    // Climate Refugia
    addSection(sections, items, 'climate_refugia_vorhanden', 'Climate Refugia',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    
    addSection(sections, items, 'climate_refugia_orte', 'Refugia-Orte',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Szenarien
    addSection(sections, items, 'zukunfts_szenarien', 'Zukunfts-Szenarien',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'szenario_best_case_beschreibung', 'Best Case',
      perspektive.farben?.[0], skipFelder, compareText);
    
    addSection(sections, items, 'szenario_moderate_beschreibung', 'Moderate Case',
      perspektive.farben?.[1], skipFelder, compareText);
    
    addSection(sections, items, 'szenario_worst_case_beschreibung', 'Worst Case',
      perspektive.farben?.[3], skipFelder, compareText);
    
    addSection(sections, items, 'monitoring_empfehlungen', 'Monitoring-Empfehlungen',
      perspektive.farben?.[2], skipFelder, compareList);
    
    addSection(sections, items, 'forschungs_prioritaeten', 'Forschungs-Prioritäten',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: DATENQUALITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasDataQuality = items.some(i => 
    i.data.temporal_daten_quellen || i.data.temporal_daten_qualitaets_score
  );
  
  if (hasDataQuality) {
    addGroupHeader(sections, '📊 Datenqualität', 'quality');
    
    addSection(sections, items, 'temporal_daten_quellen', 'Daten-Quellen',
      perspektive.farben?.[0], skipFelder, compareList);
    
    addSection(sections, items, 'temporal_daten_qualitaets_score', 'Qualitäts-Score',
      perspektive.farben?.[0], skipFelder, compareBar);
    
    addSection(sections, items, 'temporal_daten_vollstaendigkeit', 'Vollständigkeit',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    addSection(sections, items, 'temporal_daten_letzte_validierung', 'Letzte Validierung',
      perspektive.farben?.[1], skipFelder, compareText);
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

export default compareTemporal;

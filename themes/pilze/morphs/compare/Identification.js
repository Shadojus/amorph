/**
 * identification - Compare-Morph für Identifikation/Determinierung
 * 
 * VOLLSTÄNDIGES identificationSSYSTEM in 10 Hauptbereichen:
 * 1. SPEZIES-IDENTIFIKATION - Taxonomie, Nomenklatur, externe IDs
 * 2. MAKROSKOPIE - Habitus, Hut, Lamellen, Stiel, Fleisch
 * 3. MIKROSKOPIE - Sporen, Basidien, Zystiden, Hyphen
 * 4. chemistry - Spot-Tests, UV-Fluoreszenz
 * 5. MOLEKULAR - DNA-Barcoding, Phylogenie
 * 6. ÖKOLOGIE - Habitat, Substrat, Symbiosen
 * 7. VERWECHSLUNG - Ähnliche Arten, Abgrenzung
 * 8. identificationSHILFEN - Schlüssel, Literatur
 * 9. MEDIEN - Bilder, 360°, 3D, Visual Signature
 * 10. FUNDDATEN - Fundort, Beleg, Dokumentation
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar,
  compareText, compareObject, compareImage,
  compareBoolean
} from '../../../../morphs/compare/primitives/index.js';

// Wrapper für Zahlen-Vergleich (nutzt compareText)
const compareNumber = compareText;

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareidentification(items, perspektive, config = {}) {
  debug.morphs('compareidentification', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-identification';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(100, 200, 220, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔍'}</span>
    <span class="perspektive-name">${perspektive.name || 'identification'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: SPEZIES-IDENTIFIKATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏷️ Spezies-Identifikation', 'spezies');
  
  // Namen
  addSection(sections, items, 'wissenschaftlicher_name', 'Wissenschaftlicher Name',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'autorenzitat', 'Autorenzitat',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'akzeptierter_name', 'Akzeptierter Name',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'basionym', 'Basionym',
    perspektive.farben?.[0], skipFelder, compareText);
  
  // Taxonomie
  addSection(sections, items, 'taxonomie_familia', 'Familie',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'taxonomie_genus', 'Gattung',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'synonyme', 'Synonyme',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'deutsche_namen', 'Deutsche Namen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Externe IDs
  addSection(sections, items, 'mycobank_id', 'MycoBank ID',
    perspektive.farben?.[2], skipFelder, compareText);
  addSection(sections, items, 'index_fungorum_id', 'Index Fungorum',
    perspektive.farben?.[2], skipFelder, compareText);
  addSection(sections, items, 'gbif_key', 'GBIF Key',
    perspektive.farben?.[3], skipFelder, compareText);
  addSection(sections, items, 'taxonomie_status', 'Status',
    perspektive.farben?.[3], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: MAKROSKOPIE - GRUNDLEGEND
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '👁️ Makroskopie', 'makroskopie');
  
  // Habitus
  addSection(sections, items, 'habitus', 'Habitus',
    perspektive.farben?.[0], skipFelder, compareTag);
  addSection(sections, items, 'wuchsform', 'Wuchsform',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'groesse_min_cm', 'Größe min (cm)',
    perspektive.farben?.[1], skipFelder, compareNumber);
  addSection(sections, items, 'groesse_max_cm', 'Größe max (cm)',
    perspektive.farben?.[1], skipFelder, compareNumber);
  
  // Farbe
  addSection(sections, items, 'farbe_frisch', 'Farbe (frisch)',
    perspektive.farben?.[2], skipFelder, compareText);
  addSection(sections, items, 'farbe_verletzung', 'Verfärbung',
    perspektive.farben?.[2], skipFelder, compareText);
  
  // Geruch & Geschmack
  addSection(sections, items, 'geruch_frisch', 'Geruch',
    perspektive.farben?.[3], skipFelder, compareText);
  addSection(sections, items, 'geschmack', 'Geschmack',
    perspektive.farben?.[3], skipFelder, compareText);
  addSection(sections, items, 'geschmack_warnung', '⚠️ Kostprobe gefährlich',
    perspektive.farben?.[3], skipFelder, compareBoolean);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2b: PILZ-SPEZIFISCH
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPilzMerkmale = items.some(i => 
    i.data.hut_durchmesser_max || i.data.lamellen_ansatz || i.data.roehren_vorhanden
  );
  
  if (hasPilzMerkmale) {
    addGroupHeader(sections, '🍄 Pilzmerkmale', 'pilz');
    
    // Hut
    addSection(sections, items, 'hut_durchmesser_min', 'Hut Ø min (cm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'hut_durchmesser_max', 'Hut Ø max (cm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'hut_form_jung', 'Hutform jung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'hut_form_alt', 'Hutform alt',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'hut_hygrophan', 'Hygrophan',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    
    // Lamellen
    addSection(sections, items, 'lamellen_vorhanden', 'Lamellen',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    addSection(sections, items, 'lamellen_ansatz', 'Lamellenansatz',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'lamellen_farbe', 'Lamellenfarbe',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Röhren
    addSection(sections, items, 'roehren_vorhanden', 'Röhren',
      perspektive.farben?.[1], skipFelder, compareBoolean);
    addSection(sections, items, 'poren_form', 'Porenform',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'poren_verfaerbung_druck', 'Porenverfärbung',
      perspektive.farben?.[1], skipFelder, compareText);
    
    // Stiel
    addSection(sections, items, 'stiel_form', 'Stielform',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'stiel_basis', 'Stielbasis',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'stiel_natterung', 'Natterung',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    
    // Hüllen
    addSection(sections, items, 'velum_partiale', 'Velum partiale',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ring_form', 'Ring',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'velum_universale', 'Velum universale',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'volva_form', 'Volva',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Fleisch
    addSection(sections, items, 'fleisch_farbe', 'Fleischfarbe',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'fleisch_verfaerbung', 'Fleischverfärbung',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'milchsaft', 'Milchsaft',
      perspektive.farben?.[3], skipFelder, compareBoolean);
    addSection(sections, items, 'milchsaft_farbe', 'Milchsaft-Farbe',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // Sporenpulver
    addSection(sections, items, 'sporenpulver_farbe', 'Sporenpulverfarbe',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: MIKROSKOPIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMikro = items.some(i => 
    i.data.sporen_laenge_min || i.data.sporen_ornament || i.data.basidien
  );
  
  if (hasMikro) {
    addGroupHeader(sections, '🔬 Mikroskopie', 'mikroskopie');
    
    // Sporen
    addSection(sections, items, 'sporen_form', 'Sporenform',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'sporen_laenge_min', 'Sporenlänge min (µm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'sporen_laenge_max', 'Sporenlänge max (µm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'sporen_breite_min', 'Sporenbreite min (µm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'sporen_breite_max', 'Sporenbreite max (µm)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'sporen_quotient', 'Sporen-Quotient (Q)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'sporen_ornament', 'Sporenornament',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Basidien & Asci
    addSection(sections, items, 'basidien_sterigmen_anzahl', 'Sterigmen-Anzahl',
      perspektive.farben?.[1], skipFelder, compareNumber);
    addSection(sections, items, 'asci_jod_reaktion', 'Asci Jod-Reaktion',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Zystiden
    addSection(sections, items, 'zystiden_vorhanden', 'Zystiden',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'cheilozystiden_form', 'Cheilozystiden',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'pleurozystiden_form', 'Pleurozystiden',
      perspektive.farben?.[2], skipFelder, compareText);
    
    // Hyphen
    addSection(sections, items, 'hyphen_schnallen', 'Schnallen',
      perspektive.farben?.[3], skipFelder, compareBoolean);
    addSection(sections, items, 'huthaut_typ', 'Huthaut-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: CHEMISCHE REAKTIONEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const haschemistry = items.some(i => 
    i.data.koh_hut || i.data.melzer_sporen || i.data.feso4_fleisch
  );
  
  if (haschemistry) {
    addGroupHeader(sections, '🧪 Chemische Reaktionen', 'chemistry');
    
    addSection(sections, items, 'koh_hut', 'KOH Hut',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'koh_fleisch', 'KOH Fleisch',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'melzer_sporen', 'Melzer Sporen',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'melzer_asci', 'Melzer Asci',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'feso4_fleisch', 'FeSO4 Fleisch',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'guajak_reaktion', 'Guajak',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'uv_365nm', 'UV 365nm',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: MOLEKULARE DATEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMolekular = items.some(i => 
    i.data.its_accession || i.data.bold_bin || i.data.phylogenie_clade
  );
  
  if (hasMolekular) {
    addGroupHeader(sections, '🧬 Molekulare Daten', 'molekular');
    
    addSection(sections, items, 'its_accession', 'ITS Accession',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'its_laenge', 'ITS Länge (bp)',
      perspektive.farben?.[0], skipFelder, compareNumber);
    addSection(sections, items, 'bold_bin', 'BOLD BIN',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'bold_similarity', 'BOLD Similarity (%)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
    addSection(sections, items, 'phylogenie_clade', 'Phylogenie-Clade',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'naechste_verwandte', 'Nächste Verwandte',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: ÖKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🌲 Ökologie', 'ecology');
  
  addSection(sections, items, 'ernaehrungsweise', 'Ernährungsweise',
    perspektive.farben?.[0], skipFelder, compareTag);
  addSection(sections, items, 'habitat_typ', 'Habitat',
    perspektive.farben?.[0], skipFelder, compareText);
  addSection(sections, items, 'substrat_kategorie', 'Substrat',
    perspektive.farben?.[1], skipFelder, compareTag);
  addSection(sections, items, 'substrat_arten', 'Substrat-Arten',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'mykorrhiza_typ', 'Mykorrhiza-Typ',
    perspektive.farben?.[2], skipFelder, compareTag);
  addSection(sections, items, 'mykorrhiza_partner', 'Mykorrhiza-Partner',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'hoehenstufe', 'Höhenstufe',
    perspektive.farben?.[3], skipFelder, compareTag);
  addSection(sections, items, 'saison_peak', 'Saison-Höhepunkt',
    perspektive.farben?.[3], skipFelder, compareText);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: VERWECHSLUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚠️ Verwechslung', 'verwechslung');
  
  addSection(sections, items, 'verwechslungs_arten', 'Verwechslungsarten',
    perspektive.farben?.[0], skipFelder, compareList);
  addSection(sections, items, 'gefaehrlichste_verwechslung', 'Gefährlichste',
    perspektive.farben?.[0], skipFelder, compareObject);
  addSection(sections, items, 'verwechslungs_gefahr', 'Verwechslungsgefahr',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 5 }));
  addSection(sections, items, 'kritische_merkmale', 'Kritische Merkmale',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'sichere_merkmale', 'Sichere Merkmale',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'identifications_safety_level', 'safetyslevel',
    perspektive.farben?.[3], skipFelder, compareTag);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: identificationSHILFEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📚 identificationshilfen', 'hilfen');
  
  addSection(sections, items, 'primaere_erkennungsmerkmale', 'Primäre Merkmale',
    perspektive.farben?.[0], skipFelder, compareList);
  addSection(sections, items, 'merkmale_fuer_anfaenger', 'Für Anfänger',
    perspektive.farben?.[0], skipFelder, compareList);
  addSection(sections, items, 'feldmerkmale', 'Feldmerkmale',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'labormerkmale', 'Labormerkmale',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'minimale_merkmalskombination', 'Minimale Kombination',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'identificationsliteratur', 'Literatur',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: MEDIEN & DOKUMENTATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📷 Medien', 'medien');
  
  addSection(sections, items, 'primaerbild', 'Primärbild',
    perspektive.farben?.[0], skipFelder, compareImage);
  addSection(sections, items, 'bild', 'Bild',
    perspektive.farben?.[0], skipFelder, compareImage);
  addSection(sections, items, 'bildergalerie', 'Bildergalerie',
    perspektive.farben?.[1], skipFelder, compareList);
  addSection(sections, items, 'bild_jung', 'Jung',
    perspektive.farben?.[1], skipFelder, compareImage);
  addSection(sections, items, 'bild_alt', 'Alt',
    perspektive.farben?.[1], skipFelder, compareImage);
  addSection(sections, items, 'mikroskopie_bilder', 'Mikroskopie',
    perspektive.farben?.[2], skipFelder, compareList);
  addSection(sections, items, 'view_360', '360°-Ansicht',
    perspektive.farben?.[2], skipFelder, compareObject);
  addSection(sections, items, 'modell_3d', '3D-Modell',
    perspektive.farben?.[3], skipFelder, compareObject);
  addSection(sections, items, 'visual_signature', 'Visual Signature',
    perspektive.farben?.[3], skipFelder, compareObject);
  addSection(sections, items, 'erkennungs_konfidenz', 'KI-Konfidenz (%)',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: FUNDDATEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFund = items.some(i => 
    i.data.fund_datum || i.data.fund_land || i.data.herbar_beleg
  );
  
  if (hasFund) {
    addGroupHeader(sections, '📍 Funddaten', 'fund');
    
    addSection(sections, items, 'identification_status', 'identifications-Status',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bestimmt_durch', 'Bestimmt durch',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'identifications_methode', 'Methode',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'identifications_konfidenz', 'Konfidenz (%)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
    
    addSection(sections, items, 'fund_datum', 'Fund-Datum',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'fund_land', 'Land',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'fund_region', 'Region',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'fund_lokalitaet', 'Lokalität',
      perspektive.farben?.[2], skipFelder, compareText);
    
    addSection(sections, items, 'finder', 'Finder',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'herbar_beleg', 'Herbarbeleg',
      perspektive.farben?.[3], skipFelder, compareBoolean);
    addSection(sections, items, 'herbar_institution', 'Herbar',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'sequenz_vorhanden', 'Sequenz vorhanden',
      perspektive.farben?.[3], skipFelder, compareBoolean);
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

export default compareidentification;

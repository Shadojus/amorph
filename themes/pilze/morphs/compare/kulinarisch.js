/**
 * KULINARISCH - Compare-Morph für kulinarische Perspektive v2.0
 * 
 * Übersichtlich gruppiert in 8 Hauptbereiche:
 * 1. SICHERHEIT & BEWERTUNG
 * 2. GESCHMACK & TEXTUR  
 * 3. ZUBEREITUNG & TECHNIKEN
 * 4. PAIRINGS & KOMPOSITION
 * 5. LAGERUNG & KONSERVIERUNG
 * 6. MAKRONÄHRSTOFFE
 * 7. MIKRONÄHRSTOFFE (Vitamine, Mineralstoffe, Aminosäuren)
 * 8. BIOAKTIVE & INDIZES
 * 9. TRADITION & KULTUR
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareRadar, comparePie, 
  compareRating, compareRange, compareText, compareObject
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareKulinarisch(items, perspektive, config = {}) {
  debug.morphs('compareKulinarisch', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-kulinarisch';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 200, 120, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🍳'}</span>
    <span class="perspektive-name">${perspektive.name || 'Kulinarisch'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: SICHERHEIT & BEWERTUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🛡️ Sicherheit & Bewertung', 'safety');
  
  // Essbarkeit Status + Rating in einer Zeile
  addSection(sections, items, 'essbarkeit_status', 'Essbarkeit', 
    perspektive.farben?.[0], skipFelder, compareTag);
  
  addSection(sections, items, 'essbarkeit_rating', 'Qualitätsbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  
  // Warnungen (wichtig!)
  addSection(sections, items, 'essbarkeit_warnungen', 'Warnhinweise',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Legacy Bewertung
  addSection(sections, items, 'bewertung', 'Gesamtbewertung',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 5 }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: GESCHMACK & TEXTUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '👅 Geschmack & Textur', 'taste');
  
  // Sensorik Radar (Hauptvisualisierung)
  addSection(sections, items, 'sensorik', 'Sensorisches Profil',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // Geschmack als kompakte Tags
  addSection(sections, items, 'geschmack_primaer', 'Hauptgeschmack',
    perspektive.farben?.[1], skipFelder, compareList);
  
  addSection(sections, items, 'geschmack_sekundaer', 'Nebennoten',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Aroma
  addSection(sections, items, 'aroma_profil', 'Aromastoffe',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Texturen
  addSection(sections, items, 'textur_roh', 'Textur (roh)',
    perspektive.farben?.[1], skipFelder, compareList);
  
  addSection(sections, items, 'textur_gegart', 'Textur (gegart)',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Optik
  addSection(sections, items, 'optik', 'Optik/Ästhetik',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // Legacy Profil
  addSection(sections, items, 'profil', 'Geschmacksprofil',
    perspektive.farben?.[1], skipFelder, compareRadar);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: ZUBEREITUNG & TECHNIKEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🍳 Zubereitung', 'cooking');
  
  // Methoden als Tags
  addSection(sections, items, 'zubereitung_methoden', 'Zubereitungsarten',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Optimale Zubereitung als Balken (spezielle Behandlung für {label, value} Arrays)
  addObjectArraySection(sections, items, 'zubereitung_optimal', 'Beste Methoden',
    perspektive.farben?.[2], skipFelder);
  
  // Temperaturen & Zeiten
  addSection(sections, items, 'zubereitung_temperaturen', 'Temperaturen',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  addSection(sections, items, 'zubereitung_zeiten', 'Garzeiten',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Spezielle Techniken
  addSection(sections, items, 'zubereitung_techniken', 'Spezielle Techniken',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Fehler vermeiden
  addSection(sections, items, 'zubereitung_fehler', 'Fehler vermeiden',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // Vorbereitung
  addSection(sections, items, 'vorbereitung', 'Vorbereitung',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: PAIRINGS & KOMPOSITION
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🥘 Pairings & Komposition', 'pairings');
  
  // Pairings
  addObjectArraySection(sections, items, 'pairings_klassisch', 'Klassische Pairings',
    perspektive.farben?.[3], skipFelder);
  
  addSection(sections, items, 'pairings_modern', 'Moderne Pairings',
    perspektive.farben?.[3], skipFelder, compareList);
  
  addSection(sections, items, 'pairings_getraenke', 'Getränke',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // Wissenschaftliche Pairings
  addSection(sections, items, 'pairings_wissenschaft', 'Food Pairing Science',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // Synergien & Kontraste
  addSection(sections, items, 'synergien', 'Geschmacks-Synergien',
    perspektive.farben?.[3], skipFelder, compareList);
  
  addSection(sections, items, 'kontraste', 'Kontraste',
    perspektive.farben?.[3], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: LAGERUNG & KONSERVIERUNG
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '📦 Lagerung & Konservierung', 'storage');
  
  // Lagerung
  addSection(sections, items, 'lagerung_temperatur', 'Lagertemperatur',
    perspektive.farben?.[0], skipFelder, compareRange);
  
  addSection(sections, items, 'lagerung_luftfeuchtigkeit', 'Luftfeuchtigkeit',
    perspektive.farben?.[0], skipFelder, compareText);
  
  addSection(sections, items, 'lagerung_behaelter', 'Behälter',
    perspektive.farben?.[0], skipFelder, compareText);
  
  addSection(sections, items, 'lagerung_haltbarkeit_tage', 'Haltbarkeit (Tage)',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'Tage' }));
  
  addSection(sections, items, 'lagerung_indikatoren', 'Frische-Check',
    perspektive.farben?.[0], skipFelder, compareList);
  
  // Konservierung
  addObjectArraySection(sections, items, 'konservierung', 'Konservierung',
    perspektive.farben?.[0], skipFelder);
  
  addSection(sections, items, 'konservierung_methoden', 'Konservierungsmethoden',
    perspektive.farben?.[0], skipFelder, compareList);
  
  addSection(sections, items, 'konservierung_qualitaet', 'Qualitätserhalt',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  addSection(sections, items, 'konservierung_haltbarkeit', 'Haltbarkeit (Konserviert)',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: MAKRONÄHRSTOFFE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🍽️ Makronährstoffe', 'macros');
  
  // Nährwerte Übersicht
  addSection(sections, items, 'naehrwerte', 'Makronährstoffe',
    perspektive.farben?.[1], skipFelder, comparePie);
  
  // Energie
  addSection(sections, items, 'energie_kcal', 'Energie (kcal)',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'kcal' }));
  
  addSection(sections, items, 'energie_kj', 'Energie (kJ)',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'kJ' }));
  
  // Makros
  addSection(sections, items, 'protein', 'Protein',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'protein_qualitaet', 'Protein-Qualität',
    perspektive.farben?.[1], skipFelder, compareObject);
  
  addSection(sections, items, 'fett', 'Fett gesamt',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'fett_gesaettigt', 'Gesättigte FS',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'fett_einfach_ungesaettigt', 'Einfach ungesättigt',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'fett_mehrfach_ungesaettigt', 'Mehrfach ungesättigt',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'omega_3', 'Omega-3',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'omega_6', 'Omega-6',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'kohlenhydrate', 'Kohlenhydrate',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'zucker', 'Zucker',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'ballaststoffe', 'Ballaststoffe',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'ballaststoffe_loeslich', 'Lösliche Ballaststoffe',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'ballaststoffe_unloeslich', 'Unlösliche Ballaststoffe',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'wasser', 'Wassergehalt',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: MIKRONÄHRSTOFFE
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '💊 Vitamine & Mineralstoffe', 'micros');
  
  // Vitamine Übersicht
  addSection(sections, items, 'vitamine', 'Vitamine Übersicht',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  // Einzelne Vitamine
  addSection(sections, items, 'vitamin_a', 'Vitamin A',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'beta_carotin', 'Beta-Carotin',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_b1', 'B1 (Thiamin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_b2', 'B2 (Riboflavin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_b3', 'B3 (Niacin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_b5', 'B5 (Pantothensäure)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_b6', 'B6 (Pyridoxin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_b7', 'B7 (Biotin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_b9', 'B9 (Folsäure)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_b12', 'B12 (Cobalamin)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_c', 'Vitamin C',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_d', 'Vitamin D',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_d2', 'Vitamin D2 (Pilze!)',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'vitamin_e', 'Vitamin E',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'vitamin_k', 'Vitamin K',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  // Mineralstoffe Übersicht
  addSection(sections, items, 'mineralstoffe', 'Mineralstoffe Übersicht',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // Einzelne Mineralstoffe
  addSection(sections, items, 'kalium', 'Kalium',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'natrium', 'Natrium',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'calcium', 'Calcium',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'magnesium', 'Magnesium',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'phosphor', 'Phosphor',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'eisen', 'Eisen',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'zink', 'Zink',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'kupfer', 'Kupfer',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'mangan', 'Mangan',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'selen', 'Selen (wichtig!)',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'jod', 'Jod',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'chrom', 'Chrom',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  addSection(sections, items, 'molybdaen', 'Molybdän',
    perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'µg' }));
  
  // Aminosäuren
  addGroupHeader(sections, '🧬 Aminosäuren', 'amino');
  
  addSection(sections, items, 'aminosaeuren', 'Aminosäuren Profil',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  addSection(sections, items, 'aminosaeuren_essentiell', 'Essentielle AS',
    perspektive.farben?.[0], skipFelder, compareObject);
  
  // Einzelne Aminosäuren (nur die wichtigsten für Vergleich)
  addSection(sections, items, 'leucin', 'Leucin',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'lysin', 'Lysin',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'tryptophan', 'Tryptophan',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'glutaminsaeure', 'Glutaminsäure (Umami!)',
    perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: BIOAKTIVE & INDIZES
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '⚗️ Bioaktive Substanzen & Indizes', 'bioactive');
  
  // Bioaktive Highlights
  addNutrientHighlights(sections, items, 'bioaktive_substanzen', 'Bioaktive Stoffe',
    perspektive.farben?.[1], skipFelder);
  
  addNutrientHighlights(sections, items, 'naehrwert_highlights', 'Nährwert-Highlights',
    perspektive.farben?.[1], skipFelder);
  
  // Einzelne Bioaktive
  addSection(sections, items, 'beta_glucane', 'Beta-Glucane',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'ergothionein', 'Ergothionein (Antioxidans)',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'ergosterol', 'Ergosterol (Provitamin D)',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  addSection(sections, items, 'chitin', 'Chitin',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'g' }));
  
  addSection(sections, items, 'polyphenole', 'Polyphenole',
    perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: 'mg' }));
  
  // Indizes
  addSection(sections, items, 'glykaemischer_index', 'Glykämischer Index',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, max: 100 }));
  
  addSection(sections, items, 'glykaemische_last', 'Glykämische Last',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg }));
  
  addSection(sections, items, 'nutri_score', 'Nutri-Score',
    perspektive.farben?.[2], skipFelder, compareTag);
  
  addSection(sections, items, 'naehrstoffdichte', 'Nährstoffdichte',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg }));
  
  addSection(sections, items, 'saettigung_index', 'Sättigungs-Index',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg }));
  
  addSection(sections, items, 'bioverfuegbarkeit', 'Bioverfügbarkeit',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  addSection(sections, items, 'antinaehrstoffe', 'Antinährstoffe',
    perspektive.farben?.[2], skipFelder, compareObject);
  
  addSection(sections, items, 'wechselwirkungen', 'Wechselwirkungen',
    perspektive.farben?.[2], skipFelder, compareList);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: TRADITION & KULTUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Nur anzeigen wenn Daten vorhanden
  const hasTradition = items.some(i => 
    i.data.traditionen_namen?.length || i.data.traditionen_gerichte?.length ||
    i.data.traditionen || i.data.geschichte || i.data.nachhaltigkeit
  );
  
  if (hasTradition) {
    addGroupHeader(sections, '🌍 Tradition & Kultur', 'culture');
    
    addSection(sections, items, 'traditionen_namen', 'Regionale Namen',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'traditionen_gerichte', 'Klassische Gerichte',
      perspektive.farben?.[3], skipFelder, compareList);
    
    addSection(sections, items, 'traditionen', 'Kulturelle Verwendung',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'saisonalitaet', 'Saison',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    addSection(sections, items, 'verfuegbarkeit', 'Verfügbarkeit',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'nachhaltigkeit', 'Nachhaltigkeit',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    addSection(sections, items, 'geschichte', 'Geschichte',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  container.appendChild(sections);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fügt einen Gruppen-Header hinzu
 */
function addGroupHeader(sections, title, groupId) {
  const header = document.createElement('div');
  header.className = 'compare-group-header';
  header.dataset.group = groupId;
  header.innerHTML = `<span class="group-title">${title}</span>`;
  sections.appendChild(header);
}

/**
 * Standard-Section hinzufügen
 */
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
 * Spezielle Section für Arrays von {label, value} Objekten
 * Rendert als übersichtliche Balken-Gruppe
 */
function addObjectArraySection(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => {
    const wert = i.data[feldName];
    return Array.isArray(wert) && wert.length > 0 && typeof wert[0] === 'object';
  });
  
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-object-array';
  
  // Sammle alle Labels aus allen Items
  const allLabels = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(obj => {
      if (obj.label) allLabels.add(obj.label);
    });
  });
  
  // Tabellen-Layout
  const table = document.createElement('div');
  table.className = 'compare-matrix';
  
  // Header mit Item-Namen
  const headerRow = document.createElement('div');
  headerRow.className = 'matrix-header';
  headerRow.innerHTML = `<div class="matrix-cell matrix-label"></div>`;
  filteredItems.forEach(item => {
    const cell = document.createElement('div');
    cell.className = `matrix-cell matrix-item ${item.farbKlasse || ''}`;
    cell.style.color = item.textFarbe || '';
    cell.textContent = item.name;
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);
  
  // Zeilen für jeden Label
  const maxValue = 100; // Annahme: Werte sind 0-100
  
  allLabels.forEach(labelText => {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    
    // Label
    const labelCell = document.createElement('div');
    labelCell.className = 'matrix-cell matrix-label';
    labelCell.textContent = labelText;
    row.appendChild(labelCell);
    
    // Werte für jedes Item
    filteredItems.forEach(item => {
      const obj = (item.data[feldName] || []).find(o => o.label === labelText);
      const value = obj?.value || 0;
      const pct = Math.min(100, (value / maxValue) * 100);
      
      const cell = document.createElement('div');
      cell.className = 'matrix-cell matrix-value';
      
      const inner = document.createElement('div');
      inner.innerHTML = `
        <div class="matrix-bar">
          <div class="matrix-bar-fill" style="width:${pct}%;background:${item.farbe || 'rgba(100,100,100,0.5)'}"></div>
        </div>
        <span class="matrix-val">${value}</span>
      `;
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
 * Spezielle Section für Nährwert-Highlights mit Units
 */
function addNutrientHighlights(sections, items, feldName, label, farbe, skipFelder) {
  const filteredItems = items.filter(i => {
    const wert = i.data[feldName];
    return Array.isArray(wert) && wert.length > 0;
  });
  
  if (filteredItems.length === 0) return;
  
  const section = createSectionIfNew(feldName, label, farbe, skipFelder);
  if (!section) return;
  
  const content = document.createElement('div');
  content.className = 'compare-nutrients';
  
  // Sammle alle Labels
  const allLabels = new Set();
  filteredItems.forEach(item => {
    (item.data[feldName] || []).forEach(obj => {
      if (obj.label) allLabels.add(obj.label);
    });
  });
  
  // Kompakte Darstellung
  const table = document.createElement('div');
  table.className = 'nutrient-table';
  
  allLabels.forEach(labelText => {
    const row = document.createElement('div');
    row.className = 'nutrient-row';
    
    const labelCell = document.createElement('span');
    labelCell.className = 'nutrient-label';
    labelCell.textContent = labelText;
    row.appendChild(labelCell);
    
    const values = document.createElement('span');
    values.className = 'nutrient-values';
    
    filteredItems.forEach(item => {
      const obj = (item.data[feldName] || []).find(o => o.label === labelText);
      if (obj) {
        const chip = document.createElement('span');
        chip.className = `nutrient-chip ${item.farbKlasse || ''}`;
        chip.style.borderColor = item.farbe || '';
        chip.innerHTML = `<b>${obj.value}</b>${obj.unit || ''}`;
        values.appendChild(chip);
      } else {
        const chip = document.createElement('span');
        chip.className = 'nutrient-chip empty';
        chip.textContent = '–';
        values.appendChild(chip);
      }
    });
    
    row.appendChild(values);
    table.appendChild(row);
  });
  
  content.appendChild(table);
  section.addContent(content);
  sections.appendChild(section);
}

export default {
  id: 'kulinarisch',
  render: compareKulinarisch
};

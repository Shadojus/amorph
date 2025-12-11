/**
 * economy - Compare-Morph für Economy-Perspektive (v2.0)
 * 
 * Umfassend gruppiert in 12 Hauptbereiche:
 * 1. ECONOMIC PROFILE - Wirtschaftsprofil & Klassifikation
 * 2. ECONOMIC VALUE - Marktwert & Preise
 * 3. MARKET DATA - Marktgröße & Trends
 * 4. PRICE HISTORY - Preishistorie & Volatilität
 * 5. INTERNATIONAL TRADE - Handel & Exporte/Importe
 * 6. PRODUCTION - Produktion & Methoden
 * 7. CULTIVATION ECONOMICS - Anbau-Wirtschaftlichkeit
 * 8. VALUE CHAIN - Wertschöpfungskette
 * 9. INDUSTRY APPLICATIONS - Industrieanwendungen
 * 10. CERTIFICATIONS - Zertifizierungen & Standards
 * 11. EMPLOYMENT - Beschäftigung & Lebensunterhalt
 * 12. FORECASTS & INVESTMENT - Prognosen & Investitionen
 */

import { debug } from '../../../../observer/debug.js';
import { createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareProgress,
  compareText, compareObject, compareNumber, compareBoolean,
  compareRange, compareRating
} from '../../../../morphs/compare/primitives/index.js';

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set}
 */
export function compareeconomy(items, perspektive, config = {}) {
  debug.morphs('compareeconomy', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-economy';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 215, 0, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '💰'}</span>
    <span class="perspektive-name">${perspektive.name || 'Economy'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: ECONOMIC PROFILE
  // Wirtschaftsprofil & Klassifikation
  // ═══════════════════════════════════════════════════════════════════════════
  
  addGroupHeader(sections, '🏷️ Wirtschaftsprofil', 'profile');
  
  // Handelsname
  addSection(sections, items, 'eco_handelsname', 'Handelsname',
    perspektive.farben?.[0], skipFelder, compareText);
  
  // Wirtschaftssektor
  addSection(sections, items, 'eco_wirtschaftssektor', 'Wirtschaftssektor',
    perspektive.farben?.[0], skipFelder, compareTag);
  
  // Sekundäre Sektoren
  addSection(sections, items, 'eco_sekundaere_sektoren', 'Sekundäre Sektoren',
    perspektive.farben?.[1], skipFelder, compareList);
  
  // HS-Warencode
  addSection(sections, items, 'eco_warencode_hs', 'HS-Warencode',
    perspektive.farben?.[1], skipFelder, compareText);
  
  // Globale Bedeutung
  addSection(sections, items, 'eco_globale_bedeutung', 'Globale Bedeutung',
    perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  
  // Wirtschaftstrend
  addSection(sections, items, 'eco_wirtschaftstrend', 'Wirtschaftstrend',
    perspektive.farben?.[2], skipFelder, compareTag);
  
  // Regionale Bedeutung
  addSection(sections, items, 'eco_regionale_bedeutung', 'Regionale Bedeutung',
    perspektive.farben?.[3], skipFelder, compareObject);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: ECONOMIC VALUE
  // Marktwert & Preise
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasValue = items.some(i => 
    i.data.wert_globaler_marktwert_usd || i.data.wert_aktueller_preis_kg_usd || i.data.wert_kategorie
  );
  
  if (hasValue) {
    addGroupHeader(sections, '💎 Wirtschaftlicher Wert', 'value');
    
    // Globaler Marktwert
    addSection(sections, items, 'wert_globaler_marktwert_usd', 'Globaler Marktwert (USD)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Marktwert Jahr
    addSection(sections, items, 'wert_marktwert_jahr', 'Marktwert-Jahr',
      perspektive.farben?.[0], skipFelder, compareNumber);
    
    // Wertkategorie
    addSection(sections, items, 'wert_kategorie', 'Wertkategorie',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Aktueller Preis/kg
    addSection(sections, items, 'wert_aktueller_preis_kg_usd', 'Preis pro kg (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD/kg' }));
    
    // Preisspanne
    addSection(sections, items, 'wert_preis_min_usd', 'Preis Min (USD)',
      perspektive.farben?.[2], skipFelder, compareNumber);
    addSection(sections, items, 'wert_preis_max_usd', 'Preis Max (USD)',
      perspektive.farben?.[2], skipFelder, compareNumber);
    
    // Preisform
    addSection(sections, items, 'wert_preis_form', 'Produktform (Preis)',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // CAGR
    addSection(sections, items, 'wert_cagr_prozent', 'CAGR (%)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Umsatzpotential
    addSection(sections, items, 'wert_umsatzpotential_score', 'Umsatzpotential',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: MARKET DATA
  // Marktgröße & Trends
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMarket = items.some(i => 
    i.data.markt_groesse_usd || i.data.markt_ausblick || i.data.markt_nachfrage_level
  );
  
  if (hasMarket) {
    addGroupHeader(sections, '📊 Marktdaten', 'market');
    
    // Marktname
    addSection(sections, items, 'markt_name', 'Marktname',
      perspektive.farben?.[0], skipFelder, compareText);
    
    // Markttyp
    addSection(sections, items, 'markt_typ', 'Markttyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Marktsegment
    addSection(sections, items, 'markt_segment', 'Marktsegment',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Marktgröße
    addSection(sections, items, 'markt_groesse_usd', 'Marktgröße (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Projizierte Größe
    addSection(sections, items, 'markt_projizierte_groesse_usd', 'Projizierte Größe (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // CAGR
    addSection(sections, items, 'markt_projizierter_cagr', 'Projiziertes CAGR (%)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Wachstumsklassifikation
    addSection(sections, items, 'markt_wachstum_klassifikation', 'Wachstum',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Marktausblick
    addSection(sections, items, 'markt_ausblick', 'Marktausblick',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Nachfrage-Level
    addSection(sections, items, 'markt_nachfrage_level', 'Nachfrage',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Angebot-Level
    addSection(sections, items, 'markt_angebot_level', 'Angebot',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Preisvolatilität
    addSection(sections, items, 'markt_preis_volatilitaet', 'Preisvolatilität',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Marktkonzentration
    addSection(sections, items, 'markt_konzentration', 'Marktkonzentration',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Hauptakteure
    addSection(sections, items, 'markt_hauptakteure', 'Hauptakteure',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    // Größte Märkte
    addSection(sections, items, 'markt_groesste_maerkte', 'Größte Märkte',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: PRICE HISTORY
  // Preishistorie & Volatilität
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPriceHistory = items.some(i => 
    i.data.preis_historie || i.data.preis_trend_5_jahre
  );
  
  if (hasPriceHistory) {
    addGroupHeader(sections, '📈 Preishistorie', 'price-history');
    
    // Preishistorie
    addSection(sections, items, 'preis_historie', 'Preishistorie',
      perspektive.farben?.[0], skipFelder, compareObject);
    
    // 5-Jahres-Trend
    addSection(sections, items, 'preis_trend_5_jahre', '5-Jahres-Trend',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Volatilitätsindex
    addSection(sections, items, 'preis_volatilitaet_index', 'Volatilitätsindex',
      perspektive.farben?.[2], skipFelder, compareNumber);
    
    // Aktueller Preis
    addSection(sections, items, 'preis_usd', 'Aktueller Preis (USD)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Preistyp
    addSection(sections, items, 'preis_typ', 'Preistyp',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: INTERNATIONAL TRADE
  // Handel & Exporte/Importe
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTrade = items.some(i => 
    i.data.handel_status || i.data.handel_jahreswert_usd || i.data.handel_top_exporteure
  );
  
  if (hasTrade) {
    addGroupHeader(sections, '🌐 Internationaler Handel', 'trade');
    
    // Handelsstatus
    addSection(sections, items, 'handel_status', 'Handelsstatus',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Handelsbedeutung
    addSection(sections, items, 'handel_bedeutung', 'Handelsbedeutung',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Jahresvolumen
    addSection(sections, items, 'handel_jahresvolumen_mt', 'Jahresvolumen (MT)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' MT' }));
    
    // Jahreswert
    addSection(sections, items, 'handel_jahreswert_usd', 'Jahreswert (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Top Exporteure
    addSection(sections, items, 'handel_top_exporteure', 'Top Exporteure',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Top Importeure
    addSection(sections, items, 'handel_top_importeure', 'Top Importeure',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // CITES-Listing
    addSection(sections, items, 'handel_cites_listing', 'CITES-Listing',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Handelsbeschränkungen
    addSection(sections, items, 'handel_beschraenkungen', 'Handelsbeschränkungen',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    // Durchschnittszoll
    addSection(sections, items, 'handel_durchschnittszoll', 'Durchschnittszoll (%)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Handelsabkommen
    addSection(sections, items, 'handel_handelsabkommen', 'Handelsabkommen',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: PRODUCTION
  // Produktion & Methoden
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasProduction = items.some(i => 
    i.data.produktion_typ || i.data.produktion_global_mt || i.data.produktion_nach_land
  );
  
  if (hasProduction) {
    addGroupHeader(sections, '🏭 Produktion', 'production');
    
    // Produktionstyp
    addSection(sections, items, 'produktion_typ', 'Produktionstyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Produktionsskala
    addSection(sections, items, 'produktion_skala', 'Produktionsskala',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Globale Produktion
    addSection(sections, items, 'produktion_global_mt', 'Globale Produktion (MT)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' MT' }));
    
    // Wachstumsrate
    addSection(sections, items, 'produktion_wachstumsrate', 'Wachstumsrate (%)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // 5-Jahres-Trend
    addSection(sections, items, 'produktion_5_jahres_trend', '5-Jahres-Trend',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Produktion nach Land
    addSection(sections, items, 'produktion_nach_land', 'Produktion nach Land',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Top Regionen
    addSection(sections, items, 'produktion_top_regionen', 'Top Regionen',
      perspektive.farben?.[2], skipFelder, compareList);
    
    // Technologie-Level
    addSection(sections, items, 'produktion_technologie_level', 'Technologie-Level',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Durchschnittsertrag
    addSection(sections, items, 'produktion_durchschnittsertrag', 'Durchschnittsertrag',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    // Produktionskosten/kg
    addSection(sections, items, 'produktion_kosten_kg_usd', 'Kosten pro kg (USD)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD/kg' }));
    
    // Effizienz
    addSection(sections, items, 'produktion_effizienz_bewertung', 'Effizienz',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: CULTIVATION ECONOMICS
  // Anbau-Wirtschaftlichkeit
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCultEcon = items.some(i => 
    i.data.anbau_oeko_rentabilitaet || i.data.anbau_oeko_roi_prozent || i.data.anbau_oeko_bruttomarge_prozent
  );
  
  if (hasCultEcon) {
    addGroupHeader(sections, '🌱 Anbau-Wirtschaftlichkeit', 'cultivation-economics');
    
    // Rentabilität
    addSection(sections, items, 'anbau_oeko_rentabilitaet', 'Rentabilität',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Kommerzieller Status
    addSection(sections, items, 'anbau_oeko_kommerzieller_status', 'Kommerzieller Status',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Setup-Kosten/ha
    addSection(sections, items, 'anbau_oeko_setup_kosten_ha_usd', 'Setup-Kosten/ha (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD/ha' }));
    
    // Betriebskosten/kg
    addSection(sections, items, 'anbau_oeko_betriebskosten_kg_usd', 'Betriebskosten/kg (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD/kg' }));
    
    // Bruttomarge
    addSection(sections, items, 'anbau_oeko_bruttomarge_prozent', 'Bruttomarge (%)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 100 }));
    
    // Nettomarge
    addSection(sections, items, 'anbau_oeko_nettomarge_prozent', 'Nettomarge (%)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 100 }));
    
    // ROI
    addSection(sections, items, 'anbau_oeko_roi_prozent', 'ROI (%)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Amortisation
    addSection(sections, items, 'anbau_oeko_amortisation_monate', 'Amortisation (Monate)',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    // Produktionsrisiko
    addSection(sections, items, 'anbau_oeko_produktionsrisiko', 'Produktionsrisiko',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Marktrisiko
    addSection(sections, items, 'anbau_oeko_marktrisiko', 'Marktrisiko',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Skalierbarkeit
    addSection(sections, items, 'anbau_oeko_skalierbarkeit_bewertung', 'Skalierbarkeit',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: VALUE CHAIN
  // Wertschöpfungskette
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasValueChain = items.some(i => 
    i.data.kette_komplexitaet || i.data.kette_stufen || i.data.kette_mehrwertprodukte
  );
  
  if (hasValueChain) {
    addGroupHeader(sections, '🔗 Wertschöpfungskette', 'value-chain');
    
    // Komplexität
    addSection(sections, items, 'kette_komplexitaet', 'Komplexität',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Vertikale Integration
    addSection(sections, items, 'kette_vertikale_integration', 'Vertikale Integration',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Stufen
    addSection(sections, items, 'kette_stufen', 'Wertschöpfungsstufen',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Verarbeitungsstufen
    addSection(sections, items, 'kette_verarbeitungsstufen', 'Verarbeitungsstufen',
      perspektive.farben?.[1], skipFelder, compareObject);
    
    // Kühlkette erforderlich
    addSection(sections, items, 'kette_kuehlkette_erforderlich', 'Kühlkette erforderlich',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    
    // Haltbarkeit frisch
    addSection(sections, items, 'kette_haltbarkeit_frisch_tage', 'Haltbarkeit frisch (Tage)',
      perspektive.farben?.[2], skipFelder, compareNumber);
    
    // Mehrwertprodukte
    addSection(sections, items, 'kette_mehrwertprodukte', 'Mehrwertprodukte',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Nebenprodukte
    addSection(sections, items, 'kette_nebenprodukte', 'Nebenprodukte',
      perspektive.farben?.[3], skipFelder, compareObject);
    
    // Kreislaufwirtschaft-Potential
    addSection(sections, items, 'kette_kreislaufwirtschaft_potential', 'Kreislaufwirtschaft',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Produzenten-Anteil
    addSection(sections, items, 'kette_produzenten_anteil_prozent', 'Produzenten-Anteil (%)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 100 }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: INDUSTRY APPLICATIONS
  // Industrieanwendungen
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasIndustry = items.some(i => 
    i.data.industrie_kategorie || i.data.industrie_anwendungen_liste || i.data.industrie_marktgroesse_usd
  );
  
  if (hasIndustry) {
    addGroupHeader(sections, '🏢 Industrieanwendungen', 'industry');
    
    // Industrie-Kategorie
    addSection(sections, items, 'industrie_kategorie', 'Industrie-Kategorie',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Anwendungstyp
    addSection(sections, items, 'industrie_anwendungstyp', 'Anwendungstyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Marktbedeutung
    addSection(sections, items, 'industrie_marktbedeutung', 'Marktbedeutung',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Marktgröße
    addSection(sections, items, 'industrie_marktgroesse_usd', 'Marktgröße (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Wachstumsrate
    addSection(sections, items, 'industrie_wachstumsrate', 'Wachstumsrate (%)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Markttrend
    addSection(sections, items, 'industrie_markttrend', 'Markttrend',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Hauptunternehmen
    addSection(sections, items, 'industrie_hauptunternehmen', 'Hauptunternehmen',
      perspektive.farben?.[2], skipFelder, compareObject);
    
    // Innovationsaktivität
    addSection(sections, items, 'industrie_innovationsaktivitaet', 'Innovationsaktivität',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Patente
    addSection(sections, items, 'industrie_patente_angemeldet', 'Patente',
      perspektive.farben?.[3], skipFelder, compareNumber);
    
    // Anwendungsliste
    addSection(sections, items, 'industrie_anwendungen_liste', 'Anwendungen',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: CERTIFICATIONS
  // Zertifizierungen & Standards
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasCertifications = items.some(i => 
    i.data.zert_bio_status || i.data.zert_haccp_status || i.data.zert_geschuetzte_herkunft
  );
  
  if (hasCertifications) {
    addGroupHeader(sections, '📜 Zertifizierungen', 'certifications');
    
    // Bio-Status
    addSection(sections, items, 'zert_bio_status', 'Bio-Status',
      perspektive.farben?.[0], skipFelder, compareTag);
    
    // Bio-Marktaufschlag
    addSection(sections, items, 'zert_bio_marktaufschlag_prozent', 'Bio-Aufschlag (%)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Nachhaltigkeit
    addSection(sections, items, 'zert_nachhaltigkeit_status', 'Nachhaltigkeit',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // HACCP
    addSection(sections, items, 'zert_haccp_status', 'HACCP-Status',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // ISO 22000
    addSection(sections, items, 'zert_iso_22000_status', 'ISO 22000',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Geschützte Herkunft
    addSection(sections, items, 'zert_geschuetzte_herkunft', 'Geschützte Herkunft',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    
    // GI-Name
    addSection(sections, items, 'zert_gi_name', 'Herkunftsbezeichnung',
      perspektive.farben?.[3], skipFelder, compareText);
    
    // GI-Typ
    addSection(sections, items, 'zert_gi_typ', 'GI-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Zertifizierungskosten
    addSection(sections, items, 'zert_kosten_jaehrlich', 'Jährliche Kosten',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 11: EMPLOYMENT
  // Beschäftigung & Lebensunterhalt
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEmployment = items.some(i => 
    i.data.beschaeftigung_global_gesamt || i.data.kleinbauern_anzahl_global || i.data.fairtrade_status
  );
  
  if (hasEmployment) {
    addGroupHeader(sections, '👥 Beschäftigung', 'employment');
    
    // Globale Beschäftigung
    addSection(sections, items, 'beschaeftigung_global_gesamt', 'Globale Beschäftigung',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' Personen' }));
    
    // Wachstumsrate
    addSection(sections, items, 'beschaeftigung_wachstumsrate', 'Wachstumsrate (%)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Frauenanteil
    addSection(sections, items, 'beschaeftigung_frauenanteil_prozent', 'Frauenanteil (%)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 100 }));
    
    // Durchschnittslohn
    addSection(sections, items, 'beschaeftigung_durchschnittslohn_usd', 'Durchschnittslohn (USD)',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Kleinbauern
    addSection(sections, items, 'kleinbauern_anzahl_global', 'Kleinbauern weltweit',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '' }));
    
    // Kleinbauern-Einkommen
    addSection(sections, items, 'kleinbauern_durchschnittseinkommen_usd', 'Kleinbauern-Einkommen (USD)',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Fairtrade-Status
    addSection(sections, items, 'fairtrade_status', 'Fairtrade-Status',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Fairtrade-Prämie
    addSection(sections, items, 'fairtrade_praemie_usd', 'Fairtrade-Prämie (USD)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Gemeinschaftsvorteile
    addSection(sections, items, 'gemeinschaft_vorteile', 'Gemeinschaftsvorteile',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 12: FORECASTS & INVESTMENT
  // Prognosen & Investitionen
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasForecast = items.some(i => 
    i.data.prognose_marktgroesse_2030 || i.data.investition_attraktivitaet || i.data.prognose_wachstumstreiber
  );
  
  if (hasForecast) {
    addGroupHeader(sections, '🔮 Prognosen & Investitionen', 'forecast');
    
    // Marktgröße 2030
    addSection(sections, items, 'prognose_marktgroesse_2030', 'Marktgröße 2030 (USD)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // CAGR 2025-2030
    addSection(sections, items, 'prognose_cagr_2025_2030', 'CAGR 2025-2030 (%)',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: '%' }));
    
    // Wachstumstreiber
    addSection(sections, items, 'prognose_wachstumstreiber', 'Wachstumstreiber',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Risiken
    addSection(sections, items, 'prognose_risiken', 'Risiken',
      perspektive.farben?.[1], skipFelder, compareList);
    
    // Investitionsattraktivität
    addSection(sections, items, 'investition_attraktivitaet', 'Investitionsattraktivität',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Investitions-Score
    addSection(sections, items, 'investition_attraktivitaet_score', 'Investitions-Score',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareRating(mapped, { ...cfg, max: 10 }));
    
    // Reifegrad
    addSection(sections, items, 'investition_reifegrad', 'Reifegrad',
      perspektive.farben?.[3], skipFelder, compareTag);
    
    // Gesamtinvestition
    addSection(sections, items, 'investition_gesamt_usd', 'Gesamtinvestition (USD)',
      perspektive.farben?.[3], skipFelder, (mapped, cfg) => compareBar(mapped, { ...cfg, einheit: ' USD' }));
    
    // Hauptinvestoren
    addSection(sections, items, 'investition_hauptinvestoren', 'Hauptinvestoren',
      perspektive.farben?.[3], skipFelder, compareObject);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATA QUALITY (Optional - nur wenn Daten vorhanden)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasDataQuality = items.some(i => 
    i.data.dq_gesamtscore !== undefined
  );
  
  if (hasDataQuality) {
    addGroupHeader(sections, '📊 Datenqualität', 'data-quality');
    
    addSection(sections, items, 'dq_gesamtscore', 'Gesamtscore',
      perspektive.farben?.[0], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'dq_vollstaendigkeit', 'Vollständigkeit',
      perspektive.farben?.[1], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 1 }));
    
    addSection(sections, items, 'dq_aktualitaet', 'Aktualität',
      perspektive.farben?.[2], skipFelder, (mapped, cfg) => compareProgress(mapped, { ...cfg, max: 1 }));
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

export default compareeconomy;

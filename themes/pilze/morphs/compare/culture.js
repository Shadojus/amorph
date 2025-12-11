/**
 * culture - Compare-Morph für cultureelle Perspektive (v2.0)
 * 
 * FLACHE DATENSTRUKTUR mit ~250 Feldern
 * Übersichtlich gruppiert in 12 Hauptbereiche:
 * 
 * 1. TRADITIONELLE NAMEN
 * 2. ETHNOMYKOLOGIE (Bedeutung, Symbolik)
 * 3. VERWENDUNGEN (cultureelle)
 * 4. WISSENSSYSTEM
 * 5. SPIRITUALITÄT
 * 6. RITUALE
 * 7. TABUS
 * 8. MYTHOLOGIE
 * 9. GESCHICHTE (Zeitperioden, Artefakte, Texte)
 * 10. KUNST & LITERATUR & FILM & MUSIK
 * 11. POPculture & BEWEGUNGEN
 * 12. FESTIVALS & TOURISMUS
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
export function compareculture(items, perspektive, config = {}) {
  debug.morphs('compareculture', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-culture';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(180, 140, 100, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🎭'}</span>
    <span class="perspektive-name">${perspektive.name || 'culture'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  // Sections Container
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 1: TRADITIONELLE NAMEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasNames = items.some(i => 
    i.data.indigene_namen || i.data.name_sprache
  );
  
  if (hasNames) {
    addGroupHeader(sections, '📛 Traditionelle Namen', 'namen');
    
    addSection(sections, items, 'indigene_namen', 'Indigene Namen',
      perspektive.farben?.[0], skipFelder, compareList);
    addSection(sections, items, 'name_sprache', 'Sprache',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'name_culture', 'culture',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'name_region', 'Region',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'name_etymologie', 'Etymologie',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'name_kategorie', 'Kategorie',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'name_transliteration', 'Transliteration',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'name_aussprache_ipa', 'Aussprache (IPA)',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'name_verwendungskontext', 'Verwendungskontext',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'name_gefaehrdet', 'Gefährdet',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'name_quelle', 'Quelle',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'name_verifikation', 'Verifikation',
      perspektive.farben?.[2], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 2: ETHNOMYKOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasEthno = items.some(i => 
    i.data.wissensdomaene || i.data.cultureelle_bedeutung_level
  );
  
  if (hasEthno) {
    addGroupHeader(sections, '🌿 Ethnomykologie', 'ethno');
    
    addSection(sections, items, 'wissensdomaene', 'Wissensdomäne',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'cultureelle_bedeutung_level', 'Bedeutungs-Level',
      perspektive.farben?.[0], skipFelder, compareBar);
    addSection(sections, items, 'cultureelle_bedeutung_zusammenfassung', 'Bedeutung (Zusammenfassung)',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'cultureelle_bedeutung_details', 'Bedeutung (Details)',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'symbolische_bedeutungen', 'Symbolische Bedeutungen',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'assoziierte_konzepte', 'Assoziierte Konzepte',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 3: VERWENDUNGEN (cultureELL)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasVerwendungen = items.some(i => 
    i.data.verwendung_typ || i.data.verwendung_beschreibung
  );
  
  if (hasVerwendungen) {
    addGroupHeader(sections, '🎯 cultureelle Verwendungen', 'verwendungen');
    
    addSection(sections, items, 'verwendung_typ', 'Verwendungstyp',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'verwendung_beschreibung', 'Beschreibung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'verwendung_zubereitung', 'Zubereitung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'verwendung_zeitpunkt', 'Zeitpunkt',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'verwendung_praktizierende', 'Praktizierende',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'verwendung_einschraenkungen', 'Einschränkungen',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'verwendung_aktiv', 'Aktiv',
      perspektive.farben?.[2], skipFelder, compareBoolean);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 4: WISSENSSYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasWissen = items.some(i => 
    i.data.klassifikationssystem || i.data.oekologisches_wissen
  );
  
  if (hasWissen) {
    addGroupHeader(sections, '📚 Wissenssystem', 'wissen');
    
    addSection(sections, items, 'klassifikationssystem', 'Klassifikationssystem',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'oekologisches_wissen', 'Ökologisches Wissen',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'phaenologisches_wissen', 'Phänologisches Wissen',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'assoziierte_arten', 'Assoziierte Arten',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'wissenstransmission', 'Wissenstransmission',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'wissenshalter', 'Wissenshalter',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'wissen_gefaehrdung', 'Gefährdung',
      perspektive.farben?.[2], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 5: SPIRITUALITÄT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasSpirit = items.some(i => 
    i.data.ist_heilig !== undefined || i.data.ist_entheogen !== undefined || 
    i.data.gottheits_assoziationen
  );
  
  if (hasSpirit) {
    addGroupHeader(sections, '✨ Spiritualität', 'spirit');
    
    addSection(sections, items, 'ist_heilig', 'Ist Heilig',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'ist_entheogen', 'Ist Entheogen',
      perspektive.farben?.[0], skipFelder, compareBoolean);
    addSection(sections, items, 'gottheits_assoziationen', 'Gottheits-Assoziationen',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'geister_assoziationen', 'Geister-Assoziationen',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'kosmologische_rolle', 'Kosmologische Rolle',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'jenseits_assoziationen', 'Jenseits-Assoziationen',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'schoepfungsmythen', 'Schöpfungsmythen',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 6: RITUALE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasRituale = items.some(i => 
    i.data.ritual_name || i.data.ritual_typ
  );
  
  if (hasRituale) {
    addGroupHeader(sections, '🔮 Rituale', 'rituale');
    
    addSection(sections, items, 'ritual_name', 'Ritual-Name',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'ritual_typ', 'Ritual-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'ritual_beschreibung', 'Beschreibung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'ritual_zeitpunkt', 'Zeitpunkt',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'ritual_teilnehmer', 'Teilnehmer',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'ritual_ort', 'Ort',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'ritual_vorbereitung', 'Vorbereitung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'pilz_rolle', 'Pilz-Rolle',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'ritual_geheim', 'Geheim',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ritual_aktiv', 'Aktiv',
      perspektive.farben?.[2], skipFelder, compareBoolean);
    addSection(sections, items, 'ritual_rechtsstatus', 'Rechtsstatus',
      perspektive.farben?.[2], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 7: TABUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTabus = items.some(i => 
    i.data.tabu_typ || i.data.tabu_beschreibung
  );
  
  if (hasTabus) {
    addGroupHeader(sections, '🚫 Tabus', 'tabus');
    
    addSection(sections, items, 'tabu_typ', 'Tabu-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'tabu_beschreibung', 'Beschreibung',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'tabu_betroffene', 'Betroffene',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'tabu_zeitpunkt', 'Zeitpunkt',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'tabu_konsequenzen', 'Konsequenzen',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'tabu_ausnahmen', 'Ausnahmen',
      perspektive.farben?.[2], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 8: MYTHOLOGIE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMythologie = items.some(i => 
    i.data.mythos_titel || i.data.mythos_typ
  );
  
  if (hasMythologie) {
    addGroupHeader(sections, '📖 Mythologie', 'mythologie');
    
    addSection(sections, items, 'mythos_titel', 'Mythos-Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'mythos_typ', 'Mythos-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'mythos_zusammenfassung', 'Zusammenfassung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'mythos_volltext', 'Volltext',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'mythos_charaktere', 'Charaktere',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'mythos_moral', 'Moral',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'mythos_verbreitung', 'Verbreitung',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'mythos_varianten', 'Varianten',
      perspektive.farben?.[2], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 9: GESCHICHTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasGeschichte = items.some(i => 
    i.data.historischer_referenz_typ || i.data.zeitperiode_name || i.data.artefakt_typ
  );
  
  if (hasGeschichte) {
    addGroupHeader(sections, '📜 Geschichte', 'geschichte');
    
    // Zeitperiode
    addSection(sections, items, 'historischer_referenz_typ', 'Referenz-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'zeitperiode_name', 'Zeitperiode',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'zeitperiode_start', 'Beginn',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'zeitperiode_ende', 'Ende',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'zeitperiode_praezision', 'Präzision',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'datierungsmethode', 'Datierungsmethode',
      perspektive.farben?.[1], skipFelder, compareTag);
    
    // Artefakte
    addSection(sections, items, 'artefakt_typ', 'Artefakt-Typ',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'artefakt_material', 'Material',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'artefakt_beschreibung', 'Artefakt-Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'artefakt_fundort', 'Fundort',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'artefakt_aktueller_ort', 'Aktueller Ort',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'artefakt_erhaltung', 'Erhaltung',
      perspektive.farben?.[2], skipFelder, compareTag);
    
    // Texte
    addSection(sections, items, 'text_typ', 'Text-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'text_titel', 'Text-Titel',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'text_autor', 'Text-Autor',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'text_originalsprache', 'Originalsprache',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'text_auszug', 'Textauszug',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 10: KUNST
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasKunst = items.some(i => 
    i.data.kunstform || i.data.kunst_titel || i.data.kuenstler_name
  );
  
  if (hasKunst) {
    addGroupHeader(sections, '🎨 Kunst', 'kunst');
    
    addSection(sections, items, 'kunstform', 'Kunstform',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'kunst_titel', 'Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'kuenstler_name', 'Künstler',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'kuenstler_nationalitaet', 'Nationalität',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'kuenstler_bewegung', 'Kunstbewegung',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'entstehungsjahr', 'Entstehungsjahr',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'kunstwerk_medium', 'Medium',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'kunstwerk_aktueller_ort', 'Aktueller Ort',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'kunstwerk_beschreibung', 'Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'pilz_darstellung_genauigkeit', 'Darstellungs-Genauigkeit',
      perspektive.farben?.[3], skipFelder, compareRating);
    addSection(sections, items, 'pilz_darstellung_prominenz', 'Darstellungs-Prominenz',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'pilz_darstellung_symbolik', 'Symbolik',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 11: LITERATUR
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasLiteratur = items.some(i => 
    i.data.literarische_form || i.data.lit_titel
  );
  
  if (hasLiteratur) {
    addGroupHeader(sections, '📚 Literatur', 'literatur');
    
    addSection(sections, items, 'literarische_form', 'Form',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'lit_titel', 'Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'lit_autor_name', 'Autor',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'lit_autor_nationalitaet', 'Nationalität',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'lit_erscheinungsjahr', 'Erscheinungsjahr',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'lit_verlag', 'Verlag',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'lit_originalsprache', 'Originalsprache',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'lit_beschreibung', 'Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'pilz_rolle_prominenz', 'Pilz-Prominenz',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'pilz_rolle_narrativ', 'Narrativ-Rolle',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'pilz_rolle_symbolik', 'Pilz-Symbolik',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'lit_themen', 'Themen',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'lit_auszeichnungen', 'Auszeichnungen',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 12: FILM & TV
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFilm = items.some(i => 
    i.data.medien_typ || i.data.film_titel
  );
  
  if (hasFilm) {
    addGroupHeader(sections, '🎬 Film & TV', 'film');
    
    addSection(sections, items, 'medien_typ', 'Medien-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'film_titel', 'Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'film_originaltitel', 'Originaltitel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'film_jahr', 'Jahr',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'film_regisseur', 'Regisseur',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'film_produktionsland', 'Produktionsland',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'film_laufzeit', 'Laufzeit',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'film_genre', 'Genre',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'film_beschreibung', 'Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'film_pilz_prominenz', 'Pilz-Prominenz',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'film_pilz_narrativ', 'Pilz-Narrativ',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'film_pilz_genauigkeit', 'Pilz-Genauigkeit',
      perspektive.farben?.[3], skipFelder, compareRating);
    addSection(sections, items, 'film_auszeichnungen', 'Auszeichnungen',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 13: MUSIK
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasMusik = items.some(i => 
    i.data.musik_typ || i.data.musik_titel
  );
  
  if (hasMusik) {
    addGroupHeader(sections, '🎵 Musik', 'musik');
    
    addSection(sections, items, 'musik_typ', 'Musik-Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'musik_titel', 'Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'musik_kuenstler_name', 'Künstler',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'musik_kuenstler_typ', 'Künstler-Typ',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'musik_kuenstler_herkunft', 'Herkunft',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'musik_album_titel', 'Album',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'musik_album_jahr', 'Album-Jahr',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'musik_genre', 'Genre',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'musik_beschreibung', 'Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'musik_pilz_referenz_typ', 'Pilz-Referenz-Typ',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'musik_pilz_referenz_beschreibung', 'Pilz-Referenz',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'musik_cultureeller_kontext', 'cultureeller Kontext',
      perspektive.farben?.[3], skipFelder, compareText);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 14: POPculture
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasPopculture = items.some(i => 
    i.data.popculture_medium || i.data.popculture_titel
  );
  
  if (hasPopculture) {
    addGroupHeader(sections, '🎮 Popculture', 'popculture');
    
    addSection(sections, items, 'popculture_medium', 'Medium',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'popculture_titel', 'Titel',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'popculture_schoepfer', 'Schöpfer',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'popculture_jahr', 'Jahr',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'popculture_plattform', 'Plattform',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'popculture_beschreibung', 'Beschreibung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'popculture_pilz_darstellung_typ', 'Darstellungs-Typ',
      perspektive.farben?.[2], skipFelder, compareTag);
    addSection(sections, items, 'popculture_pilz_darstellung_genauigkeit', 'Darstellungs-Genauigkeit',
      perspektive.farben?.[2], skipFelder, compareRating);
    addSection(sections, items, 'popculture_pilz_cultureeller_einfluss', 'cultureeller Einfluss',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'popculture_reichweite', 'Reichweite',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'popculture_tags', 'Tags',
      perspektive.farben?.[3], skipFelder, compareList);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 15: BEWEGUNGEN
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasBewegungen = items.some(i => 
    i.data.bewegung_name || i.data.bewegung_typ
  );
  
  if (hasBewegungen) {
    addGroupHeader(sections, '🌊 Bewegungen', 'bewegungen');
    
    addSection(sections, items, 'bewegung_name', 'Name',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'bewegung_typ', 'Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'bewegung_gruendungsjahr', 'Gründungsjahr',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'bewegung_geografische_reichweite', 'Reichweite',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'bewegung_regionen', 'Regionen',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'bewegung_beschreibung', 'Beschreibung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'bewegung_schluesselfiguren', 'Schlüsselfiguren',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'bewegung_schluesselevents', 'Schlüssel-Events',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'bewegung_verwandte_pilze', 'Verwandte Pilze',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'bewegung_einfluss', 'Einfluss',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'bewegung_aktueller_status', 'Status',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 16: FESTIVALS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasFestivals = items.some(i => 
    i.data.festival_name || i.data.festival_typ
  );
  
  if (hasFestivals) {
    addGroupHeader(sections, '🎪 Festivals', 'festivals');
    
    addSection(sections, items, 'festival_name', 'Name',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'festival_typ', 'Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'festival_ort_stadt', 'Stadt',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'festival_ort_land', 'Land',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'festival_haeufigkeit', 'Häufigkeit',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'festival_typischer_monat', 'Monat',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'festival_dauer_tage', 'Dauer (Tage)',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'festival_gruendungsjahr', 'Gründungsjahr',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'festival_beschreibung', 'Beschreibung',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'festival_aktivitaeten', 'Aktivitäten',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'festival_featured_pilze', 'Featured Pilze',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'festival_teilnehmer_groesse', 'Teilnehmer',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'festival_aktueller_status', 'Status',
      perspektive.farben?.[3], skipFelder, compareTag);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPPE 17: TOURISMUS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const hasTourismus = items.some(i => 
    i.data.tourismus_name || i.data.tourismus_typ
  );
  
  if (hasTourismus) {
    addGroupHeader(sections, '🧭 Tourismus', 'tourismus');
    
    addSection(sections, items, 'tourismus_name', 'Name',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'tourismus_typ', 'Typ',
      perspektive.farben?.[0], skipFelder, compareTag);
    addSection(sections, items, 'tourismus_ort_name', 'Ort',
      perspektive.farben?.[0], skipFelder, compareText);
    addSection(sections, items, 'tourismus_ort_land', 'Land',
      perspektive.farben?.[1], skipFelder, compareTag);
    addSection(sections, items, 'tourismus_beschreibung', 'Beschreibung',
      perspektive.farben?.[1], skipFelder, compareText);
    addSection(sections, items, 'tourismus_featured_pilze', 'Featured Pilze',
      perspektive.farben?.[1], skipFelder, compareList);
    addSection(sections, items, 'tourismus_beste_saison', 'Beste Saison',
      perspektive.farben?.[2], skipFelder, compareList);
    addSection(sections, items, 'tourismus_dauer_typische_stunden', 'Typische Dauer (h)',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'tourismus_anbieter', 'Anbieter',
      perspektive.farben?.[2], skipFelder, compareText);
    addSection(sections, items, 'tourismus_preisgestaltung', 'Preis',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'tourismus_sprachen', 'Sprachen',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'tourismus_schwierigkeit', 'Schwierigkeit',
      perspektive.farben?.[3], skipFelder, compareTag);
    addSection(sections, items, 'tourismus_barrierefreiheit', 'Barrierefreiheit',
      perspektive.farben?.[3], skipFelder, compareText);
    addSection(sections, items, 'tourismus_indigene_partnerschaft', 'Indigene Partnerschaft',
      perspektive.farben?.[3], skipFelder, compareBoolean);
    addSection(sections, items, 'tourismus_nachhaltigkeitspraktiken', 'Nachhaltigkeit',
      perspektive.farben?.[3], skipFelder, compareList);
    addSection(sections, items, 'tourismus_aktueller_status', 'Status',
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

export default compareculture;

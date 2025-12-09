/**
 * SICHERHEIT - Compare-Morph für Sicherheits-Perspektive
 * 
 * Zeigt: Essbarkeit, Toxizität, Toxine, Symptomverlauf, Verwechslungsrisiko, Erste Hilfe
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareTag, compareList, compareBar, compareText, compareProgress, compareRating, compareObject
} from '../../../../morphs/compare/primitives/index.js';

// ============== HELPER FUNCTIONS ==============

/**
 * Rendert Toxine als Warnkarten mit Details
 */
function renderToxineComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.toxine?.length > 0 || i.data.giftstoffe_details);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'toxine-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'toxine-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'toxine-card-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    // Toxin-Liste
    const toxine = item.data.toxine || [];
    if (toxine.length > 0) {
      const list = document.createElement('div');
      list.className = 'toxine-list';
      toxine.forEach(toxin => {
        const toxinEl = document.createElement('span');
        toxinEl.className = 'toxin-badge danger';
        toxinEl.textContent = typeof toxin === 'string' ? toxin : toxin.name;
        list.appendChild(toxinEl);
      });
      card.appendChild(list);
    }
    
    // Details wenn vorhanden
    const details = item.data.giftstoffe_details;
    if (details && Array.isArray(details)) {
      details.forEach(d => {
        const detailEl = document.createElement('div');
        detailEl.className = 'toxin-detail';
        detailEl.innerHTML = `
          <span class="toxin-name">${d.name}</span>
          <span class="toxin-wirkung">${d.wirkung || ''}</span>
          ${d.dosis ? `<span class="toxin-dosis">Kritisch: ${d.dosis}</span>` : ''}
        `;
        card.appendChild(detailEl);
      });
    }
    
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Symptomverlauf als Timeline
 */
function renderSymptomVerlauf(items, skipFelder) {
  const validItems = items.filter(i => i.data.symptom_verlauf?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'symptom-verlauf-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'symptom-timeline-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'symptom-card-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const timeline = document.createElement('div');
    timeline.className = 'symptom-timeline';
    
    item.data.symptom_verlauf.forEach((phase, idx) => {
      const phaseEl = document.createElement('div');
      phaseEl.className = `symptom-phase ${phase.schwere || 'mittel'}`;
      phaseEl.innerHTML = `
        <div class="phase-time">${phase.zeit || phase.phase || `Phase ${idx + 1}`}</div>
        <div class="phase-symptoms">${Array.isArray(phase.symptome) ? phase.symptome.join(', ') : phase.symptome || phase.beschreibung}</div>
        ${phase.schwere ? `<div class="phase-severity severity-${phase.schwere}">${phase.schwere}</div>` : ''}
      `;
      timeline.appendChild(phaseEl);
    });
    
    card.appendChild(timeline);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Erste-Hilfe-Maßnahmen
 */
function renderErsteHilfe(items, skipFelder) {
  const validItems = items.filter(i => i.data.erste_hilfe?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'erste-hilfe-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'erste-hilfe-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'erste-hilfe-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const steps = document.createElement('ol');
    steps.className = 'erste-hilfe-steps';
    
    item.data.erste_hilfe.forEach(step => {
      const li = document.createElement('li');
      li.className = 'erste-hilfe-step';
      li.textContent = typeof step === 'string' ? step : step.action || step.maßnahme;
      steps.appendChild(li);
    });
    
    card.appendChild(steps);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Verwechslungspartner mit Unterscheidungsmerkmalen
 */
function renderVerwechslungspartner(items, skipFelder) {
  const validItems = items.filter(i => i.data.verwechslungspartner?.length > 0);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'verwechslungs-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'verwechslungs-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'verwechslungs-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const partners = document.createElement('div');
    partners.className = 'verwechslungs-list';
    
    item.data.verwechslungspartner.forEach(partner => {
      const partnerEl = document.createElement('div');
      partnerEl.className = `verwechslungs-partner ${partner.gefahr || 'unbekannt'}`;
      
      const name = typeof partner === 'string' ? partner : partner.name;
      const unterscheidung = partner.unterscheidung || '';
      const gefahr = partner.gefahr || partner.essbarkeit || '';
      
      partnerEl.innerHTML = `
        <div class="partner-name">${name}</div>
        ${gefahr ? `<span class="partner-gefahr gefahr-${gefahr}">${gefahr}</span>` : ''}
        ${unterscheidung ? `<div class="partner-unterscheidung">${unterscheidung}</div>` : ''}
      `;
      partners.appendChild(partnerEl);
    });
    
    card.appendChild(partners);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Antidote/Behandlung
 */
function renderAntidote(items, skipFelder) {
  const validItems = items.filter(i => i.data.antidote);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'antidote-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'antidote-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'antidote-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const antidote = item.data.antidote;
    const content = document.createElement('div');
    content.className = 'antidote-content';
    
    if (antidote.vorhanden !== undefined) {
      content.innerHTML += `<div class="antidote-status ${antidote.vorhanden ? 'available' : 'unavailable'}">
        ${antidote.vorhanden ? '✓ Antidot verfügbar' : '✗ Kein spezifisches Antidot'}
      </div>`;
    }
    
    if (antidote.name) {
      content.innerHTML += `<div class="antidote-name">Antidot: <strong>${antidote.name}</strong></div>`;
    }
    
    if (antidote.behandlung) {
      content.innerHTML += `<div class="antidote-behandlung">${antidote.behandlung}</div>`;
    }
    
    if (antidote.zeitfenster) {
      content.innerHTML += `<div class="antidote-zeitfenster">⏱️ Zeitfenster: ${antidote.zeitfenster}</div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareSicherheit(items, perspektive, config = {}) {
  debug.morphs('compareSicherheit', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-sicherheit';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 140, 160, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⚠️'}</span>
    <span class="perspektive-name">${perspektive.name || 'Sicherheit'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Essbarkeit (Tag) - Wichtigste Info!
  const essbarkeitItems = items.filter(i => i.data.essbarkeit);
  if (essbarkeitItems.length > 0) {
    const section = createSectionIfNew('essbarkeit', '⚠️ Essbarkeit', perspektive.farben?.[0], skipFelder);
    if (section) {
      section.classList.add('section-primary');
      const mapped = essbarkeitItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.essbarkeit, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 2. Toxizität (Progress/Bar)
  const toxizitaetItems = items.filter(i => i.data.toxizitaet !== undefined);
  if (toxizitaetItems.length > 0) {
    const section = createSectionIfNew('toxizitaet', 'Toxizitätsgrad', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = toxizitaetItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.toxizitaet, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareBar(mapped, { max: 100, einheit: '%' }));
      sections.appendChild(section);
    }
  }
  
  // 3. Verwechslung (List) - mit Overlap-Anzeige
  const verwechslungItems = items.filter(i => i.data.verwechslung?.length > 0);
  if (verwechslungItems.length > 0) {
    const section = createSectionIfNew('verwechslung', 'Verwechslungsgefahr', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = verwechslungItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.verwechslung, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 4. Symptome (nur bei giftigen)
  const symptomeItems = items.filter(i => i.data.symptome);
  if (symptomeItems.length > 0) {
    const section = createSectionIfNew('symptome', 'Symptome bei Verzehr', perspektive.farben?.[3], skipFelder);
    if (section) {
      section.classList.add('section-danger');
      const mapped = symptomeItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.symptome, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareText(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 5. Verfügbarkeit/Status (Badge)
  const statusItems = items.filter(i => i.data.verfuegbarkeit);
  if (statusItems.length > 0) {
    const section = createSectionIfNew('verfuegbarkeit', 'Status', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = statusItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.verfuegbarkeit, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareTag(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // ============== ERWEITERTE SICHERHEITS-SECTIONS ==============
  
  // 6. Toxine (detaillierte Giftstoffe)
  const toxineSection = createSectionIfNew('toxine', '☠️ Toxine / Giftstoffe', perspektive.farben?.[1], skipFelder);
  if (toxineSection) {
    const content = renderToxineComparison(items, skipFelder);
    if (content) {
      toxineSection.addContent(content);
      sections.appendChild(toxineSection);
    }
  }
  
  // 7. Verwechslungsrisiko (Rating 1-10)
  const risikoItems = items.filter(i => i.data.verwechslungsrisiko !== undefined);
  if (risikoItems.length > 0) {
    const section = createSectionIfNew('verwechslungsrisiko', '⚠️ Verwechslungsrisiko', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = risikoItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.verwechslungsrisiko, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareBar(mapped, { max: 10, einheit: '/10', showValue: true }));
      sections.appendChild(section);
    }
  }
  
  // 8. Verwechslungspartner (detailliert)
  const partnerSection = createSectionIfNew('verwechslungspartner', 'Verwechslungspartner', perspektive.farben?.[3], skipFelder);
  if (partnerSection) {
    const content = renderVerwechslungspartner(items, skipFelder);
    if (content) {
      partnerSection.addContent(content);
      sections.appendChild(partnerSection);
    }
  }
  
  // 9. Sichere Erkennungsmerkmale
  const merkmaleItems = items.filter(i => i.data.erkennungsmerkmale_sicher?.length > 0);
  if (merkmaleItems.length > 0) {
    const section = createSectionIfNew('erkennungsmerkmale_sicher', '✓ Sichere Erkennungsmerkmale', perspektive.farben?.[0], skipFelder);
    if (section) {
      section.classList.add('section-safe');
      const mapped = merkmaleItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.erkennungsmerkmale_sicher, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 10. Symptomverlauf (Timeline)
  const verlaufSection = createSectionIfNew('symptom_verlauf', '⏱️ Symptomverlauf', perspektive.farben?.[1], skipFelder);
  if (verlaufSection) {
    const content = renderSymptomVerlauf(items, skipFelder);
    if (content) {
      verlaufSection.addContent(content);
      sections.appendChild(verlaufSection);
    }
  }
  
  // 11. Erste Hilfe
  const ersteHilfeSection = createSectionIfNew('erste_hilfe', '🚑 Erste Hilfe', perspektive.farben?.[2], skipFelder);
  if (ersteHilfeSection) {
    const content = renderErsteHilfe(items, skipFelder);
    if (content) {
      ersteHilfeSection.classList.add('section-help');
      ersteHilfeSection.addContent(content);
      sections.appendChild(ersteHilfeSection);
    }
  }
  
  // 12. Antidote
  const antidoteSection = createSectionIfNew('antidote', '💊 Antidote / Behandlung', perspektive.farben?.[3], skipFelder);
  if (antidoteSection) {
    const content = renderAntidote(items, skipFelder);
    if (content) {
      antidoteSection.addContent(content);
      sections.appendChild(antidoteSection);
    }
  }
  
  // 13. LD50-Werte (falls vorhanden)
  const ld50Items = items.filter(i => i.data.ld50_werte);
  if (ld50Items.length > 0) {
    const section = createSectionIfNew('ld50_werte', 'LD50-Werte', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = ld50Items.map(i => ({
        id: i.id, name: i.name, wert: i.data.ld50_werte, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareObject(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  container.appendChild(sections);
  return container;
}

export default {
  id: 'sicherheit',
  render: compareSicherheit
};

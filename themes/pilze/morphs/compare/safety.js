/**
 * safety - Compare-Morph für safetys-Perspektive
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

// ============== NEUE HELPER FUNCTIONS (Schema v2) ==============

/**
 * Rendert safetysprofil-Übersicht
 */
function rendersafetysprofil(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.safety_gesamteinstufung || 
    i.data.safety_klassifikation ||
    i.data.safety_konfidenzniveau
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'safetysprofil-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'safetysprofil-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'safetysprofil-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'safetysprofil-content';
    
    // Haupteinstufung
    if (item.data.safety_gesamteinstufung) {
      const einstufung = item.data.safety_gesamteinstufung;
      const klasse = einstufung.toLowerCase().replace(/\s+/g, '-');
      content.innerHTML += `<div class="safety-einstufung einstufung-${klasse}">${einstufung}</div>`;
    }
    
    // Klassifikation
    if (item.data.safety_klassifikation) {
      content.innerHTML += `<div class="safety-klassifikation">
        <span class="label">Klassifikation:</span> ${item.data.safety_klassifikation}
      </div>`;
    }
    
    // Konfidenzniveau
    if (item.data.safety_konfidenzniveau) {
      content.innerHTML += `<div class="safety-konfidenz">
        <span class="label">Konfidenz:</span> 
        <span class="konfidenz-wert">${item.data.safety_konfidenzniveau}%</span>
      </div>`;
    }
    
    // Primäre Risiken
    if (item.data.safety_primaere_risiken?.length > 0) {
      const risiken = document.createElement('div');
      risiken.className = 'safety-risiken';
      risiken.innerHTML = `<span class="label">Primäre Risiken:</span>`;
      const list = document.createElement('ul');
      item.data.safety_primaere_risiken.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        list.appendChild(li);
      });
      risiken.appendChild(list);
      content.appendChild(risiken);
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Toxin-Profile mit wissenschaftlichen Details
 */
function renderToxinProfile(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.toxin_name || 
    i.data.toxin_klasse ||
    i.data.toxin_wirkmechanismus
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'toxin-profile-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'toxin-profile-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'toxin-profile-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'toxin-profile-content';
    
    // Toxin-Name und Synonyme
    if (item.data.toxin_name) {
      content.innerHTML += `<div class="toxin-hauptname">${item.data.toxin_name}</div>`;
    }
    if (item.data.toxin_synonyme?.length > 0) {
      content.innerHTML += `<div class="toxin-synonyme">${item.data.toxin_synonyme.join(', ')}</div>`;
    }
    
    // Klassifikation
    if (item.data.toxin_klasse) {
      content.innerHTML += `<div class="toxin-klasse">
        <span class="label">Klasse:</span> ${item.data.toxin_klasse}
      </div>`;
    }
    if (item.data.toxin_unterklasse) {
      content.innerHTML += `<div class="toxin-unterklasse">
        <span class="label">Unterklasse:</span> ${item.data.toxin_unterklasse}
      </div>`;
    }
    
    // Chemische Formel
    if (item.data.toxin_chemische_formel) {
      content.innerHTML += `<div class="toxin-formel">
        <span class="label">Formel:</span> <code>${item.data.toxin_chemische_formel}</code>
      </div>`;
    }
    
    // LD50
    if (item.data.toxin_ld50_wert) {
      content.innerHTML += `<div class="toxin-ld50">
        <span class="label">LD50:</span> ${item.data.toxin_ld50_wert} ${item.data.toxin_ld50_einheit || 'mg/kg'}
        ${item.data.toxin_ld50_spezies ? `(${item.data.toxin_ld50_spezies})` : ''}
      </div>`;
    }
    
    // Wirkmechanismus
    if (item.data.toxin_wirkmechanismus) {
      content.innerHTML += `<div class="toxin-wirkmechanismus">
        <span class="label">Wirkmechanismus:</span> ${item.data.toxin_wirkmechanismus}
      </div>`;
    }
    
    // Latenzzeit
    if (item.data.toxin_latenzzeit_min || item.data.toxin_latenzzeit_max) {
      const min = item.data.toxin_latenzzeit_min || '?';
      const max = item.data.toxin_latenzzeit_max || '?';
      content.innerHTML += `<div class="toxin-latenz">
        <span class="label">Latenz:</span> ${min} - ${max} ${item.data.toxin_latenzzeit_einheit || 'h'}
      </div>`;
    }
    
    // Hitzestabilität
    if (item.data.toxin_hitzestabil !== undefined) {
      content.innerHTML += `<div class="toxin-hitzestabil ${item.data.toxin_hitzestabil ? 'ja' : 'nein'}">
        ${item.data.toxin_hitzestabil ? '⚠️ Hitzestabil (Kochen zerstört nicht!)' : '✓ Nicht hitzestabil'}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Verwechslungs-Analyse v2
 */
function renderVerwechslungV2(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.verwechslung_zielart_name || 
    i.data.verwechslung_aehnlichkeit_gesamt
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'verwechslung-v2-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'verwechslung-v2-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'verwechslung-v2-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'verwechslung-v2-content';
    
    // Zielart
    if (item.data.verwechslung_zielart_name) {
      content.innerHTML += `<div class="verwechslung-zielart">
        <span class="label">Ähnlich zu:</span> 
        <strong>${item.data.verwechslung_zielart_name}</strong>
        ${item.data.verwechslung_zielart_essbarkeit ? 
          `<span class="essbarkeit-badge ${item.data.verwechslung_zielart_essbarkeit}">${item.data.verwechslung_zielart_essbarkeit}</span>` : ''}
      </div>`;
    }
    
    // Ähnlichkeits-Werte
    if (item.data.verwechslung_aehnlichkeit_gesamt) {
      const aehnl = item.data.verwechslung_aehnlichkeit_gesamt;
      content.innerHTML += `<div class="verwechslung-aehnlichkeit">
        <div class="aehnlichkeit-bar" style="--wert: ${aehnl}%">
          <span class="aehnlichkeit-wert">${aehnl}%</span>
        </div>
      </div>`;
    }
    
    // Teil-Ähnlichkeiten
    const teilAehnl = [];
    if (item.data.verwechslung_aehnlichkeit_hut) teilAehnl.push(['Hut', item.data.verwechslung_aehnlichkeit_hut]);
    if (item.data.verwechslung_aehnlichkeit_stiel) teilAehnl.push(['Stiel', item.data.verwechslung_aehnlichkeit_stiel]);
    if (item.data.verwechslung_aehnlichkeit_lamellen) teilAehnl.push(['Lamellen', item.data.verwechslung_aehnlichkeit_lamellen]);
    if (item.data.verwechslung_aehnlichkeit_geruch) teilAehnl.push(['Geruch', item.data.verwechslung_aehnlichkeit_geruch]);
    if (item.data.verwechslung_aehnlichkeit_habitat) teilAehnl.push(['Habitat', item.data.verwechslung_aehnlichkeit_habitat]);
    
    if (teilAehnl.length > 0) {
      const teilDiv = document.createElement('div');
      teilDiv.className = 'teil-aehnlichkeiten';
      teilAehnl.forEach(([name, wert]) => {
        teilDiv.innerHTML += `<div class="teil-aehnl">
          <span class="teil-name">${name}</span>
          <span class="teil-wert">${wert}%</span>
        </div>`;
      });
      content.appendChild(teilDiv);
    }
    
    // Unterscheidungsmerkmale
    if (item.data.verwechslung_unterscheidung_merkmale?.length > 0) {
      const merkmale = document.createElement('div');
      merkmale.className = 'unterscheidung-merkmale';
      merkmale.innerHTML = '<span class="label">Unterscheidbar durch:</span>';
      const ul = document.createElement('ul');
      item.data.verwechslung_unterscheidung_merkmale.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        ul.appendChild(li);
      });
      merkmale.appendChild(ul);
      content.appendChild(merkmale);
    }
    
    // Risikobewertung
    if (item.data.verwechslung_risikoklasse) {
      content.innerHTML += `<div class="verwechslung-risiko risiko-${item.data.verwechslung_risikoklasse.toLowerCase()}">
        Risikoklasse: ${item.data.verwechslung_risikoklasse}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Symptom-Details v2
 */
function renderSymptomDetails(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.symptom_name || 
    i.data.symptom_kategorie ||
    i.data.symptom_organsystem
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'symptom-details-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'symptom-details-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'symptom-details-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'symptom-details-content';
    
    // Symptom-Name und Kategorie
    if (item.data.symptom_name) {
      content.innerHTML += `<div class="symptom-hauptname">${item.data.symptom_name}</div>`;
    }
    if (item.data.symptom_kategorie) {
      content.innerHTML += `<div class="symptom-kategorie kategorie-${item.data.symptom_kategorie.toLowerCase()}">
        ${item.data.symptom_kategorie}
      </div>`;
    }
    
    // Organsystem
    if (item.data.symptom_organsystem) {
      content.innerHTML += `<div class="symptom-organ">
        <span class="label">Organsystem:</span> ${item.data.symptom_organsystem}
      </div>`;
    }
    
    // Schweregrad
    if (item.data.symptom_schweregrad_skala) {
      const schwere = item.data.symptom_schweregrad_skala;
      content.innerHTML += `<div class="symptom-schwere schwere-${schwere}">
        <span class="label">Schwere:</span> ${schwere}/5
        <div class="schwere-bar" style="--wert: ${schwere * 20}%"></div>
      </div>`;
    }
    
    // Zeitliches Auftreten
    if (item.data.symptom_beginn_min || item.data.symptom_beginn_max) {
      const min = item.data.symptom_beginn_min || '?';
      const max = item.data.symptom_beginn_max || '?';
      content.innerHTML += `<div class="symptom-beginn">
        <span class="label">Beginn:</span> ${min} - ${max} ${item.data.symptom_beginn_einheit || 'h'}
      </div>`;
    }
    
    // Dauer
    if (item.data.symptom_dauer_typisch) {
      content.innerHTML += `<div class="symptom-dauer">
        <span class="label">Typische Dauer:</span> ${item.data.symptom_dauer_typisch}
      </div>`;
    }
    
    // Reversibilität
    if (item.data.symptom_reversibilitaet) {
      const rev = item.data.symptom_reversibilitaet;
      content.innerHTML += `<div class="symptom-reversibel reversibel-${rev.toLowerCase()}">
        <span class="label">Reversibilität:</span> ${rev}
      </div>`;
    }
    
    // Behandelbarkeit
    if (item.data.symptom_behandelbar !== undefined) {
      content.innerHTML += `<div class="symptom-behandelbar ${item.data.symptom_behandelbar ? 'ja' : 'nein'}">
        ${item.data.symptom_behandelbar ? '✓ Behandelbar' : '✗ Schwer behandelbar'}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Syndrom-Informationen
 */
function renderSyndromInfo(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.syndrom_name || 
    i.data.syndrom_typ ||
    i.data.syndrom_haupttoxine
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'syndrom-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'syndrom-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'syndrom-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'syndrom-content';
    
    // Syndrom-Name
    if (item.data.syndrom_name) {
      content.innerHTML += `<div class="syndrom-hauptname">${item.data.syndrom_name}</div>`;
    }
    if (item.data.syndrom_icd10_code) {
      content.innerHTML += `<div class="syndrom-icd10">ICD-10: ${item.data.syndrom_icd10_code}</div>`;
    }
    
    // Typ und Letalität
    if (item.data.syndrom_typ) {
      content.innerHTML += `<div class="syndrom-typ typ-${item.data.syndrom_typ.toLowerCase()}">
        ${item.data.syndrom_typ}
      </div>`;
    }
    
    // Letalität
    if (item.data.syndrom_letalitaet_unbehandelt) {
      const letal = item.data.syndrom_letalitaet_unbehandelt;
      content.innerHTML += `<div class="syndrom-letalitaet letalitaet-${letal > 50 ? 'hoch' : letal > 20 ? 'mittel' : 'niedrig'}">
        <span class="label">Letalität unbehandelt:</span> ${letal}%
      </div>`;
    }
    if (item.data.syndrom_letalitaet_behandelt) {
      content.innerHTML += `<div class="syndrom-letalitaet-behandelt">
        <span class="label">Letalität behandelt:</span> ${item.data.syndrom_letalitaet_behandelt}%
      </div>`;
    }
    
    // Latenzzeit
    if (item.data.syndrom_latenz_min || item.data.syndrom_latenz_max) {
      const min = item.data.syndrom_latenz_min || '?';
      const max = item.data.syndrom_latenz_max || '?';
      content.innerHTML += `<div class="syndrom-latenz">
        <span class="label">Latenz:</span> ${min} - ${max} Stunden
      </div>`;
    }
    
    // Hauptsymptome
    if (item.data.syndrom_hauptsymptome?.length > 0) {
      const symptome = document.createElement('div');
      symptome.className = 'syndrom-hauptsymptome';
      symptome.innerHTML = '<span class="label">Hauptsymptome:</span>';
      const ul = document.createElement('ul');
      item.data.syndrom_hauptsymptome.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      symptome.appendChild(ul);
      content.appendChild(symptome);
    }
    
    // Haupttoxine
    if (item.data.syndrom_haupttoxine?.length > 0) {
      const toxine = document.createElement('div');
      toxine.className = 'syndrom-toxine';
      item.data.syndrom_haupttoxine.forEach(t => {
        toxine.innerHTML += `<span class="toxin-badge">${t}</span>`;
      });
      content.appendChild(toxine);
    }
    
    // Zielorgane
    if (item.data.syndrom_zielorgane?.length > 0) {
      content.innerHTML += `<div class="syndrom-zielorgane">
        <span class="label">Zielorgane:</span> ${item.data.syndrom_zielorgane.join(', ')}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Behandlungs-Protokolle
 */
function renderBehandlung(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.behandlung_name || 
    i.data.behandlung_typ ||
    i.data.behandlung_prioritaet
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'behandlung-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'behandlung-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'behandlung-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'behandlung-content';
    
    // Behandlungsname
    if (item.data.behandlung_name) {
      content.innerHTML += `<div class="behandlung-hauptname">${item.data.behandlung_name}</div>`;
    }
    
    // Typ und Priorität
    if (item.data.behandlung_typ) {
      content.innerHTML += `<div class="behandlung-typ">${item.data.behandlung_typ}</div>`;
    }
    if (item.data.behandlung_prioritaet) {
      content.innerHTML += `<div class="behandlung-prioritaet prio-${item.data.behandlung_prioritaet}">
        Priorität: ${item.data.behandlung_prioritaet}
      </div>`;
    }
    
    // Zeitfenster
    if (item.data.behandlung_zeitfenster_optimal) {
      content.innerHTML += `<div class="behandlung-zeitfenster optimal">
        <span class="label">Optimal:</span> ${item.data.behandlung_zeitfenster_optimal}
      </div>`;
    }
    if (item.data.behandlung_zeitfenster_maximal) {
      content.innerHTML += `<div class="behandlung-zeitfenster maximal">
        <span class="label">Maximal:</span> ${item.data.behandlung_zeitfenster_maximal}
      </div>`;
    }
    
    // Effektivität
    if (item.data.behandlung_effektivitaet) {
      const eff = item.data.behandlung_effektivitaet;
      content.innerHTML += `<div class="behandlung-effektivitaet">
        <span class="label">Effektivität:</span> ${eff}%
        <div class="effektivitaet-bar" style="--wert: ${eff}%"></div>
      </div>`;
    }
    
    // Dosierung
    if (item.data.behandlung_dosierung_erwachsene) {
      content.innerHTML += `<div class="behandlung-dosierung">
        <span class="label">Dosierung (Erwachsene):</span> ${item.data.behandlung_dosierung_erwachsene}
      </div>`;
    }
    
    // Kontraindikationen
    if (item.data.behandlung_kontraindikationen?.length > 0) {
      const kontra = document.createElement('div');
      kontra.className = 'behandlung-kontra';
      kontra.innerHTML = '<span class="label">⚠️ Kontraindikationen:</span>';
      const ul = document.createElement('ul');
      item.data.behandlung_kontraindikationen.forEach(k => {
        const li = document.createElement('li');
        li.textContent = k;
        ul.appendChild(li);
      });
      kontra.appendChild(ul);
      content.appendChild(kontra);
    }
    
    // Spezialausrüstung
    if (item.data.behandlung_spezialausruestung?.length > 0) {
      content.innerHTML += `<div class="behandlung-ausruestung">
        <span class="label">Benötigt:</span> ${item.data.behandlung_spezialausruestung.join(', ')}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Notfall-Kontakte und Protokolle
 */
function renderNotfall(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.notfall_telefon || 
    i.data.notfall_name ||
    i.data.notfall_sofortmassnahmen
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'notfall-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'notfall-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'notfall-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'notfall-content';
    
    // Notfallnummer (groß und prominent)
    if (item.data.notfall_telefon) {
      content.innerHTML += `<div class="notfall-telefon">
        <a href="tel:${item.data.notfall_telefon}" class="notfall-tel-link">
          📞 ${item.data.notfall_telefon}
        </a>
      </div>`;
    }
    
    // Name/Organisation
    if (item.data.notfall_name) {
      content.innerHTML += `<div class="notfall-name">${item.data.notfall_name}</div>`;
    }
    
    // Verfügbarkeit
    if (item.data.notfall_verfuegbarkeit) {
      content.innerHTML += `<div class="notfall-verfuegbar">
        🕐 ${item.data.notfall_verfuegbarkeit}
      </div>`;
    }
    
    // Reaktionszeit
    if (item.data.notfall_reaktionszeit) {
      content.innerHTML += `<div class="notfall-reaktion">
        <span class="label">Reaktionszeit:</span> ${item.data.notfall_reaktionszeit}
      </div>`;
    }
    
    // Sofortmaßnahmen
    if (item.data.notfall_sofortmassnahmen?.length > 0) {
      const mass = document.createElement('div');
      mass.className = 'notfall-sofortmassnahmen';
      mass.innerHTML = '<span class="label">🚨 Sofortmaßnahmen:</span>';
      const ol = document.createElement('ol');
      item.data.notfall_sofortmassnahmen.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        ol.appendChild(li);
      });
      mass.appendChild(ol);
      content.appendChild(mass);
    }
    
    // Zu sichernde Materialien
    if (item.data.notfall_sicherungsmaterial?.length > 0) {
      content.innerHTML += `<div class="notfall-sicherung">
        <span class="label">Sicherstellen:</span> ${item.data.notfall_sicherungsmaterial.join(', ')}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Erste-Hilfe v2 (erweitert)
 */
function renderErsteHilfeV2(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.erste_hilfe_kategorie || 
    i.data.erste_hilfe_schritte ||
    i.data.erste_hilfe_prioritaet
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'erste-hilfe-v2-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'erste-hilfe-v2-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'erste-hilfe-v2-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'erste-hilfe-v2-content';
    
    // Kategorie und Priorität
    if (item.data.erste_hilfe_kategorie) {
      content.innerHTML += `<div class="eh-kategorie">${item.data.erste_hilfe_kategorie}</div>`;
    }
    if (item.data.erste_hilfe_prioritaet) {
      content.innerHTML += `<div class="eh-prioritaet prio-${item.data.erste_hilfe_prioritaet}">
        Priorität: ${item.data.erste_hilfe_prioritaet}
      </div>`;
    }
    
    // Schritte
    if (item.data.erste_hilfe_schritte?.length > 0) {
      const schritte = document.createElement('div');
      schritte.className = 'eh-schritte';
      const ol = document.createElement('ol');
      item.data.erste_hilfe_schritte.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      });
      schritte.appendChild(ol);
      content.appendChild(schritte);
    }
    
    // Warnungen
    if (item.data.erste_hilfe_warnungen?.length > 0) {
      const warn = document.createElement('div');
      warn.className = 'eh-warnungen';
      warn.innerHTML = '<span class="label">⚠️ Warnungen:</span>';
      item.data.erste_hilfe_warnungen.forEach(w => {
        warn.innerHTML += `<div class="eh-warnung">${w}</div>`;
      });
      content.appendChild(warn);
    }
    
    // NICHT TUN
    if (item.data.erste_hilfe_nicht_tun?.length > 0) {
      const nicht = document.createElement('div');
      nicht.className = 'eh-nicht-tun';
      nicht.innerHTML = '<span class="label">❌ NICHT TUN:</span>';
      item.data.erste_hilfe_nicht_tun.forEach(n => {
        nicht.innerHTML += `<div class="eh-nicht">${n}</div>`;
      });
      content.appendChild(nicht);
    }
    
    // Zeitkritisch
    if (item.data.erste_hilfe_zeitkritisch !== undefined) {
      content.innerHTML += `<div class="eh-zeitkritisch ${item.data.erste_hilfe_zeitkritisch ? 'ja' : 'nein'}">
        ${item.data.erste_hilfe_zeitkritisch ? '⚡ ZEITKRITISCH' : 'Nicht zeitkritisch'}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Vergiftungsvorfälle
 */
function renderVorfaelle(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.vorfall_jahr || 
    i.data.vorfall_faelle_gesamt ||
    i.data.vorfall_region
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'vorfaelle-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vorfall-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'vorfall-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'vorfall-content';
    
    // Jahr und Region
    if (item.data.vorfall_jahr) {
      content.innerHTML += `<div class="vorfall-jahr">${item.data.vorfall_jahr}</div>`;
    }
    if (item.data.vorfall_region) {
      content.innerHTML += `<div class="vorfall-region">📍 ${item.data.vorfall_region}</div>`;
    }
    
    // Fallzahlen
    if (item.data.vorfall_faelle_gesamt) {
      content.innerHTML += `<div class="vorfall-faelle">
        <span class="faelle-zahl">${item.data.vorfall_faelle_gesamt}</span>
        <span class="faelle-label">Fälle</span>
      </div>`;
    }
    
    // Detailzahlen
    const details = [];
    if (item.data.vorfall_todesfaelle) details.push(['Todesfälle', item.data.vorfall_todesfaelle, 'tod']);
    if (item.data.vorfall_schwere_verlaeufe) details.push(['Schwer', item.data.vorfall_schwere_verlaeufe, 'schwer']);
    if (item.data.vorfall_leichte_verlaeufe) details.push(['Leicht', item.data.vorfall_leichte_verlaeufe, 'leicht']);
    
    if (details.length > 0) {
      const detailDiv = document.createElement('div');
      detailDiv.className = 'vorfall-details';
      details.forEach(([label, wert, klasse]) => {
        detailDiv.innerHTML += `<div class="vorfall-detail detail-${klasse}">
          <span class="detail-wert">${wert}</span>
          <span class="detail-label">${label}</span>
        </div>`;
      });
      content.appendChild(detailDiv);
    }
    
    // Häufigste Ursache
    if (item.data.vorfall_haeufigste_ursache) {
      content.innerHTML += `<div class="vorfall-ursache">
        <span class="label">Häufigste Ursache:</span> ${item.data.vorfall_haeufigste_ursache}
      </div>`;
    }
    
    // Trend
    if (item.data.vorfall_trend) {
      const trend = item.data.vorfall_trend;
      const icon = trend === 'steigend' ? '📈' : trend === 'fallend' ? '📉' : '➡️';
      content.innerHTML += `<div class="vorfall-trend trend-${trend}">
        ${icon} Trend: ${trend}
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Regionale safetysdaten
 */
function renderRegionalData(items, skipFelder) {
  const validItems = items.filter(i => 
    i.data.regional_region || 
    i.data.regional_vorkommen_haeufigkeit ||
    i.data.regional_risikoeinstufung
  );
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'regional-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'regional-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'regional-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'regional-content';
    
    // Region und Land
    if (item.data.regional_region) {
      content.innerHTML += `<div class="regional-name">📍 ${item.data.regional_region}</div>`;
    }
    if (item.data.regional_land) {
      content.innerHTML += `<div class="regional-land">${item.data.regional_land}</div>`;
    }
    
    // Vorkommen
    if (item.data.regional_vorkommen_haeufigkeit) {
      content.innerHTML += `<div class="regional-vorkommen">
        <span class="label">Vorkommen:</span> ${item.data.regional_vorkommen_haeufigkeit}
      </div>`;
    }
    
    // Risikoeinstufung
    if (item.data.regional_risikoeinstufung) {
      const risiko = item.data.regional_risikoeinstufung;
      content.innerHTML += `<div class="regional-risiko risiko-${risiko.toLowerCase()}">
        Risiko: ${risiko}
      </div>`;
    }
    
    // Saison
    if (item.data.regional_saison_start || item.data.regional_saison_ende) {
      const start = item.data.regional_saison_start || '?';
      const ende = item.data.regional_saison_ende || '?';
      content.innerHTML += `<div class="regional-saison">
        <span class="label">Saison:</span> ${start} - ${ende}
      </div>`;
    }
    
    // Hauptsaison
    if (item.data.regional_hauptsaison_monate?.length > 0) {
      content.innerHTML += `<div class="regional-hauptsaison">
        <span class="label">Hauptsaison:</span> ${item.data.regional_hauptsaison_monate.join(', ')}
      </div>`;
    }
    
    // Lokale Namen
    if (item.data.regional_lokale_namen?.length > 0) {
      content.innerHTML += `<div class="regional-namen">
        <span class="label">Lokale Namen:</span> ${item.data.regional_lokale_namen.join(', ')}
      </div>`;
    }
    
    // Verwechslungspartner regional
    if (item.data.regional_verwechslungspartner?.length > 0) {
      const partner = document.createElement('div');
      partner.className = 'regional-verwechslung';
      partner.innerHTML = '<span class="label">Regionale Verwechslungspartner:</span>';
      const ul = document.createElement('ul');
      item.data.regional_verwechslungspartner.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        ul.appendChild(li);
      });
      partner.appendChild(ul);
      content.appendChild(partner);
    }
    
    // Giftnotruf lokal
    if (item.data.regional_giftnotruf) {
      content.innerHTML += `<div class="regional-notruf">
        <a href="tel:${item.data.regional_giftnotruf}" class="notruf-link">
          📞 ${item.data.regional_giftnotruf}
        </a>
      </div>`;
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
export function comparesafety(items, perspektive, config = {}) {
  debug.morphs('comparesafety', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-safety';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(255, 140, 160, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '⚠️'}</span>
    <span class="perspektive-name">${perspektive.name || 'safety'}</span>
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
  
  // ============== ERWEITERTE safetyS-SECTIONS ==============
  
  // 6. safetysprofil-Übersicht (NEU v2)
  const safetysprofilSection = createSectionIfNew('safetysprofil', '🛡️ safetysprofil', perspektive.farben?.[0], skipFelder);
  if (safetysprofilSection) {
    const content = rendersafetysprofil(items, skipFelder);
    if (content) {
      safetysprofilSection.addContent(content);
      sections.appendChild(safetysprofilSection);
    }
  }
  
  // 7. Toxine (detaillierte Giftstoffe) - Legacy
  const toxineSection = createSectionIfNew('toxine', '☠️ Toxine / Giftstoffe', perspektive.farben?.[1], skipFelder);
  if (toxineSection) {
    const content = renderToxineComparison(items, skipFelder);
    if (content) {
      toxineSection.addContent(content);
      sections.appendChild(toxineSection);
    }
  }
  
  // 8. Toxin-Profile (NEU v2 - wissenschaftlich)
  const toxinProfileSection = createSectionIfNew('toxin_profile', '🧪 Toxin-Profile', perspektive.farben?.[1], skipFelder);
  if (toxinProfileSection) {
    const content = renderToxinProfile(items, skipFelder);
    if (content) {
      toxinProfileSection.addContent(content);
      sections.appendChild(toxinProfileSection);
    }
  }
  
  // 9. Verwechslungsrisiko (Rating 1-10)
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
  
  // 10. Verwechslungspartner (Legacy)
  const partnerSection = createSectionIfNew('verwechslungspartner', 'Verwechslungspartner', perspektive.farben?.[3], skipFelder);
  if (partnerSection) {
    const content = renderVerwechslungspartner(items, skipFelder);
    if (content) {
      partnerSection.addContent(content);
      sections.appendChild(partnerSection);
    }
  }
  
  // 11. Verwechslungs-Analyse v2 (NEU)
  const verwechslungV2Section = createSectionIfNew('verwechslung_v2', '🔍 Verwechslungs-Analyse', perspektive.farben?.[2], skipFelder);
  if (verwechslungV2Section) {
    const content = renderVerwechslungV2(items, skipFelder);
    if (content) {
      verwechslungV2Section.addContent(content);
      sections.appendChild(verwechslungV2Section);
    }
  }
  
  // 12. Sichere Erkennungsmerkmale
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
  
  // 13. Symptomverlauf (Timeline Legacy)
  const verlaufSection = createSectionIfNew('symptom_verlauf', '⏱️ Symptomverlauf', perspektive.farben?.[1], skipFelder);
  if (verlaufSection) {
    const content = renderSymptomVerlauf(items, skipFelder);
    if (content) {
      verlaufSection.addContent(content);
      sections.appendChild(verlaufSection);
    }
  }
  
  // 14. Symptom-Details v2 (NEU)
  const symptomDetailsSection = createSectionIfNew('symptom_details', '🩺 Symptom-Details', perspektive.farben?.[3], skipFelder);
  if (symptomDetailsSection) {
    const content = renderSymptomDetails(items, skipFelder);
    if (content) {
      symptomDetailsSection.addContent(content);
      sections.appendChild(symptomDetailsSection);
    }
  }
  
  // 15. Syndrom-Informationen (NEU)
  const syndromSection = createSectionIfNew('syndrom', '⚕️ Vergiftungssyndrome', perspektive.farben?.[1], skipFelder);
  if (syndromSection) {
    const content = renderSyndromInfo(items, skipFelder);
    if (content) {
      syndromSection.addContent(content);
      sections.appendChild(syndromSection);
    }
  }
  
  // 16. Behandlungs-Protokolle (NEU)
  const behandlungSection = createSectionIfNew('behandlung', '💊 Behandlung', perspektive.farben?.[2], skipFelder);
  if (behandlungSection) {
    const content = renderBehandlung(items, skipFelder);
    if (content) {
      behandlungSection.addContent(content);
      sections.appendChild(behandlungSection);
    }
  }
  
  // 17. Erste Hilfe (Legacy)
  const ersteHilfeSection = createSectionIfNew('erste_hilfe', '🚑 Erste Hilfe', perspektive.farben?.[2], skipFelder);
  if (ersteHilfeSection) {
    const content = renderErsteHilfe(items, skipFelder);
    if (content) {
      ersteHilfeSection.classList.add('section-help');
      ersteHilfeSection.addContent(content);
      sections.appendChild(ersteHilfeSection);
    }
  }
  
  // 18. Erste Hilfe v2 (NEU - erweitert)
  const ersteHilfeV2Section = createSectionIfNew('erste_hilfe_v2', '🚑 Erste Hilfe (Detail)', perspektive.farben?.[0], skipFelder);
  if (ersteHilfeV2Section) {
    const content = renderErsteHilfeV2(items, skipFelder);
    if (content) {
      ersteHilfeV2Section.addContent(content);
      sections.appendChild(ersteHilfeV2Section);
    }
  }
  
  // 19. Notfall-Kontakte (NEU)
  const notfallSection = createSectionIfNew('notfall', '📞 Notfall-Kontakte', perspektive.farben?.[3], skipFelder);
  if (notfallSection) {
    const content = renderNotfall(items, skipFelder);
    if (content) {
      notfallSection.classList.add('section-emergency');
      notfallSection.addContent(content);
      sections.appendChild(notfallSection);
    }
  }
  
  // 20. Antidote (Legacy)
  const antidoteSection = createSectionIfNew('antidote', '💊 Antidote / Behandlung', perspektive.farben?.[3], skipFelder);
  if (antidoteSection) {
    const content = renderAntidote(items, skipFelder);
    if (content) {
      antidoteSection.addContent(content);
      sections.appendChild(antidoteSection);
    }
  }
  
  // 21. Vergiftungsvorfälle (NEU)
  const vorfaelleSection = createSectionIfNew('vorfaelle', '📊 Vergiftungsvorfälle', perspektive.farben?.[1], skipFelder);
  if (vorfaelleSection) {
    const content = renderVorfaelle(items, skipFelder);
    if (content) {
      vorfaelleSection.addContent(content);
      sections.appendChild(vorfaelleSection);
    }
  }
  
  // 22. Regionale Daten (NEU)
  const regionalSection = createSectionIfNew('regional', '🗺️ Regionale Daten', perspektive.farben?.[2], skipFelder);
  if (regionalSection) {
    const content = renderRegionalData(items, skipFelder);
    if (content) {
      regionalSection.addContent(content);
      sections.appendChild(regionalSection);
    }
  }
  
  // 23. LD50-Werte (falls vorhanden)
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
  id: 'safety',
  render: comparesafety
};

/**
 * Ansichten Feature
 * Verwaltet FELD-Auswahl, Detail-View und Vergleichs-View
 * 
 * Grid-View: Einzelne FELDER sind anklickbar (nicht ganze Cards)
 * Detail-View: Zeigt ausgewählte Felder gruppiert nach Pilz
 * Vergleich-View: Stellt gleiche Feldtypen nebeneinander
 */

import { debug } from '../../observer/debug.js';
import { getFeldConfig, getVersteckteFelder, getFeldReihenfolge } from '../../util/semantic.js';

// Globaler State für FELD-Auswahl
const state = {
  // Map<"pilzId:feldName", {pilzId, feldName, wert, pilzDaten}>
  auswahl: new Map(),
  aktiveAnsicht: 'karten', // 'karten' | 'detail' | 'vergleich'
  detailPilzId: null       // Welcher Pilz im Detail angezeigt wird
};

export function getState() {
  return state;
}

export function setAktiveAnsicht(ansicht) {
  state.aktiveAnsicht = ansicht;
  debug.views('View changed', { view: ansicht });
}

/**
 * Feld zur Auswahl hinzufügen/entfernen
 * @param {string} pilzId - ID des Pilzes
 * @param {string} feldName - Name des Feldes (z.B. "temperatur", "name")
 * @param {*} wert - Wert des Feldes
 * @param {Object} pilzDaten - Komplette Pilz-Daten
 */
export function toggleFeldAuswahl(pilzId, feldName, wert, pilzDaten) {
  const key = `${pilzId}:${feldName}`;
  
  if (state.auswahl.has(key)) {
    state.auswahl.delete(key);
    debug.views('Field selection removed', { key, count: state.auswahl.size });
  } else {
    state.auswahl.set(key, {
      pilzId,
      feldName,
      wert,
      pilzDaten
    });
    debug.views('Field selection added', { key, count: state.auswahl.size });
  }
  
  // Event für UI-Updates
  document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
    detail: { 
      auswahl: [...state.auswahl.keys()], 
      anzahl: state.auswahl.size,
      pilzIds: getAuswahlPilzIds()
    }
  }));
  
  return state.auswahl.size;
}

/**
 * Legacy-Funktion für Kompatibilität - wählt ALLE Felder eines Pilzes aus
 */
export function toggleAuswahl(id, daten = null) {
  if (!daten) return state.auswahl.size;
  
  const versteckt = getVersteckteFelder();
  const hatBereitsFelder = [...state.auswahl.values()].some(a => a.pilzId === String(id));
  
  if (hatBereitsFelder) {
    // Alle Felder dieses Pilzes entfernen
    const entfernteFelder = [];
    for (const [key, data] of state.auswahl) {
      if (data.pilzId === String(id)) {
        entfernteFelder.push(data.feldName);
        state.auswahl.delete(key);
      }
    }
    debug.views('All fields removed', { id, count: state.auswahl.size, fields: entfernteFelder });
    
    // Event mit entferntem Pilz dispatchen
    document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
      detail: { 
        auswahl: [...state.auswahl.keys()], 
        anzahl: state.auswahl.size,
        pilzIds: getAuswahlPilzIds(),
        entfernterPilz: String(id),
        entfernteFelder
      }
    }));
    
    return state.auswahl.size;
  } else {
    // Alle sichtbaren Felder hinzufügen
    for (const [feldName, wert] of Object.entries(daten)) {
      if (versteckt.includes(feldName)) continue;
      if (wert === null || wert === undefined || wert === '') continue;
      
      const key = `${id}:${feldName}`;
      state.auswahl.set(key, {
        pilzId: String(id),
        feldName,
        wert,
        pilzDaten: daten
      });
    }
    debug.views('All fields added', { id, count: state.auswahl.size });
  }
  
  document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
    detail: { 
      auswahl: [...state.auswahl.keys()], 
      anzahl: state.auswahl.size,
      pilzIds: getAuswahlPilzIds()
    }
  }));
  
  return state.auswahl.size;
}

/**
 * Entfernt alle Felder eines bestimmten Feldnamens aus der Auswahl
 * Wird vom Compare-View genutzt wenn ein Feld abgewählt wird
 * @param {string} feldName - Name des Feldes (z.B. "temperatur", "essbarkeit")
 * @returns {number} Anzahl entfernter Felder
 */
export function removeFeldAuswahl(feldName) {
  let entfernt = 0;
  
  for (const [key, data] of state.auswahl) {
    if (data.feldName === feldName) {
      state.auswahl.delete(key);
      entfernt++;
    }
  }
  
  if (entfernt > 0) {
    debug.views('Field type deselected', { fieldName: feldName, removed: entfernt, remaining: state.auswahl.size });
    
    document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
      detail: { 
        auswahl: [...state.auswahl.keys()], 
        anzahl: state.auswahl.size,
        pilzIds: getAuswahlPilzIds(),
        entferntesFeld: feldName
      }
    }));
  }
  
  return entfernt;
}

export function clearAuswahl() {
  state.auswahl.clear();
  state.detailPilzId = null;
  debug.views('Selection cleared');
  
  document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
    detail: { auswahl: [], anzahl: 0, pilzIds: [] }
  }));
}

/**
 * Aktualisiert die Pilz-Daten in der Auswahl
 * Wird aufgerufen wenn vollständige Perspektiven-Daten geladen wurden
 * @param {Array} fullItems - Array mit vollständigen Item-Daten
 */
export function updateAuswahlDaten(fullItems) {
  if (!fullItems?.length || state.auswahl.size === 0) return;
  
  // Map für schnellen Lookup nach ID/Slug
  const itemMap = new Map();
  for (const item of fullItems) {
    const id = item.id || item.slug;
    if (id) itemMap.set(String(id), item);
  }
  
  let updated = 0;
  
  // Alle Auswahl-Einträge mit vollständigen Daten aktualisieren
  for (const [key, data] of state.auswahl) {
    const fullData = itemMap.get(String(data.pilzId));
    if (fullData) {
      // Wert aktualisieren falls vorhanden
      if (data.feldName in fullData) {
        data.wert = fullData[data.feldName];
      }
      // Vollständige Pilz-Daten aktualisieren
      data.pilzDaten = fullData;
      updated++;
    }
  }
  
  if (updated > 0) {
    debug.views('Selection data updated with full perspectives', { updated, total: state.auswahl.size });
    
    // Event für UI-Updates
    document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {
      detail: { 
        auswahl: [...state.auswahl.keys()], 
        anzahl: state.auswahl.size,
        pilzIds: getAuswahlPilzIds(),
        datenAktualisiert: true
      }
    }));
  }
}

/**
 * Gibt alle eindeutigen Pilz-IDs in der Auswahl zurück
 */
export function getAuswahlPilzIds() {
  const ids = new Set();
  for (const data of state.auswahl.values()) {
    ids.add(data.pilzId);
  }
  return [...ids];
}

/**
 * Gibt alle ausgewählten Felder zurück
 */
export function getAuswahl() {
  return [...state.auswahl.keys()];
}

/**
 * Gibt die Auswahl-Daten gruppiert nach Pilz zurück (Felder sortiert nach Schema)
 */
export function getAuswahlNachPilz() {
  const nachPilz = new Map();
  const reihenfolge = getFeldReihenfolge();
  
  for (const [key, data] of state.auswahl) {
    if (!nachPilz.has(data.pilzId)) {
      nachPilz.set(data.pilzId, {
        pilzDaten: data.pilzDaten,
        felder: []
      });
    }
    nachPilz.get(data.pilzId).felder.push({
      feldName: data.feldName,
      wert: data.wert
    });
  }
  
  // Felder nach Schema-Reihenfolge sortieren
  for (const pilzData of nachPilz.values()) {
    pilzData.felder.sort((a, b) => {
      const indexA = reihenfolge.indexOf(a.feldName);
      const indexB = reihenfolge.indexOf(b.feldName);
      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;
      return posA - posB;
    });
  }
  
  return nachPilz;
}

/**
 * Gibt die Auswahl-Daten gruppiert nach Feldtyp zurück (sortiert nach Schema)
 */
export function getAuswahlNachFeld() {
  const nachFeld = new Map();
  const reihenfolge = getFeldReihenfolge();
  
  for (const [key, data] of state.auswahl) {
    if (!nachFeld.has(data.feldName)) {
      nachFeld.set(data.feldName, []);
    }
    nachFeld.get(data.feldName).push({
      pilzId: data.pilzId,
      pilzDaten: data.pilzDaten,
      wert: data.wert
    });
  }
  
  // Map nach Schema-Reihenfolge sortieren
  const sortedNachFeld = new Map();
  const feldNamen = [...nachFeld.keys()].sort((a, b) => {
    const indexA = reihenfolge.indexOf(a);
    const indexB = reihenfolge.indexOf(b);
    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;
    return posA - posB;
  });
  
  for (const feldName of feldNamen) {
    sortedNachFeld.set(feldName, nachFeld.get(feldName));
  }
  
  return sortedNachFeld;
}

/**
 * Prüft ob ein Feld ausgewählt ist
 */
export function istFeldAusgewaehlt(pilzId, feldName) {
  return state.auswahl.has(`${pilzId}:${feldName}`);
}

/**
 * Navigation im Detail-View zwischen Pilzen
 */
export function detailNavigation(richtung) {
  const pilzIds = getAuswahlPilzIds();
  if (pilzIds.length === 0) return null;
  
  let currentIndex = pilzIds.indexOf(state.detailPilzId);
  if (currentIndex === -1) currentIndex = 0;
  
  if (richtung === 'next') {
    currentIndex = (currentIndex + 1) % pilzIds.length;
  } else if (richtung === 'prev') {
    currentIndex = (currentIndex - 1 + pilzIds.length) % pilzIds.length;
  }
  
  state.detailPilzId = pilzIds[currentIndex];
  
  debug.ansichten('Detail Navigation', { 
    richtung, 
    pilzId: state.detailPilzId, 
    index: currentIndex,
    total: pilzIds.length 
  });
  
  return state.detailPilzId;
}

/**
 * Rendert die Detail-Ansicht - zeigt ausgewählte Felder gruppiert nach Pilz
 */
export function renderDetail(container) {
  const nachPilz = getAuswahlNachPilz();
  const pilzIds = [...nachPilz.keys()];
  
  if (pilzIds.length === 0) {
    container.innerHTML = `
      <div class="amorph-ansicht-leer">
        <div class="amorph-ansicht-leer-icon">📋</div>
        <div class="amorph-ansicht-leer-text">Wähle mindestens ein Feld aus<br><small>Klicke auf einzelne Felder in den Karten</small></div>
      </div>
    `;
    return;
  }
  
  // Aktuellen Pilz bestimmen
  if (!state.detailPilzId || !nachPilz.has(state.detailPilzId)) {
    state.detailPilzId = pilzIds[0];
  }
  
  const currentIndex = pilzIds.indexOf(state.detailPilzId);
  const pilzData = nachPilz.get(state.detailPilzId);
  const daten = pilzData.pilzDaten;
  const ausgewaehlteFelder = pilzData.felder;
  
  container.innerHTML = '';
  
  // Navigation Header (nur wenn mehrere Pilze)
  if (pilzIds.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'amorph-detail-nav';
    nav.innerHTML = `
      <button class="amorph-detail-nav-btn prev" ${currentIndex === 0 ? 'disabled' : ''}>←</button>
      <span class="amorph-detail-counter">${currentIndex + 1} / ${pilzIds.length} Pilze</span>
      <button class="amorph-detail-nav-btn next" ${currentIndex === pilzIds.length - 1 ? 'disabled' : ''}>→</button>
    `;
    
    nav.querySelector('.prev')?.addEventListener('click', () => {
      detailNavigation('prev');
      renderDetail(container);
    });
    nav.querySelector('.next')?.addEventListener('click', () => {
      detailNavigation('next');
      renderDetail(container);
    });
    
    container.appendChild(nav);
  }
  
  // Ausgewählte Felder Info
  const info = document.createElement('div');
  info.className = 'amorph-detail-info';
  info.innerHTML = `<span class="amorph-detail-badge">${ausgewaehlteFelder.length} Felder ausgewählt</span>`;
  container.appendChild(info);
  
  // Detail-Card
  const card = document.createElement('div');
  card.className = 'amorph-detail-card';
  
  // Bild wenn ausgewählt (mit fester Höhe!)
  const bildFeld = ausgewaehlteFelder.find(f => f.feldName === 'bild');
  if (bildFeld && bildFeld.wert) {
    const bildContainer = document.createElement('div');
    bildContainer.className = 'amorph-detail-bild';
    bildContainer.style.cssText = 'height: 250px; max-height: 250px; overflow: hidden;';
    const img = document.createElement('img');
    img.src = bildFeld.wert;
    img.alt = daten.name || '';
    img.loading = 'lazy';
    img.style.cssText = 'width: 100%; height: 250px; object-fit: cover;';
    bildContainer.appendChild(img);
    card.appendChild(bildContainer);
  }
  
  // Header mit Name (wenn ausgewählt)
  const nameFeld = ausgewaehlteFelder.find(f => f.feldName === 'name');
  const wissNameFeld = ausgewaehlteFelder.find(f => f.feldName === 'wissenschaftlich');
  
  if (nameFeld || wissNameFeld) {
    const header = document.createElement('div');
    header.className = 'amorph-detail-header';
    header.innerHTML = `
      ${nameFeld ? `<h2 class="amorph-detail-titel">${nameFeld.wert}</h2>` : ''}
      ${wissNameFeld ? `<p class="amorph-detail-subtitel">${wissNameFeld.wert}</p>` : ''}
    `;
    card.appendChild(header);
  } else {
    // Fallback: Pilz-Name aus Daten anzeigen
    const header = document.createElement('div');
    header.className = 'amorph-detail-header';
    header.innerHTML = `<h2 class="amorph-detail-titel">${daten.name || 'Pilz'}</h2>`;
    card.appendChild(header);
  }
  
  // Ausgewählte Felder anzeigen (ohne Bild, Name, wissenschaftlich)
  const felder = document.createElement('div');
  felder.className = 'amorph-detail-felder';
  
  for (const { feldName, wert } of ausgewaehlteFelder) {
    if (['bild', 'name', 'wissenschaftlich'].includes(feldName)) continue;
    
    const feldConfig = getFeldConfig(feldName);
    const label = feldConfig?.label || feldName;
    
    const feld = document.createElement('div');
    feld.className = 'amorph-detail-feld';
    feld.innerHTML = `
      <span class="amorph-detail-label">${label}</span>
      <span class="amorph-detail-wert">${formatWert(wert)}</span>
    `;
    felder.appendChild(feld);
  }
  
  if (felder.children.length > 0) {
    card.appendChild(felder);
  }
  
  container.appendChild(card);
  
  debug.ansichten('Detail gerendert', { 
    pilzId: state.detailPilzId, 
    name: daten.name,
    felderAnzahl: ausgewaehlteFelder.length 
  });
}

/**
 * Rendert die Vergleichs-Ansicht - Pilze als Karten nebeneinander
 */
export function renderVergleich(container) {
  const nachFeld = getAuswahlNachFeld();
  const nachPilz = getAuswahlNachPilz();
  const pilzIds = [...nachPilz.keys()];
  
  if (pilzIds.length < 2) {
    container.innerHTML = `
      <div class="amorph-ansicht-leer">
        <div class="amorph-ansicht-leer-icon">⚖️</div>
        <div class="amorph-ansicht-leer-text">Wähle Felder von mindestens 2 Pilzen<br><small>Klicke auf gleiche Felder bei verschiedenen Pilzen</small></div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  // Info-Badge
  const info = document.createElement('div');
  info.className = 'amorph-vergleich-info';
  info.innerHTML = `<span class="amorph-vergleich-badge">${pilzIds.length} Pilze zum Vergleich</span>`;
  container.appendChild(info);
  
  // Cards-Grid
  const grid = document.createElement('div');
  grid.className = 'amorph-vergleich-grid';
  
  // Eine Card pro Pilz
  for (const [pilzId, pilzData] of nachPilz) {
    const daten = pilzData.pilzDaten;
    const felder = pilzData.felder;
    
    const card = document.createElement('div');
    card.className = 'amorph-vergleich-card';
    
    // Bild (mit fester Höhe!)
    const bildFeld = felder.find(f => f.feldName === 'bild');
    if (bildFeld && bildFeld.wert) {
      const bildDiv = document.createElement('div');
      bildDiv.className = 'amorph-vergleich-card-bild';
      bildDiv.style.cssText = 'height: 180px; overflow: hidden;';
      const img = document.createElement('img');
      img.src = bildFeld.wert;
      img.alt = daten.name || '';
      img.style.cssText = 'width: 100%; height: 180px; object-fit: cover;';
      bildDiv.appendChild(img);
      card.appendChild(bildDiv);
    }
    
    // Name
    const nameEl = document.createElement('h3');
    nameEl.className = 'amorph-vergleich-card-name';
    nameEl.textContent = daten.name || 'Pilz';
    card.appendChild(nameEl);
    
    // Felder
    const felderDiv = document.createElement('div');
    felderDiv.className = 'amorph-vergleich-card-felder';
    
    for (const { feldName, wert } of felder) {
      if (['bild', 'name', 'wissenschaftlich'].includes(feldName)) continue;
      
      const feldConfig = getFeldConfig(feldName);
      const label = feldConfig?.label || feldName;
      
      felderDiv.innerHTML += `
        <div class="amorph-vergleich-card-feld">
          <span class="amorph-vergleich-card-label">${label}</span>
          <span class="amorph-vergleich-card-wert">${formatWert(wert)}</span>
        </div>
      `;
    }
    
    card.appendChild(felderDiv);
    grid.appendChild(card);
  }
  
  container.appendChild(grid);
  
  debug.ansichten('Vergleich gerendert', { 
    pilzeAnzahl: pilzIds.length
  });
}

/**
 * Hilfsfunktion: Wert formatieren
 */
function formatWert(wert) {
  if (wert === null || wert === undefined) return '';
  if (Array.isArray(wert)) return wert.join(', ');
  if (typeof wert === 'object') {
    if ('min' in wert && 'max' in wert) {
      return `${wert.min}–${wert.max}${wert.einheit ? ' ' + wert.einheit : ''}`;
    }
    return JSON.stringify(wert);
  }
  return String(wert);
}

/**
 * Feature Init
 * 
 * Ansichten verwaltet nur den Auswahl-State.
 * Die eigentlichen Views (Detail, Vergleich) sind separate Features.
 */
export default function init(ctx) {
  debug.ansichten('Ansichten Feature Init (nur Auswahl-State)');
  
  // Ansichten-Liste aus Config laden (statt hardcoded)
  const ansichtConfig = ctx.config?.ansicht || ctx.config || {};
  const erlaubteAnsichten = (ansichtConfig.ansichten || []).map(a => a.id || a);
  // Fallback wenn keine Config
  const ansichtenListe = erlaubteAnsichten.length > 0 
    ? erlaubteAnsichten 
    : ['karten', 'detail', 'vergleich'];
  
  debug.ansichten('Erlaubte Ansichten aus Config', { ansichten: ansichtenListe });
  
  // Auf Ansicht-Wechsel hören und State aktualisieren
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    const neueAnsicht = e.detail?.ansicht;
    if (neueAnsicht && ansichtenListe.includes(neueAnsicht)) {
      setAktiveAnsicht(neueAnsicht);
      debug.ansichten('Ansicht-State aktualisiert', { aktiveAnsicht: neueAnsicht });
    }
  });
  
  // Dieses Feature verwaltet nur den Auswahl-State.
  // Die Detail- und Vergleich-Views werden von ihren eigenen Features gehandhabt.
  // Der Ansicht-Switch im Header sendet 'amorph:ansicht-wechsel' Events,
  // auf die die detail/ und vergleich/ Features reagieren.
  
  ctx.mount();
}


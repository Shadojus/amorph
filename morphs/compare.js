/**
 * 🔄 COMPARE MORPHS - Vergleichs-Visualisierungen
 * 
 * Spezialisierte Morphs für Detail/Vergleich-Ansichten
 * Zeigen mehrere Werte desselben Feldes nebeneinander
 * 
 * Mobile-first: Kompakt, lateral, touch-freundlich
 */

import { debug } from '../observer/debug.js';

// Pilz-Farben für konsistente Zuordnung
const FARBEN = [
  '#e8b04a', '#60c090', '#d06080', '#5aa0d8', 
  '#a080d0', '#d0a050', '#50b0b0', '#d08050'
];

/**
 * Erstellt Farbzuordnung für Pilze
 */
export function erstelleFarben(pilzIds) {
  const farben = new Map();
  pilzIds.forEach((id, i) => {
    // IDs können strings oder numbers sein - normalisieren
    const normalizedId = String(id);
    farben.set(normalizedId, FARBEN[i % FARBEN.length]);
    debug.morphs('Farbe zugewiesen', { id: normalizedId, farbe: FARBEN[i % FARBEN.length] });
  });
  return farben;
}

/**
 * COMPARE BAR - Horizontale Balken für numerische Vergleiche
 * 
 * Perfekt für: bewertung, beliebtheit, temperatur, progress-Werte
 * 
 * @param {Array<{pilzId, pilzName, wert, farbe}>} items
 * @param {Object} config - {max, einheit, label}
 */
export function compareBar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  // Max-Wert ermitteln
  const werte = items.map(i => {
    if (typeof i.wert === 'object' && 'min' in i.wert) {
      return (i.wert.min + i.wert.max) / 2;
    }
    return Number(i.wert) || 0;
  });
  const maxWert = config.max || Math.max(...werte, 1);
  
  // Label
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Balken
  const bars = document.createElement('div');
  bars.className = 'compare-bars';
  
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'compare-bar-row';
    
    // Wert berechnen - komplexe Objekte richtig formatieren
    let displayWert, numWert;
    if (Array.isArray(item.wert)) {
      // Array von Objekten [{label, value, unit}] oder [{date, event}]
      displayWert = item.wert.map(v => {
        if (v.label && v.value !== undefined) return `${v.label}: ${v.value}${v.unit || ''}`;
        if (v.date && v.event) return `${v.event}`;
        return String(v);
      }).join(', ');
      numWert = item.wert.reduce((sum, v) => sum + (Number(v.value) || 0), 0);
    } else if (typeof item.wert === 'object' && item.wert !== null) {
      if ('min' in item.wert) {
        numWert = (item.wert.min + item.wert.max) / 2;
        displayWert = `${item.wert.min}–${item.wert.max}`;
      } else {
        // Generisches Objekt
        displayWert = Object.entries(item.wert).map(([k, v]) => `${k}: ${v}`).join(', ');
        numWert = 0;
      }
    } else {
      numWert = Number(item.wert) || 0;
      displayWert = String(item.wert);
    }
    
    const pct = Math.min(100, (numWert / maxWert) * 100);
    
    row.innerHTML = `
      <span class="bar-name" style="color:${item.farbe}">${item.pilzName}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;background:${item.farbe}"></div>
      </div>
      <span class="bar-wert">${displayWert}${config.einheit || ''}</span>
    `;
    
    bars.appendChild(row);
  });
  
  el.appendChild(bars);
  return el;
}

/**
 * COMPARE RATING - Sterne-Vergleich
 * 
 * Perfekt für: bewertung
 */
export function compareRating(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-rating';
  
  const max = config.max || config.maxStars || 5;
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const rows = document.createElement('div');
  rows.className = 'compare-rows';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-rating-row';
    
    const filled = Math.round(Number(item.wert) || 0);
    const stars = Array(max).fill(0).map((_, i) => 
      `<span class="star ${i < filled ? 'filled' : ''}">${i < filled ? '★' : '☆'}</span>`
    ).join('');
    
    row.innerHTML = `
      <span class="rating-name" style="color:${item.farbe}">${item.pilzName}</span>
      <div class="rating-stars">${stars}</div>
      <span class="rating-wert">${item.wert}</span>
    `;
    
    rows.appendChild(row);
  });
  
  el.appendChild(rows);
  return el;
}

/**
 * COMPARE TAG - Chip-Vergleich für kategorische Daten
 * 
 * Perfekt für: essbarkeit, saison, verfuegbarkeit
 * Nutzt Schema-Farben für Kategorien (essbar: grün, giftig: rot, etc.)
 */
export function compareTag(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-tag';
  
  console.log('%c[COMPARE-TAG] 🏷️ Tag-Morph erstellen', 'background:#d06080;color:white;padding:2px 6px;border-radius:3px', {
    itemsAnzahl: items.length,
    label: config.label,
    schemaFarben: config.farben,
    perspektiveFarben: config.perspektiveFarben
  });
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const chips = document.createElement('div');
  chips.className = 'compare-chips';
  
  // Gruppiere nach Wert
  const nachWert = new Map();
  items.forEach(item => {
    const key = String(item.wert || '').toLowerCase();
    if (!nachWert.has(key)) {
      nachWert.set(key, { wert: item.wert, pilze: [] });
    }
    nachWert.get(key).pilze.push(item);
  });
  
  nachWert.forEach(({wert, pilze}) => {
    const chip = document.createElement('div');
    chip.className = 'compare-chip';
    
    // Farbe aus Schema-Config (z.B. essbarkeit.farben.essbar)
    // Fallback: erste Pilz-Farbe oder grau
    const wertKey = String(wert || '').toLowerCase();
    const tagFarbe = config.farben?.[wertKey] || pilze[0]?.farbe || '#666';
    
    console.log('%c[COMPARE-TAG] Chip-Farbe', 'background:#808080;color:white;padding:2px 4px;border-radius:3px', {
      wert,
      wertKey,
      gefundeneFarbe: config.farben?.[wertKey],
      verwendeteFarbe: tagFarbe
    });
    
    chip.innerHTML = `
      <span class="chip-wert" style="background:${tagFarbe}">${wert || '–'}</span>
      <span class="chip-pilze">${pilze.map(p => 
        `<span style="color:${p.farbe}">${p.pilzName}</span>`
      ).join(', ')}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

/**
 * COMPARE LIST - Listen-Vergleich mit Overlap-Anzeige
 * 
 * Perfekt für: standort, geschmack, verwechslung
 */
export function compareList(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-list';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle einzigartigen Werte sammeln und zählen wer sie hat
  const alleWerte = new Map();
  items.forEach(item => {
    const liste = Array.isArray(item.wert) ? item.wert : [item.wert];
    liste.forEach(v => {
      if (!alleWerte.has(v)) {
        alleWerte.set(v, []);
      }
      alleWerte.get(v).push(item);
    });
  });
  
  const container = document.createElement('div');
  container.className = 'compare-list-items';
  
  // Sortiere: Gemeinsame zuerst
  const sorted = [...alleWerte.entries()].sort((a, b) => b[1].length - a[1].length);
  
  sorted.forEach(([wert, pilze]) => {
    const row = document.createElement('div');
    row.className = 'compare-list-item';
    
    // Gemeinsam = highlight
    if (pilze.length > 1) {
      row.classList.add('gemeinsam');
    }
    
    const dots = pilze.map(p => 
      `<span class="pilz-dot" style="background:${p.farbe}" title="${p.pilzName}"></span>`
    ).join('');
    
    row.innerHTML = `
      <span class="list-wert">${wert}</span>
      <span class="list-pilze">${dots}</span>
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE IMAGE - Bildergalerie-Vergleich
 * 
 * Perfekt für: bild
 */
export function compareImage(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-image';
  
  const gallery = document.createElement('div');
  gallery.className = 'compare-gallery';
  
  items.forEach(item => {
    if (!item.wert) return;
    
    const imgWrap = document.createElement('div');
    imgWrap.className = 'compare-img-wrap';
    imgWrap.style.borderColor = item.farbe;
    
    imgWrap.innerHTML = `
      <img src="${item.wert}" alt="${item.pilzName}" loading="lazy">
      <span class="img-label" style="background:${item.farbe}">${item.pilzName}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

/**
 * COMPARE RADAR - Überlappende Radar-Charts
 * 
 * Perfekt für: profil (multi-dimensionale Daten)
 */
export function compareRadar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar';
  
  if (items.length === 0 || !items[0]?.wert) {
    el.innerHTML = '<div class="compare-leer">Keine Profil-Daten</div>';
    return el;
  }
  
  // Achsen aus erstem Item
  const firstWert = items[0].wert;
  const achsen = Array.isArray(firstWert) 
    ? firstWert.map(a => a.axis || a.label || a.name)
    : Object.keys(firstWert);
  
  if (achsen.length < 3) {
    // Fallback zu kompakter Darstellung
    return compareRadarCompact(items, config);
  }
  
  // SVG erstellen
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'compare-radar-svg');
  
  // Grid
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const points = achsen.map((_, i) => {
      const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'radar-grid');
    svg.appendChild(polygon);
  }
  
  // Achsen-Linien mit Beschriftung
  achsen.forEach((achse, i) => {
    const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + Math.cos(angle) * radius);
    line.setAttribute('y2', cy + Math.sin(angle) * radius);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);
    
    // Achsen-Beschriftung
    const labelR = radius + 12;
    const labelX = cx + Math.cos(angle) * labelR;
    const labelY = cy + Math.sin(angle) * labelR;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', labelY);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = achse;
    svg.appendChild(text);
  });
  
  // Daten-Shapes für jeden Pilz
  items.forEach(item => {
    const werte = normalisiereRadarWerte(item.wert, achsen);
    const points = achsen.map((achse, i) => {
      const val = werte[achse] || 0;
      const r = (val / 100) * radius;
      const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'radar-shape');
    polygon.setAttribute('style', `stroke:${item.farbe};fill:${item.farbe}`);
    svg.appendChild(polygon);
  });
  
  el.appendChild(svg);
  
  // Legende
  const legende = document.createElement('div');
  legende.className = 'compare-legende';
  items.forEach(item => {
    legende.innerHTML += `
      <span class="legende-item">
        <span class="legende-dot" style="background:${item.farbe}"></span>
        ${item.pilzName}
      </span>
    `;
  });
  el.appendChild(legende);
  
  return el;
}

/**
 * Kompakte Radar-Alternative für wenige Achsen
 */
function compareRadarCompact(items, config) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar-compact';
  
  // Alle Achsen sammeln
  const alleAchsen = new Set();
  items.forEach(item => {
    const wert = item.wert;
    if (Array.isArray(wert)) {
      wert.forEach(a => alleAchsen.add(a.axis || a.label || a.name));
    } else if (typeof wert === 'object') {
      Object.keys(wert).forEach(k => alleAchsen.add(k));
    }
  });
  
  [...alleAchsen].forEach(achse => {
    const row = document.createElement('div');
    row.className = 'radar-compact-row';
    row.innerHTML = `<span class="radar-achse">${achse}</span>`;
    
    const bars = document.createElement('div');
    bars.className = 'radar-compact-bars';
    
    items.forEach(item => {
      const werte = normalisiereRadarWerte(item.wert, [achse]);
      const val = werte[achse] || 0;
      
      bars.innerHTML += `
        <div class="radar-mini-bar" style="width:${val}%;background:${item.farbe}" title="${item.pilzName}: ${val}"></div>
      `;
    });
    
    row.appendChild(bars);
    el.appendChild(row);
  });
  
  return el;
}

function normalisiereRadarWerte(wert, achsen) {
  const result = {};
  
  if (Array.isArray(wert)) {
    wert.forEach(item => {
      const key = item.axis || item.label || item.name;
      result[key] = item.value || item.score || 0;
    });
  } else if (typeof wert === 'object') {
    Object.assign(result, wert);
  }
  
  return result;
}

/**
 * COMPARE PIE - Nebeneinander Pie-Charts
 * 
 * Perfekt für: naehrwerte
 */
export function comparePie(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pie';
  
  const container = document.createElement('div');
  container.className = 'compare-pie-container';
  
  items.forEach(item => {
    const pieWrap = document.createElement('div');
    pieWrap.className = 'compare-pie-wrap';
    
    // Pilz-Name
    pieWrap.innerHTML = `<div class="pie-pilz" style="color:${item.farbe}">${item.pilzName}</div>`;
    
    // Mini-Pie erstellen
    const pieData = typeof item.wert === 'object' && !Array.isArray(item.wert) 
      ? Object.entries(item.wert).map(([k, v]) => ({ label: k, value: v }))
      : item.wert;
    
    if (!pieData || (Array.isArray(pieData) && pieData.length === 0)) {
      pieWrap.innerHTML += '<div class="pie-leer">–</div>';
    } else {
      pieWrap.appendChild(erstelleMiniPie(pieData));
    }
    
    container.appendChild(pieWrap);
  });
  
  el.appendChild(container);
  return el;
}

function erstelleMiniPie(data) {
  const size = 60;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'mini-pie-svg');
  
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  
  const total = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0);
  const pieColors = ['#60c090', '#5aa0d8', '#e8b04a', '#d06080', '#a080d0'];
  
  let currentAngle = -Math.PI / 2;
  
  data.forEach((d, i) => {
    const value = d.value || d.count || 0;
    const angle = (value / total) * Math.PI * 2;
    
    const x1 = cx + Math.cos(currentAngle) * r;
    const y1 = cy + Math.sin(currentAngle) * r;
    const x2 = cx + Math.cos(currentAngle + angle) * r;
    const y2 = cy + Math.sin(currentAngle + angle) * r;
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', pieColors[i % pieColors.length]);
    path.setAttribute('class', 'pie-slice');
    
    // Tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${d.label || d.name}: ${value}`;
    path.appendChild(title);
    
    svg.appendChild(path);
    currentAngle += angle;
  });
  
  return svg;
}

/**
 * COMPARE TEXT - Einfacher Text-Vergleich
 * 
 * Fallback für: beschreibung, zubereitung, etc.
 */
export function compareText(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-text';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const rows = document.createElement('div');
  rows.className = 'compare-text-rows';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-text-row';
    
    // Komplexe Werte richtig formatieren
    let displayWert;
    if (Array.isArray(item.wert)) {
      // Array von Objekten
      displayWert = item.wert.map(v => {
        if (v.label && v.value !== undefined) return `${v.label}: ${v.value}${v.unit || ''}`;
        if (v.date && v.event) return `${v.date}: ${v.event}`;
        if (v.axis && v.value !== undefined) return `${v.axis}: ${v.value}`;
        return String(v);
      }).join(' · ');
    } else if (typeof item.wert === 'object' && item.wert !== null) {
      displayWert = Object.entries(item.wert).map(([k, v]) => `${k}: ${v}`).join(' · ');
    } else {
      displayWert = item.wert || '–';
    }
    
    row.innerHTML = `
      <span class="text-pilz" style="border-color:${item.farbe}">${item.pilzName}</span>
      <span class="text-wert">${displayWert}</span>
    `;
    rows.appendChild(row);
  });

  el.appendChild(rows);
  return el;
}

/**
 * COMPARE WIRKSTOFFE - Spezialisiert für [{label, value, unit}]
 */
export function compareWirkstoffe(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-wirkstoffe';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle Wirkstoffe sammeln
  const alleWirkstoffe = new Map();
  items.forEach(item => {
    if (!Array.isArray(item.wert)) return;
    item.wert.forEach(w => {
      const key = w.label || w.name;
      if (!alleWirkstoffe.has(key)) {
        alleWirkstoffe.set(key, { label: key, unit: w.unit || '', werte: [] });
      }
      alleWirkstoffe.get(key).werte.push({
        pilz: item.pilzName,
        farbe: item.farbe,
        value: w.value
      });
    });
  });
  
  const container = document.createElement('div');
  container.className = 'wirkstoffe-container';
  
  alleWirkstoffe.forEach(({label, unit, werte}) => {
    const row = document.createElement('div');
    row.className = 'wirkstoffe-row';
    
    const labelEl = document.createElement('span');
    labelEl.className = 'wirkstoffe-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);
    
    const barContainer = document.createElement('div');
    barContainer.className = 'wirkstoffe-bars';
    
    const maxVal = Math.max(...werte.map(w => Number(w.value) || 0), 1);
    
    werte.forEach(({pilz, farbe, value}) => {
      const pct = Math.min(100, (Number(value) / maxVal) * 100);
      const bar = document.createElement('div');
      bar.className = 'wirkstoffe-bar';
      bar.innerHTML = `
        <div class="bar-fill" style="width:${pct}%;background:${farbe}" title="${pilz}"></div>
        <span class="bar-value">${value}${unit}</span>
      `;
      barContainer.appendChild(bar);
    });
    
    row.appendChild(barContainer);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE TIMELINE - Spezialisiert für [{date, event}]
 */
export function compareTimeline(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-timeline';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  const container = document.createElement('div');
  container.className = 'timeline-container';
  
  items.forEach(item => {
    const pilzRow = document.createElement('div');
    pilzRow.className = 'timeline-pilz';
    
    const pilzLabel = document.createElement('div');
    pilzLabel.className = 'timeline-pilz-name';
    pilzLabel.style.color = item.farbe;
    pilzLabel.textContent = item.pilzName;
    pilzRow.appendChild(pilzLabel);
    
    const events = document.createElement('div');
    events.className = 'timeline-events';
    
    if (Array.isArray(item.wert)) {
      item.wert.forEach(evt => {
        const eventEl = document.createElement('span');
        eventEl.className = 'timeline-event';
        eventEl.style.borderColor = item.farbe;
        eventEl.innerHTML = `<span class="event-date">${evt.date || ''}</span> ${evt.event || evt.label || ''}`;
        events.appendChild(eventEl);
      });
    }
    
    pilzRow.appendChild(events);
    container.appendChild(pilzRow);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * HAUPT-EXPORT: Wählt automatisch den richtigen Compare-Morph
 * 
 * Priorität:
 * 1. Explizit übergebener `typ` (von Perspektiven-Config)
 * 2. Feld-spezifische Handler (für spezielle Felder wie bild, profil)
 * 3. Schema-Typ basierte Handler
 * 4. Fallback zu Text
 * 
 * @param {string} feldName - Name des Feldes
 * @param {string} typ - Schema-Typ oder Perspektiven-Typ (rating, progress, tag, list, etc.)
 * @param {Array} items - [{pilzId, pilzName, wert, farbe}]
 * @param {Object} config - Feld-Config aus Schema + Perspektiven-Config
 */
export function compareMorph(feldName, typ, items, config = {}) {
  console.log('%c[COMPARE-MORPH] compareMorph aufgerufen', 'background:#e86080;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', {
    feldName,
    typ,
    itemsAnzahl: items.length,
    perspektive: config.perspektive,
    label: config.label,
    hatFarben: !!config.farben
  });
  debug.morphs('compareMorph', { feldName, typ, items: items.length, perspektive: config.perspektive });
  
  // Typ-basierte Handler (höchste Priorität - erlaubt Perspektiven-Override)
  const typHandler = {
    rating: () => compareRating(items, config),
    progress: () => compareBar(items, { ...config, max: 100 }),
    number: () => compareBar(items, config),
    range: () => compareBar(items, config),
    tag: () => compareTag(items, config),
    badge: () => compareTag(items, config),
    list: () => compareList(items, config),
    image: () => compareImage(items, config),
    radar: () => compareRadar(items, config),
    pie: () => comparePie(items, config),
    bar: () => compareBar(items, config),
    stats: () => compareBar(items, config),
    timeline: () => compareTimeline(items, config),
    wirkstoffe: () => compareWirkstoffe(items, config),
    text: () => compareText(items, config),
  };
  
  // Wenn Perspektive einen Typ definiert hat → diesen nutzen
  if (config.perspektive && typHandler[typ]) {
    console.log('%c[COMPARE-MORPH] ★ PERSPEKTIVEN-OVERRIDE aktiv!', 'background:#a855f7;color:white;padding:4px 8px;border-radius:3px;font-weight:bold;font-size:12px', {
      feldName,
      typ,
      perspektive: config.perspektive,
      verwendeterHandler: typ
    });
    debug.morphs('Perspektiven-Morph', { feldName, typ, perspektive: config.perspektive });
    return typHandler[typ]();
  }
  
  // Feld-spezifische Handler (Standard-Darstellung ohne Perspektive)
  const feldHandler = {
    bild: () => compareImage(items, config),
    profil: () => compareRadar(items, config),
    naehrwerte: () => comparePie(items, config),
    bewertung: () => compareRating(items, config),
    zubereitung: () => compareTag(items, config),
    wirkstoffe: () => compareWirkstoffe(items, config),
    lebenszyklus: () => compareTimeline(items, config),
  };
  
  if (feldHandler[feldName]) {
    console.log('%c[COMPARE-MORPH] Feld-Handler verwendet', 'background:#5cc98a;color:white;padding:2px 6px;border-radius:3px', {
      feldName,
      handler: feldName
    });
    return feldHandler[feldName]();
  }
  
  // Typ-basierte Handler (für alle anderen Felder)
  if (typHandler[typ]) {
    console.log('%c[COMPARE-MORPH] Typ-Handler verwendet', 'background:#5aa0d8;color:white;padding:2px 6px;border-radius:3px', {
      feldName,
      typ
    });
    return typHandler[typ]();
  }
  
  // Fallback
  return compareText(items, config);
}

export default {
  erstelleFarben,
  compareMorph,
  compareBar,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareWirkstoffe,
  compareTimeline
};

/**
 * COMPARE MORPHS - Generische Vergleichs-Wrapper
 * 
 * Diese Morphs wrappen die Primitives für Vergleichs-Darstellung.
 * Sie erhalten Arrays von Items und stellen sie vergleichbar dar.
 * 
 * DATENGETRIEBEN: Typ wird aus Datenstruktur erkannt, nicht aus Feldnamen!
 * 
 * LATERAL THINKING:
 * - Radar-Charts: ÜBERLAGERT, nicht nebeneinander
 * - Ranges: Auf gemeinsamer Skala mit Überlappungs-Highlight
 * - Stats: Als Box-Plots oder Range-Bars
 * - Progress: Als vergleichende Balken mit Differenz-Anzeige
 */

import { debug } from '../../observer/debug.js';
import { detectType, createSection } from './base.js';

// Primitive Morphs für Single-Item Rendering
import { 
  bar, radar, pie, rating, progress, stats, 
  tag, badge, list, range, timeline, image 
} from '../primitives/index.js';

/**
 * COMPARE BAR - Horizontale Balken für numerische Vergleiche
 * 
 * @param {Array} items - [{id, name, wert, farbe}]
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
  
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'compare-bar-row';
    
    let numWert = typeof item.wert === 'object' && 'min' in item.wert
      ? (item.wert.min + item.wert.max) / 2
      : Number(item.wert) || 0;
    
    const displayWert = typeof item.wert === 'object' && 'min' in item.wert
      ? `${item.wert.min}–${item.wert.max}`
      : String(item.wert);
    
    const pct = Math.min(100, (numWert / maxWert) * 100);
    
    row.innerHTML = `
      <span class="bar-name" style="color:${item.farbe}">${item.name}</span>
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
 * COMPARE BAR GROUP - Für Arrays von Bar-Objekten (z.B. Wirkstoffe)
 * Jedes Item hat einen Array von {label, value, unit}
 * Zeigt gruppierte Balken pro Label, vergleicht Items side-by-side
 */
export function compareBarGroup(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bar-group';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle Labels sammeln (z.B. alle Wirkstoffe)
  const alleLabels = new Map(); // label -> [{item, value, unit}]
  
  items.forEach(item => {
    const arr = item.wert;
    if (!Array.isArray(arr)) return;
    
    arr.forEach(entry => {
      const lbl = entry.label || entry.name || 'Unbekannt';
      if (!alleLabels.has(lbl)) {
        alleLabels.set(lbl, []);
      }
      alleLabels.get(lbl).push({
        item,
        value: entry.value,
        unit: entry.unit || ''
      });
    });
  });
  
  // Globales Maximum pro Label ermitteln
  const container = document.createElement('div');
  container.className = 'bar-group-container';
  
  alleLabels.forEach((entries, lbl) => {
    const group = document.createElement('div');
    group.className = 'bar-group';
    
    const maxVal = Math.max(...entries.map(e => e.value || 0), 1);
    const unit = entries[0]?.unit || '';
    
    // Label-Header
    const header = document.createElement('div');
    header.className = 'bar-group-label';
    header.textContent = lbl;
    group.appendChild(header);
    
    // Bars für jeden Item
    const barsWrap = document.createElement('div');
    barsWrap.className = 'bar-group-bars';
    
    entries.forEach(entry => {
      const pct = Math.min(100, (entry.value / maxVal) * 100);
      const bar = document.createElement('div');
      bar.className = 'bar-group-bar';
      bar.innerHTML = `
        <span class="bar-name" style="color:${entry.item.farbe}">${entry.item.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${entry.item.farbe}"></div>
        </div>
        <span class="bar-wert">${entry.value}${unit}</span>
      `;
      barsWrap.appendChild(bar);
    });
    
    group.appendChild(barsWrap);
    container.appendChild(group);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE RATING - Sterne-Vergleich
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
      <span class="rating-name" style="color:${item.farbe}">${item.name}</span>
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
 */
export function compareTag(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-tag';
  
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
      nachWert.set(key, { wert: item.wert, items: [] });
    }
    nachWert.get(key).items.push(item);
  });
  
  nachWert.forEach(({ wert, items: gruppeItems }) => {
    const chip = document.createElement('div');
    chip.className = 'compare-chip';
    
    const wertKey = String(wert || '').toLowerCase();
    const tagFarbe = config.farben?.[wertKey] || gruppeItems[0]?.farbe || '#666';
    
    chip.innerHTML = `
      <span class="chip-wert" style="background:${tagFarbe}">${wert || '–'}</span>
      <span class="chip-items">${gruppeItems.map(p => 
        `<span style="color:${p.farbe}">${p.name}</span>`
      ).join(', ')}</span>
    `;
    
    chips.appendChild(chip);
  });
  
  el.appendChild(chips);
  return el;
}

/**
 * COMPARE LIST - Listen-Vergleich mit Overlap-Anzeige
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
  
  // Alle einzigartigen Werte sammeln
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
  
  sorted.forEach(([wert, ownerItems]) => {
    const row = document.createElement('div');
    row.className = 'compare-list-item';
    
    if (ownerItems.length > 1) {
      row.classList.add('gemeinsam');
    }
    
    const dots = ownerItems.map(p => 
      `<span class="item-dot" style="background:${p.farbe}" title="${p.name}"></span>`
    ).join('');
    
    row.innerHTML = `
      <span class="list-wert">${wert}</span>
      <span class="list-items">${dots}</span>
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE IMAGE - Bildergalerie
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
      <img src="${item.wert}" alt="${item.name}" loading="lazy">
      <span class="img-label" style="background:${item.farbe}">${item.name}</span>
    `;
    
    gallery.appendChild(imgWrap);
  });
  
  el.appendChild(gallery);
  return el;
}

/**
 * COMPARE RADAR - Überlappende Radar-Charts
 */
export function compareRadar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar';
  
  if (!items.length || !items[0]?.wert) {
    el.innerHTML = '<div class="compare-leer">Keine Profil-Daten</div>';
    return el;
  }
  
  // Achsen aus erstem Item
  const firstWert = items[0].wert;
  const achsen = Array.isArray(firstWert) 
    ? firstWert.map(a => a.axis || a.label || a.name)
    : Object.keys(firstWert);
  
  if (achsen.length < 3) {
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
  
  // Achsen-Linien
  achsen.forEach((achse, i) => {
    const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + Math.cos(angle) * radius);
    line.setAttribute('y2', cy + Math.sin(angle) * radius);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);
    
    // Label
    const labelR = radius + 12;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx + Math.cos(angle) * labelR);
    text.setAttribute('y', cy + Math.sin(angle) * labelR);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = achse;
    svg.appendChild(text);
  });
  
  // Daten-Shapes für jeden Item
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
        ${item.name}
      </span>
    `;
  });
  el.appendChild(legende);
  
  return el;
}

function compareRadarCompact(items, config) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar-compact';
  
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
        <div class="radar-mini-bar" style="width:${val}%;background:${item.farbe}" title="${item.name}: ${val}"></div>
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
 */
export function comparePie(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pie';
  
  const container = document.createElement('div');
  container.className = 'compare-pie-container';
  
  items.forEach(item => {
    const pieWrap = document.createElement('div');
    pieWrap.className = 'compare-pie-wrap';
    
    pieWrap.innerHTML = `<div class="pie-name" style="color:${item.farbe}">${item.name}</div>`;
    
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
  const pieColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
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
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${d.label || d.name}: ${value}`;
    path.appendChild(title);
    
    svg.appendChild(path);
    currentAngle += angle;
  });
  
  return svg;
}

/**
 * COMPARE TEXT - Einfacher Text-Vergleich (Fallback)
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
    
    let displayWert;
    if (Array.isArray(item.wert)) {
      displayWert = item.wert.map(v => {
        if (v.label && v.value !== undefined) return `${v.label}: ${v.value}${v.unit || ''}`;
        if (v.date && v.event) return `${v.date}: ${v.event}`;
        return String(v);
      }).join(' · ');
    } else if (typeof item.wert === 'object' && item.wert !== null) {
      displayWert = Object.entries(item.wert).map(([k, v]) => `${k}: ${v}`).join(' · ');
    } else {
      displayWert = item.wert || '–';
    }
    
    row.innerHTML = `
      <span class="text-name" style="border-color:${item.farbe}">${item.name}</span>
      <span class="text-wert">${displayWert}</span>
    `;
    rows.appendChild(row);
  });

  el.appendChild(rows);
  return el;
}

/**
 * COMPARE TIMELINE - Timeline-Vergleich
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
    const row = document.createElement('div');
    row.className = 'timeline-row';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'timeline-name';
    nameEl.style.color = item.farbe;
    nameEl.textContent = item.name;
    row.appendChild(nameEl);
    
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
    
    row.appendChild(events);
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE STATS - Box-Plot Style Statistik-Vergleich
 * Zeigt min/max als Range, avg als Marker, optional count
 */
export function compareStats(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stats';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Globale Grenzen ermitteln
  let globalMin = Infinity, globalMax = -Infinity;
  items.forEach(item => {
    const s = item.wert;
    if (s?.min !== undefined) globalMin = Math.min(globalMin, s.min);
    if (s?.max !== undefined) globalMax = Math.max(globalMax, s.max);
  });
  
  const range = globalMax - globalMin || 1;
  const container = document.createElement('div');
  container.className = 'stats-container';
  
  items.forEach(item => {
    const s = item.wert;
    if (!s?.min || !s?.max) return;
    
    const row = document.createElement('div');
    row.className = 'stats-row';
    
    const leftPct = ((s.min - globalMin) / range) * 100;
    const widthPct = ((s.max - s.min) / range) * 100;
    const avgPct = s.avg !== undefined ? ((s.avg - globalMin) / range) * 100 : null;
    
    row.innerHTML = `
      <span class="stats-name" style="color:${item.farbe}">${item.name}</span>
      <div class="stats-track">
        <div class="stats-range" style="left:${leftPct}%;width:${widthPct}%;background:${item.farbe}20;border-color:${item.farbe}">
          ${avgPct !== null ? `<div class="stats-avg" style="left:${((s.avg - s.min) / (s.max - s.min)) * 100}%;background:${item.farbe}"></div>` : ''}
        </div>
      </div>
      <span class="stats-values">
        <span class="stats-min">${s.min}</span>
        ${s.avg !== undefined ? `<span class="stats-avg-label">⌀${s.avg}</span>` : ''}
        <span class="stats-max">${s.max}</span>
        ${s.count !== undefined ? `<span class="stats-count">(n=${s.count})</span>` : ''}
      </span>
    `;
    
    container.appendChild(row);
  });
  
  // Skala
  const scale = document.createElement('div');
  scale.className = 'stats-scale';
  scale.innerHTML = `
    <span>${globalMin}${config.einheit || ''}</span>
    <span>${globalMax}${config.einheit || ''}</span>
  `;
  
  el.appendChild(container);
  el.appendChild(scale);
  return el;
}

/**
 * COMPARE PROGRESS - Fortschritts-Balken mit Differenz-Anzeige
 * Zeigt Prozentwerte mit visuellem Vergleich
 */
export function compareProgress(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-progress';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Sortiere nach Wert für Ranking
  const sorted = [...items].sort((a, b) => (Number(b.wert) || 0) - (Number(a.wert) || 0));
  const maxVal = Math.max(...items.map(i => Number(i.wert) || 0), config.max || 100);
  const leader = sorted[0];
  
  const container = document.createElement('div');
  container.className = 'progress-container';
  
  sorted.forEach((item, idx) => {
    const val = Number(item.wert) || 0;
    const pct = (val / maxVal) * 100;
    const diff = leader && idx > 0 ? val - Number(leader.wert) : null;
    
    const row = document.createElement('div');
    row.className = 'progress-row';
    if (idx === 0) row.classList.add('leader');
    
    row.innerHTML = `
      <span class="progress-rank">${idx + 1}</span>
      <span class="progress-name" style="color:${item.farbe}">${item.name}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%;background:${item.farbe}"></div>
      </div>
      <span class="progress-value">${val}${config.einheit || '%'}</span>
      ${diff !== null ? `<span class="progress-diff" style="color:${diff >= 0 ? '#60c090' : '#d06080'}">${diff >= 0 ? '+' : ''}${diff}</span>` : ''}
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE BOOLEAN - Ja/Nein Vergleich mit Gruppierung
 */
export function compareBoolean(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-boolean';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Gruppiere nach Wert
  const jaItems = items.filter(i => i.wert === true || i.wert === 'ja' || i.wert === 'yes');
  const neinItems = items.filter(i => i.wert === false || i.wert === 'nein' || i.wert === 'no' || !i.wert);
  
  const container = document.createElement('div');
  container.className = 'boolean-container';
  
  if (jaItems.length > 0) {
    const jaGroup = document.createElement('div');
    jaGroup.className = 'boolean-group ja';
    jaGroup.innerHTML = `
      <span class="boolean-icon">✓</span>
      <span class="boolean-items">${jaItems.map(i => 
        `<span class="boolean-item" style="color:${i.farbe}">${i.name}</span>`
      ).join('')}</span>
    `;
    container.appendChild(jaGroup);
  }
  
  if (neinItems.length > 0) {
    const neinGroup = document.createElement('div');
    neinGroup.className = 'boolean-group nein';
    neinGroup.innerHTML = `
      <span class="boolean-icon">✗</span>
      <span class="boolean-items">${neinItems.map(i => 
        `<span class="boolean-item" style="color:${i.farbe}">${i.name}</span>`
      ).join('')}</span>
    `;
    container.appendChild(neinGroup);
  }
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE OBJECT - Generischer Objekt-Vergleich als Tabelle
 */
export function compareObject(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-object';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Alle Keys sammeln
  const allKeys = new Set();
  items.forEach(item => {
    if (typeof item.wert === 'object' && item.wert !== null) {
      Object.keys(item.wert).forEach(k => allKeys.add(k));
    }
  });
  
  if (allKeys.size === 0) {
    el.innerHTML += '<div class="compare-leer">Keine Daten</div>';
    return el;
  }
  
  // Tabelle erstellen
  const table = document.createElement('table');
  table.className = 'object-table';
  
  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th></th>
      ${items.map(i => `<th style="color:${i.farbe}">${i.name}</th>`).join('')}
    </tr>
  `;
  table.appendChild(thead);
  
  // Body
  const tbody = document.createElement('tbody');
  [...allKeys].forEach(key => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="object-key">${key}</td>
      ${items.map(i => {
        const val = i.wert?.[key];
        return `<td class="object-val">${val !== undefined ? val : '–'}</td>`;
      }).join('')}
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  
  el.appendChild(table);
  return el;
}

/**
 * COMPARE RANGE - Range-Vergleich mit Überlappung
 */
export function compareRange(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-range';
  
  if (config.label) {
    const label = document.createElement('div');
    label.className = 'compare-label';
    label.textContent = config.label;
    el.appendChild(label);
  }
  
  // Gesamt-Range ermitteln
  let globalMin = Infinity, globalMax = -Infinity;
  items.forEach(item => {
    if (item.wert?.min !== undefined) globalMin = Math.min(globalMin, item.wert.min);
    if (item.wert?.max !== undefined) globalMax = Math.max(globalMax, item.wert.max);
  });
  
  const container = document.createElement('div');
  container.className = 'range-container';
  
  items.forEach(item => {
    if (!item.wert?.min || !item.wert?.max) return;
    
    const row = document.createElement('div');
    row.className = 'range-row';
    
    const startPct = ((item.wert.min - globalMin) / (globalMax - globalMin)) * 100;
    const widthPct = ((item.wert.max - item.wert.min) / (globalMax - globalMin)) * 100;
    
    row.innerHTML = `
      <span class="range-name" style="color:${item.farbe}">${item.name}</span>
      <div class="range-track">
        <div class="range-fill" style="left:${startPct}%;width:${widthPct}%;background:${item.farbe}"></div>
      </div>
      <span class="range-wert">${item.wert.min}–${item.wert.max}${config.einheit || ''}</span>
    `;
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  return el;
}

/**
 * COMPARE BY TYPE - Automatische Typ-Selektion
 * 
 * Wählt den passenden Compare-Morph basierend auf dem erkannten Typ.
 * 
 * @param {string} typ - Erkannter Typ (aus detectType oder Schema)
 * @param {Array} items - [{id, name, wert, farbe}]
 * @param {Object} config - Morph-Konfiguration
 */
export function compareByType(typ, items, config = {}) {
  debug.morphs('compareByType', { typ, itemCount: items?.length, config });
  
  // Intelligente Bar-Erkennung: Wenn wert ein Array von Objekten ist → BarGroup
  if ((typ === 'bar' || typ === 'number') && items?.length && Array.isArray(items[0]?.wert)) {
    debug.morphs('compareByType: Bar mit Array-Wert → BarGroup');
    return compareBarGroup(items, config);
  }
  
  switch (typ) {
    case 'bar':
    case 'number':
      return compareBar(items, config);
      
    case 'rating':
      return compareRating(items, config);
      
    case 'radar':
      return compareRadar(items, config);
      
    case 'pie':
      return comparePie(items, config);
      
    case 'tag':
    case 'badge':
      return compareTag(items, config);
      
    case 'list':
      return compareList(items, config);
      
    case 'image':
      return compareImage(items, config);
      
    case 'timeline':
      return compareTimeline(items, config);
      
    case 'stats':
      return compareStats(items, config);
      
    case 'range':
      return compareRange(items, config);
      
    case 'progress':
      return compareProgress(items, config);
      
    case 'boolean':
      return compareBoolean(items, config);
      
    case 'object':
      return compareObject(items, config);
      
    case 'text':
    case 'string':
    default:
      return compareText(items, config);
  }
}

export default {
  compareByType,
  compareBar,
  compareBarGroup,
  compareRating,
  compareTag,
  compareList,
  compareImage,
  compareRadar,
  comparePie,
  compareText,
  compareTimeline,
  compareStats,
  compareRange,
  compareProgress,
  compareBoolean,
  compareObject
};

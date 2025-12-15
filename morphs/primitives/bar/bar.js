/**
 * 📊 BAR MORPH - Balkendiagramm nach Kirk-Prinzipien
 * 
 * DESIGN-PRINZIPIEN (basierend auf Visualizing Data):
 * - Sortierung: Werte sortiert für bessere Lesbarkeit
 * - Baseline: Klare Null-Linie als Referenz
 * - Hervorhebung: Größter/kleinster Wert markiert
 * - Annotation: Wichtige Werte direkt annotiert
 * - Vergleichbarkeit: Konsistente Skalierung
 * 
 * Input: [{label: "A", value: 12}, {label: "B", value: 45}]
 *    oder: [12, 45, 23, 67]
 *    oder: {A: 12, B: 45, C: 23}
 * Output: Kompaktes Balkendiagramm mit Annotationen
 */

import { debug } from '../../../observer/debug.js';

export function bar(wert, config = {}) {
  debug.morphs('bar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-bar';
  
  // Daten normalisieren
  let balken = normalisiereWert(wert, config);
  
  if (balken.length === 0) {
    el.innerHTML = '<span class="amorph-bar-leer">Keine Daten</span>';
    return el;
  }
  
  // KIRK: Sortierung für bessere Lesbarkeit (optional)
  if (config.sort !== false) {
    balken = balken.sort((a, b) => b.value - a.value);
  }
  
  // Statistiken berechnen
  const values = balken.map(b => b.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const einheit = config.einheit || balken[0]?.unit || '';
  
  // Titel mit optionaler Summary
  if (config.titel || config.title) {
    const header = document.createElement('div');
    header.className = 'amorph-bar-header';
    
    const titel = document.createElement('div');
    titel.className = 'amorph-bar-titel';
    titel.textContent = config.titel || config.title;
    header.appendChild(titel);
    
    // KIRK: Summary-Stats im Header
    if (config.showSummary !== false && balken.length > 2) {
      const summary = document.createElement('div');
      summary.className = 'amorph-bar-summary';
      summary.innerHTML = `<span class="summary-max">↑${formatValue(max, einheit)}</span>
        <span class="summary-avg">⌀${formatValue(avg, einheit)}</span>`;
      header.appendChild(summary);
    }
    el.appendChild(header);
  }
  
  // Container für Balken
  const container = document.createElement('div');
  container.className = 'amorph-bar-container';
  
  // KIRK: Referenzlinie (Durchschnitt oder Schwellenwert)
  if (config.showReference !== false && balken.length > 2) {
    const refPercent = (avg / max) * 100;
    container.style.setProperty('--reference-line', `${refPercent}%`);
    container.classList.add('has-reference');
  }
  
  // Balken rendern
  for (let i = 0; i < balken.length; i++) {
    const b = balken[i];
    const row = document.createElement('div');
    row.className = 'amorph-bar-row';
    
    // KIRK: Hervorhebung von Extremwerten
    if (b.value === max) row.classList.add('is-max');
    if (b.value === min && balken.length > 2) row.classList.add('is-min');
    if (b.highlight) row.classList.add('is-highlight');
    
    // KIRK: Trend-Indikator falls vorhanden
    if (b.trend) {
      row.setAttribute('data-trend', b.trend > 0 ? 'up' : b.trend < 0 ? 'down' : 'stable');
    }
    
    // Label mit optionalem Ranking
    const label = document.createElement('span');
    label.className = 'amorph-bar-label';
    if (config.showRank && i < 3) {
      label.innerHTML = `<span class="rank">${i + 1}</span>${b.label}`;
    } else {
      label.textContent = b.label;
    }
    row.appendChild(label);
    
    // Track mit Baseline
    const track = document.createElement('div');
    track.className = 'amorph-bar-track';
    
    // Fill
    const fill = document.createElement('div');
    fill.className = 'amorph-bar-fill';
    const percent = max > 0 ? (b.value / max) * 100 : 0;
    fill.style.width = `${percent}%`;
    
    // KIRK: Farbkodierung nach Kontext
    if (config.colorByValue) {
      fill.setAttribute('data-level', getValueLevel(b.value, min, max));
    }
    
    track.appendChild(fill);
    row.appendChild(track);
    
    // Wert (KIRK: Direkte Annotation)
    const value = document.createElement('span');
    value.className = 'amorph-bar-value';
    value.textContent = formatValue(b.value, einheit);
    
    // KIRK: Veränderung annotieren falls vorhanden
    if (b.change !== undefined) {
      const change = document.createElement('span');
      change.className = `amorph-bar-change ${b.change >= 0 ? 'positive' : 'negative'}`;
      change.textContent = `${b.change >= 0 ? '+' : ''}${b.change.toFixed(1)}%`;
      value.appendChild(change);
    }
    row.appendChild(value);
    
    container.appendChild(row);
  }
  
  el.appendChild(container);
  
  // KIRK: Baseline-Skala
  if (config.showScale !== false && max > 0) {
    const scale = document.createElement('div');
    scale.className = 'amorph-bar-scale';
    scale.innerHTML = `
      <span class="amorph-bar-scale-min">0</span>
      <span class="amorph-bar-scale-max">${formatValue(max, einheit)}</span>
    `;
    el.appendChild(scale);
  }
  
  // KIRK: Annotation/Legende falls nötig
  if (config.annotation) {
    const annotation = document.createElement('div');
    annotation.className = 'amorph-bar-annotation';
    annotation.textContent = config.annotation;
    el.appendChild(annotation);
  }
  
  return el;
}

function normalisiereWert(wert, config) {
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert.map((item, i) => {
      if (typeof item === 'number') {
        return { label: config.labels?.[i] || `#${i + 1}`, value: item };
      }
      if (typeof item === 'object') {
        const value = extractNumericValue(item);
        const label = item.label || item.name || item.kategorie || 
                     item.nutrient || item.compound || `#${i + 1}`;
        const unit = item.unit || item.einheit || '';
        const trend = item.trend || item.change || undefined;
        const highlight = item.highlight || item.hervorheben || false;
        if (value !== null) {
          return { label: kuerzeLabel(label), value, unit, trend, highlight };
        }
      }
      return null;
    }).filter(Boolean).slice(0, config.maxBalken || 10);
  }
  
  // Objekt: {A: 10, B: 20}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([_, v]) => typeof v === 'number')
      .map(([label, value]) => ({ label: kuerzeLabel(label), value }))
      .slice(0, config.maxBalken || 10);
  }
  
  return [];
}

function extractNumericValue(item) {
  let value = item.value || item.amount || item.count || item.score || 
              item.anzahl || item.wert || item.concentration;
  
  // Verschachtelte Objekte
  if (value && typeof value === 'object') {
    if (value.value !== undefined) return value.value;
    if (value.optimal !== undefined) return value.optimal;
    if (value.min !== undefined && value.max !== undefined) {
      return (value.min + value.max) / 2;
    }
  }
  
  return typeof value === 'number' ? value : null;
}

function kuerzeLabel(label) {
  if (label.length > 15) {
    return label.replace(/_/g, ' ').split(' ').slice(0, 2).join(' ');
  }
  return label.replace(/_/g, ' ');
}

function formatValue(value, unit) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k${unit}`;
  if (Number.isInteger(value)) return `${value}${unit}`;
  if (value >= 1) return `${value.toFixed(1)}${unit}`;
  return `${value.toFixed(2)}${unit}`;
}

function getValueLevel(value, min, max) {
  const range = max - min;
  const percent = (value - min) / range;
  if (percent >= 0.75) return 'high';
  if (percent >= 0.25) return 'medium';
  return 'low';
}

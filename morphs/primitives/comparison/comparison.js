/**
 * ⚖️ COMPARISON MORPH - Vorher/Nachher Vergleich
 * 
 * Zeigt Veränderungen mit Trend-Indikatoren
 * DATENGETRIEBEN - Erkennt vorher/nachher-Strukturen
 * 
 * Input: {vorher: 1000, nachher: 220}
 *    oder {from: 100, to: 150, change: 50}
 *    oder {2020: 500, 2024: 300}
 * Output: Visueller Vergleich mit Pfeil und Prozent
 */

import { debug } from '../../../observer/debug.js';

export function comparison(wert, config = {}) {
  debug.morphs('comparison', { typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-comparison';
  
  // Werte extrahieren
  const data = extractComparisonData(wert);
  
  if (!data) {
    el.innerHTML = '<span class="amorph-comparison-leer">Keine Vergleichsdaten</span>';
    return el;
  }
  
  const { from, to, changePercent, label } = data;
  const einheit = config.einheit || wert.einheit || wert.unit || '';
  
  // Trend bestimmen
  const trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
  el.setAttribute('data-trend', trend);
  
  // Label falls vorhanden
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className = 'amorph-comparison-label';
    labelEl.textContent = label;
    el.appendChild(labelEl);
  }
  
  // Werte-Container
  const values = document.createElement('div');
  values.className = 'amorph-comparison-values';
  
  // Von-Wert
  const fromEl = document.createElement('div');
  fromEl.className = 'amorph-comparison-from';
  fromEl.innerHTML = `
    <span class="amorph-comparison-from-label">Vorher</span>
    <span class="amorph-comparison-from-value">${formatValue(from)}${einheit}</span>
  `;
  values.appendChild(fromEl);
  
  // Pfeil mit Änderung
  const arrow = document.createElement('div');
  arrow.className = 'amorph-comparison-arrow';
  arrow.innerHTML = `
    <span class="amorph-comparison-arrow-icon">${getTrendIcon(trend)}</span>
    <span class="amorph-comparison-change">${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%</span>
  `;
  values.appendChild(arrow);
  
  // Nach-Wert
  const toEl = document.createElement('div');
  toEl.className = 'amorph-comparison-to';
  toEl.innerHTML = `
    <span class="amorph-comparison-to-label">Nachher</span>
    <span class="amorph-comparison-to-value">${formatValue(to)}${einheit}</span>
  `;
  values.appendChild(toEl);
  
  el.appendChild(values);
  
  // Visueller Balken
  if (config.showBar !== false) {
    const barContainer = document.createElement('div');
    barContainer.className = 'amorph-comparison-bar';
    
    const max = Math.max(from, to);
    const fromPercent = (from / max) * 100;
    const toPercent = (to / max) * 100;
    
    const fromBar = document.createElement('div');
    fromBar.className = 'amorph-comparison-bar-from';
    fromBar.style.width = `${fromPercent}%`;
    barContainer.appendChild(fromBar);
    
    const toBar = document.createElement('div');
    toBar.className = 'amorph-comparison-bar-to';
    toBar.style.width = `${toPercent}%`;
    barContainer.appendChild(toBar);
    
    el.appendChild(barContainer);
  }
  
  return el;
}

function extractComparisonData(wert) {
  if (!wert || typeof wert !== 'object') return null;
  
  let from, to, label;
  
  // Explizite Felder
  if ('vorher' in wert && 'nachher' in wert) {
    from = wert.vorher;
    to = wert.nachher;
    label = wert.label || wert.name;
  } else if ('from' in wert && 'to' in wert) {
    from = wert.from;
    to = wert.to;
    label = wert.label || wert.name;
  } else if ('alt' in wert && 'neu' in wert) {
    from = wert.alt;
    to = wert.neu;
    label = wert.label || wert.name;
  } else if ('before' in wert && 'after' in wert) {
    from = wert.before;
    to = wert.after;
    label = wert.label || wert.name;
  } else {
    // Jahres-Vergleich erkennen (z.B. {2020: 500, 2024: 300})
    const years = Object.keys(wert).filter(k => /^\d{4}$/.test(k)).sort();
    if (years.length >= 2) {
      from = wert[years[0]];
      to = wert[years[years.length - 1]];
      label = `${years[0]} → ${years[years.length - 1]}`;
    }
  }
  
  if (from === undefined || to === undefined) return null;
  
  from = parseFloat(from);
  to = parseFloat(to);
  
  if (isNaN(from) || isNaN(to)) return null;
  
  const changePercent = from !== 0 ? ((to - from) / from) * 100 : 0;
  
  return { from, to, changePercent, label };
}

function getTrendIcon(trend) {
  switch (trend) {
    case 'up': return '↗';
    case 'down': return '↘';
    default: return '→';
  }
}

function formatValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

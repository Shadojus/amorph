/**
 * 📊 BAR MORPH - Balkendiagramm
 * 
 * Zeigt numerische Arrays als horizontale Balken
 * DATENGETRIEBEN - Erkennt Arrays mit Zahlen
 * 
 * Input: [{label: "A", value: 12}, {label: "B", value: 45}]
 *    oder: [12, 45, 23, 67]
 *    oder: {A: 12, B: 45, C: 23}
 * Output: Kompaktes horizontales Balkendiagramm
 */

import { debug } from '../../../observer/debug.js';

export function bar(wert, config = {}) {
  debug.morphs('bar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-bar';
  
  // Daten normalisieren
  const balken = normalisiereWert(wert, config);
  
  if (balken.length === 0) {
    el.innerHTML = '<span class="amorph-bar-leer">Keine Daten</span>';
    return el;
  }
  
  // Titel anzeigen falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-bar-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Max für Skalierung
  const max = Math.max(...balken.map(b => b.value));
  const einheit = config.einheit || balken[0]?.unit || '';
  
  // Balken rendern
  for (const b of balken) {
    const row = document.createElement('div');
    row.className = 'amorph-bar-row';
    
    // Label
    const label = document.createElement('span');
    label.className = 'amorph-bar-label';
    label.textContent = b.label;
    row.appendChild(label);
    
    // Track
    const track = document.createElement('div');
    track.className = 'amorph-bar-track';
    
    // Fill
    const fill = document.createElement('div');
    fill.className = 'amorph-bar-fill';
    const percent = max > 0 ? (b.value / max) * 100 : 0;
    fill.style.width = `${percent}%`;
    track.appendChild(fill);
    row.appendChild(track);
    
    // Wert
    const value = document.createElement('span');
    value.className = 'amorph-bar-value';
    value.textContent = formatValue(b.value, einheit);
    row.appendChild(value);
    
    el.appendChild(row);
  }
  
  // Achsenbeschriftung (X-Achse mit Skala)
  if (config.showScale !== false && max > 0) {
    const scale = document.createElement('div');
    scale.className = 'amorph-bar-scale';
    scale.innerHTML = `
      <span class="amorph-bar-scale-min">0${einheit}</span>
      <span class="amorph-bar-scale-mid">${formatValue(max / 2, einheit)}</span>
      <span class="amorph-bar-scale-max">${formatValue(max, einheit)}</span>
    `;
    el.appendChild(scale);
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
        if (value !== null) {
          return { label: kuerzeLabel(label), value, unit };
        }
      }
      return null;
    }).filter(Boolean).slice(0, config.maxBalken || 8);
  }
  
  // Objekt: {A: 10, B: 20}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([_, v]) => typeof v === 'number')
      .map(([label, value]) => ({ label: kuerzeLabel(label), value }))
      .slice(0, config.maxBalken || 8);
  }
  
  return [];
}

function extractNumericValue(item) {
  let value = item.value || item.amount || item.count || item.score || 
              item.anzahl || item.wert || item.concentration;
  
  // Verschachtelte Objekte (z.B. {value: {min: 5, max: 10}})
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
  if (label.length > 12) {
    return label.replace(/_/g, ' ').split(' ').slice(0, 2).join(' ');
  }
  return label;
}

function formatValue(value, unit) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k${unit}`;
  if (value >= 1) return `${value.toFixed(1)}${unit}`;
  return `${value.toFixed(2)}${unit}`;
}

/**
 * 🍭 LOLLIPOP - Lollipop Chart
 * 
 * Elegante Alternative zum Balkendiagramm
 * Kirk Design: Punkt am Ende einer Linie, weniger Tinte
 * Ideal für sortierte Rankings und Vergleiche
 * 
 * Input: [{label: "A", value: 85}, {label: "B", value: 72}]
 * Output: Lollipop-Diagramm mit Linien und Punkten
 */

import { debug } from '../../../observer/debug.js';

// Universe-Farbpalette
const LOLLIPOP_FARBEN = {
  positiv: 'rgba(78, 205, 196, 0.8)',   // Türkis
  negativ: 'rgba(255, 107, 107, 0.8)',  // Koralle
  neutral: 'rgba(149, 225, 211, 0.8)',  // Mint
  highlight: 'rgba(255, 230, 109, 0.8)' // Gelb
};

export function lollipop(wert, config = {}) {
  debug.morphs('lollipop', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-lollipop';
  
  // Daten normalisieren
  let items = normalisiereWert(wert);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-lollipop-leer">Keine Lollipop-Daten</span>';
    return el;
  }
  
  // Sortieren wenn aktiviert (Standard: ja)
  if (config.sorted !== false) {
    items = items.sort((a, b) => b.value - a.value);
  }
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-lollipop-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Min/Max für Skalierung
  const values = items.map(i => i.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values, 0);
  const baseline = config.baseline || 0;
  const maxIndex = values.indexOf(Math.max(...values));
  
  // Container
  const container = document.createElement('div');
  container.className = 'amorph-lollipop-container';
  
  // Horizontal (Standard) oder Vertikal
  const horizontal = config.horizontal !== false;
  container.classList.add(horizontal ? 'horizontal' : 'vertical');
  
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'amorph-lollipop-row';
    
    // Highlight für Max
    if (config.highlightMax !== false && i === maxIndex) {
      row.classList.add('is-max');
    }
    
    // Label
    const label = document.createElement('span');
    label.className = 'amorph-lollipop-label';
    label.textContent = item.label;
    row.appendChild(label);
    
    // Track (Linie + Punkt)
    const track = document.createElement('div');
    track.className = 'amorph-lollipop-track';
    
    // Linie
    const line = document.createElement('div');
    line.className = 'amorph-lollipop-line';
    const percent = maxValue > 0 ? Math.abs(item.value) / maxValue * 100 : 0;
    line.style.width = `${percent}%`;
    
    // Farbe basierend auf Wert
    const farbe = item.value >= baseline ? LOLLIPOP_FARBEN.positiv : LOLLIPOP_FARBEN.negativ;
    line.style.backgroundColor = farbe;
    
    // Punkt am Ende
    const dot = document.createElement('div');
    dot.className = 'amorph-lollipop-dot';
    dot.style.backgroundColor = i === maxIndex ? LOLLIPOP_FARBEN.highlight : farbe;
    line.appendChild(dot);
    
    track.appendChild(line);
    row.appendChild(track);
    
    // Wert
    if (config.showValues !== false) {
      const value = document.createElement('span');
      value.className = 'amorph-lollipop-value';
      value.textContent = formatValue(item.value, config.einheit);
      row.appendChild(value);
    }
    
    container.appendChild(row);
  });
  
  el.appendChild(container);
  
  return el;
}

function normalisiereWert(wert) {
  if (!wert) return [];
  
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && item !== null)
      .map(item => ({
        label: item.label || item.name || item.kategorie || item.category || '',
        value: parseFloat(item.value ?? item.wert ?? item.score ?? item.gap ?? item.rank ?? item.amount ?? 0)
      }))
      .filter(item => !isNaN(item.value));
  }
  
  // Objekt {A: 10, B: 20}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([key]) => !['label', 'titel', 'title', 'einheit'].includes(key))
      .map(([label, value]) => ({
        label,
        value: parseFloat(value) || 0
      }))
      .filter(item => !isNaN(item.value));
  }
  
  return [];
}

function formatValue(value, einheit = '') {
  if (typeof value !== 'number') return String(value);
  
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M' + einheit;
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K' + einheit;
  }
  if (Number.isInteger(value)) {
    return value + einheit;
  }
  return value.toFixed(1) + einheit;
}

export default lollipop;

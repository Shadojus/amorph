/**
 * 👥 PICTOGRAM - Icon Repeat Chart
 * 
 * Wiederholt Icons zur Mengendarstellung
 * Kirk Design: Isotype-inspiriert, intuitive Mengenvisualisierung
 * Jedes Icon repräsentiert eine Einheit
 * 
 * Input: {count: 42, icon: "👤"} oder [{label: "A", value: 10}, {label: "B", value: 20}]
 * Output: Grid von wiederholten Icons
 */

import { debug } from '../../../observer/debug.js';

// Standard-Icons für verschiedene Kategorien
const STANDARD_ICONS = {
  person: '👤',
  menschen: '👤',
  people: '👤',
  users: '👤',
  männer: '👨',
  frauen: '👩',
  kinder: '🧒',
  tiere: '🐾',
  pilze: '🍄',
  pflanzen: '🌱',
  bäume: '🌳',
  geld: '💰',
  euro: '€',
  dollar: '$',
  häuser: '🏠',
  autos: '🚗',
  punkte: '●',
  default: '■'
};

export function pictogram(wert, config = {}) {
  debug.morphs('pictogram', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-pictogram';
  
  // Daten normalisieren
  const items = normalisiereWert(wert, config);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-pictogram-leer">Keine Pictogram-Daten</span>';
    return el;
  }
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-pictogram-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  const maxIcons = config.maxIcons || 100;
  const einheitWert = config.einheitWert || config.unitValue || 1;
  const columns = config.columns || 10;
  
  // Für jedes Item eine Zeile
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'amorph-pictogram-row';
    
    // Label
    if (item.label) {
      const label = document.createElement('div');
      label.className = 'amorph-pictogram-label';
      label.textContent = item.label;
      row.appendChild(label);
    }
    
    // Icon-Grid
    const grid = document.createElement('div');
    grid.className = 'amorph-pictogram-grid';
    grid.style.setProperty('--columns', columns);
    
    // Anzahl Icons berechnen
    const iconCount = Math.min(Math.ceil(item.value / einheitWert), maxIcons);
    const icon = item.icon || config.icon || waehleIcon(item.label);
    
    for (let i = 0; i < iconCount; i++) {
      const iconEl = document.createElement('span');
      iconEl.className = 'amorph-pictogram-icon';
      iconEl.textContent = icon;
      
      // Letztes Icon kann teilweise gefüllt sein
      if (i === iconCount - 1) {
        const remainder = (item.value / einheitWert) % 1;
        if (remainder > 0 && remainder < 1) {
          iconEl.style.opacity = remainder;
        }
      }
      
      grid.appendChild(iconEl);
    }
    
    row.appendChild(grid);
    
    // Wert anzeigen
    if (config.showValues !== false) {
      const value = document.createElement('span');
      value.className = 'amorph-pictogram-value';
      value.textContent = formatValue(item.value, config.einheit);
      row.appendChild(value);
    }
    
    el.appendChild(row);
  });
  
  // Legende
  if (config.showLegend !== false && einheitWert !== 1) {
    const legend = document.createElement('div');
    legend.className = 'amorph-pictogram-legend';
    const legendIcon = config.icon || items[0]?.icon || STANDARD_ICONS.default;
    legend.innerHTML = `<span class="legend-icon">${legendIcon}</span> = ${einheitWert}`;
    el.appendChild(legend);
  }
  
  return el;
}

function normalisiereWert(wert, config) {
  if (!wert) return [];
  
  // Einzelnes Objekt mit count/value
  if (typeof wert === 'object' && wert !== null && !Array.isArray(wert)) {
    if ('count' in wert || 'value' in wert || 'amount' in wert) {
      return [{
        label: wert.label || wert.name || '',
        value: parseFloat(wert.count ?? wert.value ?? wert.amount ?? 0),
        icon: wert.icon || wert.symbol
      }];
    }
    
    // Objekt als Key-Value Paare
    return Object.entries(wert)
      .filter(([key]) => !['label', 'titel', 'title', 'icon', 'symbol'].includes(key))
      .map(([label, value]) => ({
        label,
        value: parseFloat(value) || 0,
        icon: null
      }))
      .filter(item => !isNaN(item.value) && item.value > 0);
  }
  
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && item !== null)
      .map(item => ({
        label: item.label || item.name || item.kategorie || '',
        value: parseFloat(item.value ?? item.count ?? item.amount ?? item.wert ?? 0),
        icon: item.icon || item.symbol
      }))
      .filter(item => !isNaN(item.value) && item.value > 0);
  }
  
  // Einzelne Zahl
  if (typeof wert === 'number') {
    return [{ label: '', value: wert, icon: null }];
  }
  
  return [];
}

function waehleIcon(label) {
  if (!label) return STANDARD_ICONS.default;
  
  const lowerLabel = label.toLowerCase();
  
  for (const [key, icon] of Object.entries(STANDARD_ICONS)) {
    if (lowerLabel.includes(key)) return icon;
  }
  
  return STANDARD_ICONS.default;
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

export default pictogram;

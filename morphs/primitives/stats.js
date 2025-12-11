/**
 * 📊 STATS MORPH - statistics-Karte
 * 
 * Zeigt Key-Value Paare als kompakte statistics-Box
 * DATENGETRIEBEN - Erkennt Objekte mit wenigen numerischen Werten
 * 
 * Input: {min: 10, max: 25, avg: 17.5, count: 42}
 * Output: Kompakte statistics-Karte mit Icons
 */

import { debug } from '../../observer/debug.js';

// Bekannte statistics-Felder mit Icons
const STAT_ICONS = {
  min: '↓',
  max: '↑',
  avg: '⌀',
  average: '⌀',
  mean: '⌀',
  mittel: '⌀',
  count: '#',
  anzahl: '#',
  total: 'Σ',
  sum: 'Σ',
  summe: 'Σ',
  median: '◇',
  range: '↔',
  variance: 'σ²',
  stddev: 'σ',
  percent: '%',
  prozent: '%',
  ratio: '÷',
  rate: '⌀',
  growth: '📈',
  decline: '📉'
};

export function stats(wert, config = {}) {
  debug.morphs('stats', { wert, typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-stats';
  
  if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) {
    el.innerHTML = '<span class="amorph-stats-leer">Keine statistics</span>';
    return el;
  }
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-stats-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  const einheit = config.einheit || wert.unit || wert.einheit || '';
  
  // Stats extrahieren
  const statsArray = [];
  for (const [key, value] of Object.entries(wert)) {
    // Nur numerische Werte und keine meta-Felder
    if (typeof value !== 'number') continue;
    if (['unit', 'einheit', 'id'].includes(key.toLowerCase())) continue;
    
    const icon = STAT_ICONS[key.toLowerCase()] || '•';
    const label = formatLabel(key);
    
    statsArray.push({ key, label, value, icon });
  }
  
  if (statsArray.length === 0) {
    el.innerHTML = '<span class="amorph-stats-leer">Keine numerischen Werte</span>';
    return el;
  }
  
  // Stats rendern
  const grid = document.createElement('div');
  grid.className = 'amorph-stats-grid';
  
  for (const stat of statsArray.slice(0, config.maxStats || 6)) {
    const item = document.createElement('div');
    item.className = 'amorph-stats-item';
    
    item.innerHTML = `
      <span class="amorph-stats-icon">${stat.icon}</span>
      <span class="amorph-stats-value">${formatValue(stat.value, einheit)}</span>
      <span class="amorph-stats-label">${stat.label}</span>
    `;
    
    grid.appendChild(item);
  }
  
  el.appendChild(grid);
  return el;
}

function formatLabel(key) {
  // snake_case und camelCase zu lesbarem Text
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

function formatValue(value, unit) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K${unit}`;
  if (Number.isInteger(value)) return `${value}${unit}`;
  return `${value.toFixed(1)}${unit}`;
}

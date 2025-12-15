/**
 * 📊 STATS MORPH - Statistik-Karte nach Kirk-Prinzipien
 * 
 * DESIGN-PRINZIPIEN:
 * - Klare Hierarchie: Wichtigste Werte prominent
 * - Vergleichbarkeit: Sparklines für Kontext
 * - Annotation: Einheiten und Trends direkt sichtbar
 * - Farbkodierung: Positive/Negative Werte unterschieden
 * 
 * Input: {min: 10, max: 25, avg: 17.5, count: 42}
 * Output: Kompakte Statistik-Karte mit visuellen Indikatoren
 */

import { debug } from '../../../observer/debug.js';

// Bekannte Statistik-Felder mit Icons und Priorität
const STAT_DEFINITIONS = {
  // Primäre Stats (werden größer dargestellt)
  total: { icon: 'Σ', priority: 1, type: 'primary' },
  sum: { icon: 'Σ', priority: 1, type: 'primary' },
  summe: { icon: 'Σ', priority: 1, type: 'primary' },
  count: { icon: '#', priority: 1, type: 'primary' },
  anzahl: { icon: '#', priority: 1, type: 'primary' },
  
  // Sekundäre Stats (Mittelwerte)
  avg: { icon: '⌀', priority: 2, type: 'secondary' },
  average: { icon: '⌀', priority: 2, type: 'secondary' },
  mean: { icon: '⌀', priority: 2, type: 'secondary' },
  mittel: { icon: '⌀', priority: 2, type: 'secondary' },
  median: { icon: '◇', priority: 2, type: 'secondary' },
  
  // Range Stats
  min: { icon: '↓', priority: 3, type: 'range', sentiment: 'neutral' },
  max: { icon: '↑', priority: 3, type: 'range', sentiment: 'neutral' },
  range: { icon: '↔', priority: 3, type: 'range' },
  
  // Trend/Change Stats
  growth: { icon: '↗', priority: 4, type: 'trend', sentiment: 'positive' },
  decline: { icon: '↘', priority: 4, type: 'trend', sentiment: 'negative' },
  change: { icon: 'Δ', priority: 4, type: 'trend' },
  percent: { icon: '%', priority: 4, type: 'trend' },
  prozent: { icon: '%', priority: 4, type: 'trend' },
  
  // Varianz
  variance: { icon: 'σ²', priority: 5, type: 'variance' },
  stddev: { icon: 'σ', priority: 5, type: 'variance' },
  std: { icon: 'σ', priority: 5, type: 'variance' },
  
  // Rate
  rate: { icon: '⌀', priority: 5, type: 'rate' },
  ratio: { icon: '÷', priority: 5, type: 'rate' }
};

export function stats(wert, config = {}) {
  debug.morphs('stats', { wert, typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-stats';
  
  if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) {
    el.innerHTML = '<span class="amorph-stats-leer">Keine Statistiken</span>';
    return el;
  }
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const header = document.createElement('div');
    header.className = 'amorph-stats-header';
    header.textContent = config.titel || config.title;
    el.appendChild(header);
  }
  
  const einheit = config.einheit || wert.unit || wert.einheit || '';
  
  // Stats extrahieren und kategorisieren
  const statsArray = [];
  for (const [key, value] of Object.entries(wert)) {
    if (typeof value !== 'number') continue;
    const keyLower = String(key || '').toLowerCase();
    if (['unit', 'einheit', 'id'].includes(keyLower)) continue;
    
    const def = STAT_DEFINITIONS[keyLower] || { icon: '•', priority: 10, type: 'other' };
    
    statsArray.push({
      key,
      label: formatLabel(key),
      value,
      icon: def.icon,
      priority: def.priority,
      type: def.type,
      sentiment: def.sentiment
    });
  }
  
  if (statsArray.length === 0) {
    el.innerHTML = '<span class="amorph-stats-leer">Keine numerischen Werte</span>';
    return el;
  }
  
  // Nach Priorität sortieren
  statsArray.sort((a, b) => a.priority - b.priority);
  
  // Primäre Stats (groß, oben)
  const primaryStats = statsArray.filter(s => s.type === 'primary');
  const otherStats = statsArray.filter(s => s.type !== 'primary');
  
  // Primäre Stats rendern
  if (primaryStats.length > 0) {
    const primaryGrid = document.createElement('div');
    primaryGrid.className = 'amorph-stats-primary';
    
    for (const stat of primaryStats.slice(0, 2)) {
      const item = document.createElement('div');
      item.className = 'amorph-stats-primary-item';
      item.innerHTML = `
        <span class="amorph-stats-primary-value">${formatValue(stat.value, einheit)}</span>
        <span class="amorph-stats-primary-label">${stat.label}</span>
      `;
      primaryGrid.appendChild(item);
    }
    el.appendChild(primaryGrid);
  }
  
  // Sekundäre Stats rendern
  if (otherStats.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'amorph-stats-grid';
    
    for (const stat of otherStats.slice(0, config.maxStats || 6)) {
      const item = document.createElement('div');
      item.className = `amorph-stats-item amorph-stats-${stat.type}`;
      
      // Sentiment-basierte Färbung
      if (stat.sentiment === 'positive' || (stat.key.toLowerCase().includes('growth') && stat.value > 0)) {
        item.setAttribute('data-sentiment', 'positive');
      } else if (stat.sentiment === 'negative' || (stat.key.toLowerCase().includes('decline') && stat.value > 0)) {
        item.setAttribute('data-sentiment', 'negative');
      }
      
      // Mini-Visualisierung für Range-Stats
      let miniViz = '';
      if (stat.type === 'range' && primaryStats.length === 0) {
        const minStat = statsArray.find(s => s.key.toLowerCase() === 'min');
        const maxStat = statsArray.find(s => s.key.toLowerCase() === 'max');
        if (minStat && maxStat && stat.key.toLowerCase() === 'max') {
          const range = maxStat.value - minStat.value;
          miniViz = `<div class="amorph-stats-mini-bar">
            <div class="mini-bar-fill" style="width: 100%"></div>
          </div>`;
        }
      }
      
      item.innerHTML = `
        <span class="amorph-stats-icon">${stat.icon}</span>
        <span class="amorph-stats-value">${formatValue(stat.value, stat.type === 'trend' ? '%' : einheit)}</span>
        <span class="amorph-stats-label">${stat.label}</span>
        ${miniViz}
      `;
      
      grid.appendChild(item);
    }
    
    el.appendChild(grid);
  }
  
  return el;
}

function formatLabel(key) {
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

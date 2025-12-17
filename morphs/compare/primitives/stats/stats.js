/**
 * COMPARE STATS - UNIFIED Statistics comparison
 * All items shown as comparative bars for each stat metric
 */

import { debug } from '../../../../observer/debug.js';

// Bekannte Statistik-Felder mit Icons und Priorität
const STAT_DEFINITIONS = {
  total: { icon: 'Σ', priority: 1, type: 'primary' },
  sum: { icon: 'Σ', priority: 1, type: 'primary' },
  summe: { icon: 'Σ', priority: 1, type: 'primary' },
  count: { icon: '#', priority: 1, type: 'primary' },
  anzahl: { icon: '#', priority: 1, type: 'primary' },
  avg: { icon: '⌀', priority: 2, type: 'secondary' },
  average: { icon: '⌀', priority: 2, type: 'secondary' },
  mean: { icon: '⌀', priority: 2, type: 'secondary' },
  mittel: { icon: '⌀', priority: 2, type: 'secondary' },
  median: { icon: '◇', priority: 2, type: 'secondary' },
  min: { icon: '↓', priority: 3, type: 'range' },
  max: { icon: '↑', priority: 3, type: 'range' },
  range: { icon: '↔', priority: 3, type: 'range' },
  growth: { icon: '↗', priority: 4, type: 'trend', sentiment: 'positive' },
  decline: { icon: '↘', priority: 4, type: 'trend', sentiment: 'negative' },
  change: { icon: 'Δ', priority: 4, type: 'trend' },
  percent: { icon: '%', priority: 4, type: 'trend' },
  variance: { icon: 'σ²', priority: 5, type: 'variance' },
  stddev: { icon: 'σ', priority: 5, type: 'variance' },
  std: { icon: 'σ', priority: 5, type: 'variance' }
};

export function compareStats(items, config = {}) {
  debug.morphs('compareStats', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stats';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items' stats
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const stats = {};
    
    if (typeof rawVal === 'object' && rawVal !== null && !Array.isArray(rawVal)) {
      for (const [key, value] of Object.entries(rawVal)) {
        if (typeof value !== 'number') continue;
        const keyLower = String(key || '').toLowerCase();
        if (['unit', 'einheit', 'id'].includes(keyLower)) continue;
        
        const def = STAT_DEFINITIONS[keyLower] || { icon: '•', priority: 10, type: 'other' };
        stats[key] = { value, ...def, label: formatLabel(key) };
      }
    }
    
    return { 
      ...item, 
      stats, 
      index: idx,
      // Farben werden durchgereicht, item hat bereits lineFarbe etc.
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  });
  
  // Collect all unique stat keys
  const allStatKeys = new Set();
  parsedItems.forEach(item => Object.keys(item.stats).forEach(k => allStatKeys.add(k)));
  
  if (allStatKeys.size === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Statistiken</div>';
    return el;
  }
  
  // Sort stat keys by priority
  const sortedKeys = [...allStatKeys].sort((a, b) => {
    const prioA = parsedItems[0]?.stats[a]?.priority ?? 10;
    const prioB = parsedItems[0]?.stats[b]?.priority ?? 10;
    return prioA - prioB;
  });
  
  // UNIFIED stats container
  const statsContainer = document.createElement('div');
  statsContainer.className = 'amorph-stats amorph-stats-compare';
  
  // Primary stat (first key with highest priority) - shown as big numbers with NEON
  const primaryKey = sortedKeys[0];
  if (primaryKey) {
    const primarySection = document.createElement('div');
    primarySection.className = 'stats-primary-compare';
    
    parsedItems.forEach(item => {
      const stat = item.stats[primaryKey];
      if (!stat) return;
      
      // Use NEON colors
      const lineColor = item.lineFarbe || item.farbe || item.color;
      const glowColor = item.glowFarbe || lineColor;
      const textColor = item.textFarbe || lineColor;
      
      const statItem = document.createElement('div');
      statItem.className = 'stats-primary-item';
      
      const nameEl = document.createElement('div');
      nameEl.className = 'stats-primary-name';
      nameEl.textContent = item.name || item.id;
      nameEl.style.color = textColor;
      
      const valueEl = document.createElement('div');
      valueEl.className = 'stats-primary-value';
      valueEl.textContent = formatValue(stat.value, '');
      valueEl.style.color = lineColor;
      valueEl.style.textShadow = `0 0 15px ${glowColor}`;
      
      const labelEl = document.createElement('div');
      labelEl.className = 'stats-primary-label';
      labelEl.textContent = stat.label || primaryKey;
      
      statItem.appendChild(nameEl);
      statItem.appendChild(valueEl);
      statItem.appendChild(labelEl);
      primarySection.appendChild(statItem);
    });
    
    statsContainer.appendChild(primarySection);
  }
  
  // Secondary stats as comparative bars with NEON
  const secondaryKeys = sortedKeys.slice(1, 7); // Max 6 secondary stats
  if (secondaryKeys.length > 0) {
    const secondarySection = document.createElement('div');
    secondarySection.className = 'stats-secondary-compare';
    
    secondaryKeys.forEach(key => {
      const def = parsedItems[0]?.stats[key];
      const maxVal = Math.max(...parsedItems.map(i => i.stats[key]?.value ?? 0), 1);
      
      const statRow = document.createElement('div');
      statRow.className = 'stats-row';
      
      // Stat label
      const labelEl = document.createElement('div');
      labelEl.className = 'stats-row-label';
      labelEl.innerHTML = `<span class="stats-icon">${def?.icon || '•'}</span> ${def?.label || key}`;
      statRow.appendChild(labelEl);
      
      // Bars for all items with NEON glow
      const barsEl = document.createElement('div');
      barsEl.className = 'stats-row-bars';
      
      parsedItems.forEach(item => {
        const stat = item.stats[key];
        const val = stat?.value ?? 0;
        const percent = (val / maxVal) * 100;
        
        // Use NEON colors
        const lineColor = item.lineFarbe || item.farbe || item.color;
        const glowColor = item.glowFarbe || lineColor;
        
        const barRow = document.createElement('div');
        barRow.className = 'stats-bar-row';
        
        const bar = document.createElement('div');
        bar.className = 'stats-bar';
        bar.style.width = `${percent}%`;
        bar.style.background = lineColor;
        bar.style.boxShadow = `0 0 8px ${glowColor}, inset 0 0 4px rgba(255,255,255,0.2)`;
        
        const valEl = document.createElement('span');
        valEl.className = 'stats-bar-value';
        valEl.textContent = formatValue(val, '');
        valEl.style.color = lineColor;
        
        barRow.appendChild(bar);
        barRow.appendChild(valEl);
        barsEl.appendChild(barRow);
      });
      
      statRow.appendChild(barsEl);
      secondarySection.appendChild(statRow);
    });
    
    statsContainer.appendChild(secondarySection);
  }
  
  el.appendChild(statsContainer);
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

export default compareStats;

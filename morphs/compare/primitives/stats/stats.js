/**
 * COMPARE STATS - Statistics comparison
 * Uses the exact same HTML structure as the original stats morph
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
  
  // Container for all stats cards
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original stats structure
    const statsEl = document.createElement('div');
    statsEl.className = 'amorph-stats';
    
    if (typeof rawVal !== 'object' || rawVal === null || Array.isArray(rawVal)) {
      statsEl.innerHTML = '<span class="amorph-stats-leer">Keine Statistiken</span>';
    } else {
      const einheit = config.einheit || rawVal.unit || rawVal.einheit || '';
      
      // Extract and categorize stats
      const statsArray = [];
      for (const [key, value] of Object.entries(rawVal)) {
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
        statsEl.innerHTML = '<span class="amorph-stats-leer">Keine numerischen Werte</span>';
      } else {
        // Sort by priority
        statsArray.sort((a, b) => a.priority - b.priority);
        
        // Primary stats
        const primaryStats = statsArray.filter(s => s.type === 'primary');
        const otherStats = statsArray.filter(s => s.type !== 'primary');
        
        // Render primary stats
        if (primaryStats.length > 0) {
          const primaryGrid = document.createElement('div');
          primaryGrid.className = 'amorph-stats-primary';
          
          for (const stat of primaryStats.slice(0, 2)) {
            const statItem = document.createElement('div');
            statItem.className = 'amorph-stats-primary-item';
            statItem.innerHTML = `
              <span class="amorph-stats-primary-value">${formatValue(stat.value, einheit)}</span>
              <span class="amorph-stats-primary-label">${stat.label}</span>
            `;
            primaryGrid.appendChild(statItem);
          }
          statsEl.appendChild(primaryGrid);
        }
        
        // Render other stats
        if (otherStats.length > 0) {
          const grid = document.createElement('div');
          grid.className = 'amorph-stats-grid';
          
          for (const stat of otherStats.slice(0, config.maxStats || 6)) {
            const statItem = document.createElement('div');
            statItem.className = `amorph-stats-item amorph-stats-${stat.type}`;
            
            if (stat.sentiment === 'positive' || (stat.key.toLowerCase().includes('growth') && stat.value > 0)) {
              statItem.setAttribute('data-sentiment', 'positive');
            } else if (stat.sentiment === 'negative' || (stat.key.toLowerCase().includes('decline') && stat.value > 0)) {
              statItem.setAttribute('data-sentiment', 'negative');
            }
            
            statItem.innerHTML = `
              <span class="amorph-stats-icon">${stat.icon}</span>
              <span class="amorph-stats-value">${formatValue(stat.value, stat.type === 'trend' ? '%' : einheit)}</span>
              <span class="amorph-stats-label">${stat.label}</span>
            `;
            
            grid.appendChild(statItem);
          }
          
          statsEl.appendChild(grid);
        }
      }
    }
    
    wrapper.appendChild(statsEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

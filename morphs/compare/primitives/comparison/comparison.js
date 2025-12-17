/**
 * COMPARE COMPARISON - Generic comparison visualization
 * Uses the exact same HTML structure as the original comparison morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareComparison(items, config = {}) {
  debug.morphs('compareComparison', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-comparison';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original comparison structure
    const comparisonEl = document.createElement('div');
    comparisonEl.className = 'amorph-comparison';
    
    const data = extractComparisonData(rawVal);
    
    if (!data) {
      comparisonEl.innerHTML = '<span class="amorph-comparison-leer">Keine Vergleichsdaten</span>';
    } else {
      const { from, to, changePercent } = data;
      const trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
      comparisonEl.setAttribute('data-trend', trend);
      
      const values = document.createElement('div');
      values.className = 'amorph-comparison-values';
      values.style.display = 'flex';
      values.style.alignItems = 'center';
      values.style.gap = '8px';
      values.style.fontSize = '11px';
      
      // From value
      const fromEl = document.createElement('div');
      fromEl.className = 'amorph-comparison-from';
      fromEl.innerHTML = `<span class="amorph-comparison-from-value">${formatValue(from)}</span>`;
      values.appendChild(fromEl);
      
      // Arrow with change
      const arrow = document.createElement('div');
      arrow.className = 'amorph-comparison-arrow';
      const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
      const trendColor = trend === 'up' ? 'rgba(100,200,150,0.9)' : trend === 'down' ? 'rgba(220,100,100,0.9)' : 'rgba(180,180,180,0.8)';
      arrow.innerHTML = `<span style="color:${trendColor}">${trendIcon} ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%</span>`;
      values.appendChild(arrow);
      
      // To value
      const toEl = document.createElement('div');
      toEl.className = 'amorph-comparison-to';
      toEl.innerHTML = `<span class="amorph-comparison-to-value">${formatValue(to)}</span>`;
      values.appendChild(toEl);
      
      comparisonEl.appendChild(values);
    }
    
    wrapper.appendChild(comparisonEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function extractComparisonData(wert) {
  if (!wert || typeof wert !== 'object') return null;
  
  let from, to;
  
  // Various formats
  if ('vorher' in wert && 'nachher' in wert) {
    from = wert.vorher;
    to = wert.nachher;
  } else if ('from' in wert && 'to' in wert) {
    from = wert.from;
    to = wert.to;
  } else if ('before' in wert && 'after' in wert) {
    from = wert.before;
    to = wert.after;
  } else {
    // Year format
    const keys = Object.keys(wert).filter(k => /^\d{4}$/.test(k)).sort();
    if (keys.length >= 2) {
      from = wert[keys[0]];
      to = wert[keys[keys.length - 1]];
    }
  }
  
  if (from === undefined || to === undefined) return null;
  
  const changePercent = from !== 0 ? ((to - from) / Math.abs(from)) * 100 : 0;
  
  return { from, to, changePercent };
}

function formatValue(val) {
  if (typeof val === 'number') {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  }
  return String(val);
}

export default compareComparison;

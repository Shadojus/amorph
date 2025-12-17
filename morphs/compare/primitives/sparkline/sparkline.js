/**
 * COMPARE SPARKLINE - Multiple sparklines side by side
 * Uses the exact same HTML structure as the original sparkline morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareSparkline(items, config = {}) {
  debug.morphs('compareSparkline', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-sparkline';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all sparklines
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Process each item - create original sparkline structure for each
  items.forEach((item, itemIndex) => {
    const data = normalizeDaten(item.value ?? item.wert);
    const color = item.farbe || item.color || `hsl(${itemIndex * 60}, 70%, 60%)`;
    
    // Wrapper for this item's sparkline
    const itemEl = document.createElement('div');
    itemEl.className = 'amorph-sparkline';
    itemEl.style.setProperty('--sparkline-color', color);
    
    // Item name as label - apply inline text color
    if (item.name || item.id) {
      const label = document.createElement('span');
      label.className = 'amorph-sparkline-label';
      label.textContent = item.name || item.id;
      if (item.textFarbe) label.style.color = item.textFarbe;
      itemEl.appendChild(label);
    }
    
    if (data.length < 2) {
      itemEl.innerHTML += '<span class="amorph-sparkline-leer">Zu wenig Daten</span>';
      container.appendChild(itemEl);
      return;
    }
    
    // Container for SVG and summary
    const svgContainer = document.createElement('div');
    svgContainer.className = 'amorph-sparkline-container';
    
    // Create SVG sparkline
    const svg = createSparklineSVG(data, color);
    svgContainer.appendChild(svg);
    
    // Create summary
    const summary = createSummary(data, color);
    svgContainer.appendChild(summary);
    
    itemEl.appendChild(svgContainer);
    
    // Tooltip
    itemEl.title = createTooltipText(data, item.name || item.id);
    
    container.appendChild(itemEl);
  });
  
  el.appendChild(container);
  return el;
}

function normalizeDaten(wert) {
  // Array of numbers
  if (Array.isArray(wert) && wert.every(v => typeof v === 'number')) {
    return wert.map((value, i) => ({ index: i, value }));
  }
  
  // Array of objects
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && item !== null)
      .map((item, i) => ({
        index: i,
        value: item.value || item.wert || item.amount || item.count || 0,
        label: item.date || item.datum || item.label || item.name || null
      }))
      .filter(d => typeof d.value === 'number');
  }
  
  // Object with trend array
  if (typeof wert === 'object' && wert !== null) {
    if (wert.trend && Array.isArray(wert.trend)) {
      return normalizeDaten(wert.trend);
    }
    if (wert.values && Array.isArray(wert.values)) {
      return normalizeDaten(wert.values);
    }
    if (wert.data && Array.isArray(wert.data)) {
      return normalizeDaten(wert.data);
    }
  }
  
  return [];
}

function createSparklineSVG(daten, color) {
  const width = 120;
  const height = 32;
  const padding = 2;
  
  const values = daten.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  // Calculate points
  const points = daten.map((d, i) => {
    const x = padding + (i / (daten.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, value: d.value };
  });
  
  // SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-sparkline-svg');
  svg.setAttribute('preserveAspectRatio', 'none');
  
  // Area under the line
  const areaPath = `M ${points[0].x} ${height} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height} Z`;
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', areaPath);
  area.setAttribute('class', 'amorph-sparkline-area');
  area.setAttribute('fill', color);
  area.setAttribute('fill-opacity', '0.2');
  svg.appendChild(area);
  
  // Line
  const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('d', linePath);
  line.setAttribute('class', 'amorph-sparkline-line');
  line.setAttribute('stroke', color);
  svg.appendChild(line);
  
  // Min/Max points
  const minPoint = points.reduce((a, b) => a.value < b.value ? a : b);
  const maxPoint = points.reduce((a, b) => a.value > b.value ? a : b);
  
  // Min point
  const minDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  minDot.setAttribute('cx', minPoint.x);
  minDot.setAttribute('cy', minPoint.y);
  minDot.setAttribute('r', 3);
  minDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-min');
  svg.appendChild(minDot);
  
  // Max point
  const maxDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  maxDot.setAttribute('cx', maxPoint.x);
  maxDot.setAttribute('cy', maxPoint.y);
  maxDot.setAttribute('r', 3);
  maxDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-max');
  svg.appendChild(maxDot);
  
  // Current (last) point
  const lastPoint = points[points.length - 1];
  const lastDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  lastDot.setAttribute('cx', lastPoint.x);
  lastDot.setAttribute('cy', lastPoint.y);
  lastDot.setAttribute('r', 4);
  lastDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-current');
  lastDot.setAttribute('fill', color);
  svg.appendChild(lastDot);
  
  return svg;
}

function createSummary(daten, color) {
  const values = daten.map(d => d.value);
  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePercent = first !== 0 ? ((change / first) * 100).toFixed(1) : 0;
  
  const summary = document.createElement('div');
  summary.className = 'amorph-sparkline-summary';
  
  // Trend icon and value
  const trend = document.createElement('span');
  trend.className = 'amorph-sparkline-trend';
  
  if (change > 0) {
    trend.classList.add('amorph-sparkline-up');
    trend.innerHTML = `<span class="trend-icon">↑</span>${Math.abs(changePercent)}%`;
  } else if (change < 0) {
    trend.classList.add('amorph-sparkline-down');
    trend.innerHTML = `<span class="trend-icon">↓</span>${Math.abs(changePercent)}%`;
  } else {
    trend.classList.add('amorph-sparkline-stable');
    trend.innerHTML = `<span class="trend-icon">→</span>0%`;
  }
  
  summary.appendChild(trend);
  
  // Current value
  const current = document.createElement('span');
  current.className = 'amorph-sparkline-current-value';
  current.textContent = formatNumber(last);
  summary.appendChild(current);
  
  return summary;
}

function createTooltipText(daten, name) {
  const values = daten.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const last = values[values.length - 1];
  
  const prefix = name ? `${name}: ` : '';
  return `${prefix}Aktuell: ${formatNumber(last)} | Min: ${formatNumber(min)} | Max: ${formatNumber(max)} | Ø ${formatNumber(avg)}`;
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1 && value !== 0) return value.toFixed(2);
  return value.toFixed(1);
}

export default compareSparkline;

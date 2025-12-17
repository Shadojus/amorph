/**
 * COMPARE SPARKLINE - UNIFIED overlapping sparklines
 * All sparklines shown in ONE SVG for direct comparison
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
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const data = normalizeDaten(item.value ?? item.wert);
    return {
      ...item,
      data,
      index: idx,
      // Use pilz farbe (neon) - prefer lineFarbe for lines
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  }).filter(item => item.data.length >= 2);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Zu wenig Daten</div>';
    return el;
  }
  
  // Find global min/max across all data
  let globalMin = Infinity;
  let globalMax = -Infinity;
  let maxLength = 0;
  
  parsedItems.forEach(item => {
    item.data.forEach(d => {
      if (d.value < globalMin) globalMin = d.value;
      if (d.value > globalMax) globalMax = d.value;
    });
    if (item.data.length > maxLength) maxLength = item.data.length;
  });
  
  const range = globalMax - globalMin || 1;
  
  // UNIFIED sparkline container
  const sparklineContainer = document.createElement('div');
  sparklineContainer.className = 'amorph-sparkline amorph-sparkline-compare';
  
  // Create ONE SVG with all lines overlapped
  const width = 280;
  const height = 80;
  const padding = 8;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-sparkline-svg');
  svg.setAttribute('preserveAspectRatio', 'none');
  
  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * (height - padding * 2);
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', padding);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('x2', width - padding);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    gridLine.setAttribute('stroke-width', '1');
    svg.appendChild(gridLine);
  }
  
  // Draw all lines in ONE SVG
  parsedItems.forEach((item, idx) => {
    const points = item.data.map((d, i) => {
      const x = padding + (i / (item.data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - globalMin) / range) * (height - padding * 2);
      return { x, y, value: d.value };
    });
    
    // Area (subtle fill)
    const areaPath = `M ${points[0].x} ${height - padding} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - padding} Z`;
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', item.color);
    area.setAttribute('fill-opacity', '0.1');
    svg.appendChild(area);
    
    // Line with NEON glow
    const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    
    // Glow effect
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', linePath);
    glow.setAttribute('stroke', item.glowFarbe || item.color);
    glow.setAttribute('stroke-width', '6');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('opacity', '0.3');
    glow.setAttribute('stroke-linecap', 'round');
    svg.appendChild(glow);
    
    // Main line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', linePath);
    line.setAttribute('stroke', item.color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);
    
    // End point marker
    const lastPoint = points[points.length - 1];
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', lastPoint.x);
    dot.setAttribute('cy', lastPoint.y);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', item.color);
    svg.appendChild(dot);
  });
  
  sparklineContainer.appendChild(svg);
  
  // Legend below
  const legend = document.createElement('div');
  legend.className = 'amorph-sparkline-legend';
  
  parsedItems.forEach(item => {
    const values = item.data.map(d => d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? ((change / first) * 100).toFixed(1) : 0;
    
    const legendItem = document.createElement('div');
    legendItem.className = 'sparkline-legend-item';
    
    const colorLine = document.createElement('span');
    colorLine.className = 'sparkline-legend-line';
    colorLine.style.background = item.color;
    colorLine.style.boxShadow = `0 0 6px ${item.glowFarbe || item.color}`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'sparkline-legend-name';
    nameSpan.textContent = item.name || item.id;
    if (item.textFarbe) nameSpan.style.color = item.textFarbe;
    
    const trendSpan = document.createElement('span');
    trendSpan.className = 'sparkline-legend-trend';
    trendSpan.style.color = change >= 0 ? 'rgba(100, 220, 140, 0.9)' : 'rgba(240, 100, 100, 0.9)';
    trendSpan.textContent = `${change >= 0 ? '+' : ''}${changePercent}%`;
    
    legendItem.appendChild(colorLine);
    legendItem.appendChild(nameSpan);
    legendItem.appendChild(trendSpan);
    legend.appendChild(legendItem);
  });
  
  sparklineContainer.appendChild(legend);
  el.appendChild(sparklineContainer);
  
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

export default compareSparkline;

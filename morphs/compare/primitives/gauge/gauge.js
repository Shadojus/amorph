/**
 * COMPARE GAUGE - UNIFIED Gauge comparison
 * All needles shown in ONE gauge for direct comparison
 */

import { debug } from '../../../../observer/debug.js';

export function compareGauge(items, config = {}) {
  debug.morphs('compareGauge', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-gauge';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items and find global min/max
  let globalMin = Infinity;
  let globalMax = -Infinity;
  
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    let value, min, max;
    
    if (typeof rawVal === 'number') {
      value = rawVal;
      min = config.min ?? 0;
      max = config.max ?? 100;
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      value = rawVal.value ?? rawVal.score ?? rawVal.wert ?? 0;
      min = rawVal.min ?? config.min ?? 0;
      max = rawVal.max ?? config.max ?? 100;
    } else {
      value = 0;
      min = 0;
      max = 100;
    }
    
    globalMin = Math.min(globalMin, min);
    globalMax = Math.max(globalMax, max);
    
    return {
      ...item,
      value,
      min,
      max,
      index: idx,
      // Farben werden durchgereicht, item hat bereits lineFarbe etc.
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`
    };
  });
  
  const range = globalMax - globalMin || 1;
  
  // Calculate percent for each item based on global scale
  parsedItems.forEach(item => {
    item.percent = Math.min(100, Math.max(0, ((item.value - globalMin) / range) * 100));
  });
  
  // UNIFIED gauge with all needles
  const gaugeEl = document.createElement('div');
  gaugeEl.className = 'amorph-gauge amorph-gauge-compare';
  
  const size = config.size || 200;
  const strokeWidth = 12;
  const radius = (size / 2) - strokeWidth;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size / 2 + 30}`);
  svg.setAttribute('class', 'amorph-gauge-svg');
  
  // Background arc
  const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bgArc.setAttribute('d', createArc(size / 2, size / 2, radius, 180, 0));
  bgArc.setAttribute('fill', 'none');
  bgArc.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  bgArc.setAttribute('stroke-width', strokeWidth);
  bgArc.setAttribute('stroke-linecap', 'round');
  svg.appendChild(bgArc);
  
  // Color zones
  const zones = [
    { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.15)' },
    { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.15)' },
    { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.15)' }
  ];
  
  for (const zone of zones) {
    const startAngle = 180 - (zone.start / 100 * 180);
    const endAngle = 180 - (zone.end / 100 * 180);
    const zoneArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    zoneArc.setAttribute('d', createArc(size / 2, size / 2, radius, startAngle, endAngle));
    zoneArc.setAttribute('fill', 'none');
    zoneArc.setAttribute('stroke', zone.color);
    zoneArc.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(zoneArc);
  }
  
  // ALL needles in one gauge with NEON glow
  parsedItems.forEach((item, idx) => {
    const needleAngle = (180 - (item.percent / 100 * 180)) * (Math.PI / 180);
    const needleLength = radius - 15 - (idx * 5); // Slightly different lengths
    const needleX = (size / 2) + Math.cos(needleAngle) * needleLength;
    const needleY = (size / 2) - Math.sin(needleAngle) * needleLength;
    
    // Use NEON colors
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    
    // Needle glow (outer)
    const needleGlow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needleGlow.setAttribute('x1', size / 2);
    needleGlow.setAttribute('y1', size / 2);
    needleGlow.setAttribute('x2', needleX);
    needleGlow.setAttribute('y2', needleY);
    needleGlow.setAttribute('stroke', glowColor);
    needleGlow.setAttribute('stroke-width', '8');
    needleGlow.setAttribute('stroke-linecap', 'round');
    needleGlow.setAttribute('opacity', '0.3');
    svg.appendChild(needleGlow);
    
    // Needle
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', size / 2);
    needle.setAttribute('y1', size / 2);
    needle.setAttribute('x2', needleX);
    needle.setAttribute('y2', needleY);
    needle.setAttribute('stroke', lineColor);
    needle.setAttribute('stroke-width', '3');
    needle.setAttribute('stroke-linecap', 'round');
    needle.setAttribute('class', 'amorph-gauge-needle');
    svg.appendChild(needle);
    
    // Value marker on arc with glow
    const markerAngle = (180 - (item.percent / 100 * 180)) * (Math.PI / 180);
    const markerX = (size / 2) + Math.cos(markerAngle) * (radius + strokeWidth / 2 + 3);
    const markerY = (size / 2) - Math.sin(markerAngle) * (radius + strokeWidth / 2 + 3);
    
    // Marker glow
    const markerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    markerGlow.setAttribute('cx', markerX);
    markerGlow.setAttribute('cy', markerY);
    markerGlow.setAttribute('r', '8');
    markerGlow.setAttribute('fill', glowColor);
    markerGlow.setAttribute('opacity', '0.4');
    svg.appendChild(markerGlow);
    
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', markerX);
    marker.setAttribute('cy', markerY);
    marker.setAttribute('r', '5');
    marker.setAttribute('fill', lineColor);
    svg.appendChild(marker);
  });
  
  // Center dot
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('cx', size / 2);
  center.setAttribute('cy', size / 2);
  center.setAttribute('r', '8');
  center.setAttribute('fill', 'rgba(0,0,0,0.8)');
  center.setAttribute('stroke', 'rgba(255,255,255,0.5)');
  center.setAttribute('stroke-width', '2');
  svg.appendChild(center);
  
  // Min/Max labels
  const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  minLabel.setAttribute('x', strokeWidth);
  minLabel.setAttribute('y', size / 2 + 5);
  minLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  minLabel.setAttribute('font-size', '10');
  minLabel.textContent = String(globalMin);
  svg.appendChild(minLabel);
  
  const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  maxLabel.setAttribute('x', size - strokeWidth - 15);
  maxLabel.setAttribute('y', size / 2 + 5);
  maxLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  maxLabel.setAttribute('font-size', '10');
  maxLabel.textContent = String(globalMax);
  svg.appendChild(maxLabel);
  
  gaugeEl.appendChild(svg);
  
  // Legend with values below gauge - with NEON glow
  const legend = document.createElement('div');
  legend.className = 'amorph-gauge-legend';
  
  parsedItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'gauge-legend-item';
    
    const lineColor = item.lineFarbe || item.farbe || item.color;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    const colorDot = document.createElement('span');
    colorDot.className = 'gauge-legend-dot';
    colorDot.style.background = lineColor;
    colorDot.style.boxShadow = `0 0 8px ${glowColor}`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'gauge-legend-name';
    nameSpan.textContent = item.name || item.id;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'gauge-legend-value';
    valueSpan.textContent = item.value;
    valueSpan.style.color = textColor;
    
    legendItem.appendChild(colorDot);
    legendItem.appendChild(nameSpan);
    legendItem.appendChild(valueSpan);
    legend.appendChild(legendItem);
  });
  
  gaugeEl.appendChild(legend);
  el.appendChild(gaugeEl);
  
  return el;
}

function createArc(cx, cy, r, startAngle, endAngle) {
  if (!isFinite(cx) || !isFinite(cy) || !isFinite(r) || !isFinite(startAngle) || !isFinite(endAngle)) {
    return 'M 0 0';
  }
  
  const start = {
    x: cx + r * Math.cos(startAngle * Math.PI / 180),
    y: cy - r * Math.sin(startAngle * Math.PI / 180)
  };
  const end = {
    x: cx + r * Math.cos(endAngle * Math.PI / 180),
    y: cy - r * Math.sin(endAngle * Math.PI / 180)
  };
  
  if (!isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
    return 'M 0 0';
  }
  
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = startAngle > endAngle ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function getGaugeColor(percent) {
  if (percent >= 66) return 'rgba(100, 220, 140, 0.9)';
  if (percent >= 33) return 'rgba(240, 200, 80, 0.9)';
  return 'rgba(240, 80, 80, 0.9)';
}

export default compareGauge;
/**
 * COMPARE GAUGE - Gauge comparison
 * Uses the exact same HTML structure as the original gauge morph
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
  
  // Container for all gauges
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
    
    // Extract gauge data
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
    
    const range = max - min || 1;
    const percent = Math.min(100, Math.max(0, ((value - min) / range) * 100));
    
    // Use original gauge structure
    const gaugeEl = document.createElement('div');
    gaugeEl.className = 'amorph-gauge';
    
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'amorph-gauge-container';
    gaugeContainer.style.setProperty('--gauge-count', '1');
    
    const gaugeItem = document.createElement('div');
    gaugeItem.className = 'amorph-gauge-item';
    
    const size = config.size || 120;
    const strokeWidth = 10;
    const radius = (size / 2) - strokeWidth;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size / 2 + 10}`);
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
      { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.2)' },
      { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.2)' },
      { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.2)' }
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
    
    // Value arc
    const valueAngle = 180 - (percent / 100 * 180);
    const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    valueArc.setAttribute('d', createArc(size / 2, size / 2, radius, 180, valueAngle));
    valueArc.setAttribute('fill', 'none');
    valueArc.setAttribute('stroke', getGaugeColor(percent));
    valueArc.setAttribute('stroke-width', strokeWidth);
    valueArc.setAttribute('stroke-linecap', 'round');
    valueArc.setAttribute('class', 'amorph-gauge-value-arc');
    svg.appendChild(valueArc);
    
    // Needle
    const needleAngle = (180 - (percent / 100 * 180)) * (Math.PI / 180);
    const needleLength = radius - 15;
    const needleX = (size / 2) + Math.cos(needleAngle) * needleLength;
    const needleY = (size / 2) - Math.sin(needleAngle) * needleLength;
    
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', size / 2);
    needle.setAttribute('y1', size / 2);
    needle.setAttribute('x2', needleX);
    needle.setAttribute('y2', needleY);
    needle.setAttribute('stroke', 'white');
    needle.setAttribute('stroke-width', '2');
    needle.setAttribute('stroke-linecap', 'round');
    needle.setAttribute('class', 'amorph-gauge-needle');
    svg.appendChild(needle);
    
    // Center dot
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', size / 2);
    center.setAttribute('cy', size / 2);
    center.setAttribute('r', '6');
    center.setAttribute('fill', 'rgba(0,0,0,0.8)');
    center.setAttribute('stroke', 'white');
    center.setAttribute('stroke-width', '2');
    svg.appendChild(center);
    
    // Min/Max labels
    const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minLabel.setAttribute('x', strokeWidth);
    minLabel.setAttribute('y', size / 2 + 5);
    minLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
    minLabel.setAttribute('font-size', '8');
    minLabel.textContent = String(min);
    svg.appendChild(minLabel);
    
    const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    maxLabel.setAttribute('x', size - strokeWidth - 10);
    maxLabel.setAttribute('y', size / 2 + 5);
    maxLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
    maxLabel.setAttribute('font-size', '8');
    maxLabel.textContent = String(max);
    svg.appendChild(maxLabel);
    
    gaugeItem.appendChild(svg);
    
    // Value display
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'amorph-gauge-display';
    valueDisplay.innerHTML = `
      <span class="amorph-gauge-number" style="color: ${getGaugeColor(percent)}">${value}</span>
    `;
    gaugeItem.appendChild(valueDisplay);
    
    gaugeContainer.appendChild(gaugeItem);
    gaugeEl.appendChild(gaugeContainer);
    
    wrapper.appendChild(gaugeEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

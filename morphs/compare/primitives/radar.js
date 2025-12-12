/**
 * COMPARE RADAR - Overlapping radar charts
 */

import { debug } from '../../../../observer/debug.js';

export function compareRadar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar';
  
  const firstVal = items[0]?.value ?? items[0]?.wert;
  if (!items.length || !firstVal) {
    el.innerHTML = '<div class="compare-empty">No profile data</div>';
    return el;
  }
  
  // Axes from first item
  const axes = Array.isArray(firstVal) 
    ? firstVal.map(a => a.axis || a.label || a.name)
    : Object.keys(firstVal);
  
  if (axes.length < 3) {
    return compareRadarCompact(items, config);
  }
  
  // Create SVG
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'compare-radar-svg');
  
  // Grid
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const points = axes.map((_, i) => {
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'radar-grid');
    svg.appendChild(polygon);
  }
  
  // Scale labels (33, 66, 100)
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const scaleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    scaleText.setAttribute('x', cx + 3);
    scaleText.setAttribute('y', cy - r - 1);
    scaleText.setAttribute('class', 'radar-scale-label');
    scaleText.textContent = String(Math.round((level / 3) * 100));
    svg.appendChild(scaleText);
  }
  
  // Axis lines
  axes.forEach((axis, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + Math.cos(angle) * radius);
    line.setAttribute('y2', cy + Math.sin(angle) * radius);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);
    
    // Label
    const labelR = radius + 12;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx + Math.cos(angle) * labelR);
    text.setAttribute('y', cy + Math.sin(angle) * labelR);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = axis;
    svg.appendChild(text);
  });
  
  // Data shapes for each item
  items.forEach(item => {
    const val = item.value ?? item.wert;
    const values = normalizeRadarValues(val, axes);
    const points = axes.map((axis, i) => {
      const v = values[axis] || 0;
      const r = (v / 100) * radius;
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', `radar-shape ${item.colorClass || item.farbKlasse || ''}`);
    
    // Inline styles with data from createColors() - color=fill, textColor=line
    const fillColor = item.color || item.farbe || 'rgba(100,100,100,0.24)';
    const strokeColor = item.lineColor || item.lineFarbe || item.textColor || item.textFarbe || item.color || item.farbe || 'rgba(100,100,100,0.70)';
    polygon.setAttribute('style', `fill:${fillColor};stroke:${strokeColor};stroke-width:2.5`);
    
    svg.appendChild(polygon);
  });
  
  el.appendChild(svg);
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'compare-legend';
  items.forEach(item => {
    const legendItem = document.createElement('span');
    legendItem.className = `legend-item ${item.colorClass || item.farbKlasse || ''}`;
    
    // Inline styles for reliable rendering
    const dotColor = item.lineColor || item.lineFarbe || item.textColor || item.textFarbe || item.color || item.farbe || 'rgba(100,100,100,0.7)';
    const textColor = item.textColor || item.textFarbe || 'rgba(255,255,255,0.85)';
    const itemName = item.name || item.id || '–';
    legendItem.innerHTML = `<span class="legend-dot" style="background:${dotColor}"></span><span style="color:${textColor}">${itemName}</span>`;
    legend.appendChild(legendItem);
  });
  el.appendChild(legend);
  
  return el;
}

function compareRadarCompact(items, config) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar-compact';
  
  const allAxes = new Set();
  items.forEach(item => {
    const val = item.value ?? item.wert;
    if (Array.isArray(val)) {
      val.forEach(a => allAxes.add(a.axis || a.label || a.name));
    } else if (typeof val === 'object') {
      Object.keys(val).forEach(k => allAxes.add(k));
    }
  });
  
  [...allAxes].forEach(axis => {
    const row = document.createElement('div');
    row.className = 'radar-compact-row';
    row.innerHTML = `<span class="radar-axis-label">${axis}</span>`;
    
    const bars = document.createElement('div');
    bars.className = 'radar-compact-bars';
    
    items.forEach(item => {
      const val = item.value ?? item.wert;
      const values = normalizeRadarValues(val, [axis]);
      const v = values[axis] || 0;
      const itemName = item.name || item.id || '–';
      const fillColor = item.color || item.farbe;
      bars.innerHTML += `
        <div class="radar-mini-bar" style="width:${v}%;background:${fillColor}" title="${itemName}: ${v}"></div>
      `;
    });
    
    row.appendChild(bars);
    el.appendChild(row);
  });
  
  return el;
}

function normalizeRadarValues(val, axes) {
  const result = {};
  
  if (Array.isArray(val)) {
    val.forEach(item => {
      const key = item.axis || item.label || item.name;
      result[key] = item.value || item.score || 0;
    });
  } else if (typeof val === 'object') {
    Object.assign(result, val);
  }
  
  return result;
}

export default compareRadar;

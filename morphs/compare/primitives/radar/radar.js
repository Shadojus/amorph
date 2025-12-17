/**
 * COMPARE RADAR - OVERLAPPING radar charts in ONE SVG
 * All items are rendered as overlapping shapes in a single radar chart
 */

import { debug } from '../../../../observer/debug.js';

export function compareRadar(items, config = {}) {
  debug.morphs('compareRadar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Normalize all items' data first
  const normalizedItems = items.map((item, idx) => {
    const val = item.value ?? item.wert;
    const achsen = normalisiereWert(val);
    return { ...item, achsen, index: idx };
  }).filter(item => item.achsen.length >= 3);
  
  if (normalizedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Min. 3 Achsen benötigt</div>';
    return el;
  }
  
  // Use first item's axes as reference (all items should have same axes)
  const referenceAxes = normalizedItems[0].achsen;
  const axisCount = referenceAxes.length;
  
  // Find global max across all items for consistent scaling
  let globalMax = 0;
  normalizedItems.forEach(item => {
    item.achsen.forEach(a => {
      if (a.value > globalMax) globalMax = a.value;
    });
  });
  const isSmallScale = globalMax <= 10;
  
  // Normalize all values to 0-100 scale
  normalizedItems.forEach(item => {
    item.achsen.forEach(a => {
      a.normalized = isSmallScale ? a.value * 10 : Math.min(100, Math.max(0, a.value));
    });
  });
  
  // Container for the single radar chart
  const radarEl = document.createElement('div');
  radarEl.className = 'amorph-radar amorph-radar-compare';
  
  // Generate SVG
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 50;
  
  // Grid path
  const gridPath = generiereGrid(cx, cy, radius, axisCount);
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-radar-svg amorph-radar-svg-compare');
  
  // Grid
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  grid.setAttribute('d', gridPath);
  grid.setAttribute('class', 'amorph-radar-grid');
  svg.appendChild(grid);
  
  // Scale labels
  const skalaWerte = isSmallScale ? ['3.3', '6.6', '10'] : ['33', '66', '100'];
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const skalaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    skalaText.setAttribute('x', cx + 4);
    skalaText.setAttribute('y', cy - r - 2);
    skalaText.setAttribute('class', 'amorph-radar-scale');
    skalaText.textContent = skalaWerte[level - 1];
    svg.appendChild(skalaText);
  }
  
  // Axis lines
  for (let i = 0; i < axisCount; i++) {
    const end = berechnePoint(i, axisCount, 100, cx, cy, radius);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('class', 'amorph-radar-axis');
    svg.appendChild(line);
  }
  
  // === OVERLAPPING DATA SHAPES with NEON GLOW ===
  // Add SVG filter for glow effect - use item.index for consistent IDs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  normalizedItems.forEach((item) => {
    const glowColor = item.glowFarbe || item.lineFarbe || item.farbe || '#ff00ff';
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    // WICHTIG: item.index verwenden, nicht loop idx, damit es mit dem Shape matched
    filter.setAttribute('id', `radar-glow-${item.index}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    filter.innerHTML = `
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feFlood flood-color="${glowColor}" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    `;
    defs.appendChild(filter);
  });
  svg.appendChild(defs);
  
  // Render all items' shapes in the SAME SVG (in reverse order so first item is on top)
  [...normalizedItems].reverse().forEach((item, reverseIdx) => {
    const achsen = item.achsen;
    
    // Calculate points for this item
    const dataPoints = achsen.map((a, i) => 
      berechnePoint(i, axisCount, a.normalized, cx, cy, radius)
    );
    const dataPath = `M ${dataPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
    
    // Data shape with transparency for overlap visibility
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', dataPath);
    shape.setAttribute('class', `amorph-radar-shape amorph-radar-shape-${item.index}`);
    shape.setAttribute('data-item-id', item.id || item.index);
    shape.setAttribute('data-item-name', item.name || `Item ${item.index + 1}`);
    
    // Use item NEON colors
    const fillColor = item.lineFarbe || item.farbe || `hsl(${item.index * 90}, 70%, 55%)`;
    const strokeColor = item.lineFarbe || fillColor;
    shape.setAttribute('fill', fillColor);
    shape.setAttribute('stroke', strokeColor);
    shape.setAttribute('fill-opacity', '0.25');
    shape.setAttribute('stroke-width', '2.5');
    shape.setAttribute('filter', `url(#radar-glow-${item.index})`);
    svg.appendChild(shape);
    
    // Points for this item with NEON glow
    dataPoints.forEach((p, pIdx) => {
      // Glow circle behind
      const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glowCircle.setAttribute('cx', p.x);
      glowCircle.setAttribute('cy', p.y);
      glowCircle.setAttribute('r', 8);
      glowCircle.setAttribute('class', 'amorph-radar-point-glow');
      glowCircle.setAttribute('fill', item.glowFarbe || strokeColor);
      glowCircle.setAttribute('fill-opacity', '0.4');
      svg.appendChild(glowCircle);
      
      // Main point
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', 5);
      circle.setAttribute('class', `amorph-radar-point amorph-radar-point-${item.index}`);
      circle.setAttribute('fill', strokeColor);
      svg.appendChild(circle);
    });
  });
  
  radarEl.appendChild(svg);
  
  // Labels outside SVG (using reference axes)
  const labelsContainer = document.createElement('div');
  labelsContainer.className = 'amorph-radar-labels';
  
  for (let i = 0; i < axisCount; i++) {
    const pos = berechneLabelPos(i, axisCount, cx, cy, radius + 30);
    const labelEl = document.createElement('span');
    labelEl.className = 'amorph-radar-label';
    labelEl.textContent = referenceAxes[i].label;
    labelEl.style.left = `${(pos.x / size) * 100}%`;
    labelEl.style.top = `${(pos.y / size) * 100}%`;
    labelsContainer.appendChild(labelEl);
  }
  radarEl.appendChild(labelsContainer);
  
  el.appendChild(radarEl);
  
  // === INLINE LEGEND with NEON ===
  const legendEl = document.createElement('div');
  legendEl.className = 'amorph-radar-legend';
  normalizedItems.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'radar-legend-item';
    const color = item.lineFarbe || item.farbe || `hsl(${item.index * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || color;
    itemEl.innerHTML = `
      <span class="radar-legend-color" style="background: ${color}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span class="radar-legend-name">${item.name || item.id || `Item ${item.index + 1}`}</span>
    `;
    legendEl.appendChild(itemEl);
  });
  el.appendChild(legendEl);
  
  return el;
}

function normalisiereWert(wert) {
  // Array of objects
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object') {
        const value = item.value || item.wert || item.score || item.rating || 
                     item.strength || item.intensity || 0;
        const label = item.axis || item.achse || item.label || item.name || 
                     item.dimension || item.kategorie || 'Unbekannt';
        return { label: kuerzeLabel(label), value };
      }
      return null;
    }).filter(Boolean).slice(0, 12);
  }
  
  // Object: {A: 80, B: 60}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([_, v]) => typeof v === 'number')
      .map(([label, value]) => ({ label: kuerzeLabel(label), value }))
      .slice(0, 12);
  }
  
  return [];
}

function kuerzeLabel(label) {
  if (label.length > 10) {
    return label.replace(/_/g, ' ').split(' ')[0].slice(0, 10);
  }
  return label;
}

function berechnePoint(index, total, value, cx, cy, radius) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / 100) * radius;
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r
  };
}

function berechneLabelPos(index, total, cx, cy, radius) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function generiereGrid(cx, cy, radius, points) {
  let path = '';
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const levelPoints = [];
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
      levelPoints.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      });
    }
    path += `M ${levelPoints[0].x} ${levelPoints[0].y} `;
    for (let i = 1; i < levelPoints.length; i++) {
      path += `L ${levelPoints[i].x} ${levelPoints[i].y} `;
    }
    path += 'Z ';
  }
  return path;
}

export default compareRadar;

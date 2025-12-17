/**
 * COMPARE RADAR - Overlapping radar charts
 * Uses the exact same HTML structure as the original radar morph
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
  
  // Container for all radar charts
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Create a radar chart for each item using original structure
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    
    // Normalize data
    const achsen = normalisiereWert(val);
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Use original radar structure
    const radarEl = document.createElement('div');
    radarEl.className = 'amorph-radar';
    
    // Title with item name - apply inline text color
    const titel = document.createElement('div');
    titel.className = 'amorph-radar-titel';
    titel.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) titel.style.color = item.textFarbe;
    radarEl.appendChild(titel);
    
    if (achsen.length < 3) {
      radarEl.innerHTML += '<span class="amorph-radar-leer">Min. 3 Achsen benötigt</span>';
      wrapper.appendChild(radarEl);
      container.appendChild(wrapper);
      return;
    }
    
    // Normalize values (0-100)
    const maxRaw = Math.max(...achsen.map(a => a.value));
    const isSmallScale = maxRaw <= 10;
    achsen.forEach(a => {
      a.normalized = isSmallScale ? a.value * 10 : Math.min(100, Math.max(0, a.value));
    });
    
    // Generate SVG
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 40;
    
    // Grid path
    const gridPath = generiereGrid(cx, cy, radius, achsen.length);
    
    // Data path
    const dataPoints = achsen.map((a, i) => 
      berechnePoint(i, achsen.length, a.normalized, cx, cy, radius)
    );
    const dataPath = `M ${dataPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('class', 'amorph-radar-svg');
    
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
    for (let i = 0; i < achsen.length; i++) {
      const end = berechnePoint(i, achsen.length, 100, cx, cy, radius);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', end.x);
      line.setAttribute('y2', end.y);
      line.setAttribute('class', 'amorph-radar-axis');
      svg.appendChild(line);
    }
    
    // Data shape - apply inline style for fill color
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', dataPath);
    shape.setAttribute('class', 'amorph-radar-shape');
    if (item.farbe) {
      shape.setAttribute('fill', item.farbe);
      shape.setAttribute('stroke', item.lineFarbe || item.farbe);
    }
    svg.appendChild(shape);
    
    // Points
    for (const p of dataPoints) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', 4);
      circle.setAttribute('class', 'amorph-radar-point');
      svg.appendChild(circle);
    }
    
    radarEl.appendChild(svg);
    
    // Labels outside SVG
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'amorph-radar-labels';
    
    for (let i = 0; i < achsen.length; i++) {
      const pos = berechneLabelPos(i, achsen.length, cx, cy, radius + 25);
      const labelEl = document.createElement('span');
      labelEl.className = 'amorph-radar-label';
      labelEl.textContent = achsen[i].label;
      labelEl.style.left = `${(pos.x / size) * 100}%`;
      labelEl.style.top = `${(pos.y / size) * 100}%`;
      labelsContainer.appendChild(labelEl);
    }
    radarEl.appendChild(labelsContainer);
    
    wrapper.appendChild(radarEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

/**
 * COMPARE SCATTERPLOT - UNIFIED Scatter plot comparison
 * All points from all items shown in ONE SVG with different colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareScatterplot(items, config = {}) {
  debug.morphs('compareScatterplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-scatterplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const punkte = normalisiereWert(rawVal);
    return {
      ...item,
      punkte,
      index: idx,
      // Use pilz neon colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  }).filter(item => item.punkte.length > 0);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Scatter-Daten</div>';
    return el;
  }
  
  // Find global min/max across all points
  let xMin = Infinity, xMax = -Infinity;
  let yMin = Infinity, yMax = -Infinity;
  
  parsedItems.forEach(item => {
    item.punkte.forEach(p => {
      if (p.x < xMin) xMin = p.x;
      if (p.x > xMax) xMax = p.x;
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    });
  });
  
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  
  // UNIFIED scatterplot container
  const scatterContainer = document.createElement('div');
  scatterContainer.className = 'amorph-scatterplot amorph-scatterplot-compare';
  
  const width = config.width || 280;
  const height = config.height || 200;
  const padding = 40;
  
  const scaleX = (x) => padding + ((x - xMin) / xRange) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - yMin) / yRange) * (height - padding * 2);
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-scatterplot-svg');
  
  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * (height - padding * 2);
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', padding);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('x2', width - padding);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    svg.appendChild(gridLine);
  }
  
  // Axes
  const xAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAchse.setAttribute('x1', padding);
  xAchse.setAttribute('y1', height - padding);
  xAchse.setAttribute('x2', width - padding);
  xAchse.setAttribute('y2', height - padding);
  xAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
  svg.appendChild(xAchse);
  
  const yAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAchse.setAttribute('x1', padding);
  yAchse.setAttribute('y1', padding);
  yAchse.setAttribute('x2', padding);
  yAchse.setAttribute('y2', height - padding);
  yAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
  svg.appendChild(yAchse);
  
  // Axis labels
  const xMinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xMinLabel.setAttribute('x', padding);
  xMinLabel.setAttribute('y', height - padding + 15);
  xMinLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  xMinLabel.setAttribute('font-size', '9');
  xMinLabel.textContent = xMin.toFixed(1);
  svg.appendChild(xMinLabel);
  
  const xMaxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xMaxLabel.setAttribute('x', width - padding);
  xMaxLabel.setAttribute('y', height - padding + 15);
  xMaxLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  xMaxLabel.setAttribute('font-size', '9');
  xMaxLabel.setAttribute('text-anchor', 'end');
  xMaxLabel.textContent = xMax.toFixed(1);
  svg.appendChild(xMaxLabel);
  
  // All points from all items in ONE SVG
  parsedItems.forEach(item => {
    item.punkte.forEach(punkt => {
      const cx = scaleX(punkt.x);
      const cy = scaleY(punkt.y);
      
      if (!isFinite(cx) || !isFinite(cy)) return;
      
      // Glow circle
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', cx);
      glow.setAttribute('cy', cy);
      glow.setAttribute('r', (config.dotSize || 5) + 3);
      glow.setAttribute('fill', item.glowColor);
      glow.setAttribute('opacity', '0.3');
      svg.appendChild(glow);
      
      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', config.dotSize || 5);
      circle.setAttribute('fill', item.color);
      circle.setAttribute('class', 'amorph-scatterplot-punkt');
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${item.name}: (${punkt.x}, ${punkt.y})`;
      circle.appendChild(title);
      
      svg.appendChild(circle);
    });
  });
  
  scatterContainer.appendChild(svg);
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'amorph-scatterplot-legend';
  
  parsedItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'scatterplot-legend-item';
    
    const dot = document.createElement('span');
    dot.className = 'scatterplot-legend-dot';
    dot.style.background = item.color;
    dot.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
    
    const name = document.createElement('span');
    name.className = 'scatterplot-legend-name';
    name.textContent = item.name || item.id;
    if (item.textFarbe) name.style.color = item.textFarbe;
    
    const count = document.createElement('span');
    count.className = 'scatterplot-legend-count';
    count.textContent = `${item.punkte.length} Punkte`;
    
    legendItem.appendChild(dot);
    legendItem.appendChild(name);
    legendItem.appendChild(count);
    legend.appendChild(legendItem);
  });
  
  scatterContainer.appendChild(legend);
  el.appendChild(scatterContainer);
  
  return el;
}

function normalisiereWert(wert) {
  if (!wert) return [];
  
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          x: item.x ?? item[0] ?? 0,
          y: item.y ?? item[1] ?? 0,
          label: item.label || item.name || ''
        };
      }
      return { x: 0, y: item, label: '' };
    }).filter(p => isFinite(p.x) && isFinite(p.y));
  }
  
  if (typeof wert === 'object') {
    const data = wert.points || wert.data || wert.punkte || [];
    return data.map(item => ({
      x: item.x ?? item[0] ?? 0,
      y: item.y ?? item[1] ?? 0,
      label: item.label || item.name || ''
    })).filter(p => isFinite(p.x) && isFinite(p.y));
  }
  
  return [];
}

export default compareScatterplot;

/**
 * COMPARE SLOPEGRAPH - UNIFIED slope graph comparison
 * All items' slopes overlaid in one chart with NEON pilz colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareSlopegraph(items, config = {}) {
  debug.morphs('compareSlopegraph', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-slopegraph';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Normalize all items' data
  const normalizedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const { daten, labels } = normalisiereDaten(rawVal);
    return { ...item, daten, labels, index: idx };
  }).filter(item => item.daten.length > 0);
  
  if (normalizedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Vergleichsdaten</div>';
    return el;
  }
  
  // Use first item's labels as reference
  const referenceLabels = normalizedItems[0].labels;
  
  // Find global min/max across ALL items
  let globalMin = Infinity, globalMax = -Infinity;
  normalizedItems.forEach(item => {
    item.daten.forEach(d => {
      globalMin = Math.min(globalMin, d.vorher, d.nachher);
      globalMax = Math.max(globalMax, d.vorher, d.nachher);
    });
  });
  const range = globalMax - globalMin || 1;
  
  // Create unified slopegraph container
  const slopegraphEl = document.createElement('div');
  slopegraphEl.className = 'amorph-slopegraph amorph-slopegraph-compare';
  
  // Header with time labels
  const header = document.createElement('div');
  header.className = 'amorph-slopegraph-header';
  header.innerHTML = `
    <span class="amorph-slopegraph-zeit">${referenceLabels.vorher}</span>
    <span class="amorph-slopegraph-zeit">${referenceLabels.nachher}</span>
  `;
  slopegraphEl.appendChild(header);
  
  // Main SVG with all slopes from all items
  const svgHeight = 180;
  const svgWidth = 280;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('class', 'amorph-slopegraph-svg-unified');
  
  // Add SVG filter defs for glow effects
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  normalizedItems.forEach((item, idx) => {
    const glowColor = item.glowFarbe || item.lineFarbe || item.farbe || '#ff00ff';
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `slope-glow-${idx}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    filter.innerHTML = `
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
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
  
  // Draw all items' slopes
  normalizedItems.forEach((item, itemIdx) => {
    const lineColor = item.lineFarbe || item.farbe || `hsl(${itemIdx * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    
    item.daten.slice(0, 5).forEach((d, dataIdx) => {
      // Calculate Y positions with staggering to reduce overlap
      const baseOffset = (dataIdx / (item.daten.length || 1)) * (svgHeight - 40);
      const y1 = 15 + ((1 - (d.vorher - globalMin) / range) * (svgHeight - 30));
      const y2 = 15 + ((1 - (d.nachher - globalMin) / range) * (svgHeight - 30));
      
      const x1 = 40;
      const x2 = svgWidth - 40;
      
      // Glow line behind
      const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      glowLine.setAttribute('x1', x1);
      glowLine.setAttribute('y1', y1);
      glowLine.setAttribute('x2', x2);
      glowLine.setAttribute('y2', y2);
      glowLine.setAttribute('stroke', glowColor);
      glowLine.setAttribute('stroke-width', '6');
      glowLine.setAttribute('stroke-opacity', '0.3');
      glowLine.setAttribute('stroke-linecap', 'round');
      svg.appendChild(glowLine);
      
      // Main line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('filter', `url(#slope-glow-${itemIdx})`);
      svg.appendChild(line);
      
      // Start dot with glow
      const glowDot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glowDot1.setAttribute('cx', x1);
      glowDot1.setAttribute('cy', y1);
      glowDot1.setAttribute('r', 8);
      glowDot1.setAttribute('fill', glowColor);
      glowDot1.setAttribute('fill-opacity', '0.3');
      svg.appendChild(glowDot1);
      
      const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot1.setAttribute('cx', x1);
      dot1.setAttribute('cy', y1);
      dot1.setAttribute('r', 5);
      dot1.setAttribute('fill', lineColor);
      svg.appendChild(dot1);
      
      // End dot with glow
      const glowDot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glowDot2.setAttribute('cx', x2);
      glowDot2.setAttribute('cy', y2);
      glowDot2.setAttribute('r', 8);
      glowDot2.setAttribute('fill', glowColor);
      glowDot2.setAttribute('fill-opacity', '0.3');
      svg.appendChild(glowDot2);
      
      const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot2.setAttribute('cx', x2);
      dot2.setAttribute('cy', y2);
      dot2.setAttribute('r', 5);
      dot2.setAttribute('fill', lineColor);
      svg.appendChild(dot2);
      
      // Value labels at ends
      const labelStart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelStart.setAttribute('x', x1 - 5);
      labelStart.setAttribute('y', y1);
      labelStart.setAttribute('text-anchor', 'end');
      labelStart.setAttribute('dominant-baseline', 'middle');
      labelStart.setAttribute('class', 'slopegraph-value-label');
      labelStart.setAttribute('fill', lineColor);
      labelStart.textContent = d.vorher.toFixed(0);
      svg.appendChild(labelStart);
      
      const labelEnd = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelEnd.setAttribute('x', x2 + 5);
      labelEnd.setAttribute('y', y2);
      labelEnd.setAttribute('text-anchor', 'start');
      labelEnd.setAttribute('dominant-baseline', 'middle');
      labelEnd.setAttribute('class', 'slopegraph-value-label');
      labelEnd.setAttribute('fill', lineColor);
      labelEnd.textContent = d.nachher.toFixed(0);
      svg.appendChild(labelEnd);
    });
  });
  
  slopegraphEl.appendChild(svg);
  el.appendChild(slopegraphEl);
  
  // Legend with NEON glow
  const legendEl = document.createElement('div');
  legendEl.className = 'slopegraph-legend';
  
  normalizedItems.forEach(item => {
    const lineColor = item.lineFarbe || item.farbe || `hsl(${item.index * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'slopegraph-legend-item';
    
    // Calculate average change
    const avgChange = item.daten.reduce((sum, d) => {
      const change = d.vorher !== 0 ? ((d.nachher - d.vorher) / Math.abs(d.vorher)) * 100 : 0;
      return sum + change;
    }, 0) / item.daten.length;
    
    itemEl.innerHTML = `
      <span class="slopegraph-legend-line" style="background: ${lineColor}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span class="slopegraph-legend-name">${item.name || item.id || `Item ${item.index + 1}`}</span>
      <span class="slopegraph-legend-change" style="color: ${avgChange >= 0 ? '#7fff7f' : '#ff7f7f'}">${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(0)}%</span>
    `;
    legendEl.appendChild(itemEl);
  });
  
  el.appendChild(legendEl);
  return el;
}

function normalisiereDaten(wert) {
  const daten = [];
  let labels = { vorher: 'Vorher', nachher: 'Nachher' };
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        const vorher = item.vorher ?? item.from ?? item.start ?? item.anfang ?? 0;
        const nachher = item.nachher ?? item.to ?? item.end ?? item.ende ?? 0;
        const name = item.name || item.label || item.kategorie || '';
        daten.push({ name, vorher, nachher });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    // {vorher: {A: x}, nachher: {A: y}} or {2020: {...}, 2023: {...}}
    const keys = Object.keys(wert);
    if (keys.includes('vorher') && keys.includes('nachher')) {
      labels = { vorher: 'Vorher', nachher: 'Nachher' };
      for (const [name, value] of Object.entries(wert.vorher || {})) {
        daten.push({ name, vorher: value, nachher: wert.nachher?.[name] ?? 0 });
      }
    } else if (keys.length >= 2) {
      const sortedKeys = keys.filter(k => /^\d+$/.test(k)).sort();
      if (sortedKeys.length >= 2) {
        labels = { vorher: sortedKeys[0], nachher: sortedKeys[sortedKeys.length - 1] };
        for (const [name, value] of Object.entries(wert[sortedKeys[0]] || {})) {
          daten.push({ name, vorher: value, nachher: wert[sortedKeys[sortedKeys.length - 1]]?.[name] ?? 0 });
        }
      }
    }
  }
  
  return { daten, labels };
}

export default compareSlopegraph;

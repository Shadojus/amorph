/**
 * COMPARE BUBBLE - UNIFIED Bubble chart comparison
 * All bubbles from all items shown in ONE SVG with item colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareBubble(items, config = {}) {
  debug.morphs('compareBubble', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bubble';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const dataItems = normalisiereWert(rawVal);
    return {
      ...item,
      dataItems,
      index: idx,
      // Neon pilz colors
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.farbe
    };
  }).filter(item => item.dataItems.length > 0);
  
  if (parsedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Bubble-Daten</div>';
    return el;
  }
  
  // Find global max value
  let globalMax = 0;
  parsedItems.forEach(item => {
    item.dataItems.forEach(d => {
      if (d.value > globalMax) globalMax = d.value;
    });
  });
  globalMax = globalMax || 1;
  
  // UNIFIED bubble container
  const bubbleContainer = document.createElement('div');
  bubbleContainer.className = 'amorph-bubble amorph-bubble-compare';
  
  // SVG with all bubbles
  const size = 200;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-bubble-svg');
  
  // Arrange bubbles in a circle pattern per item
  const centerX = size / 2;
  const centerY = size / 2;
  const baseRadius = 60;
  
  parsedItems.forEach((item, itemIdx) => {
    const itemAngleOffset = (itemIdx / parsedItems.length) * Math.PI * 2;
    
    item.dataItems.slice(0, 3).forEach((d, i) => {
      // Ensure valid values to prevent NaN
      const safeValue = isFinite(d.value) && d.value > 0 ? d.value : 0.1;
      const ratio = Math.sqrt(safeValue / globalMax);
      const bubbleRadius = (isFinite(ratio) ? ratio : 0.1) * 25 + 8;
      const distFromCenter = baseRadius - i * 15;
      const angle = itemAngleOffset + (i * 0.3);
      
      const cx = centerX + Math.cos(angle) * distFromCenter;
      const cy = centerY + Math.sin(angle) * distFromCenter;
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'amorph-bubble-group');
      
      // Glow
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', cx);
      glow.setAttribute('cy', cy);
      glow.setAttribute('r', bubbleRadius + 4);
      glow.setAttribute('fill', item.glowColor || item.color);
      glow.setAttribute('opacity', '0.3');
      g.appendChild(glow);
      
      // Main bubble
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', bubbleRadius);
      circle.setAttribute('class', 'amorph-bubble-circle');
      circle.setAttribute('fill', item.color);
      circle.setAttribute('fill-opacity', '0.6');
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-width', '1');
      g.appendChild(circle);
      
      // Label if big enough
      if (bubbleRadius > 12) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', cx);
        text.setAttribute('y', cy);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'amorph-bubble-label');
        text.setAttribute('fill', 'rgba(255,255,255,0.9)');
        text.setAttribute('font-size', '8');
        text.textContent = d.label.slice(0, 4);
        g.appendChild(text);
      }
      
      // Title
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${item.name}: ${d.label} (${d.value})`;
      g.appendChild(title);
      
      svg.appendChild(g);
    });
  });
  
  bubbleContainer.appendChild(svg);
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'amorph-bubble-legend';
  
  parsedItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'bubble-legend-item';
    
    const dot = document.createElement('span');
    dot.className = 'bubble-legend-dot';
    dot.style.background = item.color;
    dot.style.boxShadow = `0 0 6px ${item.glowColor || item.color}`;
    
    const name = document.createElement('span');
    name.className = 'bubble-legend-name';
    name.textContent = item.name || item.id;
    if (item.textFarbe) name.style.color = item.textFarbe;
    
    legendItem.appendChild(dot);
    legendItem.appendChild(name);
    legend.appendChild(legendItem);
  });
  
  bubbleContainer.appendChild(legend);
  el.appendChild(bubbleContainer);
  
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        const rawValue = item.value || item.wert || item.size || 0;
        const numValue = Number(rawValue);
        items.push({
          label: item.label || item.name || '',
          value: isFinite(numValue) && numValue > 0 ? numValue : 0.1
        });
      } else if (typeof item === 'number') {
        items.push({ label: `${items.length + 1}`, value: isFinite(item) && item > 0 ? item : 0.1 });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'number') {
        items.push({ label: key, value: isFinite(value) && value > 0 ? value : 0.1 });
      }
    }
  }
  
  return items.sort((a, b) => b.value - a.value);
}

export default compareBubble;

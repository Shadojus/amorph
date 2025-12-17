/**
 * COMPARE BUBBLE - Bubble chart comparison
 * Uses the exact same HTML structure as the original bubble morph
 */

import { debug } from '../../../../observer/debug.js';

const FARBEN = [
  'rgba(100, 180, 255, 0.6)',
  'rgba(80, 160, 240, 0.6)',
  'rgba(60, 140, 220, 0.6)',
  'rgba(120, 200, 255, 0.5)',
  'rgba(40, 120, 200, 0.6)'
];

export function compareBubble(items, config = {}) {
  debug.morphs('compareBubble', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-bubble';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original bubble structure
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'amorph-bubble';
    
    const dataItems = normalisiereWert(rawVal);
    
    if (dataItems.length === 0) {
      bubbleEl.innerHTML = '<span class="amorph-bubble-leer">Keine Bubble-Daten</span>';
    } else {
      // SVG Container
      const size = 100;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.setAttribute('class', 'amorph-bubble-svg');
      
      const maxValue = Math.max(...dataItems.map(d => d.value), 1);
      
      // Simple packing: arrange in a row
      dataItems.slice(0, 4).forEach((d, i) => {
        const radius = Math.sqrt(d.value / maxValue) * 20 + 5;
        const cx = 15 + (i % 2) * 40 + radius;
        const cy = 15 + Math.floor(i / 2) * 40 + radius;
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'amorph-bubble-group');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', 'amorph-bubble-circle');
        circle.setAttribute('fill', FARBEN[i % FARBEN.length]);
        circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
        circle.setAttribute('stroke-width', '1');
        g.appendChild(circle);
        
        // Label inside bubble if big enough
        if (radius > 10) {
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
        
        svg.appendChild(g);
      });
      
      bubbleEl.appendChild(svg);
    }
    
    wrapper.appendChild(bubbleEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const items = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        items.push({
          label: item.label || item.name || '',
          value: item.value || item.wert || item.size || 0
        });
      } else if (typeof item === 'number') {
        items.push({ label: `${items.length + 1}`, value: item });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'number') {
        items.push({ label: key, value });
      }
    }
  }
  
  return items.sort((a, b) => b.value - a.value);
}

export default compareBubble;

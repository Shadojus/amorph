/**
 * COMPARE SUNBURST - Sunburst chart comparison
 * Uses the exact same HTML structure as the original sunburst morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareSunburst(items, config = {}) {
  debug.morphs('compareSunburst', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-sunburst';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Neon pilz colors
    const baseColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || baseColor;
    const textColor = item.textFarbe || baseColor;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Original sunburst structure
    const sunburstEl = document.createElement('div');
    sunburstEl.className = 'amorph-sunburst';
    
    const root = normalisiereWert(rawVal);
    
    if (!root || !root.children || root.children.length === 0) {
      sunburstEl.innerHTML = '<span class="amorph-sunburst-leer">Keine Hierarchie-Daten</span>';
    } else {
      berechneValues(root);
      
      const size = 120;
      const cx = size / 2;
      const cy = size / 2;
      const maxRadius = size / 2 - 10;
      const innerRadius = 15;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.setAttribute('class', 'amorph-sunburst-svg');
      
      // Add glow filter
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', `sunburst-glow-${itemIndex}`);
      filter.innerHTML = `<feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>`;
      defs.appendChild(filter);
      svg.appendChild(defs);
      
      const maxDepth = berechneMaxDepth(root);
      const ringWidth = (maxRadius - innerRadius) / Math.max(maxDepth, 1);
      
      // Use neon color variations for rings
      zeichneNode(svg, root, 0, Math.PI * 2, 0, cx, cy, innerRadius, ringWidth, baseColor, glowColor, itemIndex);
      
      // Center circle with neon
      const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerCircle.setAttribute('cx', cx);
      centerCircle.setAttribute('cy', cy);
      centerCircle.setAttribute('r', innerRadius - 3);
      centerCircle.setAttribute('class', 'amorph-sunburst-center');
      centerCircle.setAttribute('fill', `${baseColor}44`);
      centerCircle.setAttribute('stroke', baseColor);
      centerCircle.setAttribute('stroke-width', '1');
      centerCircle.setAttribute('filter', `url(#sunburst-glow-${itemIndex})`);
      svg.appendChild(centerCircle);
      
      sunburstEl.appendChild(svg);
    }
    
    wrapper.appendChild(sunburstEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  if (!wert) return null;
  
  if (typeof wert === 'object' && wert.children) {
    return wert;
  }
  
  if (Array.isArray(wert)) {
    const children = wert.map((item, i) => ({
      name: item.name || item.label || `Item ${i + 1}`,
      value: item.value || item.wert || item.size || 0
    }));
    return { name: 'Root', children };
  }
  
  if (typeof wert === 'object') {
    const children = Object.entries(wert).map(([key, value]) => ({
      name: key,
      value: typeof value === 'number' ? value : 1
    }));
    return { name: 'Root', children };
  }
  
  return null;
}

function berechneValues(node) {
  if (!node.children || node.children.length === 0) {
    node.value = node.value || 1;
    return node.value;
  }
  node.value = node.children.reduce((sum, child) => sum + berechneValues(child), 0);
  return node.value;
}

function berechneMaxDepth(node, depth = 0) {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(...node.children.map(child => berechneMaxDepth(child, depth + 1)));
}

function zeichneNode(svg, node, startAngle, endAngle, depth, cx, cy, innerRadius, ringWidth, baseColor, glowColor, itemIndex) {
  if (depth > 0 && node.value > 0) {
    const r0 = innerRadius + (depth - 1) * ringWidth;
    const r1 = innerRadius + depth * ringWidth;
    const path = arcPath(cx, cy, r0, r1, startAngle, endAngle);
    
    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    segment.setAttribute('d', path);
    segment.setAttribute('class', 'amorph-sunburst-segment');
    
    // Use neon color with varying opacity for depth
    const opacity = Math.max(0.3, 0.8 - (depth - 1) * 0.15);
    segment.setAttribute('fill', baseColor);
    segment.setAttribute('fill-opacity', opacity.toString());
    segment.setAttribute('stroke', 'rgba(0,0,0,0.3)');
    segment.setAttribute('stroke-width', '0.5');
    segment.setAttribute('filter', `url(#sunburst-glow-${itemIndex})`);
    svg.appendChild(segment);
  }
  
  if (node.children && node.children.length > 0) {
    let currentAngle = startAngle;
    const angleSpan = endAngle - startAngle;
    
    node.children.forEach((child, i) => {
      const childAngle = angleSpan * (child.value / node.value);
      zeichneNode(svg, child, currentAngle, currentAngle + childAngle, depth + 1, cx, cy, innerRadius, ringWidth, baseColor, glowColor, itemIndex);
      currentAngle += childAngle;
    });
  }
}

function arcPath(cx, cy, r0, r1, startAngle, endAngle) {
  const delta = endAngle - startAngle;
  const largeArc = delta > Math.PI ? 1 : 0;
  
  const x0 = cx + r0 * Math.cos(startAngle);
  const y0 = cy + r0 * Math.sin(startAngle);
  const x1 = cx + r1 * Math.cos(startAngle);
  const y1 = cy + r1 * Math.sin(startAngle);
  const x2 = cx + r1 * Math.cos(endAngle);
  const y2 = cy + r1 * Math.sin(endAngle);
  const x3 = cx + r0 * Math.cos(endAngle);
  const y3 = cy + r0 * Math.sin(endAngle);
  
  return `M ${x0} ${y0} L ${x1} ${y1} A ${r1} ${r1} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${largeArc} 0 ${x0} ${y0} Z`;
}

export default compareSunburst;

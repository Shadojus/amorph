/**
 * COMPARE FLOW - Flow diagram comparison
 * Uses the exact same HTML structure as the original flow morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareFlow(items, config = {}) {
  debug.morphs('compareFlow', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-flow';
  
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
    
    // Original flow structure
    const flowEl = document.createElement('div');
    flowEl.className = 'amorph-flow';
    
    const { connections, nodes } = normalisiereWert(rawVal);
    
    if (connections.length === 0) {
      flowEl.innerHTML = '<span class="amorph-flow-leer">Keine Flow-Daten</span>';
    } else {
      // Simplified SVG representation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 120 60');
      svg.setAttribute('class', 'amorph-flow-svg');
      
      // Draw connections as curves
      connections.slice(0, 4).forEach((conn, i) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const y = 15 + i * 12;
        path.setAttribute('d', `M 10,${y} Q 60,${y - 8 + i * 3} 110,${y}`);
        path.setAttribute('class', 'amorph-flow-curve');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', `rgba(${100 + i * 20}, ${160 + i * 10}, 255, 0.6)`);
        path.setAttribute('stroke-width', Math.max(1, Math.min(3, (conn.value || 1) / 10)));
        svg.appendChild(path);
      });
      
      // Draw nodes
      nodes.slice(0, 4).forEach((node, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = 10 + (i % 2) * 100;
        const y = 15 + Math.floor(i / 2) * 30;
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('class', 'amorph-flow-node');
        circle.setAttribute('fill', 'rgba(150, 200, 255, 0.8)');
        svg.appendChild(circle);
      });
      
      flowEl.appendChild(svg);
    }
    
    wrapper.appendChild(flowEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  const connections = [];
  const nodes = [];
  const nodeSet = new Set();
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (item.from && item.to) {
        connections.push({
          from: item.from,
          to: item.to,
          value: item.value || item.wert || 1
        });
        nodeSet.add(item.from);
        nodeSet.add(item.to);
      }
    }
  } else if (typeof wert === 'object' && wert.connections) {
    for (const conn of wert.connections || []) {
      connections.push({
        from: conn.from || conn.source,
        to: conn.to || conn.target,
        value: conn.value || 1
      });
      nodeSet.add(conn.from || conn.source);
      nodeSet.add(conn.to || conn.target);
    }
  }
  
  nodeSet.forEach(n => nodes.push({ id: n }));
  
  return { connections, nodes };
}

export default compareFlow;

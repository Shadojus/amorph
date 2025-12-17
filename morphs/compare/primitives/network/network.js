/**
 * COMPARE NETWORK - UNIFIED Network graph comparison
 * All items' connections shown in ONE visualization
 */

import { debug } from '../../../../observer/debug.js';

export function compareNetwork(items, config = {}) {
  debug.morphs('compareNetwork', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-network';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items' network data
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const nodes = rawVal?.nodes ?? rawVal?.knoten ?? rawVal?.vertices ?? 
                  (Array.isArray(rawVal) ? rawVal : []);
    const edges = rawVal?.edges ?? rawVal?.kanten ?? rawVal?.links ?? [];
    
    return {
      ...item,
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      index: idx,
      color: item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`,
      glowColor: item.glowFarbe || item.lineFarbe || item.farbe,
      textColor: item.textFarbe || item.lineFarbe || item.farbe
    };
  });
  
  // Collect all unique node names across items
  const allNodeNames = new Set();
  parsedItems.forEach(item => {
    item.nodes.forEach(node => {
      const name = typeof node === 'string' ? node : (node?.name || node?.id || node?.label);
      if (name) allNodeNames.add(name);
    });
  });
  
  const uniqueNodes = Array.from(allNodeNames);
  const nodeCount = Math.min(Math.max(uniqueNodes.length, 4), 12);
  
  // UNIFIED network visualization
  const networkEl = document.createElement('div');
  networkEl.className = 'amorph-network amorph-network-compare';
  
  const size = 300;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-network-svg amorph-network-svg-compare');
  
  // Add glow filters for each item
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  parsedItems.forEach((item, idx) => {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `network-glow-${idx}`);
    filter.innerHTML = `
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feFlood flood-color="${item.color}" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    `;
    defs.appendChild(filter);
  });
  svg.appendChild(defs);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 50;
  
  // Calculate node positions in a circle
  const nodePositions = {};
  for (let i = 0; i < nodeCount; i++) {
    const name = uniqueNodes[i] || `Node ${i}`;
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    nodePositions[name] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      angle
    };
  }
  
  // Draw connections for each item with their color
  parsedItems.forEach((item, itemIdx) => {
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', `amorph-network-edges amorph-network-edges-${itemIdx}`);
    
    // Draw edges if available, otherwise connect to center
    if (item.edges.length > 0) {
      item.edges.forEach(edge => {
        const source = edge.source ?? edge.from ?? edge.von;
        const target = edge.target ?? edge.to ?? edge.nach;
        const sourcePos = nodePositions[source];
        const targetPos = nodePositions[target];
        
        if (sourcePos && targetPos) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', sourcePos.x);
          line.setAttribute('y1', sourcePos.y);
          line.setAttribute('x2', targetPos.x);
          line.setAttribute('y2', targetPos.y);
          line.setAttribute('stroke', item.color);
          line.setAttribute('stroke-opacity', '0.6');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('filter', `url(#network-glow-${itemIdx})`);
          edgesGroup.appendChild(line);
        }
      });
    } else {
      // Connect item's nodes to center
      item.nodes.forEach(node => {
        const name = typeof node === 'string' ? node : (node?.name || node?.id);
        const pos = nodePositions[name];
        if (pos) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', centerX);
          line.setAttribute('y1', centerY);
          line.setAttribute('x2', pos.x);
          line.setAttribute('y2', pos.y);
          line.setAttribute('stroke', item.color);
          line.setAttribute('stroke-opacity', '0.5');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('filter', `url(#network-glow-${itemIdx})`);
          edgesGroup.appendChild(line);
        }
      });
    }
    svg.appendChild(edgesGroup);
  });
  
  // Draw center node
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX);
  centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', '20');
  centerCircle.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
  centerCircle.setAttribute('stroke', 'rgba(100, 150, 255, 0.6)');
  centerCircle.setAttribute('stroke-width', '2');
  svg.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', centerX);
  centerText.setAttribute('y', centerY + 4);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('fill', 'rgba(255, 255, 255, 0.8)');
  centerText.setAttribute('font-size', '10');
  centerText.textContent = 'Zentrum';
  svg.appendChild(centerText);
  
  // Draw outer nodes with labels
  for (let i = 0; i < nodeCount; i++) {
    const name = uniqueNodes[i] || `Node ${i}`;
    const pos = nodePositions[name];
    if (!pos) continue;
    
    // Check which items have this node
    const itemsWithNode = parsedItems.filter(item => 
      item.nodes.some(n => (typeof n === 'string' ? n : n?.name) === name)
    );
    
    // Node circle - color based on first item that has it
    const nodeColor = itemsWithNode[0]?.color || 'rgba(150, 150, 150, 0.6)';
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');
    circle.setAttribute('stroke', nodeColor);
    circle.setAttribute('stroke-width', '2');
    if (itemsWithNode[0]) {
      circle.setAttribute('filter', `url(#network-glow-${itemsWithNode[0].index})`);
    }
    svg.appendChild(circle);
    
    // Node label
    const labelX = centerX + Math.cos(pos.angle) * (radius + 20);
    const labelY = centerY + Math.sin(pos.angle) * (radius + 20);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY + 4);
    label.setAttribute('text-anchor', pos.angle > Math.PI / 2 || pos.angle < -Math.PI / 2 ? 'end' : 'start');
    label.setAttribute('fill', 'rgba(255, 255, 255, 0.7)');
    label.setAttribute('font-size', '10');
    label.textContent = name.length > 6 ? name.slice(0, 6) : name;
    svg.appendChild(label);
  }
  
  networkEl.appendChild(svg);
  
  // Legend
  const legend = document.createElement('div');
  legend.className = 'amorph-network-legend';
  parsedItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'network-legend-item';
    legendItem.innerHTML = `
      <span class="network-legend-dot" style="background: ${item.color}; box-shadow: 0 0 6px ${item.glowColor || item.color}"></span>
      <span class="network-legend-name" style="color: ${item.textColor || item.color}">${item.name || item.id}</span>
      <span class="network-legend-count">${item.nodes.length} Knoten</span>
    `;
    legend.appendChild(legendItem);
  });
  networkEl.appendChild(legend);
  
  el.appendChild(networkEl);
  return el;
}

export default compareNetwork;

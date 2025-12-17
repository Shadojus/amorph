/**
 * COMPARE NETWORK - Network graph comparison
 * Uses the exact same HTML structure as the original network morph
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
  
  // Container for all networks
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper with item name
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original network structure (simplified summary)
    const networkEl = document.createElement('div');
    networkEl.className = 'amorph-network';
    
    // Extract network data
    const nodes = rawVal?.nodes ?? rawVal?.knoten ?? rawVal?.vertices ?? [];
    const edges = rawVal?.edges ?? rawVal?.kanten ?? rawVal?.links ?? [];
    
    if (nodes.length === 0 && edges.length === 0) {
      networkEl.innerHTML = '<span class="amorph-network-leer">Keine Verbindungen</span>';
    } else {
      // Create a mini visualization
      const size = 120;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.setAttribute('class', 'amorph-network-svg');
      
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = (size / 2) - 25;
      
      // Draw edges
      const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      edgesGroup.setAttribute('class', 'amorph-network-edges');
      
      const nodeCount = Math.min(nodes.length || 4, 8);
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(100, 180, 255, 0.4)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('class', 'amorph-network-edge');
        edgesGroup.appendChild(line);
      }
      svg.appendChild(edgesGroup);
      
      // Draw center node
      const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerCircle.setAttribute('cx', centerX);
      centerCircle.setAttribute('cy', centerY);
      centerCircle.setAttribute('r', '15');
      centerCircle.setAttribute('fill', 'rgba(0, 0, 0, 0.7)');
      centerCircle.setAttribute('stroke', 'rgba(100, 180, 255, 0.6)');
      centerCircle.setAttribute('stroke-width', '2');
      centerCircle.setAttribute('class', 'amorph-network-center');
      svg.appendChild(centerCircle);
      
      // Draw outer nodes
      const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodesGroup.setAttribute('class', 'amorph-network-nodes');
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');
        circle.setAttribute('stroke', 'rgba(100, 180, 255, 0.5)');
        circle.setAttribute('stroke-width', '1.5');
        circle.setAttribute('class', 'amorph-network-node');
        nodesGroup.appendChild(circle);
      }
      svg.appendChild(nodesGroup);
      
      networkEl.appendChild(svg);
      
      // Summary text
      const summary = document.createElement('div');
      summary.className = 'amorph-network-summary';
      summary.textContent = `${nodes.length || 0} Knoten, ${edges.length || 0} Kanten`;
      networkEl.appendChild(summary);
    }
    
    wrapper.appendChild(networkEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

export default compareNetwork;

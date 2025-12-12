/**
 * 🕸️ NETWORK MORPH - Interaktions-Netzwerk
 * 
 * Zeigt Beziehungen als Netzwerk-Diagramm
 * DATENGETRIEBEN - Erkennt Interaktions-Strukturen
 * 
 * Input: [{typ: "Symbiose", partner: "A"}, {typ: "Prädation", partner: "B"}]
 *    oder {knoten: [...], kanten: [...]}
 * Output: Netzwerk-Visualisierung mit Zentral-Element
 */

import { debug } from '../../../observer/debug.js';

// Interaktionstypen mit Farben
const INTERACTION_TYPES = {
  symbiose: { color: 'rgba(100, 220, 160, 0.8)', icon: '🤝' },
  symbiosis: { color: 'rgba(100, 220, 160, 0.8)', icon: '🤝' },
  mykorrhiza: { color: 'rgba(100, 220, 160, 0.8)', icon: '🌿' },
  parasitismus: { color: 'rgba(240, 110, 110, 0.8)', icon: '🦠' },
  parasitism: { color: 'rgba(240, 110, 110, 0.8)', icon: '🦠' },
  praedation: { color: 'rgba(240, 150, 80, 0.8)', icon: '🦅' },
  predation: { color: 'rgba(240, 150, 80, 0.8)', icon: '🦅' },
  konkurrenz: { color: 'rgba(240, 190, 80, 0.8)', icon: '⚔️' },
  competition: { color: 'rgba(240, 190, 80, 0.8)', icon: '⚔️' },
  kommensalismus: { color: 'rgba(90, 160, 240, 0.8)', icon: '🏠' },
  bestaeubung: { color: 'rgba(240, 180, 220, 0.8)', icon: '🐝' },
  pollination: { color: 'rgba(240, 180, 220, 0.8)', icon: '🐝' },
  nahrung: { color: 'rgba(180, 140, 100, 0.8)', icon: '🍽️' },
  food: { color: 'rgba(180, 140, 100, 0.8)', icon: '🍽️' },
  default: { color: 'rgba(140, 160, 180, 0.8)', icon: '🔗' }
};

export function network(wert, config = {}) {
  debug.morphs('network', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-network';
  
  // Knoten und Kanten extrahieren
  const { nodes, edges, center } = extractNetworkData(wert, config);
  
  if (nodes.length === 0) {
    el.innerHTML = '<span class="amorph-network-leer">Keine Verbindungen</span>';
    return el;
  }
  
  // SVG-Container
  const size = config.size || 250;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-network-svg');
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 50;
  
  // Kanten zeichnen
  const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgesGroup.setAttribute('class', 'amorph-network-edges');
  
  for (let i = 0; i < nodes.length; i++) {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const edge = edges[i] || {};
    const typeConfig = getInteractionType(edge.typ || edge.type);
    
    // Linie
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', typeConfig.color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-opacity', '0.6');
    edgesGroup.appendChild(line);
    
    // Interaktions-Icon auf der Linie
    const midX = (centerX + x) / 2;
    const midY = (centerY + y) / 2;
    
    const iconBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    iconBg.setAttribute('cx', midX);
    iconBg.setAttribute('cy', midY);
    iconBg.setAttribute('r', '10');
    iconBg.setAttribute('fill', 'rgba(0,0,0,0.8)');
    edgesGroup.appendChild(iconBg);
    
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icon.setAttribute('x', midX);
    icon.setAttribute('y', midY);
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('dominant-baseline', 'middle');
    icon.setAttribute('font-size', '10');
    icon.textContent = typeConfig.icon;
    edgesGroup.appendChild(icon);
  }
  svg.appendChild(edgesGroup);
  
  // Zentral-Knoten
  const centerNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  centerNode.setAttribute('class', 'amorph-network-center');
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX);
  centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', '25');
  centerCircle.setAttribute('fill', 'rgba(var(--color-accent-rgb), 0.2)');
  centerCircle.setAttribute('stroke', 'var(--color-accent)');
  centerCircle.setAttribute('stroke-width', '2');
  centerNode.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', centerX);
  centerText.setAttribute('y', centerY);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('dominant-baseline', 'middle');
  centerText.setAttribute('fill', 'white');
  centerText.setAttribute('font-size', '12');
  centerText.setAttribute('font-weight', 'bold');
  centerText.textContent = center.substring(0, 8);
  centerNode.appendChild(centerText);
  
  svg.appendChild(centerNode);
  
  // Äußere Knoten
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesGroup.setAttribute('class', 'amorph-network-nodes');
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const edge = edges[i] || {};
    const typeConfig = getInteractionType(edge.typ || edge.type);
    
    // Knoten-Kreis
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '18');
    circle.setAttribute('fill', 'rgba(0,0,0,0.6)');
    circle.setAttribute('stroke', typeConfig.color);
    circle.setAttribute('stroke-width', '2');
    nodesGroup.appendChild(circle);
    
    // Knoten-Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '8');
    text.textContent = node.name.substring(0, 6);
    nodesGroup.appendChild(text);
  }
  svg.appendChild(nodesGroup);
  
  el.appendChild(svg);
  
  // Legende
  if (config.showLegend !== false && edges.length > 0) {
    const legend = document.createElement('div');
    legend.className = 'amorph-network-legend';
    
    const uniqueTypes = [...new Set(edges.map(e => e.typ || e.type || 'default'))];
    for (const type of uniqueTypes.slice(0, 5)) {
      const typeConfig = getInteractionType(type);
      
      const item = document.createElement('div');
      item.className = 'amorph-network-legend-item';
      
      const dot = document.createElement('span');
      dot.className = 'amorph-network-legend-dot';
      dot.style.background = typeConfig.color;
      item.appendChild(dot);
      
      const label = document.createElement('span');
      label.className = 'amorph-network-legend-label';
      label.textContent = type;
      item.appendChild(label);
      
      legend.appendChild(item);
    }
    
    el.appendChild(legend);
  }
  
  return el;
}

function extractNetworkData(wert, config) {
  const nodes = [];
  const edges = [];
  let center = config.center || config.zentrum || 'Zentrum';
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        const name = item.partner || item.name || item.target || item.ziel || '';
        const typ = item.typ || item.type || item.relation || 'default';
        if (name) {
          nodes.push({ name });
          edges.push({ typ, intensity: item.intensitaet || item.intensity || 50 });
        }
      } else if (typeof item === 'string') {
        nodes.push({ name: item });
        edges.push({ typ: 'default', intensity: 50 });
      }
    }
  } else if (typeof wert === 'object') {
    // Interaktionen-Objekt
    if (wert.interaktionen || wert.interactions) {
      const arr = wert.interaktionen || wert.interactions;
      return extractNetworkData(arr, config);
    }
    // Knoten/Kanten-Format
    if (wert.knoten || wert.nodes) {
      const n = wert.knoten || wert.nodes;
      for (const item of n) {
        nodes.push({ name: typeof item === 'string' ? item : item.name || item.id });
      }
    }
    if (wert.kanten || wert.edges) {
      for (const e of (wert.kanten || wert.edges)) {
        edges.push({ typ: e.typ || e.type || 'default', intensity: e.weight || 50 });
      }
    }
    if (wert.zentrum || wert.center) {
      center = wert.zentrum || wert.center;
    }
  }
  
  return { nodes, edges, center };
}

function getInteractionType(typ) {
  const lower = (typ || '').toLowerCase().replace(/[äöü]/g, m => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[m]));
  return INTERACTION_TYPES[lower] || INTERACTION_TYPES.default;
}

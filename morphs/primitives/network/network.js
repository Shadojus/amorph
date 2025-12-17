/**
 * 🕸️ NETWORK MORPH - Organisches Beziehungs-Netzwerk
 * 
 * DESIGN-PRINZIPIEN (basierend auf organischen Flow-Diagrammen):
 * - Organische Kurven: Bezier statt gerade Linien
 * - Größe nach Bedeutung: Node-Größe zeigt Wichtigkeit
 * - Farbkodierung: Beziehungstypen farblich unterschieden
 * - Cluster: Verwandte Nodes gruppiert
 * - Annotationen: Interaktionstypen direkt an Kanten
 * 
 * Input: [{typ: "Symbiose", partner: "A"}, {typ: "Prädation", partner: "B"}]
 *    oder {knoten: [...], kanten: [...]}
 * Output: Organisches Netzwerk mit fließenden Verbindungen
 */

import { debug } from '../../../observer/debug.js';

// Interaktionstypen mit Farben (biologisch)
const INTERACTION_TYPES = {
  symbiose: { color: 'rgba(100, 220, 160, 0.8)', stroke: '#64dc9c', icon: '⚭' },
  symbiosis: { color: 'rgba(100, 220, 160, 0.8)', stroke: '#64dc9c', icon: '⚭' },
  mykorrhiza: { color: 'rgba(100, 220, 160, 0.8)', stroke: '#64dc9c', icon: '🌿' },
  mutualism: { color: 'rgba(100, 220, 160, 0.8)', stroke: '#64dc9c', icon: '⚭' },
  parasitismus: { color: 'rgba(240, 110, 110, 0.8)', stroke: '#f06e6e', icon: '⊘' },
  parasitism: { color: 'rgba(240, 110, 110, 0.8)', stroke: '#f06e6e', icon: '⊘' },
  praedation: { color: 'rgba(240, 150, 80, 0.8)', stroke: '#f09650', icon: '→' },
  predation: { color: 'rgba(240, 150, 80, 0.8)', stroke: '#f09650', icon: '→' },
  konkurrenz: { color: 'rgba(240, 190, 80, 0.8)', stroke: '#f0be50', icon: '⇆' },
  competition: { color: 'rgba(240, 190, 80, 0.8)', stroke: '#f0be50', icon: '⇆' },
  kommensalismus: { color: 'rgba(90, 160, 240, 0.8)', stroke: '#5aa0f0', icon: '⤵' },
  bestaeubung: { color: 'rgba(240, 180, 220, 0.8)', stroke: '#f0b4dc', icon: '✿' },
  pollination: { color: 'rgba(240, 180, 220, 0.8)', stroke: '#f0b4dc', icon: '✿' },
  nahrung: { color: 'rgba(180, 140, 100, 0.8)', stroke: '#b48c64', icon: '◈' },
  food: { color: 'rgba(180, 140, 100, 0.8)', stroke: '#b48c64', icon: '◈' },
  habitat: { color: 'rgba(120, 180, 120, 0.8)', stroke: '#78b478', icon: '⌂' },
  decomposer: { color: 'rgba(160, 140, 100, 0.8)', stroke: '#a08c64', icon: '↻' },
  default: { color: 'rgba(140, 160, 180, 0.8)', stroke: '#8ca0b4', icon: '○' }
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
  const size = config.size || 280;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-network-svg');
  
  // Defs für Gradienten und Filter
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Glow Filter
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'nodeGlow');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  filter.innerHTML = `
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  `;
  defs.appendChild(filter);
  svg.appendChild(defs);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 55;
  
  // Kanten als organische Bezier-Kurven
  const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgesGroup.setAttribute('class', 'amorph-network-edges');
  
  for (let i = 0; i < nodes.length; i++) {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const edge = edges[i] || {};
    const typeConfig = getInteractionType(edge.typ || edge.type);
    const intensity = edge.intensity || 50;
    
    // Organische Bezier-Kurve statt gerader Linie
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const curve = createOrganicCurve(centerX, centerY, x, y, i, nodes.length);
    path.setAttribute('d', curve);
    path.setAttribute('stroke', typeConfig.color);
    path.setAttribute('stroke-width', Math.max(1, intensity / 25));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0.6');
    path.setAttribute('class', 'amorph-network-edge');
    edgesGroup.appendChild(path);
    
    // Kleine Annotations-Punkte auf der Kurve
    const midAngle = angle + (Math.random() - 0.5) * 0.3;
    const midDist = radius * 0.5;
    const midX = centerX + Math.cos(midAngle) * midDist;
    const midY = centerY + Math.sin(midAngle) * midDist;
    
    // Annotation-Punkt
    const annotDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    annotDot.setAttribute('cx', midX);
    annotDot.setAttribute('cy', midY);
    annotDot.setAttribute('r', '4');
    annotDot.setAttribute('fill', typeConfig.color);
    annotDot.setAttribute('class', 'amorph-network-annotation');
    annotDot.setAttribute('opacity', '0.8');
    edgesGroup.appendChild(annotDot);
  }
  svg.appendChild(edgesGroup);
  
  // Zentral-Knoten (größer, prominent)
  const centerNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  centerNode.setAttribute('class', 'amorph-network-center');
  centerNode.setAttribute('data-central', 'true');
  
  // Äußerer Glow-Ring
  const centerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerGlow.setAttribute('cx', centerX);
  centerGlow.setAttribute('cy', centerY);
  centerGlow.setAttribute('r', '35');
  centerGlow.setAttribute('fill', 'rgba(100, 180, 255, 0.1)');
  centerGlow.setAttribute('class', 'amorph-network-center-glow');
  centerNode.appendChild(centerGlow);
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX);
  centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', '24');
  centerCircle.setAttribute('fill', 'rgba(0, 0, 0, 0.7)');
  centerCircle.setAttribute('stroke', 'rgba(100, 180, 255, 0.6)');
  centerCircle.setAttribute('stroke-width', '2');
  centerCircle.setAttribute('filter', 'url(#nodeGlow)');
  centerNode.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', centerX);
  centerText.setAttribute('y', centerY);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('dominant-baseline', 'middle');
  centerText.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
  centerText.setAttribute('font-size', '10');
  centerText.setAttribute('font-weight', '600');
  centerText.textContent = truncateText(center, 8);
  centerNode.appendChild(centerText);
  
  svg.appendChild(centerNode);
  
  // Äußere Knoten (Größe variiert nach Intensität)
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesGroup.setAttribute('class', 'amorph-network-nodes');
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const edge = edges[i] || {};
    const typeConfig = getInteractionType(edge.typ || edge.type);
    const intensity = edge.intensity || 50;
    
    // Node-Größe basiert auf Intensität
    const nodeRadius = 12 + (intensity / 20);
    
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'amorph-network-node');
    nodeGroup.setAttribute('data-type', edge.typ || edge.type || 'default');
    
    // Äußerer Ring (Typ-Farbe)
    const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerRing.setAttribute('cx', x);
    outerRing.setAttribute('cy', y);
    outerRing.setAttribute('r', nodeRadius + 2);
    outerRing.setAttribute('fill', 'none');
    outerRing.setAttribute('stroke', typeConfig.color);
    outerRing.setAttribute('stroke-width', '2');
    outerRing.setAttribute('opacity', '0.5');
    nodeGroup.appendChild(outerRing);
    
    // Knoten-Kreis
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', nodeRadius);
    circle.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');
    circle.setAttribute('stroke', typeConfig.color);
    circle.setAttribute('stroke-width', '1.5');
    nodeGroup.appendChild(circle);
    
    // Knoten-Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
    text.setAttribute('font-size', '8');
    text.textContent = truncateText(node.name, 6);
    nodeGroup.appendChild(text);
    
    nodesGroup.appendChild(nodeGroup);
  }
  svg.appendChild(nodesGroup);
  
  el.appendChild(svg);
  
  // Kompakte Legende
  if (config.showLegend !== false && edges.length > 0) {
    const legend = document.createElement('div');
    legend.className = 'amorph-network-legend';
    
    const uniqueTypes = [...new Set(edges.map(e => e.typ || e.type || 'default'))];
    for (const type of uniqueTypes.slice(0, 4)) {
      const typeConfig = getInteractionType(type);
      
      const item = document.createElement('div');
      item.className = 'amorph-network-legend-item';
      item.innerHTML = `
        <span class="legend-dot" style="background: ${typeConfig.color}"></span>
        <span class="legend-label">${formatTypeName(type)}</span>
      `;
      legend.appendChild(item);
    }
    
    el.appendChild(legend);
  }
  
  return el;
}

// Erstellt organische Bezier-Kurve
function createOrganicCurve(x1, y1, x2, y2, index, total) {
  // Safety check for NaN
  if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
    return 'M 0 0';
  }
  
  // Kontrollpunkt seitlich versetzt für organische Kurve
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Versatz basierend auf Index für Variation
  const offset = 15 + (index % 3) * 8;
  const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const direction = index % 2 === 0 ? 1 : -1;
  
  const ctrlX = midX + Math.cos(angle) * offset * direction;
  const ctrlY = midY + Math.sin(angle) * offset * direction;
  
  // Check computed values
  if (!isFinite(ctrlX) || !isFinite(ctrlY)) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
}

function truncateText(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) : text;
}

function formatTypeName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function extractNetworkData(wert, config) {
  const nodes = [];
  const edges = [];
  let center = config.center || config.zentrum || 'Zentrum';
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        const name = item.partner || item.name || item.target || item.ziel || item.organism || '';
        const typ = item.typ || item.type || item.relation || item.relationship || item.beziehung || 'default';
        
        // Pattern 2: connections Array
        if (item.connections || item.verbindungen || item.links) {
          const conns = item.connections || item.verbindungen || item.links;
          const sourceNode = item.name || item.id || 'Unbekannt';
          
          if (!config.center && !config.zentrum && nodes.length === 0) {
            center = sourceNode;
          } else {
            nodes.push({ name: sourceNode });
            edges.push({ typ: 'default', intensity: 50 });
          }
          
          for (const conn of conns) {
            if (typeof conn === 'string') {
              nodes.push({ name: conn });
              edges.push({ typ: 'default', intensity: 50 });
            } else if (typeof conn === 'object') {
              const targetName = conn.target || conn.ziel || conn.name || conn.partner || '';
              const connTyp = conn.typ || conn.type || conn.relation || conn.relationship || 'default';
              if (targetName) {
                nodes.push({ name: targetName });
                edges.push({ typ: connTyp, intensity: conn.intensity || conn.intensitaet || conn.strength || 50 });
              }
            }
          }
        } else if (name) {
          nodes.push({ name });
          edges.push({ typ, intensity: item.intensitaet || item.intensity || item.strength || 50 });
        }
      } else if (typeof item === 'string') {
        nodes.push({ name: item });
        edges.push({ typ: 'default', intensity: 50 });
      }
    }
  } else if (typeof wert === 'object') {
    if (wert.interaktionen || wert.interactions) {
      return extractNetworkData(wert.interaktionen || wert.interactions, config);
    }
    if (wert.knoten || wert.nodes) {
      for (const item of (wert.knoten || wert.nodes)) {
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

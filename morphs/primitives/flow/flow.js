/**
 * 🌊 FLOW MORPH - Organische Strömungs-Visualisierung
 * 
 * Zeigt Verbindungen und Flüsse als organische Kurven mit Partikeln
 * Inspiriert von biologischen Netzwerken und Myzel-Strukturen
 * Design-Grundlage für das Universe Biosphere Theme
 * 
 * Input: [{from: "A", to: "B", value: 10}, ...]
 *    oder: {connections: [...], nodes: [...]}
 * Output: SVG mit fließenden Bezier-Kurven und leuchtenden Partikeln
 */

import { debug } from '../../../observer/debug.js';

// Blue theme - flow colors
const FLOW_COLORS = [
  'rgba(100, 180, 255, 0.6)',   // Light Sky Blue
  'rgba(80, 160, 240, 0.6)',    // Bright Blue
  'rgba(60, 140, 220, 0.6)',    // Ocean Blue
  'rgba(120, 200, 255, 0.55)',  // Ice Blue
  'rgba(40, 120, 200, 0.6)',    // Deep Blue
  'rgba(140, 210, 255, 0.5)',   // Pale Blue
  'rgba(70, 150, 230, 0.6)',    // Azure
  'rgba(90, 170, 250, 0.55)'    // Soft Blue
];

const PARTICLE_COLORS = [
  'rgba(150, 210, 255, 0.8)',   // Light Blue
  'rgba(120, 190, 255, 0.8)',   // Sky Blue
  'rgba(100, 170, 250, 0.8)',   // Azure
  'rgba(130, 200, 255, 0.8)',   // Ice Blue
  'rgba(110, 180, 255, 0.8)'    // Soft Blue
];

export function flow(wert, config = {}) {
  debug.morphs('flow', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-flow';
  
  // Daten normalisieren
  const { connections, nodes } = normalisiereWert(wert);
  
  if (connections.length === 0) {
    el.innerHTML = '<span class="amorph-flow-leer">Keine Flow-Daten</span>';
    return el;
  }
  
  // SVG erstellen
  const width = config.width || 400;
  const height = config.height || 300;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-flow-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Defs für Gradient und Filter
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Glow Filter
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'flow-glow');
  filter.innerHTML = `
    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  `;
  defs.appendChild(filter);
  svg.appendChild(defs);
  
  // Node-Positionen berechnen
  const nodePositions = berechneNodePositionen(nodes, width, height, config);
  
  // Strömungs-Kurven zeichnen
  const curvesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  curvesGroup.setAttribute('class', 'amorph-flow-curves');
  
  connections.forEach((conn, i) => {
    const fromPos = nodePositions[conn.from];
    const toPos = nodePositions[conn.to];
    
    if (!fromPos || !toPos) return;
    
    const color = FLOW_COLORS[i % FLOW_COLORS.length];
    const curves = erstelleOrganischeKurven(fromPos, toPos, conn.value, color, i);
    curves.forEach(curve => curvesGroup.appendChild(curve));
  });
  
  svg.appendChild(curvesGroup);
  
  // Partikel/Punkte zeichnen
  const particlesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  particlesGroup.setAttribute('class', 'amorph-flow-particles');
  
  connections.forEach((conn, i) => {
    const fromPos = nodePositions[conn.from];
    const toPos = nodePositions[conn.to];
    
    if (!fromPos || !toPos) return;
    
    const particles = erstellePartikel(fromPos, toPos, conn.value, i);
    particles.forEach(p => particlesGroup.appendChild(p));
  });
  
  svg.appendChild(particlesGroup);
  
  // Knoten zeichnen (optional)
  if (config.showNodes !== false) {
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'amorph-flow-nodes');
    
    for (const [name, pos] of Object.entries(nodePositions)) {
      const node = erstelleNode(name, pos, nodes.find(n => n.name === name));
      nodesGroup.appendChild(node);
    }
    
    svg.appendChild(nodesGroup);
  }
  
  el.appendChild(svg);
  
  // Animation starten (optional)
  if (config.animate !== false) {
    starteAnimation(el);
  }
  
  return el;
}

function normalisiereWert(wert) {
  let connections = [];
  let nodes = [];
  const nodeSet = new Set();
  
  // Array von Verbindungen
  if (Array.isArray(wert)) {
    connections = wert.filter(item => {
      if (typeof item === 'object' && item !== null) {
        const from = item.from || item.source || item.start;
        const to = item.to || item.target || item.end;
        if (from && to) {
          nodeSet.add(from);
          nodeSet.add(to);
          return true;
        }
      }
      return false;
    }).map(item => ({
      from: item.from || item.source || item.start,
      to: item.to || item.target || item.end,
      value: item.value || item.weight || item.strength || 1,
      type: item.type || item.category || 'default'
    }));
  }
  
  // Objekt mit connections/nodes
  else if (typeof wert === 'object' && wert !== null) {
    if (wert.connections) {
      return normalisiereWert(wert.connections);
    }
    if (wert.links) {
      return normalisiereWert(wert.links);
    }
    if (wert.edges) {
      return normalisiereWert(wert.edges);
    }
  }
  
  // Nodes aus Set erstellen
  nodes = Array.from(nodeSet).map(name => ({ name, value: 1 }));
  
  return { connections, nodes };
}

function berechneNodePositionen(nodes, width, height, config) {
  const positions = {};
  const padding = 40;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  
  if (config.layout === 'circular') {
    // Kreisförmiges Layout
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(usableWidth, usableHeight) / 2.5;
    
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      positions[node.name] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      };
    });
  } else {
    // Organisches/zufälliges Layout mit Abstands-Optimierung
    nodes.forEach((node, i) => {
      // Pseudo-zufällige aber deterministische Positionen
      const seed = hashString(node.name);
      const x = padding + (seed % 1000) / 1000 * usableWidth;
      const y = padding + ((seed * 7) % 1000) / 1000 * usableHeight;
      positions[node.name] = { x, y };
    });
  }
  
  return positions;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function erstelleOrganischeKurven(from, to, value, color, index) {
  const curves = [];
  const numCurves = Math.min(5, Math.max(1, Math.floor(value / 2)));
  
  for (let i = 0; i < numCurves; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Organische Bezier-Kurve mit Variation
    const offset = (i - numCurves / 2) * 15;
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    // Perpendicular offset für organische Kurve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1; // Prevent division by zero
    const perpX = -dy / len * offset;
    const perpY = dx / len * offset;
    
    // Zusätzliche Welligkeit
    const wave = Math.sin(index + i) * 20;
    
    const cp1x = from.x + dx * 0.25 + perpX + wave;
    const cp1y = from.y + dy * 0.25 + perpY - wave * 0.5;
    const cp2x = from.x + dx * 0.75 + perpX - wave;
    const cp2y = from.y + dy * 0.75 + perpY + wave * 0.5;
    
    const d = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', 1 + value / 10);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('class', 'amorph-flow-curve');
    path.setAttribute('opacity', 0.4 + (i / numCurves) * 0.3);
    
    curves.push(path);
  }
  
  return curves;
}

function erstellePartikel(from, to, value, index) {
  const particles = [];
  const numParticles = Math.min(20, Math.max(3, value));
  
  for (let i = 0; i < numParticles; i++) {
    const t = Math.random();
    const offset = (Math.random() - 0.5) * 30;
    
    // Position entlang der Kurve mit Offset
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero if from and to are the same
    if (len < 0.001) continue;
    
    const perpX = -dy / len * offset;
    const perpY = dx / len * offset;
    
    const x = from.x + dx * t + perpX;
    const y = from.y + dy * t + perpY;
    
    // Partikel-Größe variieren
    const size = 2 + Math.random() * 4;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', size);
    circle.setAttribute('class', 'amorph-flow-particle');
    circle.setAttribute('fill', PARTICLE_COLORS[index % PARTICLE_COLORS.length]);
    circle.setAttribute('filter', 'url(#flow-glow)');
    
    // Animation-Delay für Bewegung
    circle.style.animationDelay = `${Math.random() * 3}s`;
    
    particles.push(circle);
    
    // Äußerer Ring für einige Partikel
    if (Math.random() > 0.7) {
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', x);
      ring.setAttribute('cy', y);
      ring.setAttribute('r', size + 3);
      ring.setAttribute('class', 'amorph-flow-particle-ring');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', PARTICLE_COLORS[index % PARTICLE_COLORS.length]);
      ring.setAttribute('stroke-width', 0.5);
      ring.setAttribute('opacity', 0.4);
      particles.push(ring);
    }
  }
  
  return particles;
}

function erstelleNode(name, pos, nodeData) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'amorph-flow-node');
  
  // Haupt-Kreis
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', pos.x);
  circle.setAttribute('cy', pos.y);
  circle.setAttribute('r', 8);
  circle.setAttribute('class', 'amorph-flow-node-circle');
  g.appendChild(circle);
  
  // Äußerer Glow
  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  glow.setAttribute('cx', pos.x);
  glow.setAttribute('cy', pos.y);
  glow.setAttribute('r', 12);
  glow.setAttribute('class', 'amorph-flow-node-glow');
  g.insertBefore(glow, circle);
  
  // Label (nur wenn nicht zu viele Nodes)
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', pos.x);
  text.setAttribute('y', pos.y + 22);
  text.setAttribute('class', 'amorph-flow-node-label');
  text.textContent = name.length > 12 ? name.slice(0, 10) + '…' : name;
  g.appendChild(text);
  
  return g;
}

function starteAnimation(container) {
  // CSS-basierte Animation - Partikel bewegen sich sanft
  const particles = container.querySelectorAll('.amorph-flow-particle');
  particles.forEach((p, i) => {
    p.style.animation = `flow-float ${3 + Math.random() * 2}s ease-in-out infinite`;
    p.style.animationDelay = `${i * 0.1}s`;
  });
}

export default flow;

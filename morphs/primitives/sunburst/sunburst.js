/**
 * ☀️ SUNBURST MORPH - Radiale Hierarchie
 * 
 * Zeigt hierarchische Daten als konzentrische Ringe
 * Basiert auf Kirk's Prinzipien: Sunburst für Hierarchien
 * Fig 6.28, 6.29 - Beer Brands, Fossil Fuel Companies
 * 
 * Input: {name: "Root", children: [{name: "A", value: 10}, ...]}
 *    oder: [{level1: "A", level2: "B", value: 10}, ...]
 * Output: SVG Sunburst mit Ringsegmenten
 */

import { debug } from '../../../observer/debug.js';

// Ring-Farben (von innen nach außen heller)
const RING_FARBEN = [
  ['rgba(0, 150, 200, 0.8)', 'rgba(0, 200, 255, 0.7)', 'rgba(100, 220, 255, 0.6)'],
  ['rgba(200, 0, 150, 0.8)', 'rgba(255, 0, 200, 0.7)', 'rgba(255, 100, 220, 0.6)'],
  ['rgba(0, 200, 100, 0.8)', 'rgba(0, 255, 128, 0.7)', 'rgba(100, 255, 180, 0.6)'],
  ['rgba(200, 150, 0, 0.8)', 'rgba(255, 200, 0, 0.7)', 'rgba(255, 220, 100, 0.6)'],
  ['rgba(150, 0, 200, 0.8)', 'rgba(200, 0, 255, 0.7)', 'rgba(220, 100, 255, 0.6)'],
  ['rgba(200, 100, 0, 0.8)', 'rgba(255, 128, 0, 0.7)', 'rgba(255, 180, 100, 0.6)']
];

export function sunburst(wert, config = {}) {
  debug.morphs('sunburst', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-sunburst';
  
  // Daten normalisieren
  const root = normalisiereWert(wert);
  
  if (!root || !root.children || root.children.length === 0) {
    el.innerHTML = '<span class="amorph-sunburst-leer">Keine Hierarchie-Daten</span>';
    return el;
  }
  
  // Total berechnen
  berechneValues(root);
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-sunburst-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // SVG
  const size = config.size || 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 20;
  const innerRadius = config.innerRadius || 30;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-sunburst-svg');
  
  // Tiefe berechnen
  const maxDepth = berechneMaxDepth(root);
  const ringWidth = (maxRadius - innerRadius) / maxDepth;
  
  // Segmente zeichnen
  zeichneNode(svg, root, 0, Math.PI * 2, 0, cx, cy, innerRadius, ringWidth, 0);
  
  // Center Label
  const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', cx);
  centerCircle.setAttribute('cy', cy);
  centerCircle.setAttribute('r', innerRadius - 5);
  centerCircle.setAttribute('class', 'amorph-sunburst-center');
  centerGroup.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', cx);
  centerText.setAttribute('y', cy);
  centerText.setAttribute('class', 'amorph-sunburst-center-text');
  centerText.textContent = root.name || config.centerLabel || 'Total';
  centerGroup.appendChild(centerText);
  
  svg.appendChild(centerGroup);
  
  el.appendChild(svg);
  
  // Legende (erste Ebene)
  if (config.showLegend !== false) {
    const legend = document.createElement('div');
    legend.className = 'amorph-sunburst-legend';
    
    root.children.forEach((child, i) => {
      const colors = RING_FARBEN[i % RING_FARBEN.length];
      const item = document.createElement('div');
      item.className = 'amorph-sunburst-legend-item';
      item.innerHTML = `
        <span class="amorph-sunburst-legend-color" style="background: ${colors[0]}"></span>
        <span class="amorph-sunburst-legend-label">${child.name}</span>
      `;
      legend.appendChild(item);
    });
    
    el.appendChild(legend);
  }
  
  return el;
}

function normalisiereWert(wert) {
  // Bereits hierarchisch: {name, children}
  if (typeof wert === 'object' && wert !== null && !Array.isArray(wert) && wert.children) {
    return wert;
  }
  
  // Array von hierarchischen Objekten: [{name, children, value}, ...]
  if (Array.isArray(wert)) {
    // Prüfe ob es bereits hierarchische Objekte sind (mit children)
    const hasHierarchy = wert.some(item => item && typeof item === 'object' && (item.children || item.value || item.size));
    
    if (hasHierarchy) {
      // Wrap in Root wenn Array von Top-Level Nodes
      return {
        name: 'Root',
        children: wert.map(item => normalisiereHierarchieItem(item))
      };
    }
    
    // Array von Pfaden: [{level1, level2, value}]
    const root = { name: 'Root', children: [] };
    
    for (const item of wert) {
      if (typeof item !== 'object' || item === null) continue;
      
      // Finde Level-Keys
      const levels = Object.keys(item)
        .filter(k => k.match(/level\d+/i) || ['category', 'subcategory', 'item'].includes(k.toLowerCase()))
        .sort();
      
      let current = root;
      for (const levelKey of levels) {
        const name = item[levelKey];
        if (!name) continue;
        
        let child = current.children.find(c => c.name === name);
        if (!child) {
          child = { name, children: [] };
          current.children.push(child);
        }
        current = child;
      }
      
      // Value zum Blatt
      if (item.value || item.size || item.count) {
        current.value = (current.value || 0) + (item.value || item.size || item.count);
      }
    }
    
    return root;
  }
  
  // Objekt-Hierarchie: {A: {B: value}}
  if (typeof wert === 'object' && wert !== null) {
    return objektZuHierarchie('Root', wert);
  }
  
  return null;
}

// Hilfsfunktion um hierarchische Items zu normalisieren
function normalisiereHierarchieItem(item) {
  if (!item || typeof item !== 'object') return { name: '', value: 0, children: [] };
  
  const result = {
    name: item.name || item.label || '',
    value: item.value || item.size || item.count || 0,
    children: []
  };
  
  if (item.children && Array.isArray(item.children)) {
    result.children = item.children.map(child => normalisiereHierarchieItem(child));
  }
  
  return result;
}

function objektZuHierarchie(name, obj) {
  if (typeof obj === 'number') {
    return { name, value: obj, children: [] };
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const children = Object.entries(obj).map(([key, val]) => 
      objektZuHierarchie(key, val)
    );
    return { name, children };
  }
  
  return { name, value: 0, children: [] };
}

function berechneValues(node) {
  if (!node.children || node.children.length === 0) {
    return node.value || 0;
  }
  
  node.value = node.children.reduce((sum, child) => sum + berechneValues(child), 0);
  return node.value;
}

function berechneMaxDepth(node, depth = 0) {
  if (!node.children || node.children.length === 0) {
    return depth;
  }
  return Math.max(...node.children.map(child => berechneMaxDepth(child, depth + 1)));
}

function zeichneNode(svg, node, startAngle, endAngle, depth, cx, cy, innerRadius, ringWidth, parentColorIndex) {
  if (!node.children || node.children.length === 0) return;
  
  let currentAngle = startAngle;
  const total = node.value || node.children.reduce((sum, c) => sum + (c.value || 0), 0);
  
  node.children.forEach((child, i) => {
    const childValue = child.value || 0;
    const childAngle = (childValue / total) * (endAngle - startAngle);
    const childEndAngle = currentAngle + childAngle;
    
    // Farbe basierend auf Parent oder eigenem Index
    const colorIndex = depth === 0 ? i : parentColorIndex;
    const colors = RING_FARBEN[colorIndex % RING_FARBEN.length];
    const color = colors[Math.min(depth, colors.length - 1)];
    
    // Ring-Segment zeichnen
    const r1 = innerRadius + depth * ringWidth;
    const r2 = r1 + ringWidth - 2;
    
    const segment = erstelleSegment(cx, cy, r1, r2, currentAngle, childEndAngle, color);
    segment.setAttribute('class', 'amorph-sunburst-segment');
    
    // Tooltip
    const percent = ((childValue / total) * 100).toFixed(1);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${child.name}: ${formatValue(childValue)} (${percent}%)`;
    segment.appendChild(title);
    
    svg.appendChild(segment);
    
    // Label (nur für große Segmente)
    if (childAngle > 0.2 && ringWidth > 20) {
      const labelAngle = currentAngle + childAngle / 2;
      const labelR = r1 + ringWidth / 2;
      const labelX = cx + Math.cos(labelAngle - Math.PI / 2) * labelR;
      const labelY = cy + Math.sin(labelAngle - Math.PI / 2) * labelR;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY);
      text.setAttribute('class', 'amorph-sunburst-label');
      text.setAttribute('transform', `rotate(${(labelAngle * 180 / Math.PI)}, ${labelX}, ${labelY})`);
      text.textContent = child.name.length > 10 ? child.name.slice(0, 8) + '…' : child.name;
      svg.appendChild(text);
    }
    
    // Rekursiv für Kinder
    zeichneNode(svg, child, currentAngle, childEndAngle, depth + 1, cx, cy, innerRadius, ringWidth, colorIndex);
    
    currentAngle = childEndAngle;
  });
}

function erstelleSegment(cx, cy, r1, r2, startAngle, endAngle, color) {
  // Winkel zu Koordinaten (0 = oben)
  const x1Inner = cx + Math.cos(startAngle - Math.PI / 2) * r1;
  const y1Inner = cy + Math.sin(startAngle - Math.PI / 2) * r1;
  const x2Inner = cx + Math.cos(endAngle - Math.PI / 2) * r1;
  const y2Inner = cy + Math.sin(endAngle - Math.PI / 2) * r1;
  const x1Outer = cx + Math.cos(startAngle - Math.PI / 2) * r2;
  const y1Outer = cy + Math.sin(startAngle - Math.PI / 2) * r2;
  const x2Outer = cx + Math.cos(endAngle - Math.PI / 2) * r2;
  const y2Outer = cy + Math.sin(endAngle - Math.PI / 2) * r2;
  
  const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
  
  const d = [
    `M ${x1Inner} ${y1Inner}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${x2Inner} ${y2Inner}`,
    `L ${x2Outer} ${y2Outer}`,
    `A ${r2} ${r2} 0 ${largeArc} 0 ${x1Outer} ${y1Outer}`,
    'Z'
  ].join(' ');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', color);
  
  return path;
}

function formatValue(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

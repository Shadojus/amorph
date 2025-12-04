/**
 * 🎯 RADAR MORPH - Spider/Radar Chart
 * 
 * Zeigt mehrdimensionale Daten als Radar-Chart
 * DATENGETRIEBEN - Perfekt für Eigenschaften-Profile
 * 
 * Input: [{axis: "Flavor", value: 80}, {axis: "Potency", value: 60}]
 *    oder: {Flavor: 80, Potency: 60, Aroma: 70}
 * Output: SVG Radar-Chart (min 3 Achsen)
 */

import { debug } from '../../observer/debug.js';

export function radar(wert, config = {}) {
  debug.morphs('radar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-radar';
  
  // Daten normalisieren
  const achsen = normalisiereWert(wert);
  
  if (achsen.length < 3) {
    el.innerHTML = '<span class="amorph-radar-leer">Min. 3 Achsen benötigt</span>';
    return el;
  }
  
  // Werte normalisieren (0-100)
  const maxRaw = Math.max(...achsen.map(a => a.value));
  const isSmallScale = maxRaw <= 10;
  achsen.forEach(a => {
    a.normalized = isSmallScale ? a.value * 10 : Math.min(100, Math.max(0, a.value));
  });
  
  // SVG generieren
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  
  // Grid-Pfad
  const gridPath = generiereGrid(cx, cy, radius, achsen.length);
  
  // Daten-Pfad
  const dataPoints = achsen.map((a, i) => 
    berechnePoint(i, achsen.length, a.normalized, cx, cy, radius)
  );
  const dataPath = `M ${dataPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
  
  // SVG erstellen
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-radar-svg');
  
  // Grid
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  grid.setAttribute('d', gridPath);
  grid.setAttribute('class', 'amorph-radar-grid');
  svg.appendChild(grid);
  
  // Achsen-Linien
  for (let i = 0; i < achsen.length; i++) {
    const end = berechnePoint(i, achsen.length, 100, cx, cy, radius);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('class', 'amorph-radar-axis');
    svg.appendChild(line);
  }
  
  // Daten-Shape
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', dataPath);
  shape.setAttribute('class', 'amorph-radar-shape');
  svg.appendChild(shape);
  
  // Punkte
  for (const p of dataPoints) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', 4);
    circle.setAttribute('class', 'amorph-radar-point');
    svg.appendChild(circle);
  }
  
  el.appendChild(svg);
  
  // Labels außerhalb SVG für bessere Lesbarkeit
  const labelsContainer = document.createElement('div');
  labelsContainer.className = 'amorph-radar-labels';
  
  for (let i = 0; i < achsen.length; i++) {
    const pos = berechneLabelPos(i, achsen.length, cx, cy, radius + 25);
    const labelEl = document.createElement('span');
    labelEl.className = 'amorph-radar-label';
    labelEl.textContent = achsen[i].label;
    labelEl.style.left = `${(pos.x / size) * 100}%`;
    labelEl.style.top = `${(pos.y / size) * 100}%`;
    labelsContainer.appendChild(labelEl);
  }
  el.appendChild(labelsContainer);
  
  return el;
}

function normalisiereWert(wert) {
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object') {
        const value = item.value || item.score || item.rating || 
                     item.strength || item.intensity || 0;
        const label = item.axis || item.label || item.name || 
                     item.dimension || item.kategorie || 'Unbekannt';
        return { label: kuerzeLabel(label), value };
      }
      return null;
    }).filter(Boolean).slice(0, 12);
  }
  
  // Objekt: {A: 80, B: 60}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .filter(([_, v]) => typeof v === 'number')
      .map(([label, value]) => ({ label: kuerzeLabel(label), value }))
      .slice(0, 12);
  }
  
  return [];
}

function kuerzeLabel(label) {
  if (label.length > 10) {
    return label.replace(/_/g, ' ').split(' ')[0].slice(0, 10);
  }
  return label;
}

function berechnePoint(index, total, value, cx, cy, radius) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / 100) * radius;
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r
  };
}

function berechneLabelPos(index, total, cx, cy, radius) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function generiereGrid(cx, cy, radius, points) {
  let path = '';
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const levelPoints = [];
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
      levelPoints.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      });
    }
    path += `M ${levelPoints[0].x} ${levelPoints[0].y} `;
    for (let i = 1; i < levelPoints.length; i++) {
      path += `L ${levelPoints[i].x} ${levelPoints[i].y} `;
    }
    path += 'Z ';
  }
  return path;
}

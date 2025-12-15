/**
 * 🫧 BUBBLE MORPH - Proportionale Kreise
 * 
 * Zeigt Mengen als proportionale Kreise (Packed Circles)
 * Basiert auf Kirk's Prinzipien: Bubble Chart für Größenvergleiche
 * Fig 6.13, 6.14 - UK Public Sector Expenditure, Marijuana Market Cap
 * 
 * Input: [{label: "A", value: 100}, {label: "B", value: 50}]
 *    oder: {A: 100, B: 50, C: 25}
 * Output: Packed Circle Layout mit Labels
 */

import { debug } from '../../../observer/debug.js';
import { getFarben } from '../../../util/semantic.js';

// Blue theme - monochromatic fallback
const FARBEN_FALLBACK = [
  'rgba(100, 180, 255, 0.6)',    // Light Sky Blue
  'rgba(80, 160, 240, 0.6)',     // Bright Blue
  'rgba(60, 140, 220, 0.6)',     // Ocean Blue
  'rgba(120, 200, 255, 0.5)',    // Ice Blue
  'rgba(40, 120, 200, 0.6)',     // Deep Blue
  'rgba(140, 210, 255, 0.45)',   // Pale Blue
  'rgba(70, 150, 230, 0.6)',     // Azure
  'rgba(90, 170, 250, 0.55)'     // Soft Blue
];

function getBubbleFarben() {
  return getFarben('diagramme') || FARBEN_FALLBACK;
}

export function bubble(wert, config = {}) {
  debug.morphs('bubble', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-bubble';
  
  // Daten normalisieren
  const items = normalisiereWert(wert);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-bubble-leer">Keine Bubble-Daten</span>';
    return el;
  }
  
  // Nach Größe sortieren (größte zuerst)
  items.sort((a, b) => b.value - a.value);
  
  // Farben zuweisen
  const farben = getBubbleFarben();
  items.forEach((item, i) => {
    item.color = config.farben?.[item.label] || farben[i % farben.length];
  });
  
  // Total berechnen
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const maxValue = items[0]?.value || 1; // Prevent division by zero
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-bubble-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // SVG Container
  const size = config.size || 300;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-bubble-svg');
  
  // Circle Packing berechnen
  const circles = packCircles(items, size, maxValue);
  
  // Bubbles rendern
  for (const circle of circles) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'amorph-bubble-group');
    
    // Äußerer Glow
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('cx', circle.x);
    glow.setAttribute('cy', circle.y);
    glow.setAttribute('r', circle.r + 2);
    glow.setAttribute('class', 'amorph-bubble-glow');
    glow.setAttribute('fill', circle.color.replace('0.6', '0.2'));
    g.appendChild(glow);
    
    // Hauptkreis
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', circle.x);
    c.setAttribute('cy', circle.y);
    c.setAttribute('r', circle.r);
    c.setAttribute('class', 'amorph-bubble-circle');
    c.setAttribute('fill', circle.color);
    g.appendChild(c);
    
    // Label (nur wenn Kreis groß genug)
    if (circle.r > 20) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', circle.x);
      text.setAttribute('y', circle.y - 5);
      text.setAttribute('class', 'amorph-bubble-label');
      text.textContent = circle.label;
      g.appendChild(text);
      
      // Wert
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', circle.x);
      valueText.setAttribute('y', circle.y + 12);
      valueText.setAttribute('class', 'amorph-bubble-value');
      valueText.textContent = formatValue(circle.value, config.unit);
      g.appendChild(valueText);
    }
    
    svg.appendChild(g);
  }
  
  el.appendChild(svg);
  
  // Legende für kleine Bubbles
  const smallBubbles = circles.filter(c => c.r <= 20);
  if (smallBubbles.length > 0) {
    const legend = document.createElement('div');
    legend.className = 'amorph-bubble-legend';
    
    for (const bubble of smallBubbles) {
      const item = document.createElement('div');
      item.className = 'amorph-bubble-legend-item';
      item.innerHTML = `
        <span class="amorph-bubble-legend-dot" style="background: ${bubble.color}"></span>
        <span class="amorph-bubble-legend-label">${bubble.label}</span>
        <span class="amorph-bubble-legend-value">${formatValue(bubble.value, config.unit)}</span>
      `;
      legend.appendChild(item);
    }
    el.appendChild(legend);
  }
  
  // Summary
  const summary = document.createElement('div');
  summary.className = 'amorph-bubble-summary';
  summary.innerHTML = `
    <span class="amorph-bubble-total">${formatValue(total, config.unit)}</span>
    <span class="amorph-bubble-total-label">${config.totalLabel || 'Total'}</span>
  `;
  el.appendChild(summary);
  
  return el;
}

function normalisiereWert(wert) {
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object' && item !== null) {
        const value = item.value || item.size || item.count || item.amount || item.radius || item.r || 0;
        const label = item.label || item.name || item.category || 'Unknown';
        return { label, value: Number(value) };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Objekt mit Label-Value Paaren
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert).map(([label, value]) => ({
      label,
      value: typeof value === 'number' ? value : 0
    }));
  }
  
  return [];
}

/**
 * Simple Circle Packing Algorithmus
 * Basiert auf einem Spiral-Layout für bessere Platzierung
 */
function packCircles(items, size, maxValue) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 3;
  const minRadius = 15;
  
  // Radius basierend auf Wert berechnen (Fläche proportional)
  const circles = items.map(item => ({
    ...item,
    r: Math.max(minRadius, Math.sqrt(item.value / maxValue) * maxRadius)
  }));
  
  // Positionierung: Größte in der Mitte, dann spiralförmig außen
  const placed = [];
  
  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    
    if (i === 0) {
      // Größter Kreis in der Mitte
      circle.x = cx;
      circle.y = cy;
    } else {
      // Spiral-Positionierung
      let bestPos = findBestPosition(circle, placed, size);
      circle.x = bestPos.x;
      circle.y = bestPos.y;
    }
    
    placed.push(circle);
  }
  
  return placed;
}

function findBestPosition(circle, placed, size) {
  const cx = size / 2;
  const cy = size / 2;
  
  // Versuche verschiedene Positionen auf einer Spirale
  for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
    for (let dist = 0; dist < size / 2; dist += 5) {
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      
      // Prüfe Kollision mit platzierten Kreisen
      let valid = true;
      for (const p of placed) {
        const dx = x - p.x;
        const dy = y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = circle.r + p.r + 4; // 4px padding
        
        if (distance < minDist) {
          valid = false;
          break;
        }
      }
      
      // Prüfe ob im Bounds
      if (x - circle.r < 5 || x + circle.r > size - 5 ||
          y - circle.r < 5 || y + circle.r > size - 5) {
        valid = false;
      }
      
      if (valid) {
        return { x, y };
      }
    }
  }
  
  // Fallback: Zufällige Position
  return { x: cx + (Math.random() - 0.5) * size * 0.6, y: cy + (Math.random() - 0.5) * size * 0.6 };
}

function formatValue(value, unit) {
  let formatted;
  if (value >= 1e9) {
    formatted = (value / 1e9).toFixed(1) + 'B';
  } else if (value >= 1e6) {
    formatted = (value / 1e6).toFixed(1) + 'M';
  } else if (value >= 1e3) {
    formatted = (value / 1e3).toFixed(1) + 'K';
  } else {
    formatted = value.toFixed(0);
  }
  
  return unit ? `${unit}${formatted}` : formatted;
}

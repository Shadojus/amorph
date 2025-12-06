/**
 * COMPARE RADAR - Überlappende Radar-Charts
 */

import { debug } from '../../../observer/debug.js';

export function compareRadar(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar';
  
  if (!items.length || !items[0]?.wert) {
    el.innerHTML = '<div class="compare-leer">Keine Profil-Daten</div>';
    return el;
  }
  
  // Achsen aus erstem Item
  const firstWert = items[0].wert;
  const achsen = Array.isArray(firstWert) 
    ? firstWert.map(a => a.axis || a.label || a.name)
    : Object.keys(firstWert);
  
  if (achsen.length < 3) {
    return compareRadarCompact(items, config);
  }
  
  // SVG erstellen
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'compare-radar-svg');
  
  // Grid
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const points = achsen.map((_, i) => {
      const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'radar-grid');
    svg.appendChild(polygon);
  }
  
  // Skalen-Beschriftung (33, 66, 100)
  for (let level = 1; level <= 3; level++) {
    const r = (radius / 3) * level;
    const skalaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    skalaText.setAttribute('x', cx + 3);
    skalaText.setAttribute('y', cy - r - 1);
    skalaText.setAttribute('class', 'radar-scale-label');
    skalaText.textContent = String(Math.round((level / 3) * 100));
    svg.appendChild(skalaText);
  }
  
  // Achsen-Linien
  achsen.forEach((achse, i) => {
    const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + Math.cos(angle) * radius);
    line.setAttribute('y2', cy + Math.sin(angle) * radius);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);
    
    // Label
    const labelR = radius + 12;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx + Math.cos(angle) * labelR);
    text.setAttribute('y', cy + Math.sin(angle) * labelR);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = achse;
    svg.appendChild(text);
  });
  
  // Daten-Shapes für jeden Item
  items.forEach(item => {
    const werte = normalisiereRadarWerte(item.wert, achsen);
    const points = achsen.map((achse, i) => {
      const val = werte[achse] || 0;
      const r = (val / 100) * radius;
      const angle = (Math.PI * 2 * i) / achsen.length - Math.PI / 2;
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
    }).join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', `radar-shape ${item.farbKlasse || ''}`);
    
    // Inline-Styles mit Daten aus erstelleFarben() - farbe=fill, textFarbe=line
    const fillColor = item.farbe || 'rgba(100,100,100,0.24)';
    const strokeColor = item.lineFarbe || item.textFarbe || item.farbe || 'rgba(100,100,100,0.70)';
    polygon.setAttribute('style', `fill:${fillColor};stroke:${strokeColor};stroke-width:2.5`);
    
    svg.appendChild(polygon);
  });
  
  el.appendChild(svg);
  
  // Legende
  const legende = document.createElement('div');
  legende.className = 'compare-legende';
  items.forEach(item => {
    const legendeItem = document.createElement('span');
    legendeItem.className = `legende-item ${item.farbKlasse || ''}`;
    
    // Inline-Styles für zuverlässige Darstellung
    const dotColor = item.lineFarbe || item.textFarbe || item.farbe || 'rgba(100,100,100,0.7)';
    const textColor = item.textFarbe || 'rgba(255,255,255,0.85)';
    legendeItem.innerHTML = `<span class="legende-dot" style="background:${dotColor}"></span><span style="color:${textColor}">${item.name}</span>`;
    legende.appendChild(legendeItem);
  });
  el.appendChild(legende);
  
  return el;
}

function compareRadarCompact(items, config) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-radar-compact';
  
  const alleAchsen = new Set();
  items.forEach(item => {
    const wert = item.wert;
    if (Array.isArray(wert)) {
      wert.forEach(a => alleAchsen.add(a.axis || a.label || a.name));
    } else if (typeof wert === 'object') {
      Object.keys(wert).forEach(k => alleAchsen.add(k));
    }
  });
  
  [...alleAchsen].forEach(achse => {
    const row = document.createElement('div');
    row.className = 'radar-compact-row';
    row.innerHTML = `<span class="radar-achse">${achse}</span>`;
    
    const bars = document.createElement('div');
    bars.className = 'radar-compact-bars';
    
    items.forEach(item => {
      const werte = normalisiereRadarWerte(item.wert, [achse]);
      const val = werte[achse] || 0;
      bars.innerHTML += `
        <div class="radar-mini-bar" style="width:${val}%;background:${item.farbe}" title="${item.name}: ${val}"></div>
      `;
    });
    
    row.appendChild(bars);
    el.appendChild(row);
  });
  
  return el;
}

function normalisiereRadarWerte(wert, achsen) {
  const result = {};
  
  if (Array.isArray(wert)) {
    wert.forEach(item => {
      const key = item.axis || item.label || item.name;
      result[key] = item.value || item.score || 0;
    });
  } else if (typeof wert === 'object') {
    Object.assign(result, wert);
  }
  
  return result;
}

export default compareRadar;

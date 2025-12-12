/**
 * 🎯 GAUGE MORPH - Halbkreis-Tachometer
 * 
 * Zeigt Werte als Gauge/Tachometer
 * DATENGETRIEBEN - Erkennt Score/Prozent-Werte
 * 
 * Input: 75 oder {value: 75, max: 100, label: "Score"}
 *    oder {fuer_menschen: 95, fuer_tiere: 70}
 * Output: Halbkreis-Gauge mit Farbzonen
 */

import { debug } from '../../../observer/debug.js';

export function gauge(wert, config = {}) {
  debug.morphs('gauge', { typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-gauge';
  
  // Mehrere Gauges für Objekte
  const gauges = normalisiereGauge(wert);
  
  if (gauges.length === 0) {
    el.innerHTML = '<span class="amorph-gauge-leer">Keine Daten</span>';
    return el;
  }
  
  // Container für mehrere Gauges
  const container = document.createElement('div');
  container.className = 'amorph-gauge-container';
  container.style.setProperty('--gauge-count', gauges.length);
  
  for (const g of gauges) {
    container.appendChild(createSingleGauge(g, config));
  }
  
  el.appendChild(container);
  return el;
}

function normalisiereGauge(wert) {
  const gauges = [];
  
  if (typeof wert === 'number') {
    gauges.push({ value: wert, max: 100, label: '' });
  } else if (typeof wert === 'object' && !Array.isArray(wert)) {
    // Einzelnes Gauge-Objekt
    if ('value' in wert || 'wert' in wert) {
      gauges.push({
        value: wert.value || wert.wert || 0,
        max: wert.max || 100,
        label: wert.label || wert.name || ''
      });
    } else {
      // Mehrere Key-Value-Paare
      for (const [key, value] of Object.entries(wert)) {
        if (typeof value === 'number') {
          gauges.push({
            value: value,
            max: 100,
            label: formatLabel(key)
          });
        }
      }
    }
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'number') {
        gauges.push({ value: item, max: 100, label: '' });
      } else if (typeof item === 'object') {
        gauges.push({
          value: item.value || item.wert || item.score || 0,
          max: item.max || 100,
          label: item.label || item.name || ''
        });
      }
    }
  }
  
  return gauges.slice(0, 4); // Max 4 Gauges
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

function createSingleGauge(data, config) {
  const { value, max, label } = data;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  const container = document.createElement('div');
  container.className = 'amorph-gauge-item';
  
  const size = config.size || 120;
  const strokeWidth = 10;
  const radius = (size / 2) - strokeWidth;
  const circumference = Math.PI * radius; // Halbkreis
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size / 2 + 10}`);
  svg.setAttribute('class', 'amorph-gauge-svg');
  
  // Hintergrund-Arc (Grau)
  const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bgArc.setAttribute('d', createArc(size / 2, size / 2, radius, 180, 0));
  bgArc.setAttribute('fill', 'none');
  bgArc.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  bgArc.setAttribute('stroke-width', strokeWidth);
  bgArc.setAttribute('stroke-linecap', 'round');
  svg.appendChild(bgArc);
  
  // Farbzonen im Hintergrund
  const zones = [
    { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.2)' },
    { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.2)' },
    { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.2)' }
  ];
  
  for (const zone of zones) {
    const startAngle = 180 - (zone.start / 100 * 180);
    const endAngle = 180 - (zone.end / 100 * 180);
    const zoneArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    zoneArc.setAttribute('d', createArc(size / 2, size / 2, radius, startAngle, endAngle));
    zoneArc.setAttribute('fill', 'none');
    zoneArc.setAttribute('stroke', zone.color);
    zoneArc.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(zoneArc);
  }
  
  // Wert-Arc
  const valueAngle = 180 - (percent / 100 * 180);
  const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  valueArc.setAttribute('d', createArc(size / 2, size / 2, radius, 180, valueAngle));
  valueArc.setAttribute('fill', 'none');
  valueArc.setAttribute('stroke', getGaugeColor(percent));
  valueArc.setAttribute('stroke-width', strokeWidth);
  valueArc.setAttribute('stroke-linecap', 'round');
  valueArc.setAttribute('class', 'amorph-gauge-value-arc');
  svg.appendChild(valueArc);
  
  // Nadel
  const needleAngle = (180 - (percent / 100 * 180)) * (Math.PI / 180);
  const needleLength = radius - 15;
  const needleX = (size / 2) + Math.cos(needleAngle) * needleLength;
  const needleY = (size / 2) - Math.sin(needleAngle) * needleLength;
  
  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  needle.setAttribute('x1', size / 2);
  needle.setAttribute('y1', size / 2);
  needle.setAttribute('x2', needleX);
  needle.setAttribute('y2', needleY);
  needle.setAttribute('stroke', 'white');
  needle.setAttribute('stroke-width', '2');
  needle.setAttribute('stroke-linecap', 'round');
  needle.setAttribute('class', 'amorph-gauge-needle');
  svg.appendChild(needle);
  
  // Nadel-Zentrum
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('cx', size / 2);
  center.setAttribute('cy', size / 2);
  center.setAttribute('r', '6');
  center.setAttribute('fill', 'rgba(0,0,0,0.8)');
  center.setAttribute('stroke', 'white');
  center.setAttribute('stroke-width', '2');
  svg.appendChild(center);
  
  // Min/Max Labels
  const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  minLabel.setAttribute('x', strokeWidth);
  minLabel.setAttribute('y', size / 2 + 5);
  minLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  minLabel.setAttribute('font-size', '8');
  minLabel.textContent = '0';
  svg.appendChild(minLabel);
  
  const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  maxLabel.setAttribute('x', size - strokeWidth - 10);
  maxLabel.setAttribute('y', size / 2 + 5);
  maxLabel.setAttribute('fill', 'rgba(255,255,255,0.4)');
  maxLabel.setAttribute('font-size', '8');
  maxLabel.textContent = String(max);
  svg.appendChild(maxLabel);
  
  container.appendChild(svg);
  
  // Wert-Anzeige
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'amorph-gauge-display';
  valueDisplay.innerHTML = `
    <span class="amorph-gauge-number" style="color: ${getGaugeColor(percent)}">${value}</span>
    ${label ? `<span class="amorph-gauge-label">${label}</span>` : ''}
  `;
  container.appendChild(valueDisplay);
  
  return container;
}

function createArc(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.cos(startAngle * Math.PI / 180),
    y: cy - r * Math.sin(startAngle * Math.PI / 180)
  };
  const end = {
    x: cx + r * Math.cos(endAngle * Math.PI / 180),
    y: cy - r * Math.sin(endAngle * Math.PI / 180)
  };
  
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = startAngle > endAngle ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function getGaugeColor(percent) {
  if (percent >= 66) return 'rgba(100, 220, 140, 0.9)';
  if (percent >= 33) return 'rgba(240, 200, 80, 0.9)';
  return 'rgba(240, 80, 80, 0.9)';
}

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
  
  // Mehrere Gauges für Objekte - config weitergeben für min/max/zones
  const gauges = normalisiereGauge(wert, config);
  
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

function normalisiereGauge(wert, config = {}) {
  const gauges = [];
  
  // Default-Zones können über config überschrieben werden
  const defaultZones = [
    { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.2)', label: 'niedrig' },
    { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.2)', label: 'mittel' },
    { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.2)', label: 'hoch' }
  ];
  
  if (typeof wert === 'number') {
    gauges.push({ value: wert, min: config.min ?? 0, max: config.max ?? 100, label: '', zones: config.zones || defaultZones });
  } else if (typeof wert === 'object' && !Array.isArray(wert)) {
    // Einzelnes Gauge-Objekt mit min/max/zones Unterstützung
    if ('value' in wert || 'wert' in wert || 'score' in wert) {
      const min = wert.min ?? config.min ?? 0;
      const max = wert.max ?? config.max ?? 100;
      // Zones aus Daten oder Config
      const zones = wert.zones || wert.zonen || wert.bereiche || config.zones || defaultZones;
      gauges.push({
        value: wert.value ?? wert.wert ?? wert.score ?? 0,
        min,
        max,
        label: wert.label || wert.name || '',
        zones: normalisiereZones(zones, min, max)
      });
    } else {
      // Mehrere Key-Value-Paare
      for (const [key, value] of Object.entries(wert)) {
        if (typeof value === 'number') {
          gauges.push({
            value: value,
            min: config.min ?? 0,
            max: config.max ?? 100,
            label: formatLabel(key),
            zones: config.zones || defaultZones
          });
        }
      }
    }
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'number') {
        gauges.push({ value: item, min: config.min ?? 0, max: config.max ?? 100, label: '', zones: config.zones || defaultZones });
      } else if (typeof item === 'object') {
        const min = item.min ?? config.min ?? 0;
        const max = item.max ?? config.max ?? 100;
        const zones = item.zones || item.zonen || config.zones || defaultZones;
        gauges.push({
          value: item.value ?? item.wert ?? item.score ?? 0,
          min,
          max,
          label: item.label || item.name || '',
          zones: normalisiereZones(zones, min, max)
        });
      }
    }
  }
  
  return gauges.slice(0, 4); // Max 4 Gauges
}

// Normalisiert Zones zu Prozent-Bereichen relativ zu min/max
function normalisiereZones(zones, min, max) {
  if (!zones || !Array.isArray(zones)) {
    return [
      { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.2)' },
      { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.2)' },
      { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.2)' }
    ];
  }
  
  const range = max - min || 1; // Prevent division by zero
  return zones.map(z => {
    // Wenn Zone bereits als Prozent definiert ist (0-100)
    if (z.percent) {
      return {
        start: z.start,
        end: z.end,
        color: z.color || getZoneColor(z.start)
      };
    }
    // Ansonsten absolute Werte zu Prozent konvertieren
    const startPercent = ((z.start - min) / range) * 100;
    const endPercent = ((z.end - min) / range) * 100;
    return {
      start: isFinite(startPercent) ? startPercent : 0,
      end: isFinite(endPercent) ? endPercent : 100,
      color: z.color || z.farbe || getZoneColor(isFinite(startPercent) ? startPercent : 0)
    };
  });
}

function getZoneColor(percent) {
  if (percent >= 66) return 'rgba(100, 220, 140, 0.2)';
  if (percent >= 33) return 'rgba(240, 200, 80, 0.2)';
  return 'rgba(240, 80, 80, 0.2)';
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

function createSingleGauge(data, config) {
  const { value, min = 0, max = 100, label, zones } = data;
  const range = max - min || 1; // Prevent division by zero
  const rawPercent = ((value - min) / range) * 100;
  const percent = isFinite(rawPercent) ? Math.min(100, Math.max(0, rawPercent)) : 0;
  
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
  
  // Farbzonen aus Daten oder Default
  const displayZones = zones || [
    { start: 0, end: 33, color: 'rgba(240, 80, 80, 0.2)' },
    { start: 33, end: 66, color: 'rgba(240, 200, 80, 0.2)' },
    { start: 66, end: 100, color: 'rgba(100, 220, 140, 0.2)' }
  ];
  
  for (const zone of displayZones) {
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
  minLabel.textContent = String(min);
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
  // Prevent NaN in path
  if (!isFinite(cx) || !isFinite(cy) || !isFinite(r) || !isFinite(startAngle) || !isFinite(endAngle)) {
    return 'M 0 0'; // Fallback empty path
  }
  
  const start = {
    x: cx + r * Math.cos(startAngle * Math.PI / 180),
    y: cy - r * Math.sin(startAngle * Math.PI / 180)
  };
  const end = {
    x: cx + r * Math.cos(endAngle * Math.PI / 180),
    y: cy - r * Math.sin(endAngle * Math.PI / 180)
  };
  
  // Additional safety check
  if (!isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
    return 'M 0 0';
  }
  
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = startAngle > endAngle ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function getGaugeColor(percent) {
  if (percent >= 66) return 'rgba(100, 220, 140, 0.9)';
  if (percent >= 33) return 'rgba(240, 200, 80, 0.9)';
  return 'rgba(240, 80, 80, 0.9)';
}

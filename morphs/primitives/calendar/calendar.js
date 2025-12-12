/**
 * 📅 CALENDAR MORPH - Jahreskalender/Saisonalität
 * 
 * Zeigt Ereignisse im Jahresverlauf als Kreiskalender oder Streifen
 * DATENGETRIEBEN - Erkennt Monats-/Saison-Strukturen
 * 
 * Input: [{monat: "März", ereignis: "..."}, {monat: "Nov-Feb", ...}]
 *    oder {jan: true, feb: true, mar: false, ...}
 * Output: Visueller Jahreskalender
 */

import { debug } from '../../../observer/debug.js';

const MONTHS = [
  { name: 'Jan', full: 'Januar', num: 1 },
  { name: 'Feb', full: 'Februar', num: 2 },
  { name: 'Mär', full: 'März', num: 3 },
  { name: 'Apr', full: 'April', num: 4 },
  { name: 'Mai', full: 'Mai', num: 5 },
  { name: 'Jun', full: 'Juni', num: 6 },
  { name: 'Jul', full: 'Juli', num: 7 },
  { name: 'Aug', full: 'August', num: 8 },
  { name: 'Sep', full: 'September', num: 9 },
  { name: 'Okt', full: 'Oktober', num: 10 },
  { name: 'Nov', full: 'November', num: 11 },
  { name: 'Dez', full: 'Dezember', num: 12 }
];

export function calendar(wert, config = {}) {
  debug.morphs('calendar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-calendar';
  
  // Daten normalisieren
  const events = normalisiereKalender(wert);
  
  // Modus: strip (Standard) oder circle
  const mode = config.mode || 'strip';
  el.setAttribute('data-mode', mode);
  
  if (mode === 'circle') {
    el.appendChild(renderCircleCalendar(events, config));
  } else {
    el.appendChild(renderStripCalendar(events, config));
  }
  
  // Legende falls Ereignisse vorhanden
  if (events.events.length > 0 && config.showLegend !== false) {
    const legend = document.createElement('div');
    legend.className = 'amorph-calendar-legend';
    
    const uniqueEvents = [...new Map(events.events.map(e => [e.label, e])).values()];
    for (const event of uniqueEvents.slice(0, 4)) {
      const item = document.createElement('div');
      item.className = 'amorph-calendar-legend-item';
      
      const dot = document.createElement('span');
      dot.className = 'amorph-calendar-legend-dot';
      dot.style.background = event.color || 'var(--color-accent)';
      item.appendChild(dot);
      
      const label = document.createElement('span');
      label.className = 'amorph-calendar-legend-label';
      label.textContent = event.label;
      item.appendChild(label);
      
      legend.appendChild(item);
    }
    
    el.appendChild(legend);
  }
  
  return el;
}

function normalisiereKalender(wert) {
  const monthData = Array(12).fill(null).map(() => ({ active: false, events: [] }));
  const events = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        const monthRange = parseMonthRange(item.monat || item.month || item.periode || '');
        const label = item.ereignis || item.event || item.label || item.name || '';
        const color = item.farbe || item.color || getEventColor(label);
        const current = item.aktuell || item.current || false;
        
        for (const monthNum of monthRange) {
          if (monthNum >= 1 && monthNum <= 12) {
            monthData[monthNum - 1].active = true;
            monthData[monthNum - 1].events.push({ label, color, current });
          }
        }
        
        if (monthRange.length > 0) {
          events.push({ label, color, months: monthRange, current });
        }
      }
    }
  } else if (typeof wert === 'object') {
    // Objekt mit Monats-Keys
    for (const [key, value] of Object.entries(wert)) {
      const monthNum = parseMonthName(key);
      if (monthNum && value) {
        monthData[monthNum - 1].active = true;
        if (typeof value === 'string') {
          monthData[monthNum - 1].events.push({ label: value, color: 'var(--color-accent)' });
        }
      }
    }
  }
  
  return { monthData, events };
}

function parseMonthRange(str) {
  if (!str) return [];
  
  const months = [];
  const lower = str.toLowerCase();
  
  // Range erkennen (z.B. "Nov-Feb" oder "November bis Februar")
  const rangeMatch = lower.match(/(\w+)[\s]*[-–bis]+[\s]*(\w+)/);
  if (rangeMatch) {
    const start = parseMonthName(rangeMatch[1]);
    const end = parseMonthName(rangeMatch[2]);
    if (start && end) {
      if (start <= end) {
        for (let i = start; i <= end; i++) months.push(i);
      } else {
        // Über Jahreswechsel (z.B. Nov-Feb)
        for (let i = start; i <= 12; i++) months.push(i);
        for (let i = 1; i <= end; i++) months.push(i);
      }
      return months;
    }
  }
  
  // Einzelner Monat
  const single = parseMonthName(lower);
  if (single) return [single];
  
  return [];
}

function parseMonthName(str) {
  if (!str) return null;
  const lower = str.toLowerCase().trim();
  
  const monthMap = {
    'jan': 1, 'januar': 1, 'january': 1,
    'feb': 2, 'februar': 2, 'february': 2,
    'mär': 3, 'mar': 3, 'märz': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'mai': 5, 'may': 5,
    'jun': 6, 'juni': 6, 'june': 6,
    'jul': 7, 'juli': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'september': 9,
    'okt': 10, 'oct': 10, 'oktober': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dez': 12, 'dec': 12, 'dezember': 12, 'december': 12
  };
  
  for (const [key, value] of Object.entries(monthMap)) {
    if (lower.startsWith(key)) return value;
  }
  
  // Nummer
  const num = parseInt(lower);
  if (num >= 1 && num <= 12) return num;
  
  return null;
}

function getEventColor(label) {
  const lower = (label || '').toLowerCase();
  if (lower.includes('blüte') || lower.includes('bloom')) return 'rgba(240, 180, 220, 0.8)';
  if (lower.includes('ernte') || lower.includes('harvest')) return 'rgba(240, 200, 80, 0.8)';
  if (lower.includes('migration') || lower.includes('wander')) return 'rgba(90, 160, 240, 0.8)';
  if (lower.includes('überwinter') || lower.includes('winter')) return 'rgba(140, 200, 240, 0.8)';
  if (lower.includes('saison') || lower.includes('season')) return 'rgba(100, 220, 160, 0.8)';
  return 'var(--color-accent)';
}

function renderStripCalendar(data, config) {
  const container = document.createElement('div');
  container.className = 'amorph-calendar-strip';
  
  // Aktuellen Monat ermitteln
  const currentMonth = new Date().getMonth(); // 0-indexed
  
  for (let i = 0; i < 12; i++) {
    const month = MONTHS[i];
    const monthInfo = data.monthData[i];
    
    const cell = document.createElement('div');
    cell.className = 'amorph-calendar-cell';
    if (monthInfo.active) cell.classList.add('amorph-calendar-active');
    if (i === currentMonth) cell.classList.add('amorph-calendar-current');
    
    // Farbe des ersten Events
    if (monthInfo.events.length > 0) {
      cell.style.setProperty('--cell-color', monthInfo.events[0].color);
    }
    
    // Monatsname
    const label = document.createElement('span');
    label.className = 'amorph-calendar-month';
    label.textContent = month.name;
    cell.appendChild(label);
    
    // Event-Indikator
    if (monthInfo.events.length > 0) {
      const indicator = document.createElement('div');
      indicator.className = 'amorph-calendar-indicator';
      for (const event of monthInfo.events.slice(0, 3)) {
        const dot = document.createElement('span');
        dot.className = 'amorph-calendar-dot';
        dot.style.background = event.color;
        indicator.appendChild(dot);
      }
      cell.appendChild(indicator);
    }
    
    container.appendChild(cell);
  }
  
  return container;
}

function renderCircleCalendar(data, config) {
  const container = document.createElement('div');
  container.className = 'amorph-calendar-circle';
  
  const size = config.size || 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = 40;
  const outerRadius = 80;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-calendar-svg');
  
  // Hintergrund-Kreis
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', centerX);
  bgCircle.setAttribute('cy', centerY);
  bgCircle.setAttribute('r', outerRadius);
  bgCircle.setAttribute('fill', 'rgba(255,255,255,0.03)');
  bgCircle.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  svg.appendChild(bgCircle);
  
  // Monats-Segmente
  const currentMonth = new Date().getMonth();
  
  for (let i = 0; i < 12; i++) {
    const monthInfo = data.monthData[i];
    const startAngle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
    
    const path = createArcPath(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle);
    
    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    segment.setAttribute('d', path);
    segment.setAttribute('fill', monthInfo.active 
      ? (monthInfo.events[0]?.color || 'rgba(var(--color-accent-rgb), 0.4)')
      : 'rgba(255,255,255,0.05)');
    segment.setAttribute('stroke', i === currentMonth ? 'white' : 'rgba(255,255,255,0.1)');
    segment.setAttribute('stroke-width', i === currentMonth ? '2' : '0.5');
    svg.appendChild(segment);
    
    // Monats-Label
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = outerRadius + 15;
    const labelX = centerX + Math.cos(midAngle) * labelRadius;
    const labelY = centerY + Math.sin(midAngle) * labelRadius;
    
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', i === currentMonth ? 'white' : 'rgba(255,255,255,0.5)');
    label.setAttribute('font-size', '8');
    label.setAttribute('font-weight', i === currentMonth ? 'bold' : 'normal');
    label.textContent = MONTHS[i].name;
    svg.appendChild(label);
  }
  
  container.appendChild(svg);
  return container;
}

function createArcPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startInner = {
    x: cx + Math.cos(startAngle) * innerR,
    y: cy + Math.sin(startAngle) * innerR
  };
  const endInner = {
    x: cx + Math.cos(endAngle) * innerR,
    y: cy + Math.sin(endAngle) * innerR
  };
  const startOuter = {
    x: cx + Math.cos(startAngle) * outerR,
    y: cy + Math.sin(startAngle) * outerR
  };
  const endOuter = {
    x: cx + Math.cos(endAngle) * outerR,
    y: cy + Math.sin(endAngle) * outerR
  };
  
  return `
    M ${startInner.x} ${startInner.y}
    L ${startOuter.x} ${startOuter.y}
    A ${outerR} ${outerR} 0 0 1 ${endOuter.x} ${endOuter.y}
    L ${endInner.x} ${endInner.y}
    A ${innerR} ${innerR} 0 0 0 ${startInner.x} ${startInner.y}
    Z
  `;
}

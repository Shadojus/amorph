/**
 * 📈 SPARKLINE MORPH - Inline-Trend-Visualisierung
 * 
 * Zeigt numerische Zeitreihen als kompakte Inline-Grafiken
 * Basiert auf Kirk's Prinzipien: Kompaktes Design, Fokus auf Daten
 * 
 * Input: [12, 45, 23, 67, 34, 89, 56]
 *    oder: [{date: "2023-01", value: 12}, ...]
 *    oder: {trend: [12, 45, 23], label: "Monatlich"}
 * Output: SVG Sparkline mit optionalen Annotations
 */

import { debug } from '../../../observer/debug.js';
import { getSchema } from '../../../util/semantic.js';

export function sparkline(wert, config = {}) {
  debug.morphs('sparkline', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-sparkline';
  
  // Daten normalisieren
  const daten = normalisiereDaten(wert);
  
  if (daten.length < 2) {
    el.innerHTML = '<span class="amorph-sparkline-leer">Zu wenig Daten</span>';
    return el;
  }
  
  // Visuell-Config aus Schema laden
  const schema = getSchema();
  const visuell = schema?.visuell || {};
  
  // Label falls vorhanden
  if (config.label || wert?.label) {
    const label = document.createElement('span');
    label.className = 'amorph-sparkline-label';
    label.textContent = config.label || wert.label;
    el.appendChild(label);
  }
  
  // SVG erstellen
  const svgContainer = document.createElement('div');
  svgContainer.className = 'amorph-sparkline-container';
  
  const svg = erstelleSparklineSVG(daten, config, visuell);
  svgContainer.appendChild(svg);
  
  // Wert-Zusammenfassung
  const summary = erstelleSummary(daten, visuell);
  svgContainer.appendChild(summary);
  
  el.appendChild(svgContainer);
  
  // Tooltip mit Details
  el.title = erstelleTooltipText(daten);
  
  return el;
}

function normalisiereDaten(wert) {
  // Array von Zahlen
  if (Array.isArray(wert) && wert.every(v => typeof v === 'number')) {
    return wert.map((value, i) => ({ index: i, value }));
  }
  
  // Array von Objekten
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && item !== null)
      .map((item, i) => ({
        index: i,
        value: item.value || item.wert || item.amount || item.count || 0,
        label: item.date || item.datum || item.label || item.name || null
      }))
      .filter(d => typeof d.value === 'number');
  }
  
  // Objekt mit trend-Array
  if (typeof wert === 'object' && wert !== null) {
    if (wert.trend && Array.isArray(wert.trend)) {
      return normalisiereDaten(wert.trend);
    }
    if (wert.values && Array.isArray(wert.values)) {
      return normalisiereDaten(wert.values);
    }
    if (wert.data && Array.isArray(wert.data)) {
      return normalisiereDaten(wert.data);
    }
  }
  
  return [];
}

function erstelleSparklineSVG(daten, config, visuell) {
  const width = config.width || 120;
  const height = config.height || 32;
  const padding = 2;
  
  const values = daten.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  // Punkte berechnen
  const points = daten.map((d, i) => {
    const x = padding + (i / (daten.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, value: d.value };
  });
  
  // SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-sparkline-svg');
  svg.setAttribute('preserveAspectRatio', 'none');
  
  // Fläche unter der Linie (Gradient)
  const areaPath = `M ${points[0].x} ${height} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height} Z`;
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', areaPath);
  area.setAttribute('class', 'amorph-sparkline-area');
  svg.appendChild(area);
  
  // Linie
  const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('d', linePath);
  line.setAttribute('class', 'amorph-sparkline-line');
  svg.appendChild(line);
  
  // Min/Max Punkte hervorheben
  const minPoint = points.reduce((a, b) => a.value < b.value ? a : b);
  const maxPoint = points.reduce((a, b) => a.value > b.value ? a : b);
  
  // Min Punkt
  const minDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  minDot.setAttribute('cx', minPoint.x);
  minDot.setAttribute('cy', minPoint.y);
  minDot.setAttribute('r', 3);
  minDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-min');
  svg.appendChild(minDot);
  
  // Max Punkt
  const maxDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  maxDot.setAttribute('cx', maxPoint.x);
  maxDot.setAttribute('cy', maxPoint.y);
  maxDot.setAttribute('r', 3);
  maxDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-max');
  svg.appendChild(maxDot);
  
  // Letzter Punkt (aktueller Wert)
  const lastPoint = points[points.length - 1];
  const lastDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  lastDot.setAttribute('cx', lastPoint.x);
  lastDot.setAttribute('cy', lastPoint.y);
  lastDot.setAttribute('r', 4);
  lastDot.setAttribute('class', 'amorph-sparkline-point amorph-sparkline-current');
  svg.appendChild(lastDot);
  
  return svg;
}

function erstelleSummary(daten, visuell) {
  const values = daten.map(d => d.value);
  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePercent = first !== 0 ? ((change / first) * 100).toFixed(1) : 0;
  
  const summary = document.createElement('div');
  summary.className = 'amorph-sparkline-summary';
  
  // Trend-Icon und Wert
  const trend = document.createElement('span');
  trend.className = 'amorph-sparkline-trend';
  
  if (change > 0) {
    trend.classList.add('amorph-sparkline-up');
    trend.innerHTML = `<span class="trend-icon">↑</span>${Math.abs(changePercent)}%`;
  } else if (change < 0) {
    trend.classList.add('amorph-sparkline-down');
    trend.innerHTML = `<span class="trend-icon">↓</span>${Math.abs(changePercent)}%`;
  } else {
    trend.classList.add('amorph-sparkline-stable');
    trend.innerHTML = `<span class="trend-icon">→</span>0%`;
  }
  
  summary.appendChild(trend);
  
  // Aktueller Wert
  const current = document.createElement('span');
  current.className = 'amorph-sparkline-current-value';
  current.textContent = formatNumber(last);
  summary.appendChild(current);
  
  return summary;
}

function erstelleTooltipText(daten) {
  const values = daten.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const last = values[values.length - 1];
  
  return `Aktuell: ${formatNumber(last)} | Min: ${formatNumber(min)} | Max: ${formatNumber(max)} | Ø ${formatNumber(avg)}`;
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1 && value !== 0) return value.toFixed(2);
  return value.toFixed(1);
}

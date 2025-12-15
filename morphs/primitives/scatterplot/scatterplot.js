/**
 * 📈 SCATTERPLOT - Streudiagramm mit Trendlinie
 * 
 * Zeigt Zusammenhänge zwischen zwei Variablen
 * Kirk Design: Punkte mit Labels, lineare Regression
 * 
 * Input: [{x: 15, y: 42, label: "A"}, {x: 20, y: 55, label: "B"}]
 * Output: SVG Scatterplot mit optionaler Trendlinie
 */

import { debug } from '../../../observer/debug.js';

// Blue theme - point colors
const PUNKT_FARBEN = [
  'rgba(100, 180, 255, 0.8)',   // Light Sky Blue
  'rgba(80, 160, 240, 0.8)',    // Bright Blue
  'rgba(60, 140, 220, 0.8)',    // Ocean Blue
  'rgba(120, 200, 255, 0.7)',   // Ice Blue
  'rgba(40, 120, 200, 0.8)',    // Deep Blue
  'rgba(140, 210, 255, 0.7)',   // Pale Blue
  'rgba(70, 150, 230, 0.8)',    // Azure
  'rgba(90, 170, 250, 0.75)'    // Soft Blue
];

export function scatterplot(wert, config = {}) {
  debug.morphs('scatterplot', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-scatterplot';
  
  // Daten normalisieren
  const punkte = normalisiereWert(wert);
  
  if (punkte.length === 0) {
    el.innerHTML = '<span class="amorph-scatterplot-leer">Keine Scatter-Daten</span>';
    return el;
  }
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-scatterplot-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Dimensionen
  const width = config.width || 300;
  const height = config.height || 200;
  const padding = 40;
  
  // Min/Max berechnen
  const xValues = punkte.map(p => p.x);
  const yValues = punkte.map(p => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Skalierungsfunktionen
  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin || 1)) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - padding * 2);
  
  // SVG erstellen
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-scatterplot-svg');
  
  // Achsen
  const achsen = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  achsen.setAttribute('class', 'amorph-scatterplot-achsen');
  
  // X-Achse
  const xAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAchse.setAttribute('x1', padding);
  xAchse.setAttribute('y1', height - padding);
  xAchse.setAttribute('x2', width - padding);
  xAchse.setAttribute('y2', height - padding);
  xAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
  achsen.appendChild(xAchse);
  
  // Y-Achse
  const yAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAchse.setAttribute('x1', padding);
  yAchse.setAttribute('y1', padding);
  yAchse.setAttribute('x2', padding);
  yAchse.setAttribute('y2', height - padding);
  yAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
  achsen.appendChild(yAchse);
  
  svg.appendChild(achsen);
  
  // Trendlinie (lineare Regression)
  if (config.showTrendline !== false && punkte.length >= 2) {
    const trend = berechneTrendlinie(punkte);
    if (trend) {
      const trendLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const x1 = xMin;
      const x2 = xMax;
      const y1 = trend.slope * x1 + trend.intercept;
      const y2 = trend.slope * x2 + trend.intercept;
      
      trendLine.setAttribute('x1', scaleX(x1));
      trendLine.setAttribute('y1', scaleY(y1));
      trendLine.setAttribute('x2', scaleX(x2));
      trendLine.setAttribute('y2', scaleY(y2));
      trendLine.setAttribute('stroke', 'rgba(255,255,255,0.5)');
      trendLine.setAttribute('stroke-width', '2');
      trendLine.setAttribute('stroke-dasharray', '4,4');
      trendLine.setAttribute('class', 'amorph-scatterplot-trend');
      svg.appendChild(trendLine);
    }
  }
  
  // Punkte zeichnen
  const punkteGruppe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  punkteGruppe.setAttribute('class', 'amorph-scatterplot-punkte');
  
  punkte.forEach((punkt, i) => {
    const cx = scaleX(punkt.x);
    const cy = scaleY(punkt.y);
    const farbe = punkt.color || PUNKT_FARBEN[i % PUNKT_FARBEN.length];
    
    // Punkt
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', config.dotSize || 6);
    circle.setAttribute('fill', farbe);
    circle.setAttribute('class', 'amorph-scatterplot-punkt');
    
    // Tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${punkt.label || ''}: (${punkt.x}, ${punkt.y})`;
    circle.appendChild(title);
    
    punkteGruppe.appendChild(circle);
    
    // Label (optional)
    if (config.showLabels !== false && punkt.label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx + 8);
      text.setAttribute('y', cy - 8);
      text.setAttribute('fill', 'rgba(255,255,255,0.7)');
      text.setAttribute('font-size', '10');
      text.setAttribute('class', 'amorph-scatterplot-label');
      text.textContent = punkt.label;
      punkteGruppe.appendChild(text);
    }
  });
  
  svg.appendChild(punkteGruppe);
  
  // Achsen-Labels
  if (config.xLabel) {
    const xLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabelText.setAttribute('x', width / 2);
    xLabelText.setAttribute('y', height - 5);
    xLabelText.setAttribute('text-anchor', 'middle');
    xLabelText.setAttribute('fill', 'rgba(255,255,255,0.5)');
    xLabelText.setAttribute('font-size', '10');
    xLabelText.textContent = config.xLabel;
    svg.appendChild(xLabelText);
  }
  
  if (config.yLabel) {
    const yLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabelText.setAttribute('x', 10);
    yLabelText.setAttribute('y', height / 2);
    yLabelText.setAttribute('text-anchor', 'middle');
    yLabelText.setAttribute('fill', 'rgba(255,255,255,0.5)');
    yLabelText.setAttribute('font-size', '10');
    yLabelText.setAttribute('transform', `rotate(-90, 10, ${height / 2})`);
    yLabelText.textContent = config.yLabel;
    svg.appendChild(yLabelText);
  }
  
  el.appendChild(svg);
  
  // Korrelations-Info
  if (config.showCorrelation !== false && punkte.length >= 3) {
    const r = berechneKorrelation(punkte);
    const info = document.createElement('div');
    info.className = 'amorph-scatterplot-info';
    info.innerHTML = `<span class="korrelation">r = ${r.toFixed(2)}</span>`;
    el.appendChild(info);
  }
  
  return el;
}

function normalisiereWert(wert) {
  if (!wert) return [];
  
  // Array von Objekten mit x, y
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && item !== null)
      .filter(item => ('x' in item && 'y' in item) || ('value1' in item && 'value2' in item))
      .map(item => ({
        x: item.x ?? item.value1 ?? 0,
        y: item.y ?? item.value2 ?? 0,
        label: item.label || item.name || '',
        color: item.color || item.farbe
      }));
  }
  
  return [];
}

function berechneTrendlinie(punkte) {
  if (punkte.length < 2) return null;
  
  const n = punkte.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  punkte.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  });
  
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function berechneKorrelation(punkte) {
  if (punkte.length < 2) return 0;
  
  const n = punkte.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  
  punkte.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  });
  
  const num = n * sumXY - sumX * sumY;
  const denom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denom === 0 ? 0 : num / denom;
}

export default scatterplot;

/**
 * 🥧 PIE MORPH - Kreisdiagramm
 * 
 * Zeigt Verteilungen als Donut-Chart
 * DATENGETRIEBEN - Erkennt Arrays mit Kategorien
 * 
 * Input: [{label: "A", value: 10}, {label: "B", value: 20}]
 *    oder: {A: 10, B: 20, C: 30}
 * Output: Kompaktes Donut-Diagramm mit Legende
 */

import { debug } from '../../observer/debug.js';
import { getFarben } from '../../util/semantic.js';

// Farben werden aus config/morphs.yaml geladen
const FARBEN_FALLBACK = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

function getDiagrammFarben() {
  return getFarben('diagramme') || FARBEN_FALLBACK;
}

export function pie(wert, config = {}) {
  debug.morphs('pie', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-pie';
  
  // Daten normalisieren
  const segmente = normalisiereWert(wert);
  
  if (segmente.length === 0) {
    el.innerHTML = '<span class="amorph-pie-leer">○ Keine Daten</span>';
    return el;
  }
  
  // Total berechnen
  const total = segmente.reduce((sum, s) => sum + s.value, 0);
  
  if (total === 0) {
    el.innerHTML = '<span class="amorph-pie-leer">○ Keine Werte</span>';
    return el;
  }
  
  // Prozente und Farben zuweisen (aus Config)
  const farben = getDiagrammFarben();
  segmente.forEach((seg, i) => {
    seg.percent = (seg.value / total) * 100;
    seg.color = config.farben?.[seg.label] || farben[i % farben.length];
  });
  
  // Conic Gradient generieren
  const gradient = generiereGradient(segmente);
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-pie-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Container
  const container = document.createElement('div');
  container.className = 'amorph-pie-container';
  
  // Chart
  const chart = document.createElement('div');
  chart.className = 'amorph-pie-chart';
  chart.style.setProperty('--pie-gradient', gradient);
  
  // Mitte (Donut-Loch)
  const center = document.createElement('div');
  center.className = 'amorph-pie-center';
  center.innerHTML = `
    <span class="amorph-pie-total">${formatNumber(total)}</span>
    <span class="amorph-pie-label">${config.totalLabel || 'Total'}</span>
  `;
  chart.appendChild(center);
  container.appendChild(chart);
  
  // Legende
  const legend = document.createElement('div');
  legend.className = 'amorph-pie-legend';
  
  for (const seg of segmente) {
    const item = document.createElement('div');
    item.className = 'amorph-pie-legend-item';
    item.innerHTML = `
      <span class="amorph-pie-legend-color" style="background: ${seg.color}"></span>
      <span class="amorph-pie-legend-label">${seg.label}</span>
      <span class="amorph-pie-legend-value">${seg.percent.toFixed(0)}%</span>
    `;
    legend.appendChild(item);
  }
  container.appendChild(legend);
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  // Array von Objekten: [{label, value}, ...]
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object') {
        const value = item.value || item.count || item.amount || item.anzahl || 0;
        const label = item.label || item.name || item.category || item.kategorie || 'Unbekannt';
        return { label, value };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Objekt: {A: 10, B: 20}
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert).map(([label, value]) => ({
      label,
      value: typeof value === 'number' ? value : 0
    }));
  }
  
  return [];
}

function generiereGradient(segmente) {
  let currentAngle = 0;
  const parts = segmente.map(seg => {
    const start = currentAngle;
    currentAngle += (seg.percent / 100) * 360;
    return `${seg.color} ${start}deg ${currentAngle}deg`;
  });
  return parts.join(', ');
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}

/**
 * COMPARE PIE - Side-by-side pie/donut charts
 * Uses the exact same HTML structure as the original pie morph
 */

import { debug } from '../../../../observer/debug.js';

// Fallback colors
const FARBEN_FALLBACK = [
  'rgba(100, 180, 255, 0.65)',
  'rgba(80, 160, 240, 0.65)',
  'rgba(60, 140, 220, 0.65)',
  'rgba(120, 200, 255, 0.55)',
  'rgba(40, 120, 200, 0.65)',
  'rgba(140, 210, 255, 0.50)',
  'rgba(70, 150, 230, 0.65)',
  'rgba(90, 170, 250, 0.60)'
];

export function comparePie(items, config = {}) {
  debug.morphs('comparePie', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pie';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all pie charts
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  // Create a pie chart for each item using original structure
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    const color = item.farbe || item.color || `hsl(${itemIndex * 60}, 70%, 60%)`;
    
    // Normalize data
    const segmente = normalisiereWert(val);
    
    // Use original pie structure
    const pieEl = document.createElement('div');
    pieEl.className = 'amorph-pie';
    
    // Title with item name - apply inline text color
    const titel = document.createElement('div');
    titel.className = 'amorph-pie-titel';
    titel.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) titel.style.color = item.textFarbe;
    pieEl.appendChild(titel);
    
    if (segmente.length === 0) {
      pieEl.innerHTML += '<span class="amorph-pie-leer">○ Keine Daten</span>';
      container.appendChild(pieEl);
      return;
    }
    
    // Calculate total and percentages
    const total = segmente.reduce((sum, s) => sum + s.value, 0);
    
    if (total === 0) {
      pieEl.innerHTML += '<span class="amorph-pie-leer">○ Keine Werte</span>';
      container.appendChild(pieEl);
      return;
    }
    
    // Assign colors and percentages
    const farben = config.farben || FARBEN_FALLBACK;
    segmente.forEach((seg, i) => {
      seg.percent = (seg.value / total) * 100;
      seg.color = farben[i % farben.length];
    });
    
    // Generate gradient
    const gradient = generiereGradient(segmente);
    
    // Container
    const pieContainer = document.createElement('div');
    pieContainer.className = 'amorph-pie-container';
    
    // Chart
    const chart = document.createElement('div');
    chart.className = 'amorph-pie-chart';
    chart.style.setProperty('--pie-gradient', gradient);
    
    // Center (donut hole)
    const center = document.createElement('div');
    center.className = 'amorph-pie-center';
    center.innerHTML = `
      <span class="amorph-pie-total">${formatNumber(total)}</span>
      <span class="amorph-pie-label">${config.totalLabel || 'Total'}</span>
    `;
    chart.appendChild(center);
    pieContainer.appendChild(chart);
    
    // Legend
    const legend = document.createElement('div');
    legend.className = 'amorph-pie-legend';
    
    for (const seg of segmente) {
      const legendItem = document.createElement('div');
      legendItem.className = 'amorph-pie-legend-item';
      legendItem.innerHTML = `
        <span class="amorph-pie-legend-color" style="background: ${seg.color}"></span>
        <span class="amorph-pie-legend-label">${seg.label}</span>
        <span class="amorph-pie-legend-value">${seg.percent.toFixed(0)}%</span>
      `;
      legend.appendChild(legendItem);
    }
    pieContainer.appendChild(legend);
    
    pieEl.appendChild(pieContainer);
    container.appendChild(pieEl);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  // Array of objects
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object') {
        const value = item.value || item.wert || item.count || item.amount || item.anzahl || item.anteil || 0;
        const label = item.label || item.name || item.category || item.kategorie || 'Unbekannt';
        return { label, value };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Object: {A: 10, B: 20}
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

export default comparePie;

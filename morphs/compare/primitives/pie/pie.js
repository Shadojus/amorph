/**
 * COMPARE PIE - Pie/donut charts with NEON pilz colors
 * Each pie uses item-specific neon color scheme
 */

import { debug } from '../../../../observer/debug.js';

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
  container.className = 'amorph-pie-compare-container';
  
  // Create a pie chart for each item using neon colors
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    const lineColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    // Normalize data
    const segmente = normalisiereWert(val);
    
    // Use original pie structure
    const pieEl = document.createElement('div');
    pieEl.className = 'amorph-pie amorph-pie-neon';
    
    // Title with item name and neon glow
    const titel = document.createElement('div');
    titel.className = 'amorph-pie-titel';
    titel.innerHTML = `
      <span class="pie-item-indicator" style="background: ${lineColor}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span style="color: ${textColor}">${item.name || item.id || `Item ${itemIndex + 1}`}</span>
    `;
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
    
    // Extract base hue for neon color generation
    const baseHue = parseInt(lineColor.match(/\d+/)?.[0] || 280);
    
    // Generate neon colors based on item's base color
    const generateNeonColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + i * 45) % 360;
        colors.push(`hsla(${hue}, 80%, 55%, 0.75)`);
      }
      return colors;
    };
    
    const neonFarben = generateNeonColors(segmente.length);
    
    // Assign colors and percentages
    segmente.forEach((seg, i) => {
      seg.percent = (seg.value / total) * 100;
      seg.color = neonFarben[i % neonFarben.length];
    });
    
    // Generate gradient
    const gradient = generiereGradient(segmente);
    
    // Container
    const pieContainer = document.createElement('div');
    pieContainer.className = 'amorph-pie-container';
    
    // Chart with neon glow
    const chart = document.createElement('div');
    chart.className = 'amorph-pie-chart amorph-pie-chart-neon';
    chart.style.setProperty('--pie-gradient', gradient);
    chart.style.boxShadow = `0 0 20px ${glowColor}40`;
    
    // Center (donut hole)
    const center = document.createElement('div');
    center.className = 'amorph-pie-center';
    center.innerHTML = `
      <span class="amorph-pie-total" style="color: ${textColor}">${formatNumber(total)}</span>
      <span class="amorph-pie-label">${config.totalLabel || 'Total'}</span>
    `;
    chart.appendChild(center);
    pieContainer.appendChild(chart);
    
    // Legend with neon colors - zeige alle Segment-Labels
    const legend = document.createElement('div');
    legend.className = 'amorph-pie-legend';
    
    for (const seg of segmente) {
      const legendItem = document.createElement('div');
      legendItem.className = 'amorph-pie-legend-item';
      // Kürze Label wenn zu lang
      const displayLabel = seg.label.length > 20 ? seg.label.slice(0, 18) + '…' : seg.label;
      legendItem.innerHTML = `
        <span class="amorph-pie-legend-color" style="background: ${seg.color}; box-shadow: 0 0 6px ${seg.color}"></span>
        <span class="amorph-pie-legend-label" title="${seg.label}">${displayLabel}</span>
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

/**
 * COMPARE STACKEDBAR - UNIFIED stacked bar chart comparison  
 * All items shown in unified rows with NEON pilz colors
 */

import { debug } from '../../../../observer/debug.js';

export function compareStackedbar(items, config = {}) {
  debug.morphs('compareStackedbar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stackedbar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Normalize all items' data
  const normalizedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const { bars, segmentNames } = normalisiereWert(rawVal);
    return { ...item, bars, segmentNames, index: idx };
  }).filter(item => item.bars.length > 0);
  
  if (normalizedItems.length === 0) {
    el.innerHTML = '<div class="compare-empty">Keine Stacked-Bar Daten</div>';
    return el;
  }
  
  // Create unified container
  const stackedbarEl = document.createElement('div');
  stackedbarEl.className = 'amorph-stackedbar amorph-stackedbar-compare';
  
  // For each item, show its bars with item-specific neon color glow
  normalizedItems.forEach((item, itemIdx) => {
    const lineColor = item.lineFarbe || item.farbe || `hsl(${itemIdx * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || lineColor;
    const textColor = item.textFarbe || lineColor;
    
    // Item header
    const itemHeader = document.createElement('div');
    itemHeader.className = 'stackedbar-item-header';
    itemHeader.innerHTML = `
      <span class="stackedbar-item-indicator" style="background: ${lineColor}; box-shadow: 0 0 8px ${glowColor}"></span>
      <span class="stackedbar-item-name" style="color: ${textColor}">${item.name || item.id || `Item ${itemIdx + 1}`}</span>
    `;
    stackedbarEl.appendChild(itemHeader);
    
    // Get segment names for this item
    const segmentNames = item.segmentNames;
    
    // Create neon colors for segments based on item color
    const getSegmentColor = (idx) => {
      const hue = (parseInt(lineColor.match(/\d+/)?.[0] || 0) + idx * 40) % 360;
      return `hsla(${hue}, 80%, 60%, 0.8)`;
    };
    
    // Bars for this item
    const barsContainer = document.createElement('div');
    barsContainer.className = 'amorph-stackedbar-container-compare';
    
    item.bars.slice(0, 4).forEach(bar => {
      const row = document.createElement('div');
      row.className = 'amorph-stackedbar-row-compare';
      
      const barLabel = document.createElement('span');
      barLabel.className = 'amorph-stackedbar-label-compare';
      barLabel.textContent = bar.label;
      row.appendChild(barLabel);
      
      const track = document.createElement('div');
      track.className = 'amorph-stackedbar-track-compare';
      track.style.boxShadow = `0 0 8px ${glowColor}40`;
      
      const total = bar.segments.reduce((sum, s) => sum + s.value, 0) || 1;
      
      bar.segments.forEach((seg, segIdx) => {
        const segment = document.createElement('div');
        segment.className = 'amorph-stackedbar-segment-compare';
        const width = (seg.value / total) * 100;
        segment.style.width = `${width}%`;
        segment.style.background = getSegmentColor(segIdx);
        segment.style.boxShadow = `inset 0 0 8px rgba(255,255,255,0.2)`;
        segment.title = `${seg.name}: ${seg.value}`;
        track.appendChild(segment);
      });
      
      row.appendChild(track);
      
      // Total value
      const totalEl = document.createElement('span');
      totalEl.className = 'amorph-stackedbar-total';
      totalEl.style.color = textColor;
      totalEl.textContent = total.toFixed(0);
      row.appendChild(totalEl);
      
      barsContainer.appendChild(row);
    });
    
    stackedbarEl.appendChild(barsContainer);
    
    // Compact segment legend for this item
    if (segmentNames.length > 1) {
      const legend = document.createElement('div');
      legend.className = 'amorph-stackedbar-segment-legend';
      
      segmentNames.slice(0, 5).forEach((name, idx) => {
        const legendItem = document.createElement('span');
        legendItem.className = 'stackedbar-segment-item';
        legendItem.innerHTML = `
          <span class="stackedbar-segment-color" style="background: ${getSegmentColor(idx)}"></span>
          <span class="stackedbar-segment-name">${name}</span>
        `;
        legend.appendChild(legendItem);
      });
      stackedbarEl.appendChild(legend);
    }
  });
  
  el.appendChild(stackedbarEl);
  return el;
}

function normalisiereWert(wert) {
  const bars = [];
  const segmentNamesSet = new Set();
  
  if (Array.isArray(wert)) {
    for (const bar of wert) {
      if (typeof bar === 'object' && bar !== null) {
        const label = bar.label || bar.category || '';
        const segments = (bar.segments || bar.teile || []).map(s => {
          const name = s.name || s.label || '';
          segmentNamesSet.add(name);
          return { name, value: s.value || s.wert || 0 };
        });
        bars.push({ label, segments });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    for (const [label, values] of Object.entries(wert)) {
      if (typeof values === 'object' && !Array.isArray(values)) {
        const segments = Object.entries(values).map(([name, value]) => {
          segmentNamesSet.add(name);
          return { name, value: Number(value) || 0 };
        });
        bars.push({ label, segments });
      }
    }
  }
  
  return { bars, segmentNames: Array.from(segmentNamesSet) };
}

export default compareStackedbar;

/**
 * COMPARE STACKEDBAR - Stacked bar chart comparison
 * Uses the exact same HTML structure as the original stackedbar morph
 */

import { debug } from '../../../../observer/debug.js';

// Blue theme colors
const FARBEN = [
  'rgba(100, 180, 255, 0.7)',
  'rgba(80, 160, 240, 0.7)',
  'rgba(60, 140, 220, 0.7)',
  'rgba(120, 200, 255, 0.6)',
  'rgba(40, 120, 200, 0.7)'
];

export function compareStackedbar(items, config = {}) {
  debug.morphs('compareStackedbar', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-stackedbar';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original stackedbar structure
    const stackedbarEl = document.createElement('div');
    stackedbarEl.className = 'amorph-stackedbar';
    
    const { bars, segmentNames } = normalisiereWert(rawVal);
    
    if (bars.length === 0) {
      stackedbarEl.innerHTML = '<span class="amorph-stackedbar-leer">Keine Stacked-Bar Daten</span>';
    } else {
      const segmentFarben = {};
      segmentNames.forEach((name, i) => {
        segmentFarben[name] = FARBEN[i % FARBEN.length];
      });
      
      // Compact legend
      if (segmentNames.length > 1) {
        const legend = document.createElement('div');
        legend.className = 'amorph-stackedbar-legend';
        legend.style.display = 'flex';
        legend.style.gap = '6px';
        legend.style.fontSize = '8px';
        legend.style.marginBottom = '4px';
        
        segmentNames.forEach(name => {
          const legendItem = document.createElement('span');
          legendItem.className = 'amorph-stackedbar-legend-item';
          legendItem.innerHTML = `<span style="display:inline-block;width:6px;height:6px;background:${segmentFarben[name]};margin-right:2px;border-radius:1px;"></span>${name}`;
          legend.appendChild(legendItem);
        });
        stackedbarEl.appendChild(legend);
      }
      
      // Bars
      const barsContainer = document.createElement('div');
      barsContainer.className = 'amorph-stackedbar-container';
      
      bars.slice(0, 3).forEach(bar => {
        const row = document.createElement('div');
        row.className = 'amorph-stackedbar-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '4px';
        row.style.marginBottom = '3px';
        
        const barLabel = document.createElement('span');
        barLabel.className = 'amorph-stackedbar-label';
        barLabel.textContent = bar.label;
        barLabel.style.fontSize = '9px';
        barLabel.style.width = '30px';
        row.appendChild(barLabel);
        
        const track = document.createElement('div');
        track.className = 'amorph-stackedbar-track';
        track.style.flex = '1';
        track.style.height = '14px';
        track.style.display = 'flex';
        track.style.borderRadius = '3px';
        track.style.overflow = 'hidden';
        
        const total = bar.segments.reduce((sum, s) => sum + s.value, 0) || 1;
        
        bar.segments.forEach(seg => {
          const segment = document.createElement('div');
          segment.className = 'amorph-stackedbar-segment';
          const width = (seg.value / total) * 100;
          segment.style.width = `${width}%`;
          segment.style.height = '100%';
          segment.style.background = segmentFarben[seg.name];
          segment.title = `${seg.name}: ${seg.value}`;
          track.appendChild(segment);
        });
        
        row.appendChild(track);
        barsContainer.appendChild(row);
      });
      
      stackedbarEl.appendChild(barsContainer);
    }
    
    wrapper.appendChild(stackedbarEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
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

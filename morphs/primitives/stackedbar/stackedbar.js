/**
 * 📊 STACKEDBAR MORPH - Gestapelte Balken
 * 
 * Zeigt Teil-Ganzes-Beziehungen über Kategorien
 * Basiert auf Kirk's Prinzipien: Stacked Bar für Proportionen
 * Fig 6.23, 6.24, 6.25 - Browser Market Share, Literacy Levels
 * 
 * Input: [{label: "2020", segments: [{name: "A", value: 30}, ...]}]
 *    oder: {2020: {A: 30, B: 50, C: 20}, 2021: {...}}
 * Output: Horizontale gestapelte Balken
 */

import { debug } from '../../../observer/debug.js';
import { getFarben } from '../../../util/semantic.js';

// Segment-Farben
const FARBEN_FALLBACK = [
  'rgba(0, 200, 255, 0.7)',     // Cyan
  'rgba(255, 0, 200, 0.7)',     // Magenta
  'rgba(0, 255, 128, 0.7)',     // Grün
  'rgba(255, 200, 0, 0.7)',     // Gelb
  'rgba(200, 100, 255, 0.7)',   // Violett
  'rgba(255, 100, 100, 0.7)',   // Rot
  'rgba(100, 200, 200, 0.7)',   // Türkis
  'rgba(200, 200, 100, 0.7)'    // Olive
];

export function stackedbar(wert, config = {}) {
  debug.morphs('stackedbar', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-stackedbar';
  
  // Daten normalisieren
  const { bars, segmentNames } = normalisiereWert(wert);
  
  if (bars.length === 0) {
    el.innerHTML = '<span class="amorph-stackedbar-leer">Keine Stacked-Bar Daten</span>';
    return el;
  }
  
  // Farben zuweisen
  const farben = getFarben('diagramme') || FARBEN_FALLBACK;
  const segmentFarben = {};
  segmentNames.forEach((name, i) => {
    segmentFarben[name] = config.farben?.[name] || farben[i % farben.length];
  });
  
  // Modus: percent (100%) oder absolute
  const isPercent = config.percent !== false;
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-stackedbar-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Legende (oben)
  if (config.showLegend !== false) {
    const legend = document.createElement('div');
    legend.className = 'amorph-stackedbar-legend';
    
    for (const name of segmentNames) {
      const item = document.createElement('div');
      item.className = 'amorph-stackedbar-legend-item';
      item.innerHTML = `
        <span class="amorph-stackedbar-legend-color" style="background: ${segmentFarben[name]}"></span>
        <span class="amorph-stackedbar-legend-label">${name}</span>
      `;
      legend.appendChild(item);
    }
    el.appendChild(legend);
  }
  
  // Bars Container
  const container = document.createElement('div');
  container.className = 'amorph-stackedbar-container';
  
  for (const bar of bars) {
    const row = erstelleBar(bar, segmentFarben, isPercent, config);
    container.appendChild(row);
  }
  
  el.appendChild(container);
  
  return el;
}

function normalisiereWert(wert) {
  const bars = [];
  const segmentNamesSet = new Set();
  
  // Array Format: [{label, segments: [{name, value}]}] or [{kategorie, nadelwald: 45, ...}]
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        // Format mit segments Array
        if (item.segments && Array.isArray(item.segments)) {
          const bar = {
            label: item.label || item.name || item.year || item.kategorie || '',
            segments: item.segments.map(s => ({
              name: s.name || s.label || s.category || 'Unknown',
              value: s.value || s.count || s.amount || 0
            }))
          };
          bar.segments.forEach(s => segmentNamesSet.add(s.name));
          bar.total = bar.segments.reduce((sum, s) => sum + s.value, 0);
          bars.push(bar);
        }
        // Format ohne segments - direkte Werte im Item
        else {
          const labelKeys = ['label', 'name', 'year', 'kategorie', 'category'];
          const labelKey = labelKeys.find(k => item[k] !== undefined);
          const label = labelKey ? item[labelKey] : '';
          
          const segments = [];
          for (const [key, value] of Object.entries(item)) {
            if (!labelKeys.includes(key) && typeof value === 'number') {
              segments.push({ name: key, value });
              segmentNamesSet.add(key);
            }
          }
          
          if (segments.length > 0) {
            const bar = {
              label,
              segments,
              total: segments.reduce((sum, s) => sum + s.value, 0)
            };
            bars.push(bar);
          }
        }
      }
    }
  }
  
  // Object Format: {Label: {Segment: value}}
  else if (typeof wert === 'object' && wert !== null) {
    for (const [label, segments] of Object.entries(wert)) {
      if (typeof segments === 'object' && segments !== null && !Array.isArray(segments)) {
        const bar = {
          label,
          segments: Object.entries(segments).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : 0
          }))
        };
        bar.segments.forEach(s => segmentNamesSet.add(s.name));
        bar.total = bar.segments.reduce((sum, s) => sum + s.value, 0);
        bars.push(bar);
      }
    }
  }
  
  return { bars, segmentNames: Array.from(segmentNamesSet) };
}

function erstelleBar(bar, segmentFarben, isPercent, config) {
  const row = document.createElement('div');
  row.className = 'amorph-stackedbar-row';
  
  // Label
  const label = document.createElement('div');
  label.className = 'amorph-stackedbar-label';
  label.textContent = bar.label;
  row.appendChild(label);
  
  // Bar
  const barContainer = document.createElement('div');
  barContainer.className = 'amorph-stackedbar-bar';
  
  // Segmente
  for (const segment of bar.segments) {
    const percent = bar.total > 0 ? (segment.value / bar.total) * 100 : 0;
    
    const seg = document.createElement('div');
    seg.className = 'amorph-stackedbar-segment';
    seg.style.width = `${percent}%`;
    seg.style.background = segmentFarben[segment.name];
    seg.title = `${segment.name}: ${isPercent ? percent.toFixed(1) + '%' : segment.value}`;
    
    // Label im Segment (nur wenn groß genug)
    if (percent > 8) {
      const segLabel = document.createElement('span');
      segLabel.className = 'amorph-stackedbar-segment-label';
      segLabel.textContent = isPercent ? `${percent.toFixed(0)}%` : segment.value;
      seg.appendChild(segLabel);
    }
    
    barContainer.appendChild(seg);
  }
  
  row.appendChild(barContainer);
  
  // Total (optional)
  if (config.showTotal) {
    const total = document.createElement('div');
    total.className = 'amorph-stackedbar-total';
    total.textContent = formatValue(bar.total);
    row.appendChild(total);
  }
  
  return row;
}

function formatValue(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

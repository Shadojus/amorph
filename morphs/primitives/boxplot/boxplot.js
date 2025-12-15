/**
 * 📦 BOXPLOT MORPH - Box-and-Whisker Diagramm
 * 
 * Zeigt statistische Verteilungen mit Quartilen
 * Basiert auf Kirk's Prinzipien: Box Plot für Verteilungen
 * Fig 6.17, 6.18 - Temperature Ranges, Ranking the Ivies
 * 
 * Input: {min: 10, q1: 25, median: 50, q3: 75, max: 90}
 *    oder: [{label: "Harvard", min: 40, q1: 55, median: 70, q3: 85, max: 95}]
 * Output: Box-and-Whisker Plot mit IQR
 */

import { debug } from '../../../observer/debug.js';

export function boxplot(wert, config = {}) {
  debug.morphs('boxplot', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-boxplot';
  
  // Daten normalisieren
  const items = normalisiereWert(wert);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-boxplot-leer">Keine Boxplot-Daten</span>';
    return el;
  }
  
  // Globales Min/Max für Skalierung
  const globalMin = Math.min(...items.map(i => i.min));
  const globalMax = Math.max(...items.map(i => i.max));
  const range = globalMax - globalMin || 1;
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-boxplot-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Skala Header (How to read)
  if (config.showScale !== false) {
    const scale = document.createElement('div');
    scale.className = 'amorph-boxplot-scale';
    scale.innerHTML = `
      <div class="amorph-boxplot-scale-labels">
        <span>${formatValue(globalMin, config)}</span>
        <span class="amorph-boxplot-scale-label">← ${config.unit || 'Value'} →</span>
        <span>${formatValue(globalMax, config)}</span>
      </div>
      <div class="amorph-boxplot-scale-legend">
        <span class="amorph-boxplot-legend-whisker">◁ Min</span>
        <span class="amorph-boxplot-legend-q1">Q1 (25%)</span>
        <span class="amorph-boxplot-legend-median">Median</span>
        <span class="amorph-boxplot-legend-q3">Q3 (75%)</span>
        <span class="amorph-boxplot-legend-whisker">Max ▷</span>
      </div>
    `;
    el.appendChild(scale);
  }
  
  // Container für alle Boxplots
  const container = document.createElement('div');
  container.className = 'amorph-boxplot-container';
  
  // Einzelne Boxplots rendern
  for (const item of items) {
    const row = erstelleBoxplotRow(item, globalMin, range, config);
    container.appendChild(row);
  }
  
  el.appendChild(container);
  
  return el;
}

function normalisiereWert(wert) {
  // Einzelner Boxplot
  if (typeof wert === 'object' && !Array.isArray(wert) && hasBoxplotKeys(wert)) {
    return [{
      label: wert.label || wert.name || '',
      ...extractBoxplotValues(wert)
    }];
  }
  
  // Array von Boxplots
  if (Array.isArray(wert)) {
    return wert
      .filter(item => typeof item === 'object' && hasBoxplotKeys(item))
      .map(item => ({
        label: item.label || item.name || item.category || '',
        ...extractBoxplotValues(item)
      }));
  }
  
  return [];
}

function hasBoxplotKeys(obj) {
  // Minimum: min und max, oder q1/q3/median
  const hasMinMax = ('min' in obj || 'minimum' in obj) && ('max' in obj || 'maximum' in obj);
  const hasQuartiles = ('q1' in obj || 'quartile1' in obj) && ('q3' in obj || 'quartile3' in obj);
  return hasMinMax || hasQuartiles;
}

function extractBoxplotValues(obj) {
  const min = obj.min ?? obj.minimum ?? obj.whiskerLow ?? 0;
  const max = obj.max ?? obj.maximum ?? obj.whiskerHigh ?? 100;
  const q1 = obj.q1 ?? obj.quartile1 ?? obj.lower ?? min + (max - min) * 0.25;
  const q3 = obj.q3 ?? obj.quartile3 ?? obj.upper ?? min + (max - min) * 0.75;
  const median = obj.median ?? obj.med ?? obj.middle ?? (q1 + q3) / 2;
  const mean = obj.mean ?? obj.avg ?? obj.average ?? null;
  
  return { min, max, q1, q3, median, mean };
}

function erstelleBoxplotRow(item, globalMin, range, config) {
  const row = document.createElement('div');
  row.className = 'amorph-boxplot-row';
  
  // Label
  if (item.label) {
    const label = document.createElement('div');
    label.className = 'amorph-boxplot-label';
    label.textContent = item.label;
    row.appendChild(label);
  }
  
  // Box Plot Visualisierung
  const viz = document.createElement('div');
  viz.className = 'amorph-boxplot-viz';
  
  // Positionen berechnen (in %)
  const minPos = ((item.min - globalMin) / range) * 100;
  const maxPos = ((item.max - globalMin) / range) * 100;
  const q1Pos = ((item.q1 - globalMin) / range) * 100;
  const q3Pos = ((item.q3 - globalMin) / range) * 100;
  const medianPos = ((item.median - globalMin) / range) * 100;
  
  // CSS Custom Properties setzen
  viz.style.setProperty('--min-pos', `${minPos}%`);
  viz.style.setProperty('--max-pos', `${maxPos}%`);
  viz.style.setProperty('--q1-pos', `${q1Pos}%`);
  viz.style.setProperty('--q3-pos', `${q3Pos}%`);
  viz.style.setProperty('--median-pos', `${medianPos}%`);
  viz.style.setProperty('--box-width', `${q3Pos - q1Pos}%`);
  
  // Whisker (Min zu Q1)
  const whiskerLeft = document.createElement('div');
  whiskerLeft.className = 'amorph-boxplot-whisker amorph-boxplot-whisker-left';
  viz.appendChild(whiskerLeft);
  
  // Box (Q1 zu Q3)
  const box = document.createElement('div');
  box.className = 'amorph-boxplot-box';
  viz.appendChild(box);
  
  // Median Linie
  const medianLine = document.createElement('div');
  medianLine.className = 'amorph-boxplot-median';
  viz.appendChild(medianLine);
  
  // Whisker (Q3 zu Max)
  const whiskerRight = document.createElement('div');
  whiskerRight.className = 'amorph-boxplot-whisker amorph-boxplot-whisker-right';
  viz.appendChild(whiskerRight);
  
  // Min/Max Endpunkte
  const minPoint = document.createElement('div');
  minPoint.className = 'amorph-boxplot-endpoint amorph-boxplot-min';
  minPoint.title = `Min: ${formatValue(item.min, config)}`;
  viz.appendChild(minPoint);
  
  const maxPoint = document.createElement('div');
  maxPoint.className = 'amorph-boxplot-endpoint amorph-boxplot-max';
  maxPoint.title = `Max: ${formatValue(item.max, config)}`;
  viz.appendChild(maxPoint);
  
  // Mean Punkt (falls vorhanden)
  if (item.mean !== null) {
    const meanPos = ((item.mean - globalMin) / range) * 100;
    const meanPoint = document.createElement('div');
    meanPoint.className = 'amorph-boxplot-mean';
    meanPoint.style.left = `${meanPos}%`;
    meanPoint.title = `Mean: ${formatValue(item.mean, config)}`;
    viz.appendChild(meanPoint);
  }
  
  row.appendChild(viz);
  
  // Werte-Annotation
  if (config.showValues !== false) {
    const values = document.createElement('div');
    values.className = 'amorph-boxplot-values';
    values.innerHTML = `
      <span class="amorph-boxplot-val-median">${formatValue(item.median, config)}</span>
    `;
    row.appendChild(values);
  }
  
  return row;
}

function formatValue(value, config) {
  if (config?.format === 'percent') {
    return `${value.toFixed(0)}%`;
  }
  if (config?.format === 'currency') {
    return `$${value.toFixed(0)}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(config?.decimals ?? 0);
}

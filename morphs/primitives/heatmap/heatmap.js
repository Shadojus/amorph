/**
 * 🔥 HEATMAP MORPH - Matrix-Wärme-Visualisierung
 * 
 * Zeigt 2D-Daten als Farbmatrix
 * Basiert auf Kirk's Prinzipien: Heatmap für Matrix-Werte
 * 
 * Input: [[1,2,3], [4,5,6], [7,8,9]]
 *    oder: {rows: ["A","B"], cols: ["X","Y"], values: [[1,2], [3,4]]}
 *    oder: [{x: "Mon", y: "9h", value: 5}, ...]
 * Output: Farbcodierte Matrix mit Legende
 */

import { debug } from '../../../observer/debug.js';
import { getSchema } from '../../../util/semantic.js';

export function heatmap(wert, config = {}) {
  debug.morphs('heatmap', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-heatmap';
  
  // Daten normalisieren
  const { matrix, rows, cols, min, max } = normalisiereDaten(wert);
  
  if (matrix.length === 0) {
    el.innerHTML = '<span class="amorph-heatmap-leer">Keine Matrix-Daten</span>';
    return el;
  }
  
  // Visuell-Config aus Schema laden
  const schema = getSchema();
  const visuell = schema?.visuell || {};
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-heatmap-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Heatmap-Grid
  const grid = document.createElement('div');
  grid.className = 'amorph-heatmap-grid';
  grid.style.setProperty('--cols', cols.length);
  grid.style.setProperty('--rows', rows.length);
  
  // Spalten-Header (falls vorhanden)
  if (cols.some(c => c !== null)) {
    const headerRow = document.createElement('div');
    headerRow.className = 'amorph-heatmap-header-row';
    
    // Leere Ecke oben links
    const corner = document.createElement('div');
    corner.className = 'amorph-heatmap-corner';
    headerRow.appendChild(corner);
    
    for (const col of cols) {
      const colHeader = document.createElement('div');
      colHeader.className = 'amorph-heatmap-col-header';
      colHeader.textContent = col || '';
      headerRow.appendChild(colHeader);
    }
    grid.appendChild(headerRow);
  }
  
  // Matrix-Zeilen
  for (let i = 0; i < rows.length; i++) {
    const row = document.createElement('div');
    row.className = 'amorph-heatmap-row';
    
    // Zeilen-Label
    if (rows[i] !== null) {
      const rowHeader = document.createElement('div');
      rowHeader.className = 'amorph-heatmap-row-header';
      rowHeader.textContent = rows[i];
      row.appendChild(rowHeader);
    }
    
    // Zellen
    for (let j = 0; j < cols.length; j++) {
      const value = matrix[i][j];
      const cell = erstelleZelle(value, min, max, visuell, config);
      row.appendChild(cell);
    }
    
    grid.appendChild(row);
  }
  
  el.appendChild(grid);
  
  // Legende
  const legende = erstelleLegende(min, max, visuell, config);
  el.appendChild(legende);
  
  return el;
}

function normalisiereDaten(wert) {
  let matrix = [];
  let rows = [];
  let cols = [];
  
  // 2D-Array direkt
  if (Array.isArray(wert) && wert.every(Array.isArray)) {
    matrix = wert;
    rows = wert.map((_, i) => null);
    cols = wert[0]?.map((_, i) => null) || [];
  }
  // Strukturiertes Objekt
  else if (typeof wert === 'object' && wert !== null) {
    if (wert.values && Array.isArray(wert.values)) {
      matrix = wert.values;
      rows = wert.rows || wert.zeilen || matrix.map((_, i) => `R${i + 1}`);
      cols = wert.cols || wert.spalten || wert.columns || matrix[0]?.map((_, i) => `C${i + 1}`) || [];
    }
    // Array von {x, y, value}
    else if (wert.data && Array.isArray(wert.data)) {
      return normalisiereKoordinatenDaten(wert.data);
    }
  }
  // Array von {x, y, value} Objekten
  else if (Array.isArray(wert) && wert.length > 0 && typeof wert[0] === 'object') {
    return normalisiereKoordinatenDaten(wert);
  }
  
  // Min/Max berechnen
  const allValues = matrix.flat().filter(v => typeof v === 'number');
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 1);
  
  return { matrix, rows, cols, min, max };
}

function normalisiereKoordinatenDaten(data) {
  const xValues = [...new Set(data.map(d => d.x || d.col || d.spalte))];
  const yValues = [...new Set(data.map(d => d.y || d.row || d.zeile))];
  
  const matrix = yValues.map(y => 
    xValues.map(x => {
      const item = data.find(d => 
        (d.x === x || d.col === x || d.spalte === x) && 
        (d.y === y || d.row === y || d.zeile === y)
      );
      return item?.value ?? item?.wert ?? null;
    })
  );
  
  const allValues = matrix.flat().filter(v => typeof v === 'number');
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 1);
  
  return { matrix, rows: yValues, cols: xValues, min, max };
}

function erstelleZelle(value, min, max, visuell, config) {
  const cell = document.createElement('div');
  cell.className = 'amorph-heatmap-cell';
  
  if (value === null || value === undefined) {
    cell.classList.add('amorph-heatmap-cell-empty');
    return cell;
  }
  
  // Wert normalisieren (0-1)
  const range = max - min || 1;
  const normalized = (value - min) / range;
  
  // Farbe berechnen - von cool (blau) zu hot (rot)
  const color = getHeatmapColor(normalized, visuell);
  cell.style.setProperty('--cell-color', color);
  cell.style.backgroundColor = color;
  
  // Textfarbe basierend auf Helligkeit
  const textColor = normalized > 0.6 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';
  cell.style.color = textColor;
  
  // Wert anzeigen
  cell.textContent = formatValue(value);
  cell.title = `Wert: ${value}`;
  
  // Kritische Werte hervorheben
  if (normalized > 0.8) {
    cell.classList.add('amorph-heatmap-cell-critical');
  } else if (normalized < 0.2) {
    cell.classList.add('amorph-heatmap-cell-low');
  }
  
  return cell;
}

function getHeatmapColor(normalized, visuell) {
  // Semantische Farben aus Schema oder Standard
  const colors = [
    { pos: 0, color: 'rgb(33, 150, 243)' },     // Info/Blau (niedrig)
    { pos: 0.25, color: 'rgb(76, 175, 80)' },   // Positiv/Grün
    { pos: 0.5, color: 'rgb(255, 235, 59)' },   // Neutral/Gelb
    { pos: 0.75, color: 'rgb(255, 152, 0)' },   // Warnung/Orange
    { pos: 1, color: 'rgb(255, 82, 82)' }       // Kritisch/Rot
  ];
  
  // Interpolieren
  for (let i = 0; i < colors.length - 1; i++) {
    if (normalized >= colors[i].pos && normalized <= colors[i + 1].pos) {
      const t = (normalized - colors[i].pos) / (colors[i + 1].pos - colors[i].pos);
      return interpolateColor(colors[i].color, colors[i + 1].color, t);
    }
  }
  
  return colors[colors.length - 1].color;
}

function interpolateColor(color1, color2, t) {
  const rgb1 = parseRGB(color1);
  const rgb2 = parseRGB(color2);
  
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function parseRGB(color) {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return { r: 128, g: 128, b: 128 };
}

function erstelleLegende(min, max, visuell, config) {
  const legende = document.createElement('div');
  legende.className = 'amorph-heatmap-legende';
  
  // Gradient-Bar
  const bar = document.createElement('div');
  bar.className = 'amorph-heatmap-legende-bar';
  legende.appendChild(bar);
  
  // Min/Max Labels
  const labels = document.createElement('div');
  labels.className = 'amorph-heatmap-legende-labels';
  labels.innerHTML = `
    <span class="amorph-heatmap-legende-min">${formatValue(min)}</span>
    <span class="amorph-heatmap-legende-max">${formatValue(max)}</span>
  `;
  legende.appendChild(labels);
  
  return legende;
}

function formatValue(value) {
  if (value === null || value === undefined) return '–';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1 && value !== 0) return value.toFixed(2);
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(1);
}

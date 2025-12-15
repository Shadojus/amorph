/**
 * 🗺️ TREEMAP MORPH - Flächenproportionale Rechtecke
 * 
 * Zeigt hierarchische Daten als verschachtelte Rechtecke
 * Basiert auf Kirk's Prinzipien: Treemap für Teil-Ganzes
 * Fig 6.26 - FinViz: Standard and Poor's 500 Index
 * 
 * Input: [{label: "AAPL", value: 100, group: "Tech"}]
 *    oder: {Tech: {AAPL: 100, MSFT: 80}, Finance: {JPM: 60}}
 * Output: Flächenproportionale Rechteck-Kacheln
 */

import { debug } from '../../../observer/debug.js';
import { getFarben } from '../../../util/semantic.js';

// Blue theme with semantic positive/negative
const GRUPPE_FARBEN = {
  positive: 'rgba(100, 200, 150, 0.7)',   // Keep green for positive
  negative: 'rgba(200, 100, 100, 0.7)',   // Keep red for negative
  neutral: 'rgba(100, 160, 220, 0.6)',    // Blue neutral
  // Categories - all blue variants
  technology: 'rgba(80, 160, 240, 0.6)',
  finance: 'rgba(60, 140, 220, 0.6)',
  healthcare: 'rgba(100, 180, 255, 0.6)',
  energy: 'rgba(40, 120, 200, 0.6)',
  consumer: 'rgba(120, 200, 255, 0.55)',
  industrial: 'rgba(70, 150, 230, 0.6)'
};

export function treemap(wert, config = {}) {
  debug.morphs('treemap', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-treemap';
  
  // Daten normalisieren
  const items = normalisiereWert(wert);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-treemap-leer">Keine Treemap-Daten</span>';
    return el;
  }
  
  // Total berechnen
  const total = items.reduce((sum, item) => sum + Math.abs(item.value), 0);
  
  // Titel
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-treemap-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Container
  const container = document.createElement('div');
  container.className = 'amorph-treemap-container';
  const width = config.width || 400;
  const height = config.height || 300;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  
  // Treemap Layout berechnen
  const rects = squarify(items, 0, 0, width, height, total);
  
  // Rechtecke rendern
  for (const rect of rects) {
    const tile = erstelleTile(rect, config);
    container.appendChild(tile);
  }
  
  el.appendChild(container);
  
  // Legende (nach Gruppen)
  const groups = [...new Set(items.map(i => i.group).filter(Boolean))];
  if (groups.length > 1 && config.showLegend !== false) {
    const legend = document.createElement('div');
    legend.className = 'amorph-treemap-legend';
    
    for (const group of groups) {
      const item = document.createElement('div');
      item.className = 'amorph-treemap-legend-item';
      const color = getGroupColor(group);
      item.innerHTML = `
        <span class="amorph-treemap-legend-color" style="background: ${color}"></span>
        <span class="amorph-treemap-legend-label">${group}</span>
      `;
      legend.appendChild(item);
    }
    el.appendChild(legend);
  }
  
  return el;
}

function normalisiereWert(wert) {
  // Array von Objekten (mit oder ohne children)
  if (Array.isArray(wert)) {
    return flattenHierarchy(wert).sort((a, b) => b.value - a.value);
  }
  
  // Hierarchisches Objekt: {Group: {Item: value}}
  if (typeof wert === 'object' && wert !== null) {
    const items = [];
    for (const [group, children] of Object.entries(wert)) {
      if (typeof children === 'object' && children !== null && !Array.isArray(children)) {
        for (const [label, value] of Object.entries(children)) {
          if (typeof value === 'number') {
            items.push({ label, value: Math.abs(value), group });
          } else if (typeof value === 'object') {
            items.push({
              label,
              value: Math.abs(value.value || value.size || 0),
              change: value.change || null,
              group
            });
          }
        }
      } else if (typeof children === 'number') {
        items.push({ label: group, value: Math.abs(children), group: null });
      }
    }
    return items.sort((a, b) => b.value - a.value);
  }
  
  return [];
}

/**
 * Flatten hierarchical data with children into flat list
 * Each item gets its parent as group for coloring
 */
function flattenHierarchy(items, parentGroup = null) {
  const result = [];
  
  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue;
    
    const label = item.label || item.name || item.ticker || item.symbol || '';
    const value = Math.abs(item.value || item.size || item.marketCap || 0);
    const change = item.change || item.percent || item.delta || null;
    const group = parentGroup || item.group || item.sector || item.category || null;
    
    // If has children, flatten them recursively
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      // Add children with current item as their group
      const childItems = flattenHierarchy(item.children, label);
      result.push(...childItems);
    } else {
      // Leaf node - add to result
      result.push({ label, value, change, group });
    }
  }
  
  return result;
}

/**
 * Squarified Treemap Algorithmus
 * Optimiert für möglichst quadratische Rechtecke
 */
function squarify(items, x, y, width, height, total) {
  const rects = [];
  
  if (items.length === 0 || width <= 0 || height <= 0) {
    return rects;
  }
  
  // Einfache Row-Layout für bessere Lesbarkeit
  let currentY = y;
  let currentX = x;
  const isWide = width > height;
  
  for (const item of items) {
    const ratio = item.value / total;
    
    let rectWidth, rectHeight;
    
    if (isWide) {
      // Horizontales Layout
      rectWidth = width * ratio;
      rectHeight = height;
    } else {
      // Vertikales Layout
      rectWidth = width;
      rectHeight = height * ratio;
    }
    
    // Mindestgröße
    rectWidth = Math.max(20, rectWidth);
    rectHeight = Math.max(20, rectHeight);
    
    rects.push({
      ...item,
      x: currentX,
      y: currentY,
      width: rectWidth,
      height: rectHeight
    });
    
    if (isWide) {
      currentX += rectWidth;
    } else {
      currentY += rectHeight;
    }
  }
  
  return rects;
}

function erstelleTile(rect, config) {
  const tile = document.createElement('div');
  tile.className = 'amorph-treemap-tile';
  
  // Position und Größe
  tile.style.left = `${rect.x}px`;
  tile.style.top = `${rect.y}px`;
  tile.style.width = `${rect.width}px`;
  tile.style.height = `${rect.height}px`;
  
  // Farbe basierend auf Change oder Gruppe
  let color;
  if (rect.change !== null) {
    if (rect.change > 0) {
      const intensity = Math.min(1, Math.abs(rect.change) / 5);
      color = `rgba(0, ${150 + intensity * 105}, ${50 + intensity * 50}, ${0.5 + intensity * 0.3})`;
      tile.classList.add('is-positive');
    } else if (rect.change < 0) {
      const intensity = Math.min(1, Math.abs(rect.change) / 5);
      color = `rgba(${150 + intensity * 105}, ${30 + intensity * 20}, ${30 + intensity * 20}, ${0.5 + intensity * 0.3})`;
      tile.classList.add('is-negative');
    } else {
      color = 'rgba(100, 100, 100, 0.5)';
    }
  } else {
    color = getGroupColor(rect.group);
  }
  tile.style.background = color;
  
  // Content
  const isSmall = rect.width < 60 || rect.height < 40;
  
  const label = document.createElement('div');
  label.className = 'amorph-treemap-label';
  label.textContent = rect.label;
  if (isSmall) label.classList.add('is-small');
  tile.appendChild(label);
  
  if (!isSmall && rect.change !== null) {
    const change = document.createElement('div');
    change.className = 'amorph-treemap-change';
    change.textContent = `${rect.change > 0 ? '+' : ''}${rect.change.toFixed(2)}%`;
    tile.appendChild(change);
  }
  
  // Tooltip
  tile.title = `${rect.label}: ${formatValue(rect.value)}${rect.change !== null ? ` (${rect.change > 0 ? '+' : ''}${rect.change.toFixed(2)}%)` : ''}`;
  
  return tile;
}

function getGroupColor(group) {
  if (!group) return 'rgba(0, 200, 255, 0.5)';
  const key = group.toLowerCase();
  return GRUPPE_FARBEN[key] || `rgba(${hashToColor(group)}, 0.6)`;
}

function hashToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF);
  const g = ((hash >> 8) & 0xFF);
  const b = ((hash >> 16) & 0xFF);
  return `${r}, ${g}, ${b}`;
}

function formatValue(value) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

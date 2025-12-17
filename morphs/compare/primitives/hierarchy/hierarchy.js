/**
 * COMPARE HIERARCHY - UNIFIED Hierarchy/tree comparison
 * All items' hierarchies shown in ONE aligned visualization
 */

import { debug } from '../../../../observer/debug.js';

// Known hierarchy orderings
const KNOWN_HIERARCHIES = {
  taxonomie: ['kingdom', 'regnum', 'phylum', 'division', 'divisio', 'class', 'classis', 'order', 'ordo', 'family', 'familia', 'genus', 'species'],
  location: ['kontinent', 'land', 'region', 'stadt', 'bezirk'],
  organization: ['organisation', 'abteilung', 'team', 'person'],
  file: ['root', 'folder', 'subfolder', 'file']
};

export function compareHierarchy(items, config = {}) {
  debug.morphs('compareHierarchy', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-hierarchy';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Parse all items and extract their hierarchy levels
  const parsedItems = items.map((item, idx) => {
    const rawVal = item.value ?? item.wert;
    const baseColor = item.lineFarbe || item.farbe || `hsl(${idx * 90}, 70%, 55%)`;
    
    let levels = [];
    if (rawVal && typeof rawVal === 'object') {
      const hierarchyType = detectHierarchyType(rawVal);
      levels = extractLevels(rawVal, hierarchyType);
    }
    
    return {
      ...item,
      levels,
      index: idx,
      color: baseColor,
      glowColor: item.glowFarbe || baseColor,
      textColor: item.textFarbe || baseColor
    };
  });
  
  // Find all unique level keys across all items
  const allLevelKeys = new Set();
  parsedItems.forEach(item => {
    item.levels.forEach(level => allLevelKeys.add(level.key));
  });
  
  // Sort level keys by hierarchy order
  const sortedKeys = sortHierarchyKeys(Array.from(allLevelKeys));
  
  // UNIFIED hierarchy container - shows all items side by side
  const hierarchyEl = document.createElement('div');
  hierarchyEl.className = 'amorph-hierarchy amorph-hierarchy-compare';
  
  // Header row with item names
  const headerRow = document.createElement('div');
  headerRow.className = 'hierarchy-compare-header';
  
  // Empty cell for level column
  const levelHeader = document.createElement('div');
  levelHeader.className = 'hierarchy-level-header';
  levelHeader.textContent = 'Ebene';
  headerRow.appendChild(levelHeader);
  
  // Item name headers
  parsedItems.forEach(item => {
    const nameHeader = document.createElement('div');
    nameHeader.className = 'hierarchy-item-header';
    nameHeader.textContent = item.name || item.id;
    nameHeader.style.color = item.color;
    nameHeader.style.textShadow = `0 0 6px ${item.glowColor}`;
    headerRow.appendChild(nameHeader);
  });
  hierarchyEl.appendChild(headerRow);
  
  // Rows for each hierarchy level
  sortedKeys.forEach((levelKey, levelIdx) => {
    const row = document.createElement('div');
    row.className = 'hierarchy-compare-row';
    
    // Level name
    const levelCell = document.createElement('div');
    levelCell.className = 'hierarchy-level-cell';
    levelCell.innerHTML = `
      <span class="hierarchy-icon">${getHierarchyIcon(levelIdx, sortedKeys.length)}</span>
      <span class="hierarchy-level-name">${levelKey}</span>
    `;
    row.appendChild(levelCell);
    
    // Value for each item
    parsedItems.forEach(item => {
      const valueCell = document.createElement('div');
      valueCell.className = 'hierarchy-value-cell';
      
      const level = item.levels.find(l => l.key === levelKey);
      if (level) {
        valueCell.textContent = level.value;
        valueCell.style.color = item.color;
        valueCell.style.textShadow = `0 0 4px ${item.glowColor}`;
      } else {
        valueCell.textContent = '–';
        valueCell.classList.add('hierarchy-empty');
      }
      
      row.appendChild(valueCell);
    });
    
    hierarchyEl.appendChild(row);
  });
  
  // Handle empty case
  if (sortedKeys.length === 0) {
    hierarchyEl.innerHTML = '<div class="compare-empty">Keine Hierarchie-Daten</div>';
  }
  
  el.appendChild(hierarchyEl);
  return el;
}

function sortHierarchyKeys(keys) {
  // Try to match against known hierarchies
  for (const [type, order] of Object.entries(KNOWN_HIERARCHIES)) {
    const matches = order.filter(o => keys.some(k => k.toLowerCase().includes(o)));
    if (matches.length >= 2) {
      // Sort by this hierarchy
      return keys.sort((a, b) => {
        const aIdx = order.findIndex(o => a.toLowerCase().includes(o));
        const bIdx = order.findIndex(o => b.toLowerCase().includes(o));
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
    }
  }
  return keys;
}

function detectHierarchyType(wert) {
  if (!wert || typeof wert !== 'object') return 'generic';
  const keys = Object.keys(wert).map(k => String(k).toLowerCase());
  
  for (const [type, hierarchy] of Object.entries(KNOWN_HIERARCHIES)) {
    const matches = hierarchy.filter(h => keys.some(k => k.includes(h)));
    if (matches.length >= 2) return type;
  }
  
  return 'generic';
}

function extractLevels(wert, hierarchyType) {
  const levels = [];
  if (!wert || typeof wert !== 'object') return levels;

  if (hierarchyType !== 'generic' && KNOWN_HIERARCHIES[hierarchyType]) {
    const order = KNOWN_HIERARCHIES[hierarchyType];
    for (const key of order) {
      const value = findValue(wert, key);
      if (value) {
        levels.push({ key: formatKey(key), value, depth: levels.length });
      }
    }
  }
  
  // Always also check for direct keys
  if (levels.length === 0) {
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'string' || typeof value === 'number') {
        levels.push({ key: formatKey(key), value: String(value), depth: levels.length });
      }
    }
  }
  
  return levels;
}

function findValue(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  const lowerKey = String(key || '').toLowerCase();
  for (const [k, v] of Object.entries(obj)) {
    if (String(k).toLowerCase().includes(lowerKey)) {
      return typeof v === 'object' ? null : String(v);
    }
  }
  return null;
}

function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
}

function getHierarchyIcon(index, total) {
  const icons = ['🌍', '📦', '📂', '📁', '📋', '🏷️', '🔬', '🧬'];
  return icons[Math.min(index, icons.length - 1)];
}

export default compareHierarchy;

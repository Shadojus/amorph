/**
 * COMPARE HIERARCHY - Hierarchy/tree comparison
 * Uses the exact same HTML structure as the original hierarchy morph
 */

import { debug } from '../../../../observer/debug.js';

// Known hierarchy orderings
const KNOWN_HIERARCHIES = {
  taxonomie: ['regnum', 'phylum', 'divisio', 'classis', 'ordo', 'familia', 'genus', 'species'],
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
  
  // Container for all hierarchies
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original hierarchy structure
    const hierarchyEl = document.createElement('div');
    hierarchyEl.className = 'amorph-hierarchy';
    
    if (!rawVal || typeof rawVal !== 'object') {
      hierarchyEl.innerHTML = '<span class="amorph-hierarchy-leer">Keine Hierarchie</span>';
    } else {
      const hierarchyType = detectHierarchyType(rawVal);
      const levels = extractLevels(rawVal, hierarchyType);
      
      if (levels.length === 0) {
        hierarchyEl.innerHTML = '<span class="amorph-hierarchy-leer">Keine Hierarchie-Ebenen</span>';
      } else {
        // Use breadcrumb for short, tree for long
        const mode = config.mode || (levels.length <= 6 ? 'breadcrumb' : 'tree');
        
        if (mode === 'tree') {
          hierarchyEl.appendChild(renderTree(levels, config));
        } else {
          hierarchyEl.appendChild(renderBreadcrumb(levels, config));
        }
      }
    }
    
    wrapper.appendChild(hierarchyEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
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
  } else {
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

function renderBreadcrumb(levels, config) {
  const container = document.createElement('div');
  container.className = 'amorph-hierarchy-breadcrumb';
  
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    
    const item = document.createElement('span');
    item.className = 'amorph-hierarchy-item';
    
    const icon = document.createElement('span');
    icon.className = 'amorph-hierarchy-icon';
    icon.textContent = getHierarchyIcon(i, levels.length);
    item.appendChild(icon);
    
    const value = document.createElement('span');
    value.className = 'amorph-hierarchy-value';
    value.textContent = level.value;
    item.appendChild(value);
    
    if (config.showLabels !== false) {
      const label = document.createElement('span');
      label.className = 'amorph-hierarchy-label';
      label.textContent = level.key;
      item.appendChild(label);
    }
    
    container.appendChild(item);
    
    if (i < levels.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'amorph-hierarchy-separator';
      sep.textContent = '›';
      container.appendChild(sep);
    }
  }
  
  return container;
}

function renderTree(levels, config) {
  const container = document.createElement('div');
  container.className = 'amorph-hierarchy-tree';
  
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    
    const item = document.createElement('div');
    item.className = 'amorph-hierarchy-tree-item';
    item.style.setProperty('--depth', level.depth);
    
    const connector = document.createElement('span');
    connector.className = 'amorph-hierarchy-connector';
    connector.innerHTML = i === levels.length - 1 ? '└─' : '├─';
    item.appendChild(connector);
    
    const icon = document.createElement('span');
    icon.className = 'amorph-hierarchy-icon';
    icon.textContent = getHierarchyIcon(i, levels.length);
    item.appendChild(icon);
    
    const content = document.createElement('span');
    content.className = 'amorph-hierarchy-content';
    
    const label = document.createElement('span');
    label.className = 'amorph-hierarchy-tree-label';
    label.textContent = level.key + ':';
    content.appendChild(label);
    
    const value = document.createElement('span');
    value.className = 'amorph-hierarchy-tree-value';
    value.textContent = level.value;
    content.appendChild(value);
    
    item.appendChild(content);
    container.appendChild(item);
  }
  
  return container;
}

function getHierarchyIcon(index, total) {
  const icons = ['🌍', '📦', '📂', '📁', '📋', '🏷️', '🔬', '🧬'];
  return icons[Math.min(index, icons.length - 1)];
}

export default compareHierarchy;

/**
 * 🌳 HIERARCHY MORPH - Hierarchische Baumdarstellung
 * 
 * Zeigt verschachtelte Daten als Baum oder Breadcrumb
 * DATENGETRIEBEN - Erkennt taxonomische/hierarchische Strukturen
 * 
 * Input: {regnum: "Animalia", phylum: "...", classis: "...", ...}
 *    oder {ebene1: {ebene2: {ebene3: "Wert"}}}
 * Output: Breadcrumb-Pfad oder Baumansicht
 */

import { debug } from '../../../observer/debug.js';

// Bekannte Hierarchie-Ordnungen
const KNOWN_HIERARCHIES = {
  taxonomie: ['regnum', 'phylum', 'divisio', 'classis', 'ordo', 'familia', 'genus', 'species'],
  location: ['kontinent', 'land', 'region', 'stadt', 'bezirk'],
  organization: ['organisation', 'abteilung', 'team', 'person'],
  file: ['root', 'folder', 'subfolder', 'file']
};

export function hierarchy(wert, config = {}) {
  debug.morphs('hierarchy', { typ: typeof wert, keys: Object.keys(wert || {}) });
  
  const el = document.createElement('div');
  el.className = 'amorph-hierarchy';
  
  if (!wert || typeof wert !== 'object') {
    el.innerHTML = '<span class="amorph-hierarchy-leer">Keine Hierarchie</span>';
    return el;
  }
  
  // Hierarchie-Typ erkennen
  const hierarchyType = detectHierarchyType(wert);
  const levels = extractLevels(wert, hierarchyType);
  
  if (levels.length === 0) {
    el.innerHTML = '<span class="amorph-hierarchy-leer">Keine Hierarchie-Ebenen</span>';
    return el;
  }
  
  // Render-Modus
  const mode = config.mode || (levels.length <= 6 ? 'breadcrumb' : 'tree');
  
  if (mode === 'tree') {
    el.appendChild(renderTree(levels, config));
  } else {
    el.appendChild(renderBreadcrumb(levels, config));
  }
  
  return el;
}

function detectHierarchyType(wert) {
  const keys = Object.keys(wert).map(k => String(k).toLowerCase());
  
  for (const [type, hierarchy] of Object.entries(KNOWN_HIERARCHIES)) {
    const matches = hierarchy.filter(h => keys.some(k => k.includes(h)));
    if (matches.length >= 2) {
      return type;
    }
  }
  
  return 'generic';
}

function extractLevels(wert, hierarchyType) {
  const levels = [];
  
  if (hierarchyType !== 'generic' && KNOWN_HIERARCHIES[hierarchyType]) {
    // Bekannte Hierarchie - in definierter Reihenfolge
    const order = KNOWN_HIERARCHIES[hierarchyType];
    for (const key of order) {
      const value = findValue(wert, key);
      if (value) {
        levels.push({ key: formatKey(key), value, depth: levels.length });
      }
    }
  } else {
    // Generisch - alle Key-Value-Paare
    for (const [key, value] of Object.entries(wert)) {
      if (typeof value === 'string' || typeof value === 'number') {
        levels.push({ key: formatKey(key), value: String(value), depth: levels.length });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Verschachtelt - rekursiv
        const nested = extractLevels(value, 'generic');
        for (const n of nested) {
          n.depth += levels.length + 1;
          levels.push(n);
        }
      }
    }
  }
  
  return levels;
}

function findValue(obj, key) {
  const lowerKey = String(key || '').toLowerCase();
  for (const [k, v] of Object.entries(obj)) {
    if (String(k).toLowerCase().includes(lowerKey)) {
      return typeof v === 'object' ? null : String(v);
    }
  }
  return null;
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

function renderBreadcrumb(levels, config) {
  const container = document.createElement('div');
  container.className = 'amorph-hierarchy-breadcrumb';
  
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    
    const item = document.createElement('span');
    item.className = 'amorph-hierarchy-item';
    
    // Icon basierend auf Position
    const icon = document.createElement('span');
    icon.className = 'amorph-hierarchy-icon';
    icon.textContent = getHierarchyIcon(i, levels.length);
    item.appendChild(icon);
    
    // Value
    const value = document.createElement('span');
    value.className = 'amorph-hierarchy-value';
    value.textContent = level.value;
    item.appendChild(value);
    
    // Label (klein)
    if (config.showLabels !== false) {
      const label = document.createElement('span');
      label.className = 'amorph-hierarchy-label';
      label.textContent = level.key;
      item.appendChild(label);
    }
    
    container.appendChild(item);
    
    // Separator
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
    
    // Verbindungslinie
    const connector = document.createElement('span');
    connector.className = 'amorph-hierarchy-connector';
    connector.innerHTML = i === levels.length - 1 ? '└─' : '├─';
    item.appendChild(connector);
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'amorph-hierarchy-icon';
    icon.textContent = getHierarchyIcon(i, levels.length);
    item.appendChild(icon);
    
    // Content
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
  // Taxonomie-Icons
  const icons = ['🌍', '📦', '📂', '📁', '📋', '🏷️', '🔬', '🧬'];
  return icons[Math.min(index, icons.length - 1)];
}

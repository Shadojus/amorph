/**
 * SMART COMPARE - Intelligenter Vergleichs-Composite
 * 
 * Analysiert Daten und baut automatisch den optimalen Vergleich.
 * 
 * DATENGETRIEBEN:
 * - Erkennt Typen aus Datenstruktur
 * - Gruppiert semantisch zusammengehörige Felder
 * - Wählt beste Visualisierung pro Gruppe
 */

import { debug } from '../../../observer/debug.js';
import { createLegende } from '../base.js';
import { analyzeItems, findRelatedFields } from './analyze.js';
import {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite
} from './render.js';

/**
 * SMART COMPARE - Analysiert Daten und baut optimalen Vergleich
 * 
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} config - {excludeFields, includeOnly, layout, labels, units}
 * 
 * DATENGETRIEBEN:
 * - Keine Annahmen über Feldnamen
 * - Typ-Erkennung aus Datenstruktur
 * - Automatische Gruppierung nach Typ-Kategorie
 */
export function smartCompare(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-smart-compare';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-leer">Keine Daten zum Vergleichen</div>';
    return el;
  }
  
  // Analyse - DATENGETRIEBEN
  const { fields, categories } = analyzeItems(items);
  const groups = findRelatedFields(fields);
  
  debug.compare('Smart Compare', { 
    items: items.length, 
    fields: Object.keys(fields).length,
    groups: groups.length 
  });
  
  // Filter anwenden (optional)
  const filteredGroups = groups.filter(g => {
    if (config.excludeFields) {
      g.fields = g.fields.filter(f => !config.excludeFields.includes(f));
    }
    if (config.includeOnly) {
      g.fields = g.fields.filter(f => config.includeOnly.includes(f));
    }
    return g.fields.length > 0;
  });
  
  // Legende oben
  el.appendChild(createLegende(items));
  
  // Jede Gruppe rendern
  filteredGroups.forEach(group => {
    const groupEl = renderGroup(group, fields, items, config);
    if (groupEl) {
      el.appendChild(groupEl);
    }
  });
  
  return el;
}

/**
 * Rendert eine Feld-Gruppe
 * 
 * DATENGETRIEBEN:
 * - group.type kommt aus Typ-Kategorie-Analyse
 * - Rendering basiert auf erkanntem Typ
 */
function renderGroup(group, fields, items, config) {
  const section = document.createElement('div');
  section.className = `compare-group compare-group-${group.type}`;
  
  // Header (außer bei Einzelfeldern)
  if (group.fields.length > 1 || group.type !== 'single') {
    const header = document.createElement('h3');
    header.className = 'compare-group-header';
    header.textContent = group.label;
    section.appendChild(header);
  }
  
  const content = document.createElement('div');
  content.className = 'compare-group-content';
  
  // Je nach Gruppen-Typ unterschiedlich rendern
  // DATENGETRIEBEN: Typ wurde durch Analyse bestimmt
  switch (group.type) {
    case 'metrics':
      content.appendChild(renderMetricsComposite(group.fields, fields, items, config));
      break;
      
    case 'ranges':
      content.appendChild(renderRangesComposite(group.fields, fields, items, config));
      break;
      
    case 'profile':
      content.appendChild(renderProfileComposite(group.fields, fields, items, config));
      break;
      
    case 'timeline':
      content.appendChild(renderTimelineComposite(group.fields, fields, items, config));
      break;
      
    case 'categories':
      content.appendChild(renderCategoriesComposite(group.fields, fields, items, config));
      break;
      
    default:
      // Einzelne Felder
      group.fields.forEach(feldName => {
        const field = fields[feldName];
        if (field) {
          const morphEl = renderFieldMorph(field, config);
          if (morphEl) content.appendChild(morphEl);
        }
      });
  }
  
  section.appendChild(content);
  return section;
}

export default smartCompare;

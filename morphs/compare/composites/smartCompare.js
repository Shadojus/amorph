/**
 * SMART COMPARE - Intelligent comparison composite
 * 
 * Analyzes data and builds the optimal comparison automatically.
 * 
 * DATA-DRIVEN:
 * - Detects types from data structure
 * - Groups semantically related fields
 * - Chooses best visualization per group
 */

import { debug } from '../../../../observer/debug.js';
import { createLegend, createLegende } from '../base.js';
import { analyzeItems, findRelatedFields } from './analyze.js';
import {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite,
  renderHierarchicalComposite,
  renderChartsComposite,
  renderMediaComposite
} from './render.js';

/**
 * SMART COMPARE - Analyzes data and builds optimal comparison
 * 
 * @param {Array} items - [{id, name, data, color}]
 * @param {Object} config - {excludeFields, includeOnly, layout, labels, units}
 * 
 * DATA-DRIVEN:
 * - No assumptions about field names
 * - Type detection from data structure
 * - Automatic grouping by type category
 */
export function smartCompare(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-smart-compare';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data to compare</div>';
    return el;
  }
  
  // Analysis - DATA-DRIVEN
  const { fields, categories } = analyzeItems(items);
  const groups = findRelatedFields(fields);
  
  debug.compare('Smart Compare', { 
    items: items.length, 
    fields: Object.keys(fields).length,
    groups: groups.length 
  });
  
  // Apply filters (optional)
  const filteredGroups = groups.filter(g => {
    if (config.excludeFields) {
      g.fields = g.fields.filter(f => !config.excludeFields.includes(f));
    }
    if (config.includeOnly) {
      g.fields = g.fields.filter(f => config.includeOnly.includes(f));
    }
    return g.fields.length > 0;
  });
  
  // Legend at top
  el.appendChild(createLegend(items));
  
  // Render each group
  filteredGroups.forEach(group => {
    const groupEl = renderGroup(group, fields, items, config);
    if (groupEl) {
      el.appendChild(groupEl);
    }
  });
  
  return el;
}

/**
 * Renders a field group
 * 
 * DATA-DRIVEN:
 * - group.type comes from type category analysis
 * - Rendering based on detected type
 */
function renderGroup(group, fields, items, config) {
  const section = document.createElement('div');
  section.className = `compare-group compare-group-${group.type}`;
  
  // Header (except for single fields)
  if (group.fields.length > 1 || group.type !== 'single') {
    const header = document.createElement('h3');
    header.className = 'compare-group-header';
    header.textContent = group.label;
    section.appendChild(header);
  }
  
  const content = document.createElement('div');
  content.className = 'compare-group-content';
  
  // Render differently based on group type
  // DATA-DRIVEN: Type was determined by analysis
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
      
    case 'hierarchical':
      content.appendChild(renderHierarchicalComposite(group.fields, fields, items, config));
      break;
      
    case 'charts':
      content.appendChild(renderChartsComposite(group.fields, fields, items, config));
      break;
      
    case 'media':
      content.appendChild(renderMediaComposite(group.fields, fields, items, config));
      break;
      
    default:
      // Single fields (textual, etc.)
      group.fields.forEach(fieldName => {
        const field = fields[fieldName];
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

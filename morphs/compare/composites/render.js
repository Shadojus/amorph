/**
 * RENDER HELPERS - Rendering functions for composite morphs
 * 
 * Shared rendering logic for all composite morphs.
 * DATA-DRIVEN: Selects morph based on detected type.
 * 
 * REFACTORED: All morphs now go through compareByType (single source of truth)
 */

import { compareByType } from '../primitives/index.js';
import { formatFieldLabel } from '../../../core/pipeline.js';

/**
 * Renders a single field with appropriate morph
 * 
 * DATA-DRIVEN:
 * - Type comes from field.type (detected by detectType)
 * - Delegates to compareByType which has ALL compare morphs
 */
export function renderFieldMorph(field, config = {}) {
  const fieldConfig = {
    label: config.labels?.[field.name] || formatFieldLabel(field.name),
    unit: config.units?.[field.name],
    // Legacy support
    einheit: config.units?.[field.name],
    ...config[field.name]
  };
  
  // Support both field.type and field.typ
  const fieldType = field.type || field.typ;
  
  // Delegate to compareByType - SINGLE SOURCE OF TRUTH for all compare morphs
  return compareByType(fieldType, field.values, fieldConfig);
}

/**
 * METRICS COMPOSITE - Combines numeric values
 * Shows rating + progress + number as comparative bars
 */
export function renderMetricsComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-metrics';
  
  // All numeric fields as multi-bar chart
  const metricsData = fieldNames.map(name => ({
    name,
    label: config.labels?.[name] || formatFieldLabel(name),
    items: fields[name].values
  }));
  
  // Display each metric with appropriate morph
  metricsData.forEach(metric => {
    const fieldSection = document.createElement('div');
    fieldSection.className = 'metric-field';
    
    const label = document.createElement('div');
    label.className = 'metric-label';
    label.textContent = metric.label;
    fieldSection.appendChild(label);
    
    // Use compareByType for consistent morph selection
    const field = fields[metric.name];
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, metric.items, { 
      max: fieldType === 'rating' ? 5 : undefined,
      unit: fieldType === 'progress' ? '%' : undefined,
      einheit: fieldType === 'progress' ? '%' : undefined
    });
    
    fieldSection.appendChild(morph);
    el.appendChild(fieldSection);
  });
  
  return el;
}

/**
 * RANGES COMPOSITE - Overlapping range display
 * Shows all ranges on a common scale
 */
export function renderRangesComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-ranges';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'range-field';
    
    const label = document.createElement('div');
    label.className = 'range-label';
    label.textContent = config.labels?.[name] || formatFieldLabel(name);
    fieldEl.appendChild(label);
    
    // Use compareByType for consistent morph selection
    const fieldType = field.type || field.typ;
    const unitConfig = { unit: config.units?.[name], einheit: config.units?.[name] };
    const morph = compareByType(fieldType, field.values, unitConfig);
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

/**
 * PROFILE COMPOSITE - Radar + Pie overlaid/side by side
 */
export function renderProfileComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-profile';
  
  // Radar fields: All overlaid in one chart
  const radarFields = fieldNames.filter(n => {
    const t = fields[n].type || fields[n].typ;
    return t === 'radar';
  });
  if (radarFields.length > 0) {
    const radarContainer = document.createElement('div');
    radarContainer.className = 'profile-radar';
    
    radarFields.forEach(name => {
      const morph = compareByType('radar', fields[name].values, { 
        label: config.labels?.[name] || formatFieldLabel(name) 
      });
      radarContainer.appendChild(morph);
    });
    
    el.appendChild(radarContainer);
  }
  
  // Pie fields: Side by side
  const pieFields = fieldNames.filter(n => {
    const t = fields[n].type || fields[n].typ;
    return t === 'pie';
  });
  if (pieFields.length > 0) {
    const pieContainer = document.createElement('div');
    pieContainer.className = 'profile-pies';
    
    pieFields.forEach(name => {
      const fieldEl = document.createElement('div');
      fieldEl.className = 'profile-pie-field';
      
      const label = document.createElement('div');
      label.className = 'pie-label';
      label.textContent = config.labels?.[name] || formatFieldLabel(name);
      fieldEl.appendChild(label);
      
      const morph = compareByType('pie', fields[name].values, {});
      fieldEl.appendChild(morph);
      pieContainer.appendChild(fieldEl);
    });
    
    el.appendChild(pieContainer);
  }
  
  return el;
}

/**
 * TIMELINE COMPOSITE - Overlaid timelines
 */
export function renderTimelineComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-timeline';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, field.values, {
      label: config.labels?.[name] || formatFieldLabel(name)
    });
    el.appendChild(morph);
  });
  
  return el;
}

/**
 * CATEGORIES COMPOSITE - Tags, lists, booleans grouped
 */
export function renderCategoriesComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-categories';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'category-field';
    
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, field.values, { 
      label: config.labels?.[name] || formatFieldLabel(name) 
    });
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

/**
 * HIERARCHICAL COMPOSITE - Networks, hierarchies, stacked bars
 */
export function renderHierarchicalComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-hierarchical';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'hierarchical-field';
    
    const label = document.createElement('div');
    label.className = 'hierarchical-label';
    label.textContent = config.labels?.[name] || formatFieldLabel(name);
    fieldEl.appendChild(label);
    
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, field.values, {});
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

/**
 * CHARTS COMPOSITE - Dotplots, lollipops, pictograms
 */
export function renderChartsComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-charts';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'chart-field';
    
    const label = document.createElement('div');
    label.className = 'chart-label';
    label.textContent = config.labels?.[name] || formatFieldLabel(name);
    fieldEl.appendChild(label);
    
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, field.values, {});
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

/**
 * MEDIA COMPOSITE - Images, maps, links
 */
export function renderMediaComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-media';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'media-field';
    
    const fieldType = field.type || field.typ;
    const morph = compareByType(fieldType, field.values, { 
      label: config.labels?.[name] || formatFieldLabel(name) 
    });
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

export default {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite,
  renderHierarchicalComposite,
  renderChartsComposite,
  renderMediaComposite
};

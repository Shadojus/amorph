/**
 * RENDER HELPERS - Rendering functions for composite morphs
 * 
 * Shared rendering logic for all composite morphs.
 * DATA-DRIVEN: Selects morph based on detected type.
 */

import {
  compareBar,
  compareRadar,
  comparePie,
  compareRating,
  compareProgress,
  compareStats,
  compareRange,
  compareTimeline,
  compareList,
  compareTag,
  compareText,
  compareImage,
  compareBoolean,
  compareObject
} from '../primitives/index.js';

/**
 * Renders a single field with appropriate morph
 * 
 * DATA-DRIVEN:
 * - Type comes from field.type (detected by detectType)
 * - Switch is complete for all recognized types
 */
export function renderFieldMorph(field, config = {}) {
  const fieldConfig = {
    label: config.labels?.[field.name] || field.name,
    unit: config.units?.[field.name],
    // Legacy support
    einheit: config.units?.[field.name],
    ...config[field.name]
  };
  
  // Support both field.type and field.typ
  const fieldType = field.type || field.typ;
  
  switch (fieldType) {
    case 'bar':
    case 'number':
      return compareBar(field.values, fieldConfig);
    case 'rating':
      return compareRating(field.values, fieldConfig);
    case 'progress':
      return compareProgress(field.values, fieldConfig);
    case 'radar':
      return compareRadar(field.values, fieldConfig);
    case 'pie':
      return comparePie(field.values, fieldConfig);
    case 'range':
      return compareRange(field.values, fieldConfig);
    case 'stats':
      return compareStats(field.values, fieldConfig);
    case 'timeline':
      return compareTimeline(field.values, fieldConfig);
    case 'list':
      return compareList(field.values, fieldConfig);
    case 'tag':
    case 'badge':
      return compareTag(field.values, fieldConfig);
    case 'boolean':
      return compareBoolean(field.values, fieldConfig);
    case 'image':
      return compareImage(field.values, fieldConfig);
    case 'object':
      return compareObject(field.values, fieldConfig);
    default:
      return compareText(field.values, fieldConfig);
  }
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
    label: config.labels?.[name] || name,
    items: fields[name].values
  }));
  
  // Display as stacked bars
  metricsData.forEach(metric => {
    const fieldSection = document.createElement('div');
    fieldSection.className = 'metric-field';
    
    const label = document.createElement('div');
    label.className = 'metric-label';
    label.textContent = metric.label;
    fieldSection.appendChild(label);
    
    // Detect type and choose appropriate morph
    const field = fields[metric.name];
    const fieldType = field.type || field.typ;
    let morph;
    
    switch (fieldType) {
      case 'rating':
        morph = compareRating(metric.items, { max: 5 });
        break;
      case 'progress':
        morph = compareProgress(metric.items, { unit: '%', einheit: '%' });
        break;
      default:
        morph = compareBar(metric.items, {});
    }
    
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
    label.textContent = config.labels?.[name] || name;
    fieldEl.appendChild(label);
    
    // Range or stats - DATA-DRIVEN
    const fieldType = field.type || field.typ;
    const unitConfig = { unit: config.units?.[name], einheit: config.units?.[name] };
    const morph = fieldType === 'stats' 
      ? compareStats(field.values, unitConfig)
      : compareRange(field.values, unitConfig);
    
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
      const morph = compareRadar(fields[name].values, { 
        label: config.labels?.[name] || name 
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
      label.textContent = config.labels?.[name] || name;
      fieldEl.appendChild(label);
      
      const morph = comparePie(fields[name].values, {});
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
    const morph = compareTimeline(fields[name].values, {
      label: config.labels?.[name] || name
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
    let morph;
    switch (fieldType) {
      case 'boolean':
        morph = compareBoolean(field.values, { label: config.labels?.[name] || name });
        break;
      case 'list':
        morph = compareList(field.values, { label: config.labels?.[name] || name });
        break;
      case 'tag':
      case 'badge':
        morph = compareTag(field.values, { label: config.labels?.[name] || name });
        break;
      default:
        morph = compareText(field.values, { label: config.labels?.[name] || name });
    }
    
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
  renderCategoriesComposite
};

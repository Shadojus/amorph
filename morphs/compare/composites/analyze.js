/**
 * ANALYZE - Data analysis functions
 * 
 * Analyzes items and extracts structure information.
 * 100% DATA-DRIVEN - no assumptions about field names!
 */

import { debug } from '../../../../observer/debug.js';
import { detectType } from '../base.js';
import { TYPE_TO_CATEGORY } from './types.js';

/**
 * Analyzes items and groups fields by category
 * 
 * @param {Array} items - [{id, name, data, color}] - data contains all fields
 * @returns {Object} { fields, categories }
 * 
 * DATA-DRIVEN:
 * - Type is detected from data structure (detectType)
 * - Category is derived from type
 * - No hardcoded field names
 */
export function analyzeItems(items) {
  if (!items?.length) return { fields: {}, categories: {} };
  
  // Extract all fields from first item (structure definition)
  const firstData = items[0]?.data || {};
  const fields = {};
  const categories = {};
  
  Object.entries(firstData).forEach(([fieldName, value]) => {
    const type = detectType(value);
    const category = TYPE_TO_CATEGORY[type] || 'textual';
    
    fields[fieldName] = {
      name: fieldName,
      type,
      // Legacy alias
      typ: type,
      category,
      // Collect all values for this field
      values: items.map(item => ({
        id: item.id,
        name: item.name,
        value: item.data?.[fieldName],
        // Legacy alias
        wert: item.data?.[fieldName],
        // CSS-Klasse für Custom Properties (PRIMARY!)
        colorClass: item.farbKlasse || item.colorClass,
        farbKlasse: item.farbKlasse || item.colorClass,
        // Inline-Farben (ALL color variants für Primitives!)
        color: item.farbe || item.color,
        farbe: item.farbe || item.color,
        // WICHTIG: lineFarbe für Bar, Radar, Gauge, etc.
        lineFarbe: item.lineFarbe || item.farbe || item.color,
        // WICHTIG: glowFarbe für Neon-Effekte
        glowFarbe: item.glowFarbe || item.farbe || item.color,
        // Text color
        textColor: item.textFarbe || item.textColor,
        textFarbe: item.textFarbe || item.textColor,
        // Background color
        bgColor: item.bgFarbe || item.bgColor,
        bgFarbe: item.bgFarbe || item.bgColor
      }))
    };
    
    // Group by category
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(fieldName);
  });
  
  debug.compare('Items analyzed', {
    fields: Object.keys(fields).length,
    categories: Object.keys(categories)
  });
  
  return { fields, categories };
}

/**
 * Detects semantically related fields
 * 
 * DATA-DRIVEN:
 * - Groups by TYPE_CATEGORY, not by field names
 * - "rating" + "popularity" = both numeric → together
 * 
 * COMPLETE: All categories from types.js are handled!
 */
export function findRelatedFields(fields) {
  const groups = [];
  const used = new Set();
  
  // Group 1: All numeric fields together
  const numericFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'numeric')
    .map(([name]) => name);
  
  if (numericFields.length > 1) {
    groups.push({
      type: 'metrics',
      label: 'Metrics',
      fields: numericFields
    });
    numericFields.forEach(f => used.add(f));
  }
  
  // Group 2: Ranges together (Temperature, etc.)
  const rangeFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'ranges')
    .map(([name]) => name);
  
  if (rangeFields.length >= 1) {
    groups.push({
      type: 'ranges',
      label: 'Ranges',
      fields: rangeFields
    });
    rangeFields.forEach(f => used.add(f));
  }
  
  // Group 3: Multidimensional data (Radar, Pie, Sunburst, etc.)
  const multidimFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'multidim')
    .map(([name]) => name);
  
  if (multidimFields.length >= 1) {
    groups.push({
      type: 'profile',
      label: 'Profiles',
      fields: multidimFields
    });
    multidimFields.forEach(f => used.add(f));
  }
  
  // Group 4: Sequential data (Timeline, Sparkline, Lifecycle, etc.)
  const seqFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'sequential')
    .map(([name]) => name);
  
  if (seqFields.length >= 1) {
    groups.push({
      type: 'timeline',
      label: 'Timelines',
      fields: seqFields
    });
    seqFields.forEach(f => used.add(f));
  }
  
  // Group 5: Categorical data (Tag, Badge, Boolean, List, Heatmap)
  const catFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'categorical')
    .map(([name]) => name);
  
  if (catFields.length >= 1) {
    groups.push({
      type: 'categories',
      label: 'Properties',
      fields: catFields
    });
    catFields.forEach(f => used.add(f));
  }
  
  // Group 6: Hierarchical data (Hierarchy, Network, GroupedBar, etc.)
  const hierarchicalFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'hierarchical')
    .map(([name]) => name);
  
  if (hierarchicalFields.length >= 1) {
    groups.push({
      type: 'hierarchical',
      label: 'Structures',
      fields: hierarchicalFields
    });
    hierarchicalFields.forEach(f => used.add(f));
  }
  
  // Group 7: Chart data (Dotplot, Lollipop, Pictogram)
  const chartFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'charts')
    .map(([name]) => name);
  
  if (chartFields.length >= 1) {
    groups.push({
      type: 'charts',
      label: 'Charts',
      fields: chartFields
    });
    chartFields.forEach(f => used.add(f));
  }
  
  // Group 8: Media (Image, Link, Map)
  const mediaFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'media')
    .map(([name]) => name);
  
  if (mediaFields.length >= 1) {
    groups.push({
      type: 'media',
      label: 'Media',
      fields: mediaFields
    });
    mediaFields.forEach(f => used.add(f));
  }
  
  // Rest: Single fields that weren't grouped (textual, etc.)
  Object.keys(fields).forEach(name => {
    if (!used.has(name)) {
      groups.push({
        type: 'single',
        label: fields[name].name,
        fields: [name]
      });
    }
  });
  
  return groups;
}

/**
 * Calculates differences between items
 * 
 * @returns {Object} { same, different, unique }
 */
export function calculateDiff(items) {
  if (items.length < 2) return null;
  
  const { fields } = analyzeItems(items);
  const diff = {
    same: [],      // Fields with identical values
    different: [], // Fields with different values
    unique: []     // Fields that only exist on one item
  };
  
  Object.entries(fields).forEach(([name, field]) => {
    const values = field.values.map(v => JSON.stringify(v.value ?? v.wert));
    const uniqueValues = new Set(values);
    
    if (uniqueValues.size === 1) {
      diff.same.push(name);
    } else if (values.some(v => v === 'undefined' || v === 'null')) {
      diff.unique.push(name);
    } else {
      diff.different.push(name);
    }
  });
  
  return diff;
}

export default {
  analyzeItems,
  findRelatedFields,
  calculateDiff
};

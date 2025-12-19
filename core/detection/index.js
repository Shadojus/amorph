/**
 * Detection Module Index
 * Centralized type detection for the AMORPH pipeline
 * 
 * @module core/detection
 */

import { detectNumberType } from './number.js';
import { detectStringType } from './string.js';
import { detectArrayType } from './array.js';
import { detectObjectType } from './object.js';

export { detectNumberType } from './number.js';
export { detectStringType } from './string.js';
export { detectArrayType } from './array.js';
export { detectObjectType } from './object.js';

/**
 * @typedef {import('../../types/index.d.ts').DetectedType} DetectedType
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/** @type {DetectionConfig|null} */
let detectionConfig = null;

/**
 * Sets the detection configuration (from morphs.yaml)
 * @param {object} config - Configuration object with erkennung/detection key
 */
export function setDetectionConfig(config) {
  detectionConfig = config?.erkennung || config?.detection || null;
}

/**
 * Gets the current detection configuration
 * @returns {DetectionConfig|null}
 */
export function getDetectionConfig() {
  return detectionConfig;
}

/**
 * Main type detection function
 * Analyzes a value and returns the most appropriate type for visualization
 * 
 * @param {*} value - The value to analyze
 * @returns {DetectedType} The detected type
 */
export function detectType(value) {
  // Null/undefined
  if (value === null || value === undefined) return 'null';
  
  // Boolean
  if (typeof value === 'boolean') return 'boolean';
  
  // Number
  if (typeof value === 'number') {
    return detectNumberType(value, detectionConfig);
  }
  
  // String
  if (typeof value === 'string') {
    return detectStringType(value, detectionConfig);
  }
  
  // Array
  if (Array.isArray(value)) {
    return detectArrayType(value, detectionConfig);
  }
  
  // Object
  if (typeof value === 'object') {
    return detectObjectType(value, detectionConfig);
  }
  
  return 'unknown';
}

/**
 * Default type-to-morph mapping
 * Extended with all Kirk-based morphs
 */
export const TYPE_TO_MORPH = {
  // Base types
  'string': 'text',
  'number': 'number',
  'boolean': 'boolean',
  'array': 'list',
  'object': 'object',
  'range': 'range',
  'null': 'text',
  
  // Visual morphs (auto-detected)
  'pie': 'pie',
  'bar': 'bar',
  'radar': 'radar',
  'progress': 'progress',
  'stats': 'stats',
  'timeline': 'timeline',
  'badge': 'badge',
  'lifecycle': 'lifecycle',
  'tag': 'tag',
  
  // Kirk Session 1 morphs
  'sparkline': 'sparkline',
  'slopegraph': 'slopegraph',
  'heatmap': 'heatmap',
  'bubble': 'bubble',
  'boxplot': 'boxplot',
  'treemap': 'treemap',
  'stackedbar': 'stackedbar',
  'dotplot': 'dotplot',
  'sunburst': 'sunburst',
  
  // Kirk Session 2 morphs
  'flow': 'flow',
  'groupedbar': 'groupedbar',
  'scatterplot': 'scatterplot',
  'lollipop': 'lollipop',
  'pictogram': 'pictogram',
  
  // Extended morphs
  'map': 'map',
  'citation': 'citation',
  'dosage': 'dosage',
  'currency': 'currency',
  'gauge': 'gauge',
  'hierarchy': 'hierarchy',
  'network': 'network',
  'steps': 'steps',
  'calendar': 'calendar',
  'severity': 'severity',
  'comparison': 'comparison',
  'link': 'link',
  'image': 'image'
};

/**
 * Finds the appropriate morph for a detected type
 * 
 * @param {string} type - The detected type
 * @param {*} value - The original value
 * @param {string|null} fieldName - Optional field name for explicit mapping
 * @param {object|null} morphConfig - Morph configuration from morphs.yaml
 * @param {object} schemaFieldMorphs - Field morphs from schema
 * @returns {string} The morph name to use
 */
export function findMorph(type, value, fieldName, morphConfig, schemaFieldMorphs = {}) {
  // 1. Explicit field assignment from morphs.yaml
  if (fieldName && morphConfig?.felder?.[fieldName]) {
    return morphConfig.felder[fieldName];
  }
  
  // 2. Field type from schema (Single Source of Truth)
  if (fieldName && schemaFieldMorphs[fieldName]) {
    return schemaFieldMorphs[fieldName];
  }
  
  // 3. Check rules
  if (morphConfig?.regeln) {
    for (const rule of morphConfig.regeln) {
      if (matchesRule(rule, type, value)) {
        return rule.morph;
      }
    }
  }
  
  // 4. Default mapping
  return TYPE_TO_MORPH[type] || 'text';
}

/**
 * Checks if a value matches a detection rule
 * 
 * @param {object} rule - The rule to check
 * @param {string} type - The detected type
 * @param {*} value - The value to check
 * @returns {boolean}
 */
function matchesRule(rule, type, value) {
  // Support both 'type' and 'typ' (German from config.js mapping)
  const ruleType = rule.type || rule.typ;
  if (ruleType && ruleType !== type) return false;
  
  if (rule.has && typeof value === 'object') {
    return rule.has.every(key => key in value);
  }
  
  // Support both 'maxLength' and 'maxLaenge' (German from config.js mapping)
  const maxLen = rule.maxLength || rule.maxLaenge;
  if (maxLen && typeof value === 'string') {
    return value.length <= maxLen;
  }
  
  return true;
}

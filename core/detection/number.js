/**
 * Number Type Detection
 * Detects progress or plain number from numeric values
 * 
 * @module core/detection/number
 */

/**
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/**
 * Detects the appropriate type for a numeric value
 * 
 * PROGRESS: 0-100 integers (Kirk: Progress bars)
 *   → Percentage values, completion status
 *   → Only integers allowed
 * 
 * NUMBER: All other numeric values
 *   → Values >100 or negative values
 *   → Decimal values
 * 
 * @param {number} value - The numeric value to analyze
 * @param {DetectionConfig|null} config - Detection configuration from morphs.yaml
 * @returns {'progress'|'number'} The detected type
 */
export function detectNumberType(value, config = null) {
  const cfg = config || {};
  
  // Progress: 0-100 integers - Kirk: Progress bars
  const progress = cfg.progress || { min: 0, max: 100, integersOnly: true };
  const pMin = progress.min ?? 0;
  const pMax = progress.max ?? 100;
  if (value >= pMin && value <= pMax && 
      (!progress.integersOnly || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

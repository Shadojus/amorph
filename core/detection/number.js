/**
 * Number Type Detection
 * Detects rating, progress, or plain number from numeric values
 * 
 * @module core/detection/number
 */

/**
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/**
 * Detects the appropriate type for a numeric value
 * 
 * RATING: 0-10 scale (Kirk: Stars/Points ratings)
 *   → Small scale for ratings (1-5 stars, 0-10 points)
 *   → Integers AND decimals allowed (4 or 4.5)
 * 
 * PROGRESS: 11-100 integers (Kirk: Progress bars)
 *   → Percentage values, completion status
 *   → Range 11-100 to avoid overlap with rating
 * 
 * NUMBER: All other numeric values
 *   → Values >100 or negative values
 * 
 * @param {number} value - The numeric value to analyze
 * @param {DetectionConfig|null} config - Detection configuration from morphs.yaml
 * @returns {'rating'|'progress'|'number'} The detected type
 */
export function detectNumberType(value, config = null) {
  const cfg = config || {};
  
  // Rating: 0-10 (integers AND decimals) - Kirk: Star ratings
  const rating = cfg.rating || { min: 0, max: 10 };
  if (value >= rating.min && value <= rating.max) {
    return 'rating';
  }
  
  // Progress: 11-100 integers - Kirk: Progress bars
  const progress = cfg.progress || { min: 11, max: 100, integersOnly: true };
  if (value >= progress.min && value <= progress.max && 
      (!progress.integersOnly || Number.isInteger(value))) {
    return 'progress';
  }
  
  return 'number';
}

/**
 * TYPE CATEGORIES - Data type categorization
 * 
 * Defines which data types semantically belong together.
 * This is the heart of data-driven decision making.
 * 
 * DATA-DRIVEN: Categories based on data structure, not field names!
 */

// =============================================================================
// TYPE CATEGORIES - Which types fit together?
// =============================================================================

export const TYPE_CATEGORIES = {
  // Numeric comparisons - can be compared on a common scale
  numeric: ['number', 'rating', 'progress', 'bar'],
  
  // Ranges - have min/max, can be overlaid
  ranges: ['range', 'stats'],
  
  // Multidimensional - have multiple axes/dimensions
  multidim: ['radar', 'pie'],
  
  // Sequential - have temporal or ordered sequence
  sequential: ['timeline'],
  
  // Categorical - discrete values
  categorical: ['tag', 'badge', 'boolean', 'list'],
  
  // Text/Complex
  textual: ['text', 'string', 'object'],
  
  // Media
  media: ['image', 'link']
};

// Reverse mapping: type → category
export const TYPE_TO_CATEGORY = {};
Object.entries(TYPE_CATEGORIES).forEach(([cat, types]) => {
  types.forEach(t => TYPE_TO_CATEGORY[t] = cat);
});

/**
 * Returns the category for a type
 * @param {string} type - The type to categorize
 * @returns {string} The category name
 */
export function getCategory(type) {
  return TYPE_TO_CATEGORY[type] || 'textual';
}

/**
 * Checks if two types are in the same category
 * @param {string} type1 - First type
 * @param {string} type2 - Second type
 * @returns {boolean} True if same category
 */
export function sameCategory(type1, type2) {
  return getCategory(type1) === getCategory(type2);
}

export default {
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory
};

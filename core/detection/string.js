/**
 * String Type Detection
 * Detects link, image, badge, tag, or plain text from string values
 * 
 * @module core/detection/string
 */

/**
 * @typedef {import('../../types/index.d.ts').DetectionConfig} DetectionConfig
 */

/** Default badge keywords for status detection */
const DEFAULT_BADGE_KEYWORDS = [
  // Availability
  'active', 'inactive', 'yes', 'no', 'online', 'offline',
  'open', 'closed', 'available', 'unavailable', 'enabled', 'disabled',
  // Edibility (Kirk: semantic colors!)
  'edible', 'toxic', 'deadly', 'poisonous', 'choice', 'caution',
  'essbar', 'giftig', 'tödlich', 'bedingt',
  // Quality/Status
  'good', 'bad', 'excellent', 'poor', 'warning', 'danger', 'safe',
  'pending', 'approved', 'rejected', 'complete', 'incomplete',
  // Categories
  'high', 'medium', 'low', 'critical', 'normal', 'none'
];

/**
 * Detects the appropriate type for a string value
 * 
 * LINK: URL pattern detected (http://, https://, www.)
 *   → External/internal links, clickable
 * 
 * IMAGE: Image path detected (.jpg, .png, .webp, .svg, .gif)
 *   → Image display with preview
 * 
 * BADGE: Status keywords + short length (≤25 characters)
 *   → Color-coded status displays: active, edible, toxic, etc.
 *   → Kirk: Semantic colors for states
 * 
 * TAG: Short strings (≤20 characters) without status semantics
 *   → Categories, labels, short terms
 * 
 * TEXT: All other strings
 *   → Standard text display
 * 
 * @param {string} value - The string value to analyze
 * @param {DetectionConfig|null} config - Detection configuration from morphs.yaml
 * @returns {'link'|'image'|'badge'|'tag'|'string'} The detected type
 */
export function detectStringType(value, config = null) {
  // Ensure value is a string before processing
  if (typeof value !== 'string') {
    return 'text';
  }
  
  const lower = value.toLowerCase().trim();
  const badgeConfig = config?.badge || {};
  
  /* ─── LINK: URL patterns ─── */
  if (/^https?:\/\/|^www\./i.test(value)) {
    return 'link';
  }
  
  /* ─── IMAGE: Image paths ─── */
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(value)) {
    return 'image';
  }
  
  /* ─── BADGE: Status keywords (short + semantically meaningful) ─── */
  const keywords = badgeConfig.keywords || DEFAULT_BADGE_KEYWORDS;
  const maxLength = badgeConfig.maxLength || 25;
  
  // Ensure keywords are strings before comparison
  const isStatusKeyword = keywords.some(kw => 
    typeof kw === 'string' && lower.includes(kw.toLowerCase())
  );
  
  if (value.length <= maxLength && isStatusKeyword) {
    return 'badge';
  }
  
  /* ─── TAG: Short strings without status meaning ─── */
  if ((value.length <= 20 && !value.includes(' ')) || value.length <= 15) {
    return 'tag';
  }
  
  return 'string';
}

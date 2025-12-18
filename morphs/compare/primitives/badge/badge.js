/**
 * COMPARE BADGE - Side-by-side badge comparison
 * Uses the exact same HTML structure as the original badge morph
 */

import { debug } from '../../../../observer/debug.js';

// Fallback variants and colors
const AUTO_VARIANTS = {
  success: ['aktiv', 'active', 'ja', 'yes', 'true', 'essbar', 'fertig', 'ok', 'gut'],
  danger: ['inaktiv', 'inactive', 'nein', 'no', 'false', 'giftig', 'tödlich', 'fehler'],
  warning: ['warnung', 'warning', 'bedingt', 'vorsicht', 'pending', 'moderat'],
  info: ['info', 'hinweis', 'note', 'tipp', 'neu', 'beta'],
  neutral: ['unbekannt', 'unknown', 'n/a', '-', 'keine', 'none']
};

const VARIANT_COLORS = {
  success: { bg: 'rgba(100, 220, 160, 0.10)', border: 'rgba(100, 220, 160, 0.28)', text: 'rgba(100, 220, 160, 0.82)', icon: '✓' },
  danger: { bg: 'rgba(240, 110, 110, 0.10)', border: 'rgba(240, 110, 110, 0.28)', text: 'rgba(240, 110, 110, 0.82)', icon: '✕' },
  warning: { bg: 'rgba(240, 190, 80, 0.10)', border: 'rgba(240, 190, 80, 0.28)', text: 'rgba(240, 190, 80, 0.82)', icon: '⚠' },
  info: { bg: 'rgba(90, 160, 240, 0.10)', border: 'rgba(90, 160, 240, 0.28)', text: 'rgba(90, 160, 240, 0.82)', icon: 'ℹ' },
  neutral: { bg: 'rgba(140, 160, 180, 0.08)', border: 'rgba(140, 160, 180, 0.20)', text: 'rgba(140, 160, 180, 0.68)', icon: '•' }
};

export function compareBadge(items, config = {}) {
  debug.morphs('compareBadge', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-badge';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all badges
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const val = item.value ?? item.wert;
    
    // Neon pilz colors for label
    const baseColor = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || baseColor;
    const textColor = item.textFarbe || baseColor;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply neon color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Extract badge text and variant
    let badgeText, variant;
    
    if (typeof val === 'string') {
      badgeText = val;
      variant = config.variant || detectVariant(val);
    } else if (typeof val === 'object' && val !== null) {
      badgeText = val.label || val.text || val.status || val.value || '';
      variant = val.variant || val.type || config.variant || detectVariant(badgeText);
    } else if (typeof val === 'boolean') {
      badgeText = val ? 'Ja' : 'Nein';
      variant = val ? 'success' : 'danger';
    } else if (val === null || val === undefined) {
      badgeText = '–';
      variant = 'neutral';
    } else if (typeof val === 'object') {
      // Fallback for any object type not caught above
      const keys = Object.keys(val);
      if (keys.length === 0) {
        badgeText = '–';
      } else if (keys.length <= 2) {
        badgeText = keys.map(k => val[k]).join(', ');
      } else {
        badgeText = `{${keys.length} Felder}`;
      }
      variant = 'neutral';
    } else {
      badgeText = String(val);
      variant = 'neutral';
    }
    
    const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.neutral;
    
    // Use original badge structure
    const badgeEl = document.createElement('span');
    badgeEl.className = 'amorph-badge';
    badgeEl.style.setProperty('--badge-bg', colors.bg);
    badgeEl.style.setProperty('--badge-border', colors.border);
    badgeEl.style.setProperty('--badge-text', colors.text);
    badgeEl.setAttribute('data-variant', variant);
    
    // Icon
    if (config.showIcon !== false) {
      const icon = document.createElement('span');
      icon.className = 'amorph-badge-icon';
      icon.textContent = config.icon || colors.icon;
      badgeEl.appendChild(icon);
    }
    
    // Text
    const textEl = document.createElement('span');
    textEl.className = 'amorph-badge-text';
    textEl.textContent = badgeText;
    badgeEl.appendChild(textEl);
    
    wrapper.appendChild(badgeEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function detectVariant(text) {
  const lower = String(text).toLowerCase().trim();
  
  for (const [variant, keywords] of Object.entries(AUTO_VARIANTS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return variant;
    }
  }
  
  return 'neutral';
}

export default compareBadge;

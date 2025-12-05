/**
 * 🏷️ BADGE MORPH - Kompakte Labels/Badges
 * 
 * Zeigt einzelne Werte als farbige Badges
 * DATENGETRIEBEN - Erkennt Status-Werte, Kategorien, kleine Strings
 * 
 * Input: "aktiv" oder {status: "aktiv", variant: "success"}
 * Output: Farbiges Badge mit Icon
 */

import { debug } from '../../observer/debug.js';
import { getBadgeConfig } from '../../util/semantic.js';

// Fallback-Werte wenn Config nicht geladen
const AUTO_VARIANTS_FALLBACK = {
  success: ['aktiv', 'active', 'ja', 'yes', 'true', 'essbar', 'fertig', 'ok', 'gut'],
  danger: ['inaktiv', 'inactive', 'nein', 'no', 'false', 'giftig', 'tödlich', 'fehler'],
  warning: ['warnung', 'warning', 'bedingt', 'vorsicht', 'pending', 'moderat'],
  info: ['info', 'hinweis', 'note', 'tipp', 'neu', 'beta'],
  neutral: ['unbekannt', 'unknown', 'n/a', '-', 'keine', 'none']
};

// Harmonische Farben basierend auf Farbkreis - Echter Glas-Stil
// Durchscheinend leuchtend auf schwarzem Grund
const VARIANT_COLORS_FALLBACK = {
  success: { bg: 'rgba(100, 220, 160, 0.10)', border: 'rgba(100, 220, 160, 0.28)', text: 'rgba(100, 220, 160, 0.82)', icon: '✓' },
  danger: { bg: 'rgba(240, 110, 110, 0.10)', border: 'rgba(240, 110, 110, 0.28)', text: 'rgba(240, 110, 110, 0.82)', icon: '✕' },
  warning: { bg: 'rgba(240, 190, 80, 0.10)', border: 'rgba(240, 190, 80, 0.28)', text: 'rgba(240, 190, 80, 0.82)', icon: '⚠' },
  info: { bg: 'rgba(90, 160, 240, 0.10)', border: 'rgba(90, 160, 240, 0.28)', text: 'rgba(90, 160, 240, 0.82)', icon: 'ℹ' },
  neutral: { bg: 'rgba(140, 160, 180, 0.08)', border: 'rgba(140, 160, 180, 0.20)', text: 'rgba(140, 160, 180, 0.68)', icon: '•' }
};

// Aus Config laden (gecached)
let cachedVariants = null;
let cachedColors = null;

function getAutoVariants() {
  if (!cachedVariants) {
    const cfg = getBadgeConfig();
    cachedVariants = cfg?.variants || AUTO_VARIANTS_FALLBACK;
  }
  return cachedVariants;
}

function getVariantColors() {
  if (!cachedColors) {
    const cfg = getBadgeConfig();
    cachedColors = cfg?.colors || VARIANT_COLORS_FALLBACK;
  }
  return cachedColors;
}

export function badge(wert, config = {}) {
  debug.morphs('badge', { wert, typ: typeof wert });
  
  const el = document.createElement('span');
  el.className = 'amorph-badge';
  
  // Wert und Variant extrahieren
  let text, variant;
  
  if (typeof wert === 'string') {
    text = wert;
    variant = config.variant || detectVariant(wert);
  } else if (typeof wert === 'object') {
    text = wert.label || wert.text || wert.status || wert.value || '';
    variant = wert.variant || wert.type || config.variant || detectVariant(text);
  } else if (typeof wert === 'boolean') {
    text = wert ? 'Ja' : 'Nein';
    variant = wert ? 'success' : 'danger';
  } else {
    text = String(wert);
    variant = 'neutral';
  }
  
  const variantColors = getVariantColors();
  const colors = variantColors[variant] || variantColors.neutral;
  
  // Styling anwenden
  el.style.setProperty('--badge-bg', colors.bg);
  el.style.setProperty('--badge-border', colors.border);
  el.style.setProperty('--badge-text', colors.text);
  el.setAttribute('data-variant', variant);
  
  // Icon (optional)
  if (config.showIcon !== false) {
    const icon = document.createElement('span');
    icon.className = 'amorph-badge-icon';
    icon.textContent = config.icon || colors.icon;
    el.appendChild(icon);
  }
  
  // Text
  const textEl = document.createElement('span');
  textEl.className = 'amorph-badge-text';
  textEl.textContent = text;
  el.appendChild(textEl);
  
  return el;
}

function detectVariant(text) {
  const lower = String(text).toLowerCase().trim();
  const autoVariants = getAutoVariants();
  
  for (const [variant, keywords] of Object.entries(autoVariants)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return variant;
    }
  }
  
  return 'neutral';
}

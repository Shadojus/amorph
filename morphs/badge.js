/**
 * 🏷️ BADGE MORPH - Kompakte Labels/Badges
 * 
 * Zeigt einzelne Werte als farbige Badges
 * DATENGETRIEBEN - Erkennt Status-Werte, Kategorien, kleine Strings
 * 
 * Input: "aktiv" oder {status: "aktiv", variant: "success"}
 * Output: Farbiges Badge mit Icon
 */

import { debug } from '../observer/debug.js';

// Automatische Farb-Erkennung basierend auf Wert
const AUTO_VARIANTS = {
  // Positiv (grün)
  success: ['aktiv', 'active', 'ja', 'yes', 'true', 'essbar', 'edible', 'fertig', 'done', 'ok', 'gut', 'good', 'verfügbar', 'available', 'online', 'open', 'geöffnet'],
  // Negativ (rot)
  danger: ['inaktiv', 'inactive', 'nein', 'no', 'false', 'giftig', 'toxic', 'tödlich', 'deadly', 'fehler', 'error', 'offline', 'closed', 'geschlossen', 'kritisch', 'critical'],
  // Warnung (orange)
  warning: ['warnung', 'warning', 'bedingt', 'conditional', 'vorsicht', 'caution', 'pending', 'wartend', 'eingeschränkt', 'limited', 'moderat', 'moderate'],
  // Info (blau)
  info: ['info', 'information', 'hinweis', 'note', 'tipp', 'tip', 'neu', 'new', 'beta', 'preview'],
  // Neutral (grau)
  neutral: ['unbekannt', 'unknown', 'n/a', '-', 'keine', 'none', 'leer', 'empty']
};

const VARIANT_COLORS = {
  success: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.6)', text: '#22c55e', icon: '✓' },
  danger: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.6)', text: '#ef4444', icon: '✕' },
  warning: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.6)', text: '#f59e0b', icon: '⚠' },
  info: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.6)', text: '#3b82f6', icon: 'ℹ' },
  neutral: { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.4)', text: '#94a3b8', icon: '•' }
};

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
  
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.neutral;
  
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
  const lower = text.toLowerCase().trim();
  
  for (const [variant, keywords] of Object.entries(AUTO_VARIANTS)) {
    if (keywords.some(kw => lower.includes(kw) || lower === kw)) {
      return variant;
    }
  }
  
  return 'neutral';
}

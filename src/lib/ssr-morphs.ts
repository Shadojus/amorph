/**
 * Optimized Server-Side Morph Renderer
 * 
 * Features:
 * - Shared Detection-Config (Single Source of Truth)
 * - Error Boundaries für robustes Rendering
 * - Bessere Performance durch weniger String-Operationen
 */

import { 
  detectType, 
  getBadgeVariant, 
  type MorphType 
} from './detection-config';

// Re-export für externe Nutzung
export { detectType, type MorphType };

// ═══════════════════════════════════════════════════════════════════════════════
// HTML UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;'
};

function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char);
}

function formatLabel(key: string): string {
  const unitMap: Record<string, string> = {
    '_g': ' (g)', '_mg': ' (mg)', '_ug': ' (µg)',
    '_um': ' (µm)', '_mm': ' (mm)', '_cm': ' (cm)',
    '_pct': ' (%)', '_percent': ' (%)'
  };
  
  let label = key;
  let unit = '';
  
  for (const [suffix, unitStr] of Object.entries(unitMap)) {
    if (label.toLowerCase().endsWith(suffix)) {
      unit = unitStr;
      label = label.slice(0, -suffix.length);
      break;
    }
  }
  
  return label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase()) + unit;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALUE RENDERERS (mit Error Boundary)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rendert einen einzelnen Wert basierend auf seinem Typ
 * Mit Error Boundary für robustes Rendering
 */
export function renderValue(value: any, type?: MorphType, fieldName?: string): string {
  try {
    const detectedType = type || detectType(value, fieldName);
    return renderValueUnsafe(value, detectedType);
  } catch (error) {
    console.error('SSR Morph render error:', error);
    return `<span class="ssr-error" title="Render-Fehler">${escapeHtml(String(value))}</span>`;
  }
}

function renderValueUnsafe(value: any, type: MorphType): string {
  switch (type) {
    case 'null':
      return '<span class="ssr-null">—</span>';
      
    case 'boolean':
      return value 
        ? '<span class="ssr-bool ssr-bool-true" aria-label="Ja">✓</span>'
        : '<span class="ssr-bool ssr-bool-false" aria-label="Nein">✗</span>';
      
    case 'rating': {
      const stars = Math.round(Math.min(Math.max(value, 0), 10) / 2);
      const fullStars = '★'.repeat(stars);
      const emptyStars = '☆'.repeat(5 - stars);
      return `<span class="ssr-rating" aria-label="${value} von 10">${fullStars}${emptyStars} <span class="ssr-rating-value">${value}/10</span></span>`;
    }
      
    case 'progress': {
      const pct = Math.min(Math.max(value, 0), 100);
      return `<div class="ssr-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="ssr-progress-bar" style="width:${pct}%"></div><span class="ssr-progress-text">${pct}%</span></div>`;
    }
      
    case 'number':
      return `<span class="ssr-number">${typeof value === 'number' ? value.toLocaleString('de-DE') : escapeHtml(value)}</span>`;
    
    case 'currency':
      return `<span class="ssr-currency">${typeof value === 'number' ? value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : escapeHtml(value)}</span>`;
      
    case 'date':
      return `<time class="ssr-date">${escapeHtml(value)}</time>`;
      
    case 'link': {
      const url = escapeHtml(String(value));
      const displayUrl = String(value).replace(/^https?:\/\//, '').slice(0, 50);
      return `<a href="${url}" class="ssr-link" rel="noopener noreferrer" target="_blank">${escapeHtml(displayUrl)}</a>`;
    }
      
    case 'image':
      return `<img src="${escapeHtml(value)}" class="ssr-image" loading="lazy" alt="">`;
      
    case 'badge': {
      const variant = getBadgeVariant(String(value));
      return `<span class="ssr-badge badge-${variant}">${escapeHtml(value)}</span>`;
    }
      
    case 'tag':
      return `<span class="ssr-tag">${escapeHtml(value)}</span>`;
      
    case 'tags':
      if (!Array.isArray(value)) return renderValueUnsafe([value], 'tags');
      return `<div class="ssr-tags">${value.map(v => `<span class="ssr-tag">${escapeHtml(v)}</span>`).join('')}</div>`;
      
    case 'list':
      if (!Array.isArray(value) || value.length === 0) return '<span class="ssr-null">—</span>';
      return `<ul class="ssr-list">${value.map(v => `<li>${typeof v === 'object' ? renderValue(v) : escapeHtml(v)}</li>`).join('')}</ul>`;
      
    case 'range': {
      const { min, max, unit } = value as { min: number; max: number; unit?: string };
      return `<span class="ssr-range">${min}–${max}${unit ? ` ${escapeHtml(unit)}` : ''}</span>`;
    }
      
    case 'stats': {
      const { value: statVal, unit: statUnit } = value as { value: number | string; unit?: string };
      return `<span class="ssr-stats"><strong>${escapeHtml(statVal)}</strong>${statUnit ? ` <span class="ssr-unit">${escapeHtml(statUnit)}</span>` : ''}</span>`;
    }
      
    case 'steps':
      if (!Array.isArray(value)) return renderValueUnsafe([value], 'list');
      return `<ol class="ssr-steps">${value.map(step => `<li class="ssr-step">${escapeHtml(step.step || step.phase || step.title || step)}</li>`).join('')}</ol>`;
      
    case 'timeline':
      if (!Array.isArray(value)) return renderValueUnsafe([value], 'list');
      return `<div class="ssr-timeline">${value.map(event => `<div class="ssr-timeline-event"><span class="ssr-timeline-date">${escapeHtml(event.date || event.year || '')}</span><span class="ssr-timeline-text">${escapeHtml(event.event || event.title || event.description || '')}</span></div>`).join('')}</div>`;
      
    case 'map': {
      const { lat, lon, lng, label } = value as { lat: number; lon?: number; lng?: number; label?: string };
      const longitude = lon ?? lng ?? 0;
      return `<span class="ssr-location" data-lat="${lat}" data-lon="${longitude}">📍 ${escapeHtml(label || `${lat.toFixed(4)}, ${longitude.toFixed(4)}`)}</span>`;
    }
      
    case 'object':
      if (!value || typeof value !== 'object') return escapeHtml(String(value));
      return `<dl class="ssr-object">${Object.entries(value).map(([k, v]) => `<div class="ssr-object-field"><dt>${formatLabel(k)}</dt><dd>${renderValue(v)}</dd></div>`).join('')}</dl>`;
      
    case 'hierarchy': {
      const renderNode = (node: any, depth = 0): string => {
        if (!node || typeof node !== 'object') return escapeHtml(String(node));
        const name = node.name || node.title || String(node);
        const children = node.children || [];
        return `<div class="ssr-hierarchy-node" style="--depth:${depth}"><span class="ssr-hierarchy-label">${escapeHtml(name)}</span>${Array.isArray(children) ? children.map((c: any) => renderNode(c, depth + 1)).join('') : ''}</div>`;
      };
      return `<div class="ssr-hierarchy">${renderNode(value)}</div>`;
    }
      
    default:
      return `<span class="ssr-text">${escapeHtml(value)}</span>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD & PERSPECTIVE RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rendert ein einzelnes Feld mit Label und Wert
 */
export function renderField(key: string, value: any): string {
  if (value === null || value === undefined) return '';
  if (key.startsWith('_')) return '';
  
  const type = detectType(value, key);
  const label = formatLabel(key);
  
  return `<div class="ssr-field" data-field="${escapeHtml(key)}" data-type="${type}">
    <dt class="ssr-field-label">${label}</dt>
    <dd class="ssr-field-value">${renderValue(value, type, key)}</dd>
  </div>`;
}

/**
 * Rendert alle Felder eines Datenobjekts
 */
export function renderFields(data: Record<string, any>): string {
  const fields = Object.entries(data)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => renderField(key, value))
    .filter(html => html !== '');
  
  return `<dl class="ssr-fields">${fields.join('')}</dl>`;
}

/**
 * Rendert eine Perspektive (Chemistry, Ecology, etc.)
 */
export function renderPerspective(
  perspectiveId: string,
  data: Record<string, any>,
  label?: string
): string {
  const perspLabel = label || formatLabel(perspectiveId);
  
  return `<section class="ssr-perspective" id="${perspectiveId}" data-perspective="${perspectiveId}">
    <h2 class="ssr-perspective-title">${perspLabel}</h2>
    ${renderFields(data)}
  </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIES PAGE RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

interface SpeciesData {
  name: string;
  wissenschaftlicher_name?: string;
  slug: string;
  kingdom: string;
  [key: string]: any;
}

/**
 * Rendert den Basis-Info-Block einer Species
 */
export function renderSpeciesHeader(species: SpeciesData): string {
  return `<header class="ssr-species-header">
    <h1 class="ssr-species-name">${escapeHtml(species.name)}</h1>
    ${species.wissenschaftlicher_name 
      ? `<p class="ssr-species-scientific"><em>${escapeHtml(species.wissenschaftlicher_name)}</em></p>` 
      : ''}
    <div class="ssr-species-meta">
      <span class="ssr-kingdom">${escapeHtml(species.kingdom)}</span>
    </div>
  </header>`;
}

/**
 * Rendert eine komplette Species-Seite mit allen Perspektiven
 */
export function renderSpeciesContent(
  species: SpeciesData,
  perspectives: Record<string, Record<string, any>>,
  perspectiveLabels: Record<string, string> = {}
): string {
  const sections = Object.entries(perspectives)
    .filter(([_, data]) => data && Object.keys(data).length > 0)
    .map(([id, data]) => renderPerspective(id, data, perspectiveLabels[id]))
    .join('\n');
  
  return `<article class="ssr-species-content" data-species="${escapeHtml(species.slug)}" itemscope itemtype="https://schema.org/Thing">
    <meta itemprop="name" content="${escapeHtml(species.name)}">
    ${species.wissenschaftlicher_name ? `<meta itemprop="alternateName" content="${escapeHtml(species.wissenschaftlicher_name)}">` : ''}
    ${sections}
  </article>`;
}

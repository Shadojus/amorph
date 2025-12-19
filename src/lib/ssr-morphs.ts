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
// SVG GENERATORS für komplexe Morphs
// ═══════════════════════════════════════════════════════════════════════════════

function renderSparkline(values: number[]): string {
  if (!Array.isArray(values) || values.length < 2) {
    return `<span class="ssr-sparkline-fallback">${values?.join(', ') || '—'}</span>`;
  }
  
  const width = 120;
  const height = 32;
  const padding = 2;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((v - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  
  const lastY = height - padding - ((values[values.length - 1] - min) / range) * (height - 2 * padding);
  const trend = values[values.length - 1] > values[0] ? 'up' : values[values.length - 1] < values[0] ? 'down' : 'stable';
  
  return `<svg class="ssr-sparkline" viewBox="0 0 ${width} ${height}" aria-label="Trend: ${trend}">
    <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${width - padding}" cy="${lastY.toFixed(1)}" r="2.5" fill="currentColor"/>
  </svg>`;
}

function renderGauge(value: number, max: number = 100, label?: string): string {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const angle = pct * 180; // Halbkreis
  const radius = 40;
  const cx = 50;
  const cy = 50;
  
  // Arc path für den gefüllten Teil
  const startAngle = Math.PI;
  const endAngle = Math.PI + (pct * Math.PI);
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  
  const color = pct < 0.33 ? '#ef4444' : pct < 0.66 ? '#f59e0b' : '#10b981';
  
  return `<div class="ssr-gauge">
    <svg viewBox="0 0 100 60" aria-label="${label || value}">
      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>
      <path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
      <text x="50" y="48" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">${Math.round(value)}</text>
    </svg>
    ${label ? `<span class="ssr-gauge-label">${escapeHtml(label)}</span>` : ''}
  </div>`;
}

function renderRadar(data: Record<string, number> | Array<{label: string; value: number}>): string {
  const items = Array.isArray(data) 
    ? data 
    : Object.entries(data).map(([label, value]) => ({ label, value }));
  
  if (items.length < 3) {
    return `<span class="ssr-radar-fallback">${items.map(i => `${i.label}: ${i.value}`).join(', ')}</span>`;
  }
  
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 45;
  const maxValue = Math.max(...items.map(i => i.value), 100);
  
  // Hintergrund-Ringe
  const rings = [0.25, 0.5, 0.75, 1].map(r => {
    const points = items.map((_, i) => {
      const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
      const x = cx + radius * r * Math.cos(angle);
      const y = cy + radius * r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>`;
  }).join('');
  
  // Achsen
  const axes = items.map((item, i) => {
    const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const labelX = cx + (radius + 12) * Math.cos(angle);
    const labelY = cy + (radius + 12) * Math.sin(angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d1d5db" stroke-width="0.5"/>
      <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="#6b7280">${escapeHtml(item.label.slice(0, 8))}</text>`;
  }).join('');
  
  // Daten-Polygon
  const dataPoints = items.map((item, i) => {
    const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
    const r = (item.value / maxValue) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  
  return `<svg class="ssr-radar" viewBox="0 0 ${size} ${size}" aria-label="Radar-Diagramm">
    ${rings}
    ${axes}
    <polygon points="${dataPoints}" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="1.5"/>
  </svg>`;
}

function renderHeatmap(data: number[][] | Record<string, Record<string, number>>): string {
  let grid: number[][];
  let rowLabels: string[] = [];
  let colLabels: string[] = [];
  
  if (Array.isArray(data)) {
    grid = data;
  } else {
    rowLabels = Object.keys(data);
    colLabels = [...new Set(rowLabels.flatMap(r => Object.keys(data[r])))];
    grid = rowLabels.map(r => colLabels.map(c => data[r]?.[c] ?? 0));
  }
  
  if (grid.length === 0) return '<span class="ssr-null">—</span>';
  
  const allValues = grid.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  
  const getColor = (v: number): string => {
    const pct = (v - min) / range;
    // Blau → Grün → Gelb → Rot
    if (pct < 0.33) return `rgb(${Math.round(59 + pct * 3 * 100)}, ${Math.round(130 + pct * 3 * 70)}, ${Math.round(246 - pct * 3 * 200)})`;
    if (pct < 0.66) return `rgb(${Math.round(159 + (pct - 0.33) * 3 * 80)}, ${Math.round(200 - (pct - 0.33) * 3 * 40)}, ${Math.round(46 + (pct - 0.33) * 3 * 100)})`;
    return `rgb(${Math.round(239)}, ${Math.round(160 - (pct - 0.66) * 3 * 100)}, ${Math.round(146 - (pct - 0.66) * 3 * 100)})`;
  };
  
  const cellSize = Math.min(24, 200 / Math.max(grid.length, grid[0]?.length || 1));
  
  return `<div class="ssr-heatmap" style="display:grid;grid-template-columns:repeat(${grid[0]?.length || 1},${cellSize}px);gap:1px;">
    ${grid.flatMap((row, ri) => 
      row.map((v, ci) => 
        `<div class="ssr-heatmap-cell" style="width:${cellSize}px;height:${cellSize}px;background:${getColor(v)}" title="${rowLabels[ri] || ri},${colLabels[ci] || ci}: ${v}"></div>`
      )
    ).join('')}
  </div>`;
}

function renderPie(data: Record<string, number> | Array<{label: string; value: number}>): string {
  const items = Array.isArray(data)
    ? data
    : Object.entries(data).map(([label, value]) => ({ label, value }));
  
  if (items.length === 0) return '<span class="ssr-null">—</span>';
  
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (total === 0) return '<span class="ssr-null">—</span>';
  
  const size = 80;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 30;
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  let currentAngle = -Math.PI / 2;
  const slices = items.map((item, i) => {
    const pct = item.value / total;
    const angle = pct * 2 * Math.PI;
    const startX = cx + radius * Math.cos(currentAngle);
    const startY = cy + radius * Math.sin(currentAngle);
    const endX = cx + radius * Math.cos(currentAngle + angle);
    const endY = cy + radius * Math.sin(currentAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = `M ${cx} ${cy} L ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)} Z`;
    currentAngle += angle;
    
    return `<path d="${path}" fill="${colors[i % colors.length]}" stroke="white" stroke-width="1">
      <title>${escapeHtml(item.label)}: ${item.value} (${(pct * 100).toFixed(1)}%)</title>
    </path>`;
  }).join('');
  
  return `<div class="ssr-pie">
    <svg viewBox="0 0 ${size} ${size}">${slices}</svg>
    <div class="ssr-pie-legend">${items.map((item, i) => 
      `<span class="ssr-pie-item"><span class="ssr-pie-color" style="background:${colors[i % colors.length]}"></span>${escapeHtml(item.label)}</span>`
    ).join('')}</div>
  </div>`;
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
    
    // SVG-basierte Morphs
    case 'sparkline':
      return renderSparkline(Array.isArray(value) ? value : [value]);
      
    case 'gauge': {
      const gaugeVal = typeof value === 'object' ? value.value : value;
      const gaugeMax = typeof value === 'object' ? (value.max || 100) : 100;
      const gaugeLabel = typeof value === 'object' ? value.label : undefined;
      return renderGauge(gaugeVal, gaugeMax, gaugeLabel);
    }
      
    case 'radar':
      return renderRadar(value);
      
    case 'heatmap':
      return renderHeatmap(value);
      
    case 'pie':
    case 'donut':
      return renderPie(value);
      
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

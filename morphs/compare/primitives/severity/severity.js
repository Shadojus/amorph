/**
 * COMPARE SEVERITY - Severity level comparison
 * Uses the exact same HTML structure as the original severity morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareSeverity(items, config = {}) {
  debug.morphs('compareSeverity', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-severity';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all severity displays
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original severity structure
    const severityEl = document.createElement('div');
    severityEl.className = 'amorph-severity';
    
    // Extract severity value
    let severityValue = 0;
    if (typeof rawVal === 'number') {
      severityValue = rawVal;
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      severityValue = rawVal.schwere || rawVal.severity || rawVal.level || rawVal.value || rawVal.wert || 0;
    }
    
    severityValue = Math.min(100, Math.max(0, severityValue));
    
    const row = document.createElement('div');
    row.className = 'amorph-severity-row';
    row.setAttribute('data-level', getSeverityLevel(severityValue));
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'amorph-severity-icon';
    icon.textContent = getSeverityIcon(severityValue);
    row.appendChild(icon);
    
    // Track
    const track = document.createElement('div');
    track.className = 'amorph-severity-track';
    
    const fill = document.createElement('div');
    fill.className = 'amorph-severity-fill';
    fill.style.width = `${severityValue}%`;
    fill.style.background = getSeverityColor(severityValue);
    track.appendChild(fill);
    row.appendChild(track);
    
    // Value
    const value = document.createElement('span');
    value.className = 'amorph-severity-value';
    value.textContent = `${severityValue}%`;
    value.style.color = getSeverityColor(severityValue);
    row.appendChild(value);
    
    severityEl.appendChild(row);
    
    wrapper.appendChild(severityEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function getSeverityLevel(value) {
  if (value >= 80) return 'critical';
  if (value >= 60) return 'severe';
  if (value >= 40) return 'moderate';
  if (value >= 20) return 'minor';
  return 'trivial';
}

function getSeverityIcon(value) {
  if (value >= 80) return '🔴';
  if (value >= 60) return '🟠';
  if (value >= 40) return '🟡';
  if (value >= 20) return '🟢';
  return '⚪';
}

function getSeverityColor(value) {
  if (value >= 80) return 'rgba(240, 80, 80, 0.9)';
  if (value >= 60) return 'rgba(240, 150, 80, 0.9)';
  if (value >= 40) return 'rgba(240, 200, 80, 0.9)';
  if (value >= 20) return 'rgba(100, 200, 140, 0.9)';
  return 'rgba(140, 160, 180, 0.9)';
}

export default compareSeverity;

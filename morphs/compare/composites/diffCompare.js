/**
 * DIFF COMPARE - Difference comparison composite
 * 
 * Shows differences and similarities between items.
 * 
 * DATA-DRIVEN:
 * - Compares values without assumptions about structure
 * - Groups into: same, different, unique
 */

import { debug } from '../../../observer/debug.js';
import { createLegend, createLegende } from '../base.js';
import { analyzeItems, calculateDiff } from './analyze.js';
import { renderFieldMorph } from './render.js';

/**
 * DIFF COMPARE - Shows only differences or similarities
 * 
 * @param {Array} items - [{id, name, data, color}]
 * @param {Object} config - {labels, units, defaultMode}
 * 
 * DATA-DRIVEN:
 * - Compares JSON-serialized values
 * - Automatically detects identical vs. different fields
 */
export function diffCompare(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-diff-compare';
  
  const diff = calculateDiff(items);
  if (!diff) {
    el.innerHTML = '<div class="compare-empty">At least 2 items required for diff</div>';
    return el;
  }
  
  const { fields } = analyzeItems(items);
  
  debug.compare('Diff Compare', {
    same: diff.same.length,
    different: diff.different.length,
    unique: diff.unique.length
  });
  
  // Legend
  el.appendChild(createLegend(items));
  
  // Mode buttons
  const modes = document.createElement('div');
  modes.className = 'diff-modes';
  modes.innerHTML = `
    <button class="diff-mode active" data-mode="different">Differences (${diff.different.length})</button>
    <button class="diff-mode" data-mode="same">Similarities (${diff.same.length})</button>
    <button class="diff-mode" data-mode="all">All (${Object.keys(fields).length})</button>
  `;
  el.appendChild(modes);
  
  // Content container
  const content = document.createElement('div');
  content.className = 'diff-content';
  el.appendChild(content);
  
  // Render function for mode
  const renderMode = (mode) => {
    content.innerHTML = '';
    
    let fieldsToShow;
    switch (mode) {
      case 'same':
        fieldsToShow = diff.same;
        break;
      case 'all':
        fieldsToShow = Object.keys(fields);
        break;
      default:
        fieldsToShow = diff.different;
    }
    
    fieldsToShow.forEach(name => {
      const field = fields[name];
      if (field) {
        const morph = renderFieldMorph(field, config);
        if (morph) content.appendChild(morph);
      }
    });
    
    if (fieldsToShow.length === 0) {
      content.innerHTML = '<div class="compare-empty">No fields in this category</div>';
    }
  };
  
  // Event handler
  modes.addEventListener('click', (e) => {
    const btn = e.target.closest('.diff-mode');
    if (!btn) return;
    
    modes.querySelectorAll('.diff-mode').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMode(btn.dataset.mode);
  });
  
  // Initial: default mode or 'different'
  renderMode(config.defaultMode || 'different');
  
  return el;
}

export default diffCompare;

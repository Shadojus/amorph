/**
 * DIFF COMPARE - Differenz-Vergleichs-Composite
 * 
 * Zeigt Unterschiede und Gemeinsamkeiten zwischen Items.
 * 
 * DATENGETRIEBEN:
 * - Vergleicht Werte ohne Annahmen über Struktur
 * - Gruppiert in: same, different, unique
 */

import { debug } from '../../../observer/debug.js';
import { createLegende } from '../base.js';
import { analyzeItems, calculateDiff } from './analyze.js';
import { renderFieldMorph } from './render.js';

/**
 * DIFF COMPARE - Zeigt nur Unterschiede oder Gemeinsamkeiten
 * 
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} config - {labels, units, defaultMode}
 * 
 * DATENGETRIEBEN:
 * - Vergleicht JSON-serialisierte Werte
 * - Erkennt automatisch identische vs. unterschiedliche Felder
 */
export function diffCompare(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-diff-compare';
  
  const diff = calculateDiff(items);
  if (!diff) {
    el.innerHTML = '<div class="compare-leer">Mindestens 2 Items für Diff benötigt</div>';
    return el;
  }
  
  const { fields } = analyzeItems(items);
  
  debug.compare('Diff Compare', {
    same: diff.same.length,
    different: diff.different.length,
    unique: diff.unique.length
  });
  
  // Legende
  el.appendChild(createLegende(items));
  
  // Mode-Buttons
  const modes = document.createElement('div');
  modes.className = 'diff-modes';
  modes.innerHTML = `
    <button class="diff-mode active" data-mode="different">Unterschiede (${diff.different.length})</button>
    <button class="diff-mode" data-mode="same">Gemeinsamkeiten (${diff.same.length})</button>
    <button class="diff-mode" data-mode="all">Alle (${Object.keys(fields).length})</button>
  `;
  el.appendChild(modes);
  
  // Content Container
  const content = document.createElement('div');
  content.className = 'diff-content';
  el.appendChild(content);
  
  // Render-Funktion für Mode
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
      content.innerHTML = '<div class="compare-leer">Keine Felder in dieser Kategorie</div>';
    }
  };
  
  // Event Handler
  modes.addEventListener('click', (e) => {
    const btn = e.target.closest('.diff-mode');
    if (!btn) return;
    
    modes.querySelectorAll('.diff-mode').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMode(btn.dataset.mode);
  });
  
  // Initial: Default-Mode oder 'different'
  renderMode(config.defaultMode || 'different');
  
  return el;
}

export default diffCompare;

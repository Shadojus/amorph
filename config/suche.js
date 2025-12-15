/**
 * Suche Morph
 * Transformiert Suche-Config zu Suchleisten-Element
 * Inkl. Highlight-Navigation (Pfeile zum Springen zwischen Treffern)
 */

import { debug } from '../observer/debug.js';

export function suche(config, morphConfig = {}) {
  debug.search('Morph created', config);
  
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  
  const input = document.createElement('input');
  input.type = 'text';  // Kein 'search' - damit kein X-Button erscheint
  input.placeholder = config.placeholder || 'Suchen...';
  input.setAttribute('aria-label', 'Suche');
  input.setAttribute('autocomplete', 'off');
  
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'amorph-suche-btn';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Suchen');
  
  // Highlight-Navigation Container (versteckt wenn keine Treffer)
  const highlightNav = document.createElement('div');
  highlightNav.className = 'amorph-highlight-nav';
  highlightNav.style.display = 'none';
  
  // Pfeil hoch (vorheriger Treffer)
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'amorph-highlight-nav-btn';
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', 'Vorheriger Treffer');
  prevBtn.title = 'Vorheriger (Shift+Enter)';
  
  // Counter (z.B. "3/12")
  const counter = document.createElement('span');
  counter.className = 'amorph-highlight-counter';
  counter.textContent = '';
  
  // Pfeil runter (nächster Treffer)
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'amorph-highlight-nav-btn';
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', 'Nächster Treffer');
  nextBtn.title = 'Nächster (Enter)';
  
  highlightNav.appendChild(prevBtn);
  highlightNav.appendChild(counter);
  highlightNav.appendChild(nextBtn);
  
  form.appendChild(input);
  form.appendChild(highlightNav);
  form.appendChild(button);
  
  // === Highlight Navigation Logik ===
  // Zählt nur SICHTBARE Text-Highlights und springt zur exakten Stelle
  let currentHighlightIndex = 0;
  let highlights = [];
  
  function isVisible(el) {
    // Prüft ob Element wirklich sichtbar ist
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 && 
      rect.height > 0 && 
      style.display !== 'none' && 
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }
  
  function updateHighlights() {
    // Finde nur SICHTBARE Highlight-Marks
    const allHighlights = document.querySelectorAll('.amorph-highlight');
    highlights = Array.from(allHighlights).filter(isVisible);
    const count = highlights.length;
    
    if (count > 0) {
      highlightNav.style.display = 'flex';
      currentHighlightIndex = Math.min(currentHighlightIndex, count - 1);
      counter.textContent = `${currentHighlightIndex + 1}/${count}`;
    } else {
      highlightNav.style.display = 'none';
      currentHighlightIndex = 0;
      counter.textContent = '';
    }
  }
  
  function getVisibleHighlights() {
    // Immer frische Liste holen
    const allHighlights = document.querySelectorAll('.amorph-highlight');
    return Array.from(allHighlights).filter(isVisible);
  }
  
  function scrollToHighlight(index) {
    const current = highlights[index];
    if (!current) return;
    
    // Entferne alte Markierung
    document.querySelectorAll('.amorph-highlight-current').forEach(h => 
      h.classList.remove('amorph-highlight-current')
    );
    
    current.classList.add('amorph-highlight-current');
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  function goToNext() {
    // Frische Liste holen
    highlights = getVisibleHighlights();
    if (highlights.length === 0) return;
    
    currentHighlightIndex = (currentHighlightIndex + 1) % highlights.length;
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    scrollToHighlight(currentHighlightIndex);
  }
  
  function goToPrev() {
    // Frische Liste holen
    highlights = getVisibleHighlights();
    if (highlights.length === 0) return;
    
    currentHighlightIndex = (currentHighlightIndex - 1 + highlights.length) % highlights.length;
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    scrollToHighlight(currentHighlightIndex);
  }
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToNext();
  });
  
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToPrev();
  });
  
  // Keyboard Navigation (Enter = next, Shift+Enter = prev)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      highlights = getVisibleHighlights();
      if (highlights.length > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    }
  });
  
  // Event-Listener für Highlight-Updates
  document.addEventListener('amorph:highlights-updated', updateHighlights);
  
  // Expose update function
  form.updateHighlights = updateHighlights;
  
  // Events werden vom Feature-System gesteuert
  form.dataset.live = config.live ? 'true' : 'false';
  form.dataset.debounce = config.debounce || 300;
  form.dataset.limit = config.limit || 50;
  form.dataset.erlaubeLeer = config.erlaubeLeer ? 'true' : 'false';
  
  return form;
}

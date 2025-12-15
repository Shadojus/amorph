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
  let currentHighlightIndex = 0;
  let highlights = [];
  
  function updateHighlights() {
    highlights = Array.from(document.querySelectorAll('.amorph-highlight'));
    const count = highlights.length;
    
    if (count > 0) {
      highlightNav.style.display = 'flex';
      currentHighlightIndex = Math.min(currentHighlightIndex, count - 1);
      // Kompakt: nur "1/384" ohne Leerzeichen
      counter.textContent = `${currentHighlightIndex + 1}/${count}`;
      scrollToHighlight(currentHighlightIndex);
    } else {
      highlightNav.style.display = 'none';
      currentHighlightIndex = 0;
      counter.textContent = '';
    }
  }
  
  function scrollToHighlight(index) {
    // Entferne alte Markierung
    highlights.forEach(h => h.classList.remove('amorph-highlight-current'));
    
    if (highlights[index]) {
      highlights[index].classList.add('amorph-highlight-current');
      highlights[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  function goToNext() {
    if (highlights.length === 0) return;
    currentHighlightIndex = (currentHighlightIndex + 1) % highlights.length;
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    scrollToHighlight(currentHighlightIndex);
  }
  
  function goToPrev() {
    if (highlights.length === 0) return;
    currentHighlightIndex = (currentHighlightIndex - 1 + highlights.length) % highlights.length;
    counter.textContent = `${currentHighlightIndex + 1}/${highlights.length}`;
    scrollToHighlight(currentHighlightIndex);
  }
  
  nextBtn.addEventListener('click', goToNext);
  prevBtn.addEventListener('click', goToPrev);
  
  // Keyboard Navigation (Enter = next, Shift+Enter = prev)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && highlights.length > 0) {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrev();
      } else {
        goToNext();
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

/**
 * COMPARE CITATION - Citation comparison
 * Uses the exact same HTML structure as the original citation morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareCitation(items, config = {}) {
  debug.morphs('compareCitation', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-citation';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all citations
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
    
    // Use original citation structure
    const citationEl = document.createElement('div');
    citationEl.className = 'amorph-citation';
    
    // Normalize citation data
    const cit = normalisiereCitation(rawVal);
    
    if (!cit) {
      citationEl.innerHTML = '<span class="amorph-citation-leer">Keine Publikation</span>';
    } else {
      const card = document.createElement('div');
      card.className = 'amorph-citation-card';
      
      // Header
      const header = document.createElement('div');
      header.className = 'amorph-citation-header';
      
      if (cit.year) {
        const year = document.createElement('span');
        year.className = 'amorph-citation-year';
        year.textContent = cit.year;
        header.appendChild(year);
      }
      
      card.appendChild(header);
      
      // Title
      if (cit.title) {
        const title = document.createElement('div');
        title.className = 'amorph-citation-title';
        title.textContent = cit.title;
        card.appendChild(title);
      }
      
      // Authors
      if (cit.authors) {
        const authors = document.createElement('div');
        authors.className = 'amorph-citation-authors';
        authors.textContent = cit.authors;
        card.appendChild(authors);
      }
      
      // Journal
      if (cit.journal) {
        const journal = document.createElement('div');
        journal.className = 'amorph-citation-journal';
        journal.textContent = cit.journal;
        card.appendChild(journal);
      }
      
      // DOI
      if (cit.doi) {
        const doi = document.createElement('div');
        doi.className = 'amorph-citation-doi';
        doi.textContent = `DOI: ${cit.doi}`;
        card.appendChild(doi);
      }
      
      citationEl.appendChild(card);
    }
    
    wrapper.appendChild(citationEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereCitation(wert) {
  if (!wert) return null;
  
  if (typeof wert === 'string') {
    return { title: wert };
  }
  
  if (typeof wert === 'object') {
    return {
      title: wert.titel || wert.title || '',
      authors: Array.isArray(wert.autoren || wert.authors) 
        ? (wert.autoren || wert.authors).join(', ')
        : (wert.autor || wert.author || wert.autoren || wert.authors || ''),
      year: wert.jahr || wert.year || '',
      journal: wert.journal || wert.zeitschrift || '',
      doi: wert.doi || ''
    };
  }
  
  return null;
}

export default compareCitation;

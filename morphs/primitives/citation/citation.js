/**
 * 📚 CITATION MORPH - Zitationen/Referenzen
 * 
 * Zeigt wissenschaftliche Referenzen formatiert
 * DATENGETRIEBEN - Erkennt Publikations-Strukturen
 * 
 * Input: [{titel: "...", autor: "...", jahr: 2020, zitationen: 850}]
 *    oder {title: "...", authors: [...], year: 2020, doi: "..."}
 * Output: Formatierte Zitationskarten
 */

import { debug } from '../../../observer/debug.js';

export function citation(wert, config = {}) {
  debug.morphs('citation', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-citation';
  
  // Zitationen normalisieren
  const citations = normalisiereCitations(wert);
  
  if (citations.length === 0) {
    el.innerHTML = '<span class="amorph-citation-leer">Keine Publikationen</span>';
    return el;
  }
  
  // Max Anzahl
  const maxItems = config.maxItems || 5;
  const displayCitations = citations.slice(0, maxItems);
  
  // Zitationen rendern
  for (const cit of displayCitations) {
    const card = document.createElement('div');
    card.className = 'amorph-citation-card';
    
    // Header mit Jahr und Typ
    const header = document.createElement('div');
    header.className = 'amorph-citation-header';
    
    if (cit.year) {
      const year = document.createElement('span');
      year.className = 'amorph-citation-year';
      year.textContent = cit.year;
      header.appendChild(year);
    }
    
    if (cit.type) {
      const type = document.createElement('span');
      type.className = 'amorph-citation-type';
      type.textContent = cit.type;
      header.appendChild(type);
    }
    
    card.appendChild(header);
    
    // Titel
    const title = document.createElement('div');
    title.className = 'amorph-citation-title';
    
    if (cit.doi || cit.url) {
      const link = document.createElement('a');
      link.href = cit.doi ? `https://doi.org/${cit.doi}` : cit.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = cit.title;
      title.appendChild(link);
    } else {
      title.textContent = cit.title;
    }
    card.appendChild(title);
    
    // Autoren
    if (cit.authors) {
      const authors = document.createElement('div');
      authors.className = 'amorph-citation-authors';
      authors.textContent = cit.authors;
      card.appendChild(authors);
    }
    
    // Journal/Quelle
    if (cit.journal) {
      const journal = document.createElement('div');
      journal.className = 'amorph-citation-journal';
      journal.textContent = cit.journal;
      card.appendChild(journal);
    }
    
    // Footer mit Metriken
    const footer = document.createElement('div');
    footer.className = 'amorph-citation-footer';
    
    if (cit.citations !== undefined) {
      const citCount = document.createElement('span');
      citCount.className = 'amorph-citation-count';
      citCount.innerHTML = `<span class="amorph-citation-count-icon">📄</span> ${formatNumber(cit.citations)} Zitationen`;
      footer.appendChild(citCount);
    }
    
    if (cit.doi) {
      const doi = document.createElement('span');
      doi.className = 'amorph-citation-doi';
      doi.textContent = `DOI: ${cit.doi}`;
      footer.appendChild(doi);
    }
    
    if (footer.children.length > 0) {
      card.appendChild(footer);
    }
    
    el.appendChild(card);
  }
  
  // Mehr anzeigen
  if (citations.length > maxItems) {
    const more = document.createElement('div');
    more.className = 'amorph-citation-more';
    more.textContent = `+${citations.length - maxItems} weitere Publikationen`;
    el.appendChild(more);
  }
  
  return el;
}

function normalisiereCitations(wert) {
  const citations = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object') {
        citations.push(extractCitation(item));
      } else if (typeof item === 'string') {
        citations.push({ title: item, authors: '', year: null, journal: '' });
      }
    }
  } else if (typeof wert === 'object') {
    // Einzelne Zitation
    if (wert.titel || wert.title) {
      citations.push(extractCitation(wert));
    }
    // Publikationen-Array im Objekt
    if (wert.publikationen || wert.publications || wert.references) {
      const arr = wert.publikationen || wert.publications || wert.references;
      for (const item of arr) {
        citations.push(extractCitation(item));
      }
    }
  }
  
  // Nach Jahr sortieren (neueste zuerst)
  return citations.sort((a, b) => (b.year || 0) - (a.year || 0));
}

function extractCitation(item) {
  // Autoren extrahieren
  let authors = '';
  if (item.autoren || item.authors || item.autor || item.author) {
    const auth = item.autoren || item.authors || item.autor || item.author;
    if (Array.isArray(auth)) {
      authors = auth.join(', ');
    } else {
      authors = auth;
    }
  }
  
  return {
    title: item.titel || item.title || item.name || '',
    authors: authors,
    year: item.jahr || item.year || null,
    journal: item.journal || item.zeitschrift || item.quelle || item.source || '',
    citations: item.zitationen || item.citations || item.cited || undefined,
    doi: item.doi || null,
    url: item.url || item.link || null,
    type: item.typ || item.type || detectPublicationType(item)
  };
}

function detectPublicationType(item) {
  const title = (item.titel || item.title || '').toLowerCase();
  if (title.includes('review')) return 'Review';
  if (title.includes('meta-analysis') || title.includes('metaanalyse')) return 'Meta-Analyse';
  if (item.journal || item.zeitschrift) return 'Artikel';
  return '';
}

function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
}

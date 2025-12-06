/**
 * COMPARE TEXT - Textvergleich nebeneinander
 */

import { debug } from '../../../observer/debug.js';

export function compareText(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-text';
  
  // DEBUG: Zeige EXAKT was ankommt - als JSON String für volle Sichtbarkeit
  console.log('[compareText] Items DETAIL:', JSON.stringify(items.map(i => ({ 
    id: i.id, 
    name: i.name,
    nameType: typeof i.name,
    hatNameProp: 'name' in i,
    keys: Object.keys(i)
  }), null, 2)));
  
  const container = document.createElement('div');
  container.className = 'compare-text-container';
  
  items.forEach(item => {
    const textWrap = document.createElement('div');
    textWrap.className = `compare-text-wrap ${item.farbKlasse || ''}`;
    
    // Inline-Styles für zuverlässige Darstellung
    const textColor = item.textFarbe || 'rgba(255,255,255,0.85)';
    const itemName = item.name || item.id || '–';
    textWrap.innerHTML = `
      <div class="text-header" style="color:${textColor}">${itemName}</div>
      <div class="text-inhalt">${item.wert || '–'}</div>
    `;
    container.appendChild(textWrap);
  });
  
  el.appendChild(container);
  return el;
}

export default compareText;

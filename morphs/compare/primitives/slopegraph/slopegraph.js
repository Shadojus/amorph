/**
 * COMPARE SLOPEGRAPH - Slope graph comparison
 * Uses the exact same HTML structure as the original slopegraph morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareSlopegraph(items, config = {}) {
  debug.morphs('compareSlopegraph', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-slopegraph';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original slopegraph structure
    const slopegraphEl = document.createElement('div');
    slopegraphEl.className = 'amorph-slopegraph';
    
    const { daten, labels } = normalisiereDaten(rawVal);
    
    if (daten.length === 0) {
      slopegraphEl.innerHTML = '<span class="amorph-slopegraph-leer">Keine Vergleichsdaten</span>';
    } else {
      // Header
      const header = document.createElement('div');
      header.className = 'amorph-slopegraph-header';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.fontSize = '9px';
      header.style.opacity = '0.6';
      header.style.marginBottom = '4px';
      header.innerHTML = `
        <span class="amorph-slopegraph-zeit">${labels.vorher}</span>
        <span class="amorph-slopegraph-zeit">${labels.nachher}</span>
      `;
      slopegraphEl.appendChild(header);
      
      // Container with slopes
      const slopeContainer = document.createElement('div');
      slopeContainer.className = 'amorph-slopegraph-container';
      
      const allValues = daten.flatMap(d => [d.vorher, d.nachher]);
      const minVal = Math.min(...allValues, 0);
      const maxVal = Math.max(...allValues, 1);
      const range = maxVal - minVal || 1;
      
      daten.slice(0, 4).forEach((d, i) => {
        const row = document.createElement('div');
        row.className = 'amorph-slopegraph-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '4px';
        row.style.marginBottom = '4px';
        
        // Label
        const rowLabel = document.createElement('span');
        rowLabel.className = 'amorph-slopegraph-label';
        rowLabel.textContent = d.name;
        rowLabel.style.fontSize = '9px';
        rowLabel.style.width = '35px';
        row.appendChild(rowLabel);
        
        // Slope visualization (mini SVG)
        const svgWrap = document.createElement('div');
        svgWrap.style.flex = '1';
        svgWrap.style.height = '20px';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 60 20');
        svg.setAttribute('class', 'amorph-slopegraph-line');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        const y1 = 18 - ((d.vorher - minVal) / range) * 16;
        const y2 = 18 - ((d.nachher - minVal) / range) * 16;
        
        const change = d.nachher - d.vorher;
        const lineColor = change > 0 ? 'rgba(100,200,150,0.8)' : change < 0 ? 'rgba(220,100,100,0.8)' : 'rgba(180,180,180,0.6)';
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '5');
        line.setAttribute('y1', y1);
        line.setAttribute('x2', '55');
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', lineColor);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
        
        // Dots
        const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot1.setAttribute('cx', '5');
        dot1.setAttribute('cy', y1);
        dot1.setAttribute('r', '3');
        dot1.setAttribute('fill', lineColor);
        svg.appendChild(dot1);
        
        const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot2.setAttribute('cx', '55');
        dot2.setAttribute('cy', y2);
        dot2.setAttribute('r', '3');
        dot2.setAttribute('fill', lineColor);
        svg.appendChild(dot2);
        
        svgWrap.appendChild(svg);
        row.appendChild(svgWrap);
        
        // Change indicator
        const changeEl = document.createElement('span');
        changeEl.className = 'amorph-slopegraph-change';
        const pct = d.vorher !== 0 ? ((change / Math.abs(d.vorher)) * 100).toFixed(0) : '—';
        changeEl.textContent = `${change > 0 ? '+' : ''}${pct}%`;
        changeEl.style.fontSize = '9px';
        changeEl.style.width = '30px';
        changeEl.style.textAlign = 'right';
        changeEl.style.color = lineColor;
        row.appendChild(changeEl);
        
        slopeContainer.appendChild(row);
      });
      
      slopegraphEl.appendChild(slopeContainer);
    }
    
    wrapper.appendChild(slopegraphEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereDaten(wert) {
  const daten = [];
  let labels = { vorher: 'Vorher', nachher: 'Nachher' };
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        const vorher = item.vorher ?? item.from ?? item.start ?? item.anfang ?? 0;
        const nachher = item.nachher ?? item.to ?? item.end ?? item.ende ?? 0;
        const name = item.name || item.label || item.kategorie || '';
        daten.push({ name, vorher, nachher });
      }
    }
  } else if (typeof wert === 'object' && wert !== null) {
    // {vorher: {A: x}, nachher: {A: y}} or {2020: {...}, 2023: {...}}
    const keys = Object.keys(wert);
    if (keys.includes('vorher') && keys.includes('nachher')) {
      labels = { vorher: 'Vorher', nachher: 'Nachher' };
      for (const [name, value] of Object.entries(wert.vorher || {})) {
        daten.push({ name, vorher: value, nachher: wert.nachher?.[name] ?? 0 });
      }
    } else if (keys.length >= 2) {
      const sortedKeys = keys.filter(k => /^\d+$/.test(k)).sort();
      if (sortedKeys.length >= 2) {
        labels = { vorher: sortedKeys[0], nachher: sortedKeys[sortedKeys.length - 1] };
        for (const [name, value] of Object.entries(wert[sortedKeys[0]] || {})) {
          daten.push({ name, vorher: value, nachher: wert[sortedKeys[sortedKeys.length - 1]]?.[name] ?? 0 });
        }
      }
    }
  }
  
  return { daten, labels };
}

export default compareSlopegraph;
